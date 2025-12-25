import { useState, useEffect, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const initializedRef = useRef(false);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const adminStatus = await authService.checkIsAdmin(userId);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("[useAuth] Failed to check admin status:", error);
      setIsAdmin(false);
    } finally {
      setAdminCheckComplete(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST - defer updates with setTimeout to avoid hook count issues
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        // Use setTimeout(0) to defer state updates and avoid "Rendered more hooks" error
        setTimeout(() => {
          if (!isMounted) return;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            checkAdminStatus(session.user.id);
          } else {
            setIsAdmin(false);
            setAdminCheckComplete(true);
            setLoading(false);
          }
        }, 0);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      try {
        const { session } = await authService.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setAdminCheckComplete(true);
        }
      } catch (error) {
        console.error("[useAuth] Failed to initialize auth:", error);
        setAdminCheckComplete(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    setAdminCheckComplete(false);
    const { data, error } = await authService.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await authService.signUp(email, password);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setAdminCheckComplete(true);
    }
    return { error };
  };

  // Only consider fully loaded when both auth and admin check are complete
  const isFullyLoaded = !loading && adminCheckComplete;

  return {
    user,
    session,
    isAdmin,
    loading: !isFullyLoaded,
    signIn,
    signUp,
    signOut,
  };
}

import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const adminStatus = await authService.checkIsAdmin(userId);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("[useAuth] Failed to check admin status:", error);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check for existing session first
    const initializeAuth = async () => {
      try {
        const { session } = await authService.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error("[useAuth] Failed to initialize auth:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
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
    }
    return { error };
  };

  return {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

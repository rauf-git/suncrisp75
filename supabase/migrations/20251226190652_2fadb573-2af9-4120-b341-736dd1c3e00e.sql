CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  allowed_emails TEXT[] := ARRAY['suncrisphospitality@gmail.com'];
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- First user or allowed email gets admin role
  IF user_count = 0 OR NEW.email = ANY(allowed_emails) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;
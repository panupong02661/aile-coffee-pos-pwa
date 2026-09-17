CREATE OR REPLACE FUNCTION public.authenticate_user(username_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record public.users;
  computed_hash text;
  normalized_username text := trim(username_input);
BEGIN
  IF NOT public.check_rate_limit('login_' || lower(normalized_username), 5, 15) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Too many login attempts');
  END IF;

  IF NOT public.validate_input_secure(normalized_username, 'username') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid username format');
  END IF;

  SELECT * INTO user_record
  FROM public.users
  WHERE lower(trim(username)) = lower(normalized_username)
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('login_failed', jsonb_build_object('username', normalized_username, 'reason', 'user_not_found'));
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  IF user_record.is_active IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account inactive');
  END IF;

  IF user_record.locked_until IS NOT NULL AND user_record.locked_until > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;

  IF user_record.password_salt IS NULL THEN
    IF password_input = user_record.password_hash THEN
      UPDATE public.users
      SET failed_login_attempts = 0,
          last_login = now(),
          locked_until = NULL
      WHERE id = user_record.id;

      INSERT INTO public.security_logs (event_type, user_id, details)
      VALUES ('login_success', user_record.id, jsonb_build_object('username', user_record.username));

      RETURN jsonb_build_object('success', true, 'user_id', user_record.id, 'role', user_record.role);
    END IF;
  ELSE
    computed_hash := encode(digest(password_input || user_record.password_salt, 'sha256'), 'base64');
    IF computed_hash = user_record.password_hash THEN
      UPDATE public.users
      SET failed_login_attempts = 0,
          last_login = now(),
          locked_until = NULL
      WHERE id = user_record.id;

      INSERT INTO public.security_logs (event_type, user_id, details)
      VALUES ('login_success', user_record.id, jsonb_build_object('username', user_record.username));

      RETURN jsonb_build_object('success', true, 'user_id', user_record.id, 'role', user_record.role);
    END IF;
  END IF;

  UPDATE public.users
  SET failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE
        WHEN failed_login_attempts >= 4 THEN now() + interval '15 minutes'
        ELSE locked_until
      END
  WHERE id = user_record.id;

  INSERT INTO public.security_logs (event_type, user_id, details)
  VALUES ('login_failed', user_record.id, jsonb_build_object('username', user_record.username, 'reason', 'invalid_password'));

  RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
END;
$function$;
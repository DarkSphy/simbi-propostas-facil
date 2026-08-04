
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;

-- Prevent users from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.pro_expires_at IS DISTINCT FROM OLD.pro_expires_at
     OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin') THEN
      NEW.role := OLD.role;
      NEW.pro_expires_at := OLD.pro_expires_at;
      NEW.trial_ends_at := OLD.trial_ends_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.activate_pro_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.profiles
     SET pro_expires_at = GREATEST(COALESCE(pro_expires_at, now()), now()) + interval '30 days'
   WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_dates_by_admin(target_user_id uuid, p_trial_ends_at timestamptz, p_pro_expires_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.profiles
     SET trial_ends_at = p_trial_ends_at,
         pro_expires_at = p_pro_expires_at
   WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot delete yourself';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.activate_pro_by_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_by_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_dates_by_admin(uuid, timestamptz, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;

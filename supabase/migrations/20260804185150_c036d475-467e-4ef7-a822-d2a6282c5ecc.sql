ALTER TABLE public.profiles DISABLE TRIGGER profiles_prevent_role_escalation;
UPDATE public.profiles SET role = 'admin' WHERE id = '3163853e-a778-42cb-8fae-07416c804766';
ALTER TABLE public.profiles ENABLE TRIGGER profiles_prevent_role_escalation;
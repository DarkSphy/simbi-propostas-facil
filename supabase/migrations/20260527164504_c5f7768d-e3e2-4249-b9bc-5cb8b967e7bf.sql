
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'company_name');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own" ON public.clients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Proposal status
CREATE TYPE public.proposal_status AS ENUM ('sent','viewed','approved','rejected');

-- Proposals
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.proposal_status NOT NULL DEFAULT 'sent',
  public_slug TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9),'base64'),
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT, UPDATE ON public.proposals TO anon;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_owner_all" ON public.proposals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "proposals_public_read" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "proposals_public_status" ON public.proposals FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Proposal items
CREATE TABLE public.proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_items TO authenticated;
GRANT SELECT ON public.proposal_items TO anon;
GRANT ALL ON public.proposal_items TO service_role;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_owner" ON public.proposal_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()));
CREATE POLICY "items_public_read" ON public.proposal_items FOR SELECT USING (true);

-- Proposal images
CREATE TABLE public.proposal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_images TO authenticated;
GRANT SELECT ON public.proposal_images TO anon;
GRANT ALL ON public.proposal_images TO service_role;
ALTER TABLE public.proposal_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_owner" ON public.proposal_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()));
CREATE POLICY "images_public_read" ON public.proposal_images FOR SELECT USING (true);

-- Storage bucket for proposal images & logos
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-images','proposal-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "proposal_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'proposal-images');
CREATE POLICY "proposal_images_auth_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'proposal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proposal_images_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'proposal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proposal_images_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'proposal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

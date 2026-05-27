-- Adiciona as novas configurações visuais
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS header_texture text DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'inter';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS item_layout text DEFAULT 'minimal';

-- Adiciona os campos de redes sociais
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;

-- Atualiza o cache do Supabase
NOTIFY pgrst, 'reload schema';

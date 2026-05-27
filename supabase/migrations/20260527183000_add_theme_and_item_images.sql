-- Adiciona cor do tema ao perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#8b5cf6';

-- Adiciona URLs de imagens aos itens
ALTER TABLE public.proposal_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.catalog_items ADD COLUMN IF NOT EXISTS image_url TEXT;

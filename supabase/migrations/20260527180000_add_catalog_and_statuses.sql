-- 1. Create catalog table
CREATE TYPE public.item_type AS ENUM ('product', 'service');

CREATE TABLE public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.item_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_own" ON public.catalog_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Alter proposal_status enum
-- PostgreSQL doesn't support ALTER TYPE ... DROP VALUE, but we can ADD VALUE.
-- The existing ones are 'sent','viewed','approved','rejected'.
-- We need: 'in_progress', 'canceled', 'finished', 'paid'.
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'canceled';
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'finished';
ALTER TYPE public.proposal_status ADD VALUE IF NOT EXISTS 'paid';

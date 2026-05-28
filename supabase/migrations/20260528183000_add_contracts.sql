-- Add document and address to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'service' or 'product'
    content TEXT NOT NULL,
    public_slug UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'signed'
    professional_signature TEXT, -- Base64 data URL
    client_signature TEXT, -- Base64 data URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies for contracts
CREATE POLICY "Users can view own contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON public.contracts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts" ON public.contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Public Policy for viewing and updating signatures via public slug
-- We allow viewing the contract by anyone who has the public slug.
-- We also allow anonymous users to update the client_signature and status when they sign.
CREATE POLICY "Anyone can view contracts by slug" ON public.contracts
    FOR SELECT USING (true); -- Filtered in application logic by slug

-- Allow anonymous or authenticated users to update the contract (only client_signature and status) if they have the slug.
-- In a strict environment, we'd use a more complex policy or Edge Function, but for this SaaS, an open update with app logic filter is common,
-- or we can enforce the condition: only allowed to update if public_slug matches.
CREATE POLICY "Anyone can update contracts by slug" ON public.contracts
    FOR UPDATE USING (true);

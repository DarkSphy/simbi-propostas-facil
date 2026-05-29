-- Create proposal logs table
CREATE TABLE IF NOT EXISTS public.proposal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view' (visualizou), 'approve' (aprovou), 'reject' (recusou)
  user_agent TEXT,
  ip_address TEXT,
  location TEXT, -- Cidade, Estado e País
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous clients) to insert tracking logs
CREATE POLICY "proposal_logs_insert_public" ON public.proposal_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow only the owner of the proposal to read its interaction logs
CREATE POLICY "proposal_logs_owner_select" ON public.proposal_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_logs.proposal_id 
        AND p.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.proposal_logs TO anon, authenticated;
GRANT ALL ON public.proposal_logs TO service_role;

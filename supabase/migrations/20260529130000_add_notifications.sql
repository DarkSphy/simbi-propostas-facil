-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "notifications_owner_all" ON public.notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- Enable Realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- In case supabase_realtime publication is handled differently, do not crash the migration
    NULL;
END;
$$;

-- Trigger for Proposal Approval
CREATE OR REPLACE FUNCTION public.handle_proposal_status_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  client_name TEXT;
BEGIN
  -- We only notify when the proposal is approved
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved' OR OLD.status IS NULL) THEN
    -- Get client name
    IF NEW.client_id IS NOT NULL THEN
      SELECT name INTO client_name FROM public.clients WHERE id = NEW.client_id;
    END IF;
    
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      NEW.user_id,
      'Proposta Aprovada 🎉',
      COALESCE(client_name, 'Um cliente') || ' aprovou a proposta "' || NEW.title || '"!'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_proposal_approved
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_proposal_status_notification();

-- Trigger for Contract Signature
CREATE OR REPLACE FUNCTION public.handle_contract_signature_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  client_name TEXT;
  proposal_title TEXT;
BEGIN
  IF NEW.status = 'signed' AND (OLD.status IS DISTINCT FROM 'signed' OR OLD.status IS NULL) THEN
    -- Get proposal title and client name from proposals and clients
    SELECT p.title, c.name 
    INTO proposal_title, client_name 
    FROM public.proposals p
    LEFT JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = NEW.proposal_id;

    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      NEW.user_id,
      'Contrato Assinado ✍️',
      COALESCE(client_name, 'Um cliente') || ' assinou o contrato para "' || COALESCE(proposal_title, 'a proposta') || '"!'
    );

    -- Log na linha de tempo da proposta
    INSERT INTO public.proposal_logs (proposal_id, event_type, location, user_agent)
    VALUES (
      NEW.proposal_id,
      'sign',
      'Assinatura Eletrônica',
      'Assinado via página digital de contratos'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_contract_signed
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_contract_signature_notification();

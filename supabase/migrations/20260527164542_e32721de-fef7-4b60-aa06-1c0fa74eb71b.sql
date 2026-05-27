
-- 1. Lock down SECURITY DEFINER fn
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Remove permissive anon UPDATE on proposals, expose via RPC instead
DROP POLICY IF EXISTS "proposals_public_status" ON public.proposals;
REVOKE UPDATE ON public.proposals FROM anon;

CREATE OR REPLACE FUNCTION public.update_proposal_status(p_slug TEXT, p_status TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_status NOT IN ('viewed','approved','rejected') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  UPDATE public.proposals
  SET status = p_status::public.proposal_status,
      viewed_at = COALESCE(viewed_at, CASE WHEN p_status='viewed' THEN now() ELSE viewed_at END),
      approved_at = CASE WHEN p_status='approved' THEN now() ELSE approved_at END,
      updated_at = now()
  WHERE public_slug = p_slug
    AND (status = 'sent' OR (status = 'viewed' AND p_status IN ('approved','rejected')));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_proposal_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_proposal_status(TEXT, TEXT) TO anon, authenticated;

-- 3. Restrict bucket listing: only allow reading own folder; public file URLs still work via CDN
DROP POLICY IF EXISTS "proposal_images_public_read" ON storage.objects;
CREATE POLICY "proposal_images_owner_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'proposal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

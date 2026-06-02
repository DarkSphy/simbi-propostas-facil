
-- 1. Add search_path to functions missing it
ALTER FUNCTION public.accept_proposal_with_options(text, uuid[]) SET search_path = public;
ALTER FUNCTION public.handle_proposal_approval() SET search_path = public;
ALTER FUNCTION public.submit_quote_request(text, text, text, jsonb) SET search_path = public;

-- 2. Drop overly permissive public SELECT policies
DROP POLICY IF EXISTS proposals_public_read ON public.proposals;
DROP POLICY IF EXISTS items_public_read ON public.proposal_items;
DROP POLICY IF EXISTS images_public_read ON public.proposal_images;

-- 3. Drop overly permissive contracts policies
DROP POLICY IF EXISTS "Anyone can view contracts by slug" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can update contracts by slug" ON public.contracts;

-- 4. Tighten proposal_logs insert: require referenced proposal to exist
DROP POLICY IF EXISTS proposal_logs_insert_public ON public.proposal_logs;
CREATE POLICY proposal_logs_insert_public ON public.proposal_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_logs.proposal_id));

-- 5. Secure RPC: fetch a proposal by its public_slug only (no enumeration)
CREATE OR REPLACE FUNCTION public.get_proposal_by_slug(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal proposals%ROWTYPE;
  v_result jsonb;
BEGIN
  SELECT * INTO v_proposal FROM public.proposals WHERE public_slug::text = p_slug;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', v_proposal.id,
    'user_id', v_proposal.user_id,
    'title', v_proposal.title,
    'description', v_proposal.description,
    'status', v_proposal.status,
    'total', v_proposal.total,
    'valid_until', v_proposal.valid_until,
    'public_slug', v_proposal.public_slug,
    'created_at', v_proposal.created_at,
    'clients', (
      SELECT jsonb_build_object('name', c.name, 'phone', c.phone)
      FROM public.clients c WHERE c.id = v_proposal.client_id
    ),
    'proposal_items', COALESCE((
      SELECT jsonb_agg(to_jsonb(pi.*) ORDER BY pi.sort_order)
      FROM public.proposal_items pi WHERE pi.proposal_id = v_proposal.id
    ), '[]'::jsonb),
    'proposal_images', COALESCE((
      SELECT jsonb_agg(to_jsonb(pim.*))
      FROM public.proposal_images pim WHERE pim.proposal_id = v_proposal.id
    ), '[]'::jsonb),
    'profiles', (
      SELECT jsonb_build_object(
        'full_name', pr.full_name,
        'company_name', pr.company_name,
        'whatsapp', pr.whatsapp,
        'logo_url', pr.logo_url,
        'theme_color', pr.theme_color,
        'background_color', pr.background_color,
        'background_image_url', pr.background_image_url,
        'header_texture', pr.header_texture,
        'header_type', pr.header_type,
        'font_family', pr.font_family,
        'item_layout', pr.item_layout,
        'instagram_url', pr.instagram_url,
        'linkedin_url', pr.linkedin_url,
        'website_url', pr.website_url,
        'payment_link', pr.payment_link,
        'document', pr.document,
        'address', pr.address
      )
      FROM public.profiles pr WHERE pr.id = v_proposal.user_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_proposal_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO anon, authenticated;

-- 6. Secure RPC: fetch a contract by slug only
CREATE OR REPLACE FUNCTION public.get_contract_by_slug(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract contracts%ROWTYPE;
BEGIN
  SELECT * INTO v_contract FROM public.contracts WHERE public_slug::text = p_slug;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_contract.id,
    'user_id', v_contract.user_id,
    'proposal_id', v_contract.proposal_id,
    'type', v_contract.type,
    'content', v_contract.content,
    'status', v_contract.status,
    'professional_signature', v_contract.professional_signature,
    'client_signature', v_contract.client_signature,
    'public_slug', v_contract.public_slug,
    'created_at', v_contract.created_at,
    'updated_at', v_contract.updated_at,
    'proposals', (
      SELECT jsonb_build_object(
        'title', p.title,
        'clients', (SELECT jsonb_build_object('name', c.name) FROM public.clients c WHERE c.id = p.client_id)
      )
      FROM public.proposals p WHERE p.id = v_contract.proposal_id
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_contract_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_contract_by_slug(text) TO anon, authenticated;

-- 7. Secure RPC: client signs a contract via slug (only if not already signed)
CREATE OR REPLACE FUNCTION public.sign_contract_by_slug(p_slug text, p_signature text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_signature IS NULL OR length(p_signature) < 10 OR length(p_signature) > 200000 THEN
    RAISE EXCEPTION 'Invalid signature';
  END IF;

  UPDATE public.contracts
  SET client_signature = p_signature,
      status = 'signed',
      updated_at = now()
  WHERE public_slug::text = p_slug
    AND client_signature IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found or already signed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sign_contract_by_slug(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_contract_by_slug(text, text) TO anon, authenticated;

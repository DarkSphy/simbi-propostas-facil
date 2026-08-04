CREATE OR REPLACE FUNCTION public.get_public_profile(p_slug text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'company_name', p.company_name,
    'whatsapp', p.whatsapp,
    'logo_url', p.logo_url,
    'theme_color', p.theme_color,
    'background_color', p.background_color,
    'background_image_url', p.background_image_url,
    'header_texture', p.header_texture,
    'header_type', p.header_type,
    'font_family', p.font_family,
    'item_layout', p.item_layout,
    'instagram_url', p.instagram_url,
    'linkedin_url', p.linkedin_url,
    'website_url', p.website_url,
    'payment_link', p.payment_link,
    'profile_slug', p.profile_slug,
    'scheduling_settings', p.scheduling_settings,
    'vitrine_hero_type', p.vitrine_hero_type,
    'vitrine_hero_url', p.vitrine_hero_url,
    'vitrine_pitch_video_url', p.vitrine_pitch_video_url,
    'vitrine_pitch_text', p.vitrine_pitch_text,
    'vitrine_skin', p.vitrine_skin,
    'vitrine_testimonials', p.vitrine_testimonials,
    'vitrine_marquee_words', p.vitrine_marquee_words
  )
  FROM public.profiles p
  WHERE p.profile_slug = p_slug;
$function$;
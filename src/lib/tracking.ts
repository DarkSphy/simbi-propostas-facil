import { supabase } from "@/integrations/supabase/client";

interface LogParams {
  proposalId: string;
  eventType: "view" | "approve" | "reject";
  userId: string; // O proprietário da proposta
}

export async function logProposalEvent({ proposalId, eventType, userId }: LogParams) {
  try {
    // 1. Evita registrar logs quando o proprietário do orçamento está visualizando
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    if (currentUserId === userId) {
      console.log("[Tracking] Dono da proposta visualizando. Log ignorado.");
      return;
    }
    
    // 2. Buscar geolocalização e IP (com timeout de 2 segundos para evitar travar o cliente)
    let ipAddress = "Desconhecido";
    let location = "Localização Indisponível";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const geo = await res.json();
        ipAddress = geo.ip || "Desconhecido";
        if (geo.city && geo.region) {
          location = `${geo.city}, ${geo.region} (${geo.country_code || 'BR'})`;
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.log("[Tracking] Falha ao obter dados de geolocalização, usando padrão.");
    }
    
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
    
    // 3. Salvar no Supabase
    const { error } = await supabase.from("proposal_logs").insert({
      proposal_id: proposalId,
      event_type: eventType,
      user_agent: userAgent,
      ip_address: ipAddress,
      location: location,
    });

    if (error) {
      console.error("[Tracking] Erro ao salvar log:", error);
    }
  } catch (err) {
    console.error("[Tracking] Erro inesperado no tracking:", err);
  }
}

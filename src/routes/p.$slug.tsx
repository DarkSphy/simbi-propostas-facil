import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBRL, statusBadge } from "@/lib/format";
import { Check, MessageCircle, X, Instagram, Linkedin, Globe, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({ meta: [{ title: "Proposta · Simbi" }] }),
  component: PublicProposal,
});

// Helper to determine white or black text based on background hex color
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#ffffff";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

function PublicProposal() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: prop, error } = await supabase.from("proposals")
        .select("*,clients(name,phone),proposal_items(*)")
        .eq("public_slug", slug).single();
      
      if (error || !prop) {
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase.from("profiles")
        .select("full_name,company_name,whatsapp,logo_url,theme_color,header_texture,font_family,item_layout,instagram_url,linkedin_url,website_url")
        .eq("id", prop.user_id).single();
        
      setData({ ...prop, profiles: prof || {} });
      setLoading(false);

      if (prop.status === "sent") {
        await supabase.rpc("update_proposal_status", { p_slug: slug, p_status: "viewed" });
      }
    })();
  }, [slug]);

  async function setStatus(status: "approved" | "rejected") {
    const { error } = await supabase.rpc("update_proposal_status", { p_slug: slug, p_status: status });
    if (error) { toast.error(error.message); return; }
    setData({ ...data, status });
    toast.success(status === "approved" ? "Proposta aprovada!" : "Proposta recusada.");
  }

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Proposta não encontrada.</div>;

  const profile = data.profiles ?? {};
  const items = data.proposal_items ?? [];
  const finalized = data.status === "approved" || data.status === "rejected";
  const whatsapp = (profile.whatsapp ?? "").replace(/\D/g, "");
  
  let customStyles = {} as React.CSSProperties;
  
  if (profile.theme_color) {
    customStyles = {
      ...customStyles,
      "--primary": profile.theme_color,
      "--color-primary": profile.theme_color,
      "--primary-foreground": getContrastColor(profile.theme_color),
      "--color-primary-foreground": getContrastColor(profile.theme_color)
    };
  }

  if (profile.background_color) {
    const bgContrast = getContrastColor(profile.background_color);
    customStyles = {
      ...customStyles,
      backgroundColor: profile.background_color,
      color: bgContrast,
      "--foreground": bgContrast,
      "--color-foreground": bgContrast,
    };
  }

  // Resolve tipografia
  const fontClass = profile.font_family === "playfair" ? "font-serif" 
                  : profile.font_family === "quicksand" ? "font-[Quicksand]" 
                  : "font-sans";

  // Resolve textura
  let textureClass = profile.background_color ? "" : "bg-muted/30";
  let textureStyle: React.CSSProperties = { ...customStyles };
  
  if (profile.header_texture === "dots") {
    textureClass = profile.background_color ? "opacity-20" : "bg-muted/10";
    textureStyle.backgroundImage = "radial-gradient(var(--color-border) 1px, transparent 1px)";
    textureStyle.backgroundSize = "20px 20px";
  } else if (profile.header_texture === "grid") {
    textureClass = profile.background_color ? "bg-grid opacity-30" : "bg-grid";
  } else if (profile.header_texture === "waves") {
    textureClass = profile.background_color ? "opacity-20" : "bg-muted/10";
    textureStyle.backgroundImage = "radial-gradient(circle at 100% 50%, transparent 20%, var(--color-primary) 21%, var(--color-primary) 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, var(--color-primary) 21%, var(--color-primary) 34%, transparent 35%, transparent)";
    textureStyle.backgroundSize = "60px 60px";
    textureStyle.opacity = profile.background_color ? 0.15 : 0.05; // mais visivel com cor escura
  }

  const isCards = profile.item_layout === "cards";

  return (
    <div className={`min-h-screen py-10 transition-colors relative ${fontClass}`} style={customStyles}>
      
      {/* Texture Background Layer */}
      <div className={`absolute inset-0 z-0 pointer-events-none ${textureClass}`} style={profile.header_texture === "waves" ? textureStyle : {}} />
      <div className={`absolute inset-0 z-0 pointer-events-none ${profile.header_texture !== "waves" ? textureClass : ""}`} style={profile.header_texture !== "waves" ? textureStyle : {}} />

      <div className="relative z-10 mx-auto max-w-2xl px-4">
        {/* Header Visual with Logo */}
        <div className="mb-10 flex flex-col items-center text-center">
          {profile.logo_url ? (
            <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-white mb-5 transition-transform hover:scale-105">
              <img src={profile.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
            </div>
          ) : (
            <div className="mb-5 grid h-24 w-24 place-items-center rounded-2xl bg-primary text-4xl font-bold text-primary-foreground shadow-2xl border-4 border-white transition-transform hover:scale-105">
              {(profile.company_name?.[0] ?? profile.full_name?.[0] ?? "S").toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{profile.company_name ?? profile.full_name ?? "Profissional"}</h2>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mt-1.5 opacity-90">Proposta Comercial</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
            {statusBadge(data.status)}
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">{data.title}</h1>
            {data.clients?.name && <p className="mt-2 text-sm font-medium text-muted-foreground">Preparado exclusivamente para <span className="text-foreground">{data.clients.name}</span></p>}

            {data.description && <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{data.description}</p>}

            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4">Investimento</h3>
              
              {isCards ? (
                <div className="space-y-4">
                  {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((it: any) => (
                    <div key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        {it.image_url && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20 cursor-zoom-in">
                                <img src={it.image_url} alt={it.description} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                  <ZoomIn className="h-5 w-5 text-white" />
                                </div>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl border-none bg-transparent shadow-none">
                              <DialogTitle className="sr-only">Imagem do item</DialogTitle>
                              <img src={it.image_url} alt={it.description} className="h-auto w-full max-h-[80vh] rounded-2xl object-contain" />
                            </DialogContent>
                          </Dialog>
                        )}
                        <div>
                          <div className="font-semibold text-base leading-tight">{it.description}</div>
                          <div className="mt-1 text-sm text-muted-foreground font-medium">Quantidade: {it.quantity}</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0 flex justify-between sm:block items-center">
                        <div className="text-sm font-semibold text-muted-foreground sm:hidden">Subtotal:</div>
                        <div>
                          <div className="font-bold text-lg">{formatBRL(it.quantity * it.unit_price)}</div>
                          <div className="text-xs text-muted-foreground">{formatBRL(it.unit_price)} un</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden bg-card">
                  <ul className="divide-y divide-border text-sm">
                    {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((it: any) => (
                      <li key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          {it.image_url && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20 cursor-zoom-in">
                                  <img src={it.image_url} alt={it.description} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                  <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                    <ZoomIn className="h-4 w-4 text-white" />
                                  </div>
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl border-none bg-transparent shadow-none">
                                <DialogTitle className="sr-only">Imagem do item</DialogTitle>
                                <img src={it.image_url} alt={it.description} className="h-auto w-full max-h-[80vh] rounded-2xl object-contain" />
                              </DialogContent>
                            </Dialog>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-base leading-tight">{it.description}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{it.quantity} × {formatBRL(it.unit_price)}</div>
                          </div>
                        </div>
                        <div className="font-bold text-base sm:text-right self-end sm:self-auto mt-1 sm:mt-0">{formatBRL(it.quantity * it.unit_price)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-primary/5 border border-primary/10 px-6 py-5">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">Total do Orçamento</span>
                <span className="text-3xl font-black text-primary mt-1 sm:mt-0">{formatBRL(Number(data.total))}</span>
              </div>
            </div>

            {data.notes && (
              <div className="mt-8 rounded-2xl bg-muted/40 p-6 text-sm text-foreground/80 border border-border">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Observações e Condições
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{data.notes}</p>
              </div>
            )}

            <div className="mt-10 space-y-3">
              {!finalized && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all text-base font-semibold" onClick={() => setStatus("rejected")}>
                    <X className="mr-2 h-5 w-5" /> Recusar
                  </Button>
                  <Button className="h-14 rounded-2xl shadow-xl shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-1 text-base font-bold" onClick={() => setStatus("approved")}>
                    <Check className="mr-2 h-5 w-5" /> Aceitar Proposta
                  </Button>
                </div>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Sobre a proposta "${data.title}"…`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-2xl border-2 border-border bg-transparent py-4 text-sm font-bold transition-colors hover:bg-muted/50 mt-4"
                >
                  <MessageCircle className="mr-2 h-5 w-5 text-green-500" /> Tirar dúvidas no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Social Footer */}
        {(profile.instagram_url || profile.linkedin_url || profile.website_url) && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {profile.instagram_url && (
              <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary">
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        )}

        <p className="mt-8 mb-4 text-center text-xs text-muted-foreground opacity-50">Proposta comercial gerada via <span className="font-bold">Simbi</span></p>
      </div>
    </div>
  );
}

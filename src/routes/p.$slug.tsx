import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBRL, statusBadge } from "@/lib/format";
import { Check, MessageCircle, X, Instagram, Linkedin, Globe, ZoomIn, Printer, AlertTriangle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { logProposalEvent } from "@/lib/tracking";import { useAuth } from "@/lib/auth";
import { PrintCustomizer, PrintSettings } from "@/components/PrintCustomizer";

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
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionalItems, setSelectedOptionalItems] = useState<Record<string, boolean>>({});

  const defaultPrintSettings: PrintSettings = {
    margin: 'default',
    font: 'inter',
    showLogo: true,
    showFooter: true,
    ecoMode: false,
  };

  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => {
    try {
      const saved = localStorage.getItem(`simbi_print_settings_${slug}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultPrintSettings;
  });

  const handleSettingsChange = (newSettings: PrintSettings) => {
    setPrintSettings(newSettings);
    localStorage.setItem(`simbi_print_settings_${slug}`, JSON.stringify(newSettings));
  };

  const isOwner = user?.id === data?.user_id;

  useEffect(() => {
    (async () => {
      const { data: prop, error } = await supabase.rpc("get_proposal_by_slug", { p_slug: slug });

      if (error || !prop) {
        setLoading(false);
        return;
      }

      setData(prop);

      const initialOptionalSelection: Record<string, boolean> = {};
      if (prop.proposal_items) {
        const isFinal = prop.status === 'approved' || prop.status === 'rejected';
        prop.proposal_items.forEach((it: any) => {
          if (it.is_optional) {
            initialOptionalSelection[it.id] = isFinal ? it.selected_by_client : false;
          }
        });
      }
      setSelectedOptionalItems(initialOptionalSelection);

      setLoading(false);

      // Registrar o log de visualização
      logProposalEvent({ proposalId: prop.id, eventType: "view", userId: prop.user_id });

      if (prop.status === "sent") {
        await supabase.rpc("update_proposal_status", { p_slug: slug, p_status: "viewed" });
      }
    })();
  }, [slug]);

  async function setStatus(status: "approved" | "rejected") {
    let errorMsg = null;
    if (status === "approved") {
      const selectedIds = Object.keys(selectedOptionalItems).filter(id => selectedOptionalItems[id]);
      const { error } = await supabase.rpc("accept_proposal_with_options", { p_slug: slug, p_selected_item_ids: selectedIds });
      errorMsg = error?.message;
    } else {
      const { error } = await supabase.rpc("update_proposal_status", { p_slug: slug, p_status: status });
      errorMsg = error?.message;
    }
    
    if (errorMsg) { toast.error(errorMsg); return; }
    
    // Registrar o log de aprovação ou rejeição
    logProposalEvent({ 
      proposalId: data.id, 
      eventType: status === "approved" ? "approve" : "reject", 
      userId: data.user_id 
    });

    setData({ ...data, status, total: status === "approved" ? calculateDynamicTotal() : data.total });
    toast.success(status === "approved" ? "Proposta aprovada!" : "Proposta recusada.");
  }

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;
  if (!data) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Proposta não encontrada.</div>;

  const profile = data.profiles ?? {};
  const items = data.proposal_items ?? [];
  const finalized = data.status === "approved" || data.status === "rejected";
  const whatsapp = (profile.whatsapp ?? "").replace(/\D/g, "");
  
  const calculateDynamicTotal = () => {
    if (finalized) return Number(data.total);
    let sum = 0;
    items.forEach((it: any) => {
      if (!it.is_optional || selectedOptionalItems[it.id]) {
        sum += (it.quantity * it.unit_price);
      }
    });
    return sum;
  };
  const displayTotal = calculateDynamicTotal();

  function toggleOptional(id: string) {
    if (finalized) return;
    setSelectedOptionalItems(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Expiration logic
  const validDate = data.valid_until ? new Date(data.valid_until) : null;
  // Use UTC to prevent timezone offsets making it off by 1 day
  if (validDate) validDate.setMinutes(validDate.getMinutes() + validDate.getTimezoneOffset());
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const isExpired = !finalized && validDate && validDate < today;
  
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

  if (profile.background_image_url) {
    customStyles = {
      ...customStyles,
      backgroundImage: `url(${profile.background_image_url})`,
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
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
  const hasImages = items.some((it: any) => !!it.image_url);

  // Dynamic print styles
  const printMargin = printSettings.margin === 'compact' ? '0.5cm' : printSettings.margin === 'wide' ? '2cm' : '1cm';
  const printFont = printSettings.font === 'playfair' ? '"Playfair Display", serif' :
                    printSettings.font === 'quicksand' ? '"Quicksand", sans-serif' :
                    printSettings.font === 'courier' ? '"Courier New", monospace' :
                    '"Inter", sans-serif';

  return (
    <div className={`min-h-screen py-10 transition-colors relative ${fontClass} proposal-body`} style={customStyles}>
      <style>{`
        @media print {
          @page {
            margin: ${printMargin};
          }
          .proposal-body {
            font-family: ${printFont} !important;
          }
          ${!printSettings.showLogo ? '.print-logo { display: none !important; }' : ''}
          ${!printSettings.showFooter ? '.print-footer { display: none !important; }' : ''}
          ${printSettings.ecoMode ? `
            * {
              background: transparent !important;
              color: black !important;
              box-shadow: none !important;
              text-shadow: none !important;
              border-color: #ddd !important;
            }
            .bg-primary { background: transparent !important; border: 1px solid #000 !important; }
            .bg-card { background: transparent !important; }
            .bg-muted { background: transparent !important; }
            .text-primary { color: black !important; }
            .text-muted-foreground { color: #555 !important; }
            .text-emerald-600 { color: black !important; }
            img { filter: grayscale(100%) !important; }
          ` : ''}
        }
      `}</style>
      
      {/* Texture Background Layer */}
      {profile.background_image_url && <div className="absolute inset-0 z-0 pointer-events-none bg-black/40 backdrop-blur-[2px]" />}
      <div className={`absolute inset-0 z-0 pointer-events-none ${textureClass}`} style={profile.header_texture === "waves" ? textureStyle : {}} />
      <div className={`absolute inset-0 z-0 pointer-events-none ${profile.header_texture !== "waves" ? textureClass : ""}`} style={profile.header_texture !== "waves" ? textureStyle : {}} />

      <div className="relative z-10 mx-auto max-w-2xl px-4">
        {/* Header Visual with Logo/Banner */}
        <div className={`mb-10 flex flex-col items-center text-center print-logo ${profile.background_image_url ? 'bg-card/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm mx-auto max-w-lg w-full' : 'max-w-lg mx-auto w-full'}`}>
          {profile.logo_url ? (
            profile.header_type === 'banner' ? (
              <div className="w-full h-32 sm:h-48 overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-muted/20 mb-6 transition-transform hover:scale-[1.02]">
                <img src={profile.logo_url} alt="Banner" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-2xl bg-white mb-5 transition-transform hover:scale-105">
                <img src={profile.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
              </div>
            )
          ) : (
            <div className={`mb-5 grid place-items-center rounded-2xl bg-primary text-4xl font-bold text-primary-foreground shadow-2xl border-4 border-white transition-transform hover:scale-[1.02] ${profile.header_type === 'banner' ? 'w-full h-32 sm:h-48' : 'h-24 w-24 hover:scale-105'}`}>
              {(profile.company_name?.[0] ?? profile.full_name?.[0] ?? "S").toUpperCase()}
            </div>
          )}
          <h2 className={`text-2xl font-extrabold tracking-tight ${profile.background_image_url ? 'text-card-foreground' : ''}`}>{profile.company_name ?? profile.full_name ?? "Profissional"}</h2>
          <div className="mt-3 inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/20">
            Orçamento
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-elevated" style={{ "--foreground": "var(--card-foreground)", "--color-foreground": "var(--color-card-foreground)" } as React.CSSProperties}>
          <div className="h-2 w-full bg-primary" />
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                {isExpired ? <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Expirada</span> : statusBadge(data.status)}
              </div>
              {validDate && !finalized && !isExpired && (
                <div className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Válida até {validDate.toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="rounded-full shadow-sm print:hidden border-border/50 bg-background/50 backdrop-blur-sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Salvar PDF
            </Button>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">{data.title}</h1>
            {data.clients?.name && <p className="mt-2 text-sm font-medium text-muted-foreground">Preparado exclusivamente para <span className="text-primary font-bold">{data.clients.name}</span></p>}

            {data.description && <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{data.description}</p>}

            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-primary" />
                Investimento
              </h3>

              {hasImages && (
                <div className="mb-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 px-5 py-3 text-sm text-foreground/80 flex items-center gap-3">
                  <ZoomIn className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>💡 <strong>Dica:</strong> Clique nas fotos dos itens abaixo para ampliá-las e ver mais detalhes.</span>
                </div>
              )}
              
              {isCards ? (
                <div className="space-y-4">
                  {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((it: any) => (
                    <div key={it.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 rounded-2xl border bg-card shadow-sm transition-colors ${it.is_optional ? (selectedOptionalItems[it.id] ? 'border-primary ring-1 ring-primary/20' : 'border-border border-dashed opacity-80') : 'border-border hover:border-primary/30'}`}>
                      <div className="flex items-center gap-4">
                        {it.is_optional && (
                          <div className="flex shrink-0 items-center justify-center">
                            <input type="checkbox" checked={selectedOptionalItems[it.id] || false} onChange={() => toggleOptional(it.id)} disabled={finalized} className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-default disabled:opacity-50" />
                          </div>
                        )}
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
                          <div className="font-semibold text-base leading-tight flex items-center gap-2">
                            {it.description}
                            {it.is_optional && <span className="text-[10px] uppercase font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">Opcional</span>}
                          </div>
                          <div className="mt-1.5 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/10">
                            Qtd: {it.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0 flex justify-between sm:block items-center">
                        <div className="text-sm font-semibold text-muted-foreground sm:hidden">Subtotal:</div>
                        <div>
                          <div className={`font-bold text-lg ${it.is_optional && !selectedOptionalItems[it.id] ? 'text-muted-foreground line-through opacity-70' : 'text-emerald-600'}`}>{formatBRL(it.quantity * it.unit_price)}</div>
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
                      <li key={it.id} className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 sm:gap-4 transition-colors ${it.is_optional ? (selectedOptionalItems[it.id] ? 'bg-primary/5' : 'bg-muted/10 opacity-80') : ''}`}>
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          {it.is_optional && (
                            <div className="flex shrink-0 items-center justify-center">
                              <input type="checkbox" checked={selectedOptionalItems[it.id] || false} onChange={() => toggleOptional(it.id)} disabled={finalized} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-default disabled:opacity-50" />
                            </div>
                          )}
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
                            <div className="font-semibold text-base leading-tight flex items-center gap-2">
                              {it.description}
                              {it.is_optional && <span className="text-[10px] uppercase font-bold bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">Opcional</span>}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-xs">
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary border border-primary/10">
                                Qtd: {it.quantity}
                              </span>
                              <span className="text-muted-foreground font-medium">× {formatBRL(it.unit_price)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold text-base sm:text-right self-end sm:self-auto mt-1 sm:mt-0 ${it.is_optional && !selectedOptionalItems[it.id] ? 'text-muted-foreground line-through opacity-70' : 'text-emerald-600'}`}>
                          {formatBRL(it.quantity * it.unit_price)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-5 transition-all">
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-700">Total do Orçamento</span>
                <span className="text-3xl font-black text-emerald-600 mt-1 sm:mt-0">{formatBRL(displayTotal)}</span>
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
              {!finalized && !isExpired && (
                <div className="grid gap-3 sm:grid-cols-2 print:hidden">
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all text-base font-semibold bg-card" onClick={() => setStatus("rejected")}>
                    <X className="mr-2 h-5 w-5" /> Recusar
                  </Button>
                  <Button className="h-14 rounded-2xl shadow-xl shadow-emerald-600/30 bg-emerald-600 hover:bg-emerald-700 transition-all hover:-translate-y-1 text-base font-bold text-white border-0" onClick={() => setStatus("approved")}>
                    <Check className="mr-2 h-5 w-5" /> Aceitar Proposta
                  </Button>
                </div>
              )}
              {isExpired && (
                <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-600 border border-red-200 rounded-2xl print:hidden">
                  <AlertTriangle className="h-8 w-8 mb-2 opacity-80" />
                  <p className="font-bold text-lg">Proposta Expirada</p>
                  <p className="text-sm mt-1 opacity-80 text-center">O prazo de validade desta proposta expirou. Entre em contato para atualizações.</p>
                </div>
              )}
              {data.status === "approved" && profile.payment_link && (
                <div className="mt-6 print:hidden">
                  <a href={profile.payment_link.startsWith('http') ? profile.payment_link : `https://${profile.payment_link}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center rounded-2xl bg-primary text-primary-foreground h-16 text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                    Realizar Pagamento <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                  <p className="text-center text-xs text-muted-foreground mt-3">Você será redirecionado para o ambiente seguro de pagamento.</p>
                </div>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Sobre a proposta "${data.title}"…`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-2xl border-2 border-primary/20 bg-transparent py-4 text-sm font-bold text-foreground transition-colors hover:bg-primary/5 hover:border-primary/50 mt-4"
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
              <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary" style={{ "--foreground": "var(--card-foreground)", "--color-foreground": "var(--color-card-foreground)" } as React.CSSProperties}>
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary" style={{ "--foreground": "var(--card-foreground)", "--color-foreground": "var(--color-card-foreground)" } as React.CSSProperties}>
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} target="_blank" rel="noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-sm transition-all hover:scale-110 hover:border-primary hover:text-primary" style={{ "--foreground": "var(--card-foreground)", "--color-foreground": "var(--color-card-foreground)" } as React.CSSProperties}>
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        )}

        <p className="mt-8 mb-4 text-center text-xs opacity-60 print-footer">Proposta comercial gerada via <span className="font-bold">Simbi</span></p>
      </div>

      {isOwner && (
        <PrintCustomizer 
          settings={printSettings} 
          onChange={handleSettingsChange} 
          onPrint={() => window.print()} 
        />
      )}
    </div>
  );
}

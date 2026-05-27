import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBRL, statusBadge } from "@/lib/format";
import { Check, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({ meta: [{ title: "Proposta · Simbi" }] }),
  component: PublicProposal,
});

// Helper to convert HEX to HSL for Tailwind CSS variables
function hexToHslString(hex: string) {
  if (!hex) return "";
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
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
        .select("full_name,company_name,whatsapp,logo_url,theme_color")
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
  
  const themeHsl = profile.theme_color ? hexToHslString(profile.theme_color) : "";
  const customStyles = themeHsl ? { "--primary": themeHsl } as React.CSSProperties : {};

  return (
    <div className="min-h-screen bg-muted/30 py-10 transition-colors" style={customStyles}>
      <div className="mx-auto max-w-xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          <div className="border-b border-border bg-card px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile.logo_url ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img src={profile.logo_url} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {(profile.company_name?.[0] ?? profile.full_name?.[0] ?? "S").toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold">{profile.company_name ?? profile.full_name ?? "Profissional"}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Proposta Comercial</div>
                </div>
              </div>
              {statusBadge(data.status)}
            </div>
          </div>

          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">{data.title}</h1>
            {data.clients?.name && <p className="mt-1 text-sm text-muted-foreground">Para {data.clients.name}</p>}

            {data.description && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{data.description}</p>}

            <div className="mt-8 rounded-xl border border-border overflow-hidden">
              <ul className="divide-y divide-border text-sm">
                {items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((it: any) => (
                  <li key={it.id} className="flex items-center justify-between px-4 py-4 gap-4">
                    {it.image_url && (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted/20">
                        <img src={it.image_url} alt={it.description} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-base">{it.description}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground font-medium">{it.quantity} × {formatBRL(it.unit_price)}</div>
                    </div>
                    <div className="font-semibold text-base">{formatBRL(it.quantity * it.unit_price)}</div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total do Orçamento</span>
                <span className="text-xl font-bold text-primary">{formatBRL(Number(data.total))}</span>
              </div>
            </div>

            {data.notes && (
              <div className="mt-6 rounded-2xl bg-muted/30 p-5 text-sm text-muted-foreground">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary">Observações / Condições</div>
                <p className="whitespace-pre-wrap leading-relaxed">{data.notes}</p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {!finalized && (
                <>
                  <Button className="w-full rounded-2xl shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5" size="lg" onClick={() => setStatus("approved")}>
                    <Check className="mr-2 h-5 w-5" /> Aceitar Proposta
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl border-dashed" onClick={() => setStatus("rejected")}>
                    <X className="mr-2 h-4 w-4" /> Recusar
                  </Button>
                </>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Sobre a proposta "${data.title}"…`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-2xl border border-border bg-card py-3 text-sm font-medium transition-colors hover:bg-muted/40"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Conversar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground opacity-60">Proposta comercial gerada via <span className="font-bold">Simbi</span></p>
      </div>
    </div>
  );
}

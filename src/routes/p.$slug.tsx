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
        .select("full_name,company_name,whatsapp")
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

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto max-w-xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          <div className="border-b border-border bg-card px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {(profile.company_name?.[0] ?? profile.full_name?.[0] ?? "S").toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{profile.company_name ?? profile.full_name ?? "Profissional"}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Proposta</div>
                </div>
              </div>
              {statusBadge(data.status)}
            </div>
          </div>

          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">{data.title}</h1>
            {data.clients?.name && <p className="mt-1 text-sm text-muted-foreground">Para {data.clients.name}</p>}

            {data.description && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{data.description}</p>}

            <div className="mt-6 rounded-xl border border-border">
              <ul className="divide-y divide-border text-sm">
                {items.map((it: any) => (
                  <li key={it.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="font-medium">{it.description}</div>
                      <div className="text-xs text-muted-foreground">{it.quantity} × {formatBRL(it.unit_price)}</div>
                    </div>
                    <div className="font-medium">{formatBRL(it.quantity * it.unit_price)}</div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">{formatBRL(Number(data.total))}</span>
              </div>
            </div>

            {data.notes && (
              <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest">Observações</div>
                <p className="whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              {!finalized && (
                <>
                  <Button className="w-full rounded-xl" size="lg" onClick={() => setStatus("approved")}>
                    <Check className="mr-2 h-4 w-4" /> Aprovar proposta
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => setStatus("rejected")}>
                    <X className="mr-2 h-4 w-4" /> Recusar
                  </Button>
                </>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Sobre a proposta "${data.title}"…`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-border bg-card py-2.5 text-sm font-medium hover:bg-muted/40"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">Proposta enviada via <span className="font-semibold text-foreground">Simbi</span></p>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MessageCircle, Trash2, Copy } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/proposals/$id")({
  head: () => ({ meta: [{ title: "Proposta · Simbi" }] }),
  component: ProposalDetail,
});

function ProposalDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("*,clients(name,phone),proposal_items(*)")
        .eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !data) return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>;

  const publicUrl = `${window.location.origin}/p/${data.public_slug}`;
  const client = (data as any).clients;
  const items = (data as any).proposal_items ?? [];

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  }
  function shareWhatsapp() {
    const phone = client?.phone?.replace(/\D/g, "") ?? "";
    const msg = encodeURIComponent(`Olá! Segue a proposta: ${publicUrl}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }
  async function remove() {
    if (!confirm("Excluir esta proposta?")) return;
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Proposta excluída");
    qc.invalidateQueries({ queryKey: ["proposals-list"] });
    navigate({ to: "/proposals" });
  }

  async function updateStatus(newStatus: string) {
    const { error } = await supabase.from("proposals").update({ status: newStatus as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status atualizado!");
    qc.invalidateQueries({ queryKey: ["proposal", id] });
    qc.invalidateQueries({ queryKey: ["proposals-list"] });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/proposals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {client?.name ?? "Sem cliente"} · {statusBadge(data.status)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}><Copy className="mr-1 h-4 w-4" /> Link</Button>
          <Button size="sm" onClick={shareWhatsapp}><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</Button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-sm">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <a href={publicUrl} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{publicUrl}</a>
        </div>
      </div>

      {data.description && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Descrição</h2>
          <p className="whitespace-pre-wrap text-sm">{data.description}</p>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Itens</h2>
        <ul className="divide-y divide-border text-sm">
          {items.map((it: any) => (
            <li key={it.id} className="flex justify-between py-2">
              <span>{it.description} <span className="text-muted-foreground">× {it.quantity}</span></span>
              <span>{formatBRL(it.quantity * it.unit_price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold"><span>Total</span><span>{formatBRL(Number(data.total))}</span></div>
      </div>

      {data.notes && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Observações</h2>
          <p className="whitespace-pre-wrap text-sm">{data.notes}</p>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Alterar Status</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => updateStatus("in_progress")}>Marcar: Em execução</Button>
          <Button variant="outline" size="sm" onClick={() => updateStatus("finished")}>Marcar: Finalizada</Button>
          <Button variant="outline" size="sm" onClick={() => updateStatus("paid")} className="text-emerald-600 hover:text-emerald-700">Marcar: Paga</Button>
          <Button variant="outline" size="sm" onClick={() => updateStatus("canceled")} className="text-destructive hover:text-destructive">Marcar: Cancelada</Button>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={remove}><Trash2 className="mr-1 h-4 w-4" /> Excluir proposta</Button>
      </div>
    </div>
  );
}

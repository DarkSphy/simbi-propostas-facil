import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/proposals/")({
  head: () => ({ meta: [{ title: "Propostas · Simbi" }] }),
  component: ProposalsList,
});

function ProposalsList() {
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
        <Button asChild className="rounded-full shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5">
          <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Nova proposta</Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : proposals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Sem propostas por aqui</h3>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta e envie pelo WhatsApp.</p>
            <Button asChild className="mt-6 rounded-full shadow-lg shadow-primary/20 glow-primary hover:glow-primary-hover hover:-translate-y-0.5">
              <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Criar proposta</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {proposals.map(p => (
              <li key={p.id}>
                <Link to="/proposals/$id" params={{ id: p.id }} className="group flex items-center gap-4 px-6 py-5 transition-all hover:bg-muted/30">
                  <div className="flex-1 truncate">
                    <div className="truncate text-base font-semibold transition-colors group-hover:text-primary">{p.title}</div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">{(p as any).clients?.name ?? "Sem cliente"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="w-28 text-right text-base font-medium">{formatBRL(Number(p.total))}</div>
                  <div className="w-28 text-right">{statusBadge(p.status)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

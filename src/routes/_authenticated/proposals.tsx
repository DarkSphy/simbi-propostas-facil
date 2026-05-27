import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/proposals")({
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
        <h1 className="text-2xl font-bold tracking-tight">Propostas</h1>
        <Button asChild className="rounded-full"><Link to="/proposals/new"><Plus className="mr-1 h-4 w-4" /> Nova proposta</Link></Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : proposals.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="mt-3 font-semibold">Sem propostas por aqui</h3>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta e envie pelo WhatsApp.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/proposals/new"><Plus className="mr-1 h-4 w-4" /> Criar proposta</Link></Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {proposals.map(p => (
              <li key={p.id}>
                <Link to="/proposals/$id" params={{ id: p.id }} className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/40">
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{(p as any).clients?.name ?? "Sem cliente"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="w-28 text-right text-sm font-medium">{formatBRL(Number(p.total))}</div>
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, statusBadge } from "@/lib/format";
import { ClipboardList, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/work-orders")({
  head: () => ({ meta: [{ title: "Ordens de Serviço · Simbi" }] }),
  component: WorkOrdersPage,
});

function WorkOrdersPage() {
  const [search, setSearch] = useState("");

  const { data: proposals = [] } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
        .eq("status", "in_progress")
        .order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const filteredProposals = proposals.filter((p: any) => {
    const term = search.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const clientMatch = p.clients?.name?.toLowerCase().includes(term);
    return titleMatch || clientMatch;
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerar Ordem de Serviço</h1>
          <p className="mt-1 text-sm text-muted-foreground">Propostas em andamento prontas para impressão e execução.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar serviço ou cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-card"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {proposals.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blue-500/10"><ClipboardList className="h-5 w-5 text-blue-600" /></div>
            <h3 className="mt-3 font-semibold">Nenhum serviço em andamento</h3>
            <p className="mt-1 text-sm text-muted-foreground">Propostas com o status "Em execução" aparecerão aqui para gerar OS.</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma proposta encontrada na busca.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredProposals.map(p => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{(p as any).clients?.name ?? "—"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="hidden sm:block w-28 text-right">{statusBadge(p.status)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold px-4">
                    <Link to="/os/$id" params={{ id: p.id }}>
                      <Printer className="mr-2 h-4 w-4" />
                      Gerar OS
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

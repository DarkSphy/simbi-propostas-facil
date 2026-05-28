import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/proposals/")({
  head: () => ({ meta: [{ title: "Propostas · Simbi" }] }),
  component: ProposalsList,
});

function ProposalsList() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filteredProposals = proposals.filter((p: any) => {
    const term = search.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const clientMatch = p.clients?.name?.toLowerCase().includes(term);
    return titleMatch || clientMatch;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título ou cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Button asChild className="rounded-full shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5 whitespace-nowrap">
            <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Nova proposta</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-elevated">
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
        ) : filteredProposals.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma proposta encontrada na busca.</div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filteredProposals.map(p => (
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

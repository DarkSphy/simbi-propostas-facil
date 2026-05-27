import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, statusBadge } from "@/lib/format";
import { History, Search, Copy, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Histórico · Simbi" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(id: string, action: 'clone' | 'edit') {
    setActionLoading(`${action}-${id}`);
    try {
      const { data, error } = await supabase.from("proposals").select("*, proposal_items(*)").eq("id", id).single();
      if (error) throw error;
      sessionStorage.setItem(action === 'clone' ? "cloneProposal" : "editProposal", JSON.stringify(data));
      navigate({ to: "/proposals/new" });
    } catch (e: any) {
      toast.error("Erro ao carregar proposta.");
    } finally {
      setActionLoading(null);
    }
  }

  const { data: proposals = [] } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
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
          <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
          <p className="mt-1 text-sm text-muted-foreground">Todas as suas propostas em um só lugar.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título ou cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-card"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {proposals.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><History className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Sem histórico</h3>
            <p className="mt-1 text-sm text-muted-foreground">Quando você enviar propostas, elas aparecerão aqui.</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma proposta encontrada na busca.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredProposals.map(p => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
                <Link to="/proposals/$id" params={{ id: p.id }} className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium hover:text-primary transition-colors">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{(p as any).clients?.name ?? "—"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="w-24 sm:w-28 text-right text-sm font-medium">{formatBRL(Number(p.total))}</div>
                  <div className="hidden sm:block w-28 text-right">{statusBadge(p.status)}</div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleAction(p.id, 'edit')} disabled={!!actionLoading} title="Editar proposta" className="hidden sm:inline-flex">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleAction(p.id, 'clone')} disabled={!!actionLoading} title="Duplicar proposta">
                    <Copy className="h-4 w-4 text-muted-foreground" />
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

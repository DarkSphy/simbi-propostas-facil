import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, statusBadge } from "@/lib/format";
import { History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Histórico · Simbi" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: proposals = [] } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
      <p className="mt-1 text-sm text-muted-foreground">Todas as suas propostas em um só lugar.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {proposals.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><History className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Sem histórico</h3>
            <p className="mt-1 text-sm text-muted-foreground">Quando você enviar propostas, elas aparecerão aqui.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {proposals.map(p => (
              <li key={p.id}>
                <Link to="/proposals/$id" params={{ id: p.id }} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40">
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{(p as any).clients?.name ?? "—"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
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

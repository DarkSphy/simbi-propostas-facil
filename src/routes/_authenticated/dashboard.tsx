import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FileText, CheckCircle2, Percent, DollarSign } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Simbi" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,client_id,clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const isWon = (status: string) => ["approved", "paid", "finished"].includes(status);
  const sent = proposals.length;
  const approved = proposals.filter(p => isWon(p.status)).length;
  const rate = sent ? Math.round((approved / sent) * 100) : 0;
  const total = proposals.filter(p => isWon(p.status)).reduce((s, p) => s + Number(p.total), 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary">Olá 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5">
          <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Nova proposta</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Propostas enviadas" value={String(sent)} />
        <Stat icon={CheckCircle2} label="Aprovadas" value={String(approved)} />
        <Stat icon={Percent} label="Taxa de aprovação" value={`${rate}%`} />
        <Stat icon={DollarSign} label="Total movimentado" value={formatBRL(total)} />
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card transition-all">
        <div className="flex items-center justify-between border-b border-border/50 bg-transparent px-6 py-5">
          <h2 className="text-lg font-bold tracking-tight">Últimas propostas</h2>
          <Link to="/proposals" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
        </div>
        {proposals.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border/50">
            {proposals.slice(0, 6).map(p => (
              <li key={p.id} className="flex items-center justify-between px-6 py-5 text-sm transition-colors hover:bg-muted/10">
                <Link to="/proposals/$id" params={{ id: p.id }} className="flex-1 truncate font-semibold transition-colors hover:text-primary">
                  {p.title}
                </Link>
                <span className="hidden flex-1 truncate text-muted-foreground sm:block">{(p as any).clients?.name ?? "—"}</span>
                <span className="w-24 text-right font-medium">{formatBRL(Number(p.total))}</span>
                <span className="ml-4 w-24 text-right">{statusBadge(p.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">{label}</span>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary">
          <Icon className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" />
        </div>
      </div>
      <div className="relative mt-5 text-3xl font-black tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
        <FileText className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Nenhuma proposta ainda</h3>
      <p className="mt-1 text-sm text-muted-foreground">Sua primeira venda está a um clique de distância.</p>
      <Button asChild className="mt-6 rounded-full shadow-lg shadow-primary/20 glow-primary hover:glow-primary-hover hover:-translate-y-0.5">
        <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Criar primeira proposta</Link>
      </Button>
    </div>
  );
}

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

  const sent = proposals.length;
  const approved = proposals.filter(p => p.status === "approved").length;
  const rate = sent ? Math.round((approved / sent) * 100) : 0;
  const total = proposals.filter(p => p.status === "approved").reduce((s, p) => s + Number(p.total), 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Olá 👋</p>
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        </div>
        <Button asChild className="rounded-full"><Link to="/proposals/new"><Plus className="mr-1 h-4 w-4" /> Nova proposta</Link></Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Propostas enviadas" value={String(sent)} />
        <Stat icon={CheckCircle2} label="Aprovadas" value={String(approved)} />
        <Stat icon={Percent} label="Taxa de aprovação" value={`${rate}%`} />
        <Stat icon={DollarSign} label="Total movimentado" value={formatBRL(total)} />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Últimas propostas</h2>
          <Link to="/proposals" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        {proposals.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {proposals.slice(0, 6).map(p => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <Link to="/proposals/$id" params={{ id: p.id }} className="flex-1 truncate font-medium hover:text-primary">
                  {p.title}
                </Link>
                <span className="hidden flex-1 truncate text-muted-foreground sm:block">{(p as any).clients?.name ?? "—"}</span>
                <span className="w-24 text-right">{formatBRL(Number(p.total))}</span>
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent">
        <FileText className="h-5 w-5 text-accent-foreground" />
      </div>
      <h3 className="mt-3 font-semibold">Nenhuma proposta ainda</h3>
      <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta em menos de 2 minutos.</p>
      <Button asChild className="mt-4 rounded-full"><Link to="/proposals/new"><Plus className="mr-1 h-4 w-4" /> Nova proposta</Link></Button>
    </div>
  );
}

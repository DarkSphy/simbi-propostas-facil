import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL, statusBadge } from "@/lib/format";
import { subDays, parseISO, isAfter } from "date-fns";
import { Users, FileText, CheckCircle2, DollarSign, Printer, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Relatórios · Simbi" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<number>(30); // 7, 15, 30

  const { data: rawProposals = [], isLoading: isLoadingProposals } = useQuery({
    queryKey: ["reports-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,clients(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: rawClients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["reports-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients")
        .select("id,created_at")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const cutoffDate = subDays(new Date(), period);

  // Filter data by period
  const periodProposals = rawProposals.filter(p => isAfter(parseISO(p.created_at), cutoffDate));
  const periodClients = rawClients.filter(c => isAfter(parseISO(c.created_at), cutoffDate));

  // Compute metrics
  const newClientsCount = periodClients.length;
  const sentProposalsCount = periodProposals.length;
  const sentProposalsValue = periodProposals.reduce((sum, p) => sum + Number(p.total), 0);

  const wonStatuses = ["approved", "paid", "finished"];
  const wonProposals = periodProposals.filter(p => wonStatuses.includes(p.status));
  const wonProposalsCount = wonProposals.length;
  const wonProposalsValue = wonProposals.reduce((sum, p) => sum + Number(p.total), 0);

  const conversionRate = sentProposalsCount > 0 ? Math.round((wonProposalsCount / sentProposalsCount) * 100) : 0;

  const isLoading = isLoadingProposals || isLoadingClients;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 print:p-0 print:bg-white print:text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório de Desempenho</h1>
          <p className="mt-1 text-sm text-muted-foreground print:hidden">Acompanhe as métricas de crescimento do seu negócio.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex rounded-lg bg-muted p-1">
            {[7, 15, 30].map(days => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === days ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {days} dias
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-8 border-b pb-4">
        <h2 className="text-xl font-bold">Resumo: Últimos {period} dias</h2>
        <p className="text-gray-500">Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Carregando dados...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard icon={Users} label="Novos Clientes" value={String(newClientsCount)} subtitle={`Nos últimos ${period} dias`} color="blue" />
            <StatCard icon={FileText} label="Orçamentos Feitos" value={String(sentProposalsCount)} subtitle={formatBRL(sentProposalsValue)} color="amber" />
            <StatCard icon={CheckCircle2} label="Vendas Fechadas" value={String(wonProposalsCount)} subtitle={formatBRL(wonProposalsValue)} color="emerald" />
            <StatCard icon={Percent} label="Taxa de Conversão" value={`${conversionRate}%`} subtitle="Fechamentos / Envios" color="purple" />
          </div>

          <div className="rounded-3xl border border-border/50 bg-card shadow-card overflow-hidden print:border-none print:shadow-none">
            <div className="border-b border-border/50 bg-muted/20 px-6 py-5 print:bg-transparent print:px-0">
              <h2 className="text-lg font-bold tracking-tight">Detalhes de Vendas Fechadas</h2>
              <p className="text-sm text-muted-foreground">Orçamentos que foram aprovados ou pagos nesse período.</p>
            </div>
            {wonProposals.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma venda fechada nos últimos {period} dias.</div>
            ) : (
              <div className="overflow-x-auto overflow-y-hidden">
                <div className="min-w-[600px]">
                  <table className="w-full text-left text-sm print:text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30 print:bg-gray-100">
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Serviço / Título</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Data</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Valor</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right print:hidden">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {wonProposals.map(p => (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors print:hover:bg-transparent">
                      <td className="px-6 py-4 font-medium">{p.title}</td>
                      <td className="px-6 py-4">{(p.clients as any)?.name ?? "Sem cliente"}</td>
                      <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-4 font-semibold text-right">{formatBRL(Number(p.total))}</td>
                      <td className="px-6 py-4 text-right print:hidden">{statusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/50 print:bg-emerald-50">
                    <td colSpan={3} className="px-6 py-4 font-bold text-right text-emerald-900 uppercase text-xs tracking-widest">Total Faturado no Período</td>
                    <td className="px-6 py-4 font-black text-emerald-700 text-right text-lg">{formatBRL(wonProposalsValue)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color }: any) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
    amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    purple: "text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-600 group-hover:text-white",
  }[color as string] || "text-gray-600 bg-gray-50 border-gray-100 group-hover:bg-gray-600 group-hover:text-white";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-elevated print:shadow-none print:border-gray-300">
      <div className="relative flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
          <div className="mt-4 text-4xl font-black tracking-tight text-foreground">{value}</div>
          <div className="mt-2 text-sm font-medium text-muted-foreground">{subtitle}</div>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl border transition-colors print:hidden ${colorClasses}`}>
          <Icon className="h-6 w-6 transition-colors" />
        </div>
      </div>
    </div>
  );
}

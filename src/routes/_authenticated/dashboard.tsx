import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, FileText, CheckCircle2, Percent, DollarSign, CalendarDays } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, subMonths, differenceInDays } from "date-fns";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { MessageCircle, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Simbi" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: catalogCount = 0 } = useQuery({
    queryKey: ["catalogCount", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("catalog_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery({
    queryKey: ["proposals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,public_slug,client_id,clients(name,phone)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("profile_slug").eq("id", user?.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", "dashboard", user?.id],
    queryFn: async () => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("appointments")
        .select("id, title, date, time, status, clients(name)")
        .eq("user_id", user?.id)
        .gte("date", todayStr)
        .neq("status", "canceled")
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Onboarding: Inject dummy data if it's a new account
  useEffect(() => {
    if (!user || isLoadingProposals || proposals.length > 0 || localStorage.getItem("dummyInjected_" + user.id)) return;
    
    async function injectDummyData() {
      localStorage.setItem("dummyInjected_" + user.id, "true");
      try {
        const { data: client } = await supabase.from("clients").insert({
          user_id: user!.id, name: "João Silva (Exemplo)", email: "joao.exemplo@email.com",
          phone: "11999999999", document: "123.456.789-00", address: "Rua Exemplo, 123 - Centro"
        }).select().single();
        if (!client) return;

        const { data: proposal } = await supabase.from("proposals").insert({
          user_id: user!.id, client_id: client.id, title: "Proposta Exemplo - Revisão Completa",
          description: "Essa é uma proposta de exemplo. Sinta-se livre para excluí-la depois.",
          status: "approved", total: 1350.00
        }).select().single();
        if (!proposal) return;

        await supabase.from("proposal_items").insert([
          { proposal_id: proposal.id, title: "Troca de Óleo + Filtro", quantity: 1, price: 150.00, order_index: 0 },
          { proposal_id: proposal.id, title: "Kit Correia Dentada (Peça e Mão de Obra)", quantity: 1, price: 1200.00, order_index: 1 }
        ]);

        queryClient.invalidateQueries({ queryKey: ["proposals"] });
      } catch (e) {}
    }
    injectDummyData();
  }, [user, isLoadingProposals, proposals.length, queryClient]);

  const isWon = (status: string) => ["approved", "paid", "finished"].includes(status);
  const sent = proposals.length;
  const approved = proposals.filter(p => isWon(p.status)).length;
  const rate = sent ? Math.round((approved / sent) * 100) : 0;
  const total = proposals.filter(p => isWon(p.status)).reduce((s, p) => s + Number(p.total), 0);

  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const monthStr = format(d, 'MMM', { locale: ptBR });
    const monthProposals = proposals.filter(p => {
      const pDate = parseISO(p.created_at);
      return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
    });
    const monthApproved = monthProposals.filter(p => isWon(p.status));
    const revenue = monthApproved.reduce((sum, p) => sum + Number(p.total), 0);
    return { name: monthStr.toUpperCase(), revenue };
  });

  const pendingFollowups = proposals.filter(p => p.status === 'sent' && differenceInDays(new Date(), parseISO(p.created_at)) >= 3);

  function handleFollowUp(p: any) {
    const publicUrl = profile?.profile_slug 
      ? `${window.location.origin}/p/${profile.profile_slug}/${p.public_slug}`
      : `${window.location.origin}/p/${p.public_slug}`;
    const phone = (p.clients as any)?.phone?.replace(/\D/g, "") ?? "";
    if (!phone) {
      alert("Este cliente não tem telefone cadastrado.");
      return;
    }
    const msg = encodeURIComponent(`Olá, ${(p.clients as any)?.name.split(" ")[0]}! Tudo bem?\nSó passando para ver se conseguiu analisar o orçamento que te enviei. Qualquer dúvida, estou à disposição!\n\nLink: ${publicUrl}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary">Olá 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        </div>
        <div className="relative">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {(proposals.length === 0 || proposals.length === 1) && !isLoadingProposals && (
                    <>
                      <div className="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-blue-500 animate-ping opacity-75" />
                      <div className="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-blue-500" />
                    </>
                  )}
                  <Button asChild className="rounded-full shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5">
                    <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Nova proposta</Link>
                  </Button>
                </div>
              </TooltipTrigger>
              {(proposals.length === 0 || proposals.length === 1) && !isLoadingProposals && (
                <TooltipContent side="bottom" align="end" className="bg-blue-600 text-white max-w-[200px] text-xs p-3 font-medium">
                  Dica: Crie sua primeira proposta oficial e envie para o WhatsApp do cliente.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <OnboardingChecklist proposalsCount={proposals.length} catalogCount={catalogCount} />

      {appointments.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-900">Sua Agenda</h2>
            </div>
            <Button size="sm" variant="outline" className="bg-white" asChild>
              <Link to="/agenda">Abrir Calendário</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {appointments.map(apt => {
              const isTodayApt = apt.date === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={apt.id} className={`p-4 rounded-xl border bg-white flex flex-col justify-between gap-2 ${isTodayApt ? 'border-blue-300 ring-1 ring-blue-100 shadow-md' : 'border-blue-100'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isTodayApt && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Hoje</span>}
                      <span className="text-xs font-semibold text-blue-600">{format(parseISO(apt.date), "dd 'de' MMM", { locale: ptBR })} {apt.time && `às ${apt.time.substring(0,5)}`}</span>
                    </div>
                    <div className="font-semibold text-gray-900 line-clamp-1" title={apt.title}>{apt.title}</div>
                    {(apt.clients as any)?.name && <div className="text-xs text-gray-500 mt-1 line-clamp-1">Cliente: {(apt.clients as any).name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingFollowups.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-bold text-amber-900">Acompanhamento Pendente</h2>
          </div>
          <p className="text-sm text-amber-800 mb-5">Você tem {pendingFollowups.length === 1 ? "1 orçamento enviado" : `${pendingFollowups.length} orçamentos enviados`} há mais de 3 dias sem resposta. Lembre os clientes para não perder a venda!</p>
          <div className="space-y-3">
            {pendingFollowups.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-white">
                <div>
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="text-xs text-gray-500">{(p.clients as any)?.name ?? "Cliente"} · Há {differenceInDays(new Date(), parseISO(p.created_at))} dias</div>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full whitespace-nowrap px-4" onClick={() => handleFollowUp(p)}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Lembrar Cliente
                </Button>
              </div>
            ))}
            {pendingFollowups.length > 3 && (
              <Button variant="link" className="text-amber-700 p-0 h-auto" asChild>
                <Link to="/proposals">Ver todos os pendentes</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Propostas enviadas" value={String(sent)} />
        <Stat icon={CheckCircle2} label="Aprovadas" value={String(approved)} />
        <Stat icon={Percent} label="Taxa de aprovação" value={`${rate}%`} />
        <Stat icon={DollarSign} label="Total aprovado" value={formatBRL(total)} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card p-6">
          <h2 className="text-lg font-bold tracking-tight mb-6">Faturamento Aprovado (6 meses)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip 
                  formatter={(value: number) => [formatBRL(value), "Faturamento"]}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card transition-all">
          <div className="flex items-center justify-between border-b border-border/50 bg-transparent px-6 py-5">
            <h2 className="text-lg font-bold tracking-tight">Últimas propostas</h2>
            <Link to="/proposals" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
          </div>
          {proposals.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border/50">
              {proposals.slice(0, 5).map(p => (
                <li key={p.id} className="flex flex-col px-6 py-4 text-sm transition-colors hover:bg-muted/10 gap-2">
                  <div className="flex items-center justify-between">
                    <Link to="/proposals/$id" params={{ id: p.id }} className="truncate font-semibold transition-colors hover:text-primary">
                      {p.title}
                    </Link>
                    <span className="w-24 text-right">{statusBadge(p.status)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="truncate">{(p as any).clients?.name ?? "—"}</span>
                    <span className="font-medium text-foreground">{formatBRL(Number(p.total))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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
      <Button asChild className="mt-6 rounded-full shadow-lg shadow-primary/20 glow-primary hover:glow-primary-hover hover:-translate-y-0.5 relative">
        <Link to="/proposals/new">
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-ping opacity-75" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
          <Plus className="mr-1.5 h-4 w-4" /> Criar primeira proposta
        </Link>
      </Button>
    </div>
  );
}

function OnboardingChecklist({ proposalsCount, catalogCount }: { proposalsCount: number, catalogCount: number }) {
  const steps = [
    { title: "Conta criada com sucesso", desc: "Seja bem-vindo ao Simbi!", done: true, href: "#" },
    { title: "Adicionar serviço ao catálogo", desc: "Salve um serviço comum para não precisar digitar de novo.", done: catalogCount > 0, href: "/catalog" },
    { title: "Criar sua primeira proposta (real)", desc: "Faça um orçamento de verdade e envie para um cliente.", done: proposalsCount > 1, href: "/proposals/new" },
  ];
  
  const progress = steps.filter(s => s.done).length;
  if (progress === steps.length) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Primeiros Passos ({progress}/{steps.length})</h2>
      <p className="text-sm text-gray-600 mb-6">Complete estas ações para ver o poder do Simbi na prática.</p>
      
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <Link key={idx} to={step.href as any} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${step.done ? 'bg-green-50 border-green-200' : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-sm'}`}>
            <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${step.done ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {step.done ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold text-sm">{idx + 1}</span>}
            </div>
            <div>
              <div className={`font-semibold ${step.done ? 'text-green-800 line-through opacity-70' : 'text-gray-900'}`}>{step.title}</div>
              <div className={`text-xs ${step.done ? 'text-green-600/70' : 'text-gray-500'}`}>{step.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

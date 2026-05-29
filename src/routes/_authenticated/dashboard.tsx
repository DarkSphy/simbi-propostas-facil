import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, FileText, CheckCircle2, Percent, DollarSign, CalendarDays, TrendingUp, Users, Crown } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO, subMonths, differenceInDays } from "date-fns";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { MessageCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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
      const { data } = await supabase.from("profiles").select("full_name, profile_slug").eq("id", user?.id).single();
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

  // Onboarding
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

  // Metrics Calculations
  const isWon = (status: string) => ["approved", "paid", "finished"].includes(status);
  const isPending = (status: string) => ["sent", "viewed"].includes(status);
  
  const sentCount = proposals.length;
  const approvedCount = proposals.filter(p => isWon(p.status)).length;
  const rate = sentCount ? Math.round((approvedCount / sentCount) * 100) : 0;
  const totalRevenue = proposals.filter(p => isWon(p.status)).reduce((s, p) => s + Number(p.total), 0);
  const ticketMedio = approvedCount > 0 ? totalRevenue / approvedCount : 0;

  // Chart Data (AreaChart)
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const monthStr = format(d, 'MMM', { locale: ptBR });
    const monthProposals = proposals.filter(p => {
      const pDate = parseISO(p.created_at);
      return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
    });
    
    const revenue = monthProposals.filter(p => isWon(p.status)).reduce((sum, p) => sum + Number(p.total), 0);
    const predicted = monthProposals.filter(p => isPending(p.status)).reduce((sum, p) => sum + Number(p.total), 0);
    
    return { name: monthStr.toUpperCase(), revenue, predicted };
  });

  // Conversion PieChart Data
  const conversionData = [
    { name: "Aprovadas", value: approvedCount },
    { name: "Perdidas/Pendentes", value: sentCount - approvedCount }
  ];
  const COLORS = ['#2563eb', '#e2e8f0'];

  // Top Clients
  const clientsMap: Record<string, { name: string, revenue: number, count: number }> = {};
  proposals.filter(p => isWon(p.status)).forEach(p => {
    const cName = (p.clients as any)?.name || "Cliente Desconhecido";
    if (!clientsMap[cName]) clientsMap[cName] = { name: cName, revenue: 0, count: 0 };
    clientsMap[cName].revenue += Number(p.total);
    clientsMap[cName].count++;
  });
  const topClients = Object.values(clientsMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

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

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="mx-auto max-w-7xl px-5 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {profile?.full_name ? `Olá, ${profile.full_name.split(' ')[0]}.` : "Dashboard."}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">
            Acompanhe seu desempenho e métricas de vendas.
          </p>
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
      </motion.div>

      <motion.div variants={itemVariants}>
        <OnboardingChecklist proposalsCount={proposals.length} catalogCount={catalogCount} />
      </motion.div>

      {/* BIG METRICS (DIRECTOR LEVEL) */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Stat icon={FileText} label="Propostas" value={String(sentCount)} />
        <Stat icon={CheckCircle2} label="Aprovadas" value={String(approvedCount)} />
        <Stat icon={TrendingUp} label="Ticket Médio" value={formatBRL(ticketMedio)} />
        <Stat icon={DollarSign} label="Total Aprovado" value={formatBRL(totalRevenue)} primary />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        
        {/* REVENUE CHART */}
        <motion.div variants={itemVariants} className="lg:col-span-2 overflow-hidden rounded-3xl border border-border bg-card shadow-card p-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <h2 className="text-lg font-bold tracking-tight mb-2">Evolução do Faturamento</h2>
          <p className="text-xs text-muted-foreground mb-6 flex items-center gap-4">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500" /> Faturamento Aprovado</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-purple-200 border border-purple-500 border-dashed" /> Valor Previsto (Aguardando Aprovação)</span>
          </p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(val) => `R$${val >= 1000 ? val/1000+'k' : val}`} width={60} />
                <RechartsTooltip 
                  formatter={(value: number, name: string) => [formatBRL(value), name === 'revenue' ? "Aprovado" : "Previsto"]}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} activeDot={{ r: 6, fill: "var(--primary)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CONVERSION & TOP CLIENTS */}
        <div className="flex flex-col gap-6">
          <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-lg font-bold tracking-tight w-full text-left mb-2">Taxa de Conversão</h2>
            <div className="relative w-40 h-40 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-primary">{rate}%</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fechamento</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4 px-2">Você converte {rate}% das propostas que envia para seus clientes.</p>
          </motion.div>

          {/* TOP CLIENTS */}
          {topClients.length > 0 && (
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h2 className="text-md font-bold tracking-tight">Melhores Clientes</h2>
              </div>
              <ul className="space-y-3">
                {topClients.map((c, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted text-muted-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                      <span className="font-medium truncate max-w-[120px]" title={c.name}>{c.name}</span>
                    </div>
                    <span className="font-bold text-primary">{formatBRL(c.revenue)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* FOLLOW UPS & AGENDA */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* AGENDA */}
        <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200">Sua Agenda</h2>
            </div>
            <Button size="sm" variant="outline" className="bg-background dark:bg-card border-blue-200 dark:border-blue-900/50 hover:bg-muted text-foreground" asChild>
              <Link to="/agenda">Abrir Calendário</Link>
            </Button>
          </div>
          
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CalendarDays className="h-10 w-10 text-blue-300 dark:text-blue-800 mb-2 opacity-50" />
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Sua agenda está livre!</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 max-w-sm">Use o calendário para marcar datas de entrega, reuniões com clientes ou visitas técnicas.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {appointments.map(apt => {
                const isTodayApt = apt.date === format(new Date(), "yyyy-MM-dd");
                return (
                  <div key={apt.id} className={`p-4 rounded-xl border bg-card flex flex-col justify-between gap-2 transition-all ${
                    isTodayApt 
                      ? 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-950/30 shadow-md' 
                      : 'border-blue-100 dark:border-blue-900/20 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isTodayApt && <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Hoje</span>}
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{format(parseISO(apt.date), "dd 'de' MMM", { locale: ptBR })} {apt.time && `às ${apt.time.substring(0,5)}`}</span>
                      </div>
                      <div className="font-semibold text-foreground line-clamp-1" title={apt.title}>{apt.title}</div>
                      {(apt.clients as any)?.name && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">Cliente: {(apt.clients as any).name}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* FOLLOW UPS */}
        {pendingFollowups.length > 0 ? (
          <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Acompanhamento Pendente</h2>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-5">Você tem {pendingFollowups.length === 1 ? "1 orçamento enviado" : `${pendingFollowups.length} orçamentos enviados`} há mais de 3 dias sem resposta. Lembre os clientes para não perder a venda!</p>
            <div className="space-y-3">
              {pendingFollowups.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 bg-card">
                  <div>
                    <div className="font-semibold text-foreground">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{(p.clients as any)?.name ?? "Cliente"} · Há {differenceInDays(new Date(), parseISO(p.created_at))} dias</div>
                  </div>
                  <Button size="sm" className="bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-full whitespace-nowrap px-4" onClick={() => handleFollowUp(p)}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Lembrar
                  </Button>
                </div>
              ))}
              {pendingFollowups.length > 3 && (
                <Button variant="link" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 p-0 h-auto" asChild>
                  <Link to="/proposals">Ver todos os pendentes</Link>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all">
            <div className="flex items-center justify-between border-b border-border bg-transparent px-6 py-5">
              <h2 className="text-lg font-bold tracking-tight">Últimas propostas</h2>
              <Link to="/proposals" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>
            </div>
            {proposals.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-y divide-border">
                {proposals.slice(0, 4).map(p => (
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
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, highlighted, primary }: any) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border ${primary ? 'border-primary bg-primary/5' : 'border-border bg-card'} p-5 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${primary ? 'text-primary' : 'text-muted-foreground'} transition-colors group-hover:text-primary`}>{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-xl ${highlighted ? 'bg-green-500/10 text-green-600' : 'bg-primary/5 text-primary'} transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}>
          <Icon className="h-4 w-4 transition-colors" />
        </div>
      </div>
      <div className={`relative mt-4 text-2xl font-black tracking-tight ${primary ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-md font-semibold">Nenhuma proposta</h3>
      <p className="mt-1 text-xs text-muted-foreground">Crie sua primeira proposta oficial.</p>
      <Button asChild className="mt-4 rounded-full shadow-md glow-primary relative text-xs h-8">
        <Link to="/proposals/new">
          <Plus className="mr-1 h-3 w-3" /> Criar agora
        </Link>
      </Button>
    </div>
  );
}

function OnboardingChecklist({ proposalsCount, catalogCount }: { proposalsCount: number, catalogCount: number }) {
  const steps = [
    { title: "Conta criada com sucesso", desc: "Seja bem-vindo ao Simbi!", done: true, href: "#" },
    { title: "Cadastrar primeiro produto ou serviço", desc: "Salve seus itens mais comuns para não precisar digitar de novo.", done: catalogCount > 0, href: "/catalog" },
    { title: "Criar sua primeira proposta (real)", desc: "Faça um orçamento de verdade e envie para um cliente.", done: proposalsCount > 1, href: "/proposals/new" },
  ];
  
  const progress = steps.filter(s => s.done).length;
  if (progress === steps.length) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Primeiros Passos ({progress}/{steps.length})</h2>
      <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-6">Complete estas ações para ver o poder do Simbi na prática.</p>
      
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <Link 
            key={idx} 
            to={step.href as any} 
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              step.done 
                ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/20' 
                : 'bg-card border-blue-100 dark:border-blue-900/20 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm text-foreground'
            }`}
          >
            <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
              step.done ? 'bg-green-500 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
            }`}>
              {step.done ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold text-sm">{idx + 1}</span>}
            </div>
            <div>
              <div className={`font-semibold ${
                step.done ? 'text-green-800 dark:text-green-300/75 line-through opacity-70' : 'text-foreground'
              }`}>{step.title}</div>
              <div className={`text-xs ${
                step.done ? 'text-green-600/70 dark:text-green-400/50' : 'text-muted-foreground'
              }`}>{step.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

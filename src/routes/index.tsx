import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Check, Smartphone, Share2, Zap, MessageCircle, FileText, BarChart3, Star, Quote, Package, Grid, Calculator, FileSignature, ClipboardList, CalendarDays, Receipt, Tag, Bell, Settings, Wrench, Shield, CheckSquare, Layers, LineChart, Banknote, Power, Crown, LayoutDashboard, Users, DollarSign, TrendingUp, Search, Menu, X, CheckCircle2, Sun, Moon, ShoppingCart, Store, Inbox, Briefcase, History, CircleDollarSign, ReceiptText, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simbi — Do orçamento ao serviço, tudo em um só lugar" },
      { name: "description", content: "Gerencie clientes, crie propostas rápidas, assine contratos digitais e emita Ordens de Serviço. Tudo em uma única ferramenta simples para prestadores de serviços autônomos." },
      { property: "og:title", content: "Simbi — O melhor sistema para orçamentos e serviços" },
      { property: "og:description", content: "Pare de perder tempo no WhatsApp. Crie orçamentos profissionais com 1 clique e aumente suas vendas." },
      { property: "og:type", content: "website" },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: "Simbi — Orçamentos Profissionais" },
      { property: "twitter:description", content: "Feito para prestadores de serviços, mecânicas, marcenarias e profissionais autônomos." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      <Hero />
      <SocialProofBar />
      <InteractiveWheel />
      <InfiniteLogos />
      <FeaturePillCloud />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5531973175882?text=Ol%C3%A1!%20Vim%20do%20site%20do%20Simbi%20e%20gostaria%20de%20tirar%20algumas%20d%C3%BAvidas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white px-5 py-3.5 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] border border-white/20 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 group hover:shadow-[0_0_40px_rgba(37,211,102,0.7)] hover:brightness-110"
        title="Fale conosco no WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-md">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031C0 14.673 1.408 17.067 3.237 18.732L2.016 23.21L6.685 22.013C8.36 23.364 10.15 24 12.031 24C18.677 24 24 18.615 24 11.969C24 5.323 18.677 0 12.031 0ZM18.423 16.59C18.158 17.338 16.892 17.962 16.143 18.125C15.553 18.257 14.733 18.366 11.666 17.086C7.755 15.452 5.234 11.455 5.048 11.206C4.861 10.957 3.522 9.18 3.522 7.342C3.522 5.503 4.456 4.601 4.83 4.227C5.14 3.916 5.67 3.76 6.168 3.76C6.324 3.76 6.464 3.768 6.589 3.776C6.963 3.791 7.15 3.822 7.4 4.413C7.68 5.114 8.365 6.794 8.458 6.981C8.552 7.168 8.645 7.385 8.52 7.635C8.396 7.884 8.302 8.008 8.116 8.226C7.929 8.444 7.726 8.615 7.555 8.833C7.368 9.051 7.165 9.284 7.383 9.658C7.601 10.032 8.365 11.277 9.486 12.273C10.932 13.565 12.115 13.97 12.52 14.125C12.925 14.28 13.392 14.25 13.673 13.97C13.953 13.689 14.67 12.833 14.981 12.397C15.292 11.961 15.603 12.023 15.977 12.148C16.35 12.272 18.312 13.237 18.716 13.44C19.121 13.642 19.386 13.735 19.479 13.891C19.573 14.047 19.573 14.779 19.293 15.526L18.423 16.59Z"/>
          </svg>
          {/* Notification red dot */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-[#25D366]"></span>
          </span>
        </div>
        <span className="font-bold text-sm tracking-tight drop-shadow-sm">Falar com Suporte</span>
      </a>
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white dark:bg-card shadow-md py-0 border-b border-border" : "bg-transparent py-2"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo inverted={!scrolled} />
        <nav className={`hidden items-center gap-8 text-sm font-medium md:flex ${scrolled ? "text-foreground" : "text-white/80"}`}>
          <a href="#recursos" className={`transition-colors ${scrolled ? "hover:text-primary" : "hover:text-white"}`}>Recursos</a>
          <a href="#como-funciona" className={`transition-colors ${scrolled ? "hover:text-primary" : "hover:text-white"}`}>Como funciona</a>
          <a href="#depoimentos" className={`transition-colors ${scrolled ? "hover:text-primary" : "hover:text-white"}`}>Depoimentos</a>
          <a href="#planos" className={`transition-colors ${scrolled ? "hover:text-primary" : "hover:text-white"}`}>Planos</a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login" className={`text-sm font-semibold transition-colors ${scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/80"}`}>Entrar</Link>
          <Button asChild size="sm" className={`rounded-full px-4 sm:px-5 shadow-sm transition-all ${scrolled ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white text-black hover:bg-white/90"}`}>
            <Link to="/register">Testar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
      {/* Animated Wave Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[200%] h-full animate-wave">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full text-blue-500/10" fill="none" stroke="currentColor" strokeWidth="200" strokeLinecap="round">
            <path d="M0,200 C300,100 300,300 600,200 C900,100 900,300 1200,200 C1500,100 1500,300 1800,200 C2100,100 2100,300 2400,200"></path>
          </svg>
        </div>
        <div className="absolute top-10 left-0 w-[200%] h-full animate-wave-slow">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full text-cyan-400/10" fill="none" stroke="currentColor" strokeWidth="250" strokeLinecap="round">
            <path d="M0,250 C300,150 300,350 600,250 C900,150 900,350 1200,250 C1500,150 1500,350 1800,250 C2100,150 2100,350 2400,250"></path>
          </svg>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -ml-[30rem] w-[60rem] max-w-none -translate-y-1/2 sm:-ml-[40rem] sm:w-[80rem]">
        <div className="aspect-[2/1] bg-gradient-to-b from-primary/50 to-transparent blur-3xl opacity-50 glow-primary pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            O sistema definitivo para autônomos e prestadores de serviços.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80">
            Do agendamento online à assinatura do contrato e controle financeiro. Gerencie todo o seu negócio em um painel profissional, sem planilhas confusas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:bg-primary/90 hover:-translate-y-0.5">
              <Link to="/register">Criar conta gratuitamente <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">Teste sem compromisso • Cancele quando quiser</p>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur-sm lg:rounded-3xl lg:p-4 shadow-2xl">
            <MockDashboardHero />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfiniteLogos() {
  const infiniteBrands = [
    { name: "Oficina do João", color: "text-blue-500" },
    { name: "Marcenaria Silva", color: "text-emerald-500" },
    { name: "TechFix Assistência", color: "text-purple-500" },
    { name: "Construtora Alfa", color: "text-amber-500" },
    { name: "Mecânica Souza", color: "text-red-500" },
    { name: "Refrigeração Costa", color: "text-cyan-500" },
    { name: "Eletro Service", color: "text-indigo-500" },
    { name: "Serralheria Arte Ferro", color: "text-orange-500" },
    { name: "Mestre das Obras", color: "text-teal-500" },
    { name: "Resolve Assistência", color: "text-pink-500" }
  ];
  // Duplicar a lista para o efeito infinito suave
  const displayBrands = [...infiniteBrands, ...infiniteBrands];

  return (
    <section className="border-b border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Aprovado por mais de 5.000 profissionais autônomos
        </p>
        <div className="mt-8 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max min-w-full shrink-0 animate-marquee items-center justify-around gap-16 py-2">
            {displayBrands.map((brand, i) => (
              <span key={i} className={`text-xl font-bold tracking-tight opacity-70 transition-all hover:opacity-100 hover:scale-105 ${brand.color}`}>
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: CalendarDays, title: "Agendamento Inteligente", desc: "Seu cliente acessa sua Vitrine, escolhe o dia e horário e agenda sozinho. O sistema bloqueia os horários ocupados para você nunca ter conflitos na agenda." },
    { icon: FileSignature, title: "Propostas e Contratos", desc: "Crie orçamentos profissionais em segundos. O cliente aprova pelo celular e já assina o contrato digitalmente. O estoque baixa na hora." },
    { icon: BarChart3, title: "Controle Financeiro", desc: "Acompanhe seu faturamento, fluxo de caixa, despesas e metas de forma visual. Emita recibos e saiba exatamente quanto você está lucrando." },
    { icon: Layers, title: "CRM, CRM e Estoque", desc: "Gerencie sua carteira de clientes, fornecedores e histórico de serviços. Tenha o controle total do seu inventário de produtos e peças." },
    { icon: ClipboardList, title: "Ordens de Serviço (OS)", desc: "Transforme orçamentos aprovados em Ordens de Serviço completas para a sua equipe técnica executar o trabalho sem falhas de comunicação." },
    { icon: Smartphone, title: "Vitrine e Catálogo Online", desc: "Tenha um link exclusivo com a sua marca, logo e cores. Exiba seus serviços e permita que clientes solicitem orçamentos diretamente." },
  ];

  return (
    <section id="recursos" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Tudo em um só lugar</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Gestão profissional e integrada.</p>
          <p className="mt-4 text-lg text-muted-foreground">O Simbi substitui as planilhas, a agenda de papel e os PDFs soltos por um sistema completo de ponta a ponta.</p>
        </div>
        
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-all hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all group-hover:glow-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-foreground py-24 sm:py-32 text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-base font-semibold leading-7 text-primary">Produtividade Máxima</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Fluxo de Trabalho.</p>
            <p className="mt-4 text-lg text-white/70">
              Automatize as tarefas chatas e foque no que você faz de melhor: o seu serviço.
            </p>
            
            <div className="mt-10 space-y-8">
              {[
                { title: "O cliente acessa e agenda", desc: "Através da sua Vitrine Online, o cliente visualiza seus serviços, pede orçamentos ou agenda um horário disponível." },
                { title: "Você cria e envia a Proposta", desc: "Em poucos cliques, o orçamento está pronto. O cliente aprova pelo celular e assina o contrato digitalmente." },
                { title: "O painel trabalha por você", desc: "O faturamento entra no financeiro, o estoque é atualizado e as tarefas vão para a agenda automaticamente." }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                    <p className="mt-1 text-white/60">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            {/* Floating Notifications */}
            <div className="absolute -right-4 sm:-right-12 top-10 z-20 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl border border-border animate-[bounce_4s_infinite]">
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                 <Check className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900">Proposta Aprovada!</p>
                 <p className="text-xs text-gray-500">Há 2 min</p>
               </div>
            </div>
            
            <div className="absolute -left-4 sm:-left-12 bottom-10 z-20 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl border border-border animate-[bounce_5s_infinite]" style={{ animationDelay: "1s" }}>
               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                 <Banknote className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900">Pagamento Recebido</p>
                 <p className="text-xs text-gray-500">R$ 1.650,00 via Pix</p>
               </div>
            </div>

            {/* Dark mode mock */}
            <div className="rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl relative z-10 transition-transform hover:scale-[1.02] duration-500">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">O</div>
                <div>
                  <div className="text-sm font-semibold text-white">Oficina do João</div>
                  <div className="text-xs text-white/50">Orçamento #1024</div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center rounded-lg bg-white/5 p-3">
                  <span className="text-white/80 text-sm">Revisão e Troca de Óleo</span>
                  <span className="text-white font-medium">R$ 450,00</span>
                </div>
                <div className="flex justify-between items-center rounded-lg bg-white/5 p-3">
                  <span className="text-white/80 text-sm">Troca da Correia Dentada</span>
                  <span className="text-white font-medium">R$ 1.200,00</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white text-xl font-bold text-primary">R$ 1.650,00</span>
                </div>
                <div className="mt-6">
                  <div className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/20 transition-all">
                    Aprovar Proposta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { body: "Antes eu perdia um tempão fazendo orçamento no bloco de notas para cada cliente. Com o Simbi, eu puxo os produtos e serviços cadastrados e mando pro cliente no zap em 2 minutos. Os clientes dão mais credibilidade e fecham mais rápido.", author: "Diego M.", role: "Mecânico Automotivo" },
    { body: "A apresentação do link que o cliente recebe passa muita credibilidade. Consegui aumentar o valor do meu metro quadrado de móveis planejados e a taxa de aprovação subiu muito.", author: "Camila R.", role: "Marceneira" },
    { body: "A facilidade do cliente ler o orçamento do conserto direto no celular mudou o jogo pra mim. Envio pelo WhatsApp e eles aprovam na hora, sem precisar baixar arquivo PDF nenhum.", author: "Felipe T.", role: "Técnico de Refrigeração" },
  ];

  return (
    <section id="depoimentos" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Profissionais amam o Simbi.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Quem testa a agilidade do link não volta para os PDFs.</p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="flex flex-col justify-between rounded-3xl bg-card border border-border p-8 shadow-soft">
              <div>
                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                <p className="text-lg leading-relaxed text-foreground">"{r.body}"</p>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {r.author[0]}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{r.author}</div>
                  <div className="text-sm text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="planos" className="bg-background py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Plano Único</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Simples e sem surpresas.</p>
          <p className="mt-4 text-lg text-muted-foreground">Tenha acesso a todas as ferramentas com um plano único. Sem reajustes surpresa e sem cobranças ocultas.</p>
        </div>
        
        <div className="mx-auto mt-16 max-w-lg items-center">
          {/* Pro Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 shadow-[0_0_40px_rgba(42,157,143,0.3)] ring-1 ring-primary relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/20 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">Simbi Pro <Crown className="h-5 w-5 text-yellow-400" /></h3>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold leading-5 text-emerald-100 border border-emerald-400/30">O Poder de um ERP</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-primary-foreground/90">Para empresas que querem impressionar clientes e gerenciar tudo num painel avançado.</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-white">R$ 39,90</span>
                <span className="text-sm font-semibold leading-6 text-primary-foreground/80">/mês</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-white">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Dashboard de Gestão Completo</strong></li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Agendamento Online Automático</strong> para clientes</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Vitrine Interativa e Catálogo</strong> com sua marca</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Propostas Comerciais e Ordens de Serviço (OS)</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Contratos com <strong>Assinatura Digital</strong></li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Controle de Estoque e Gestão de Clientes (CRM)</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Controle Financeiro, Fluxo de Caixa e Recibos</li>
              </ul>
            </div>
            <Button asChild className="mt-8 w-full rounded-full h-12 bg-white text-primary hover:bg-emerald-50 shadow-xl font-bold relative z-10 text-base">
              <Link to="/register">Testar 7 dias grátis</Link>
            </Button>
            <p className="mt-4 text-xs text-center text-emerald-100/70 font-medium flex items-center justify-center gap-1.5 relative z-10">
              <Shield className="h-3.5 w-3.5" /> Comece agora, sem compromisso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-primary px-6 py-24 text-center sm:py-32 lg:px-8">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[200%] h-full animate-wave">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full text-white/5" fill="none" stroke="currentColor" strokeWidth="200" strokeLinecap="round">
            <path d="M0,200 C300,100 300,300 600,200 C900,100 900,300 1200,200 C1500,100 1500,300 1800,200 C2100,100 2100,300 2400,200"></path>
          </svg>
        </div>
        <div className="absolute top-10 left-0 w-[200%] h-full animate-wave-slow">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full text-white/10" fill="none" stroke="currentColor" strokeWidth="250" strokeLinecap="round">
            <path d="M0,250 C300,150 300,350 600,250 C900,150 900,350 1200,250 C1500,150 1500,350 1800,250 C2100,150 2100,350 2400,250"></path>
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-2xl relative z-10">
        <h2 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">Pronto para impressionar?</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
          Crie sua primeira proposta em menos de 2 minutos. Comece gratuitamente hoje mesmo.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild size="lg" className="h-14 rounded-full bg-white px-8 text-base text-primary hover:bg-white/90 shadow-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            <Link to="/register">Começar agora gratuitamente</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background py-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Propostas comerciais que encantam seus clientes e fecham negócios mais rápido.
            </p>
            <p className="text-xs text-muted-foreground">
              CNPJ: 65.615.316/0001-33
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Produto</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#recursos" className="hover:text-primary transition-colors">Recursos</a></li>
              <li><a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a></li>
              <li><a href="#planos" className="hover:text-primary transition-colors">Planos e Preços</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Suporte</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="https://wa.me/5531973175882" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2"><MessageCircle className="h-4 w-4" /> (31) 97317-5882</a></li>
              <li><a href="mailto:contato@simbi.com" className="hover:text-primary transition-colors">Falar com a equipe</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Simbi. Todos os direitos reservados.
          </p>
          <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
            Feito para profissionais e prestadores de serviços.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Mockups ---------------- */

function MockDashboardHero() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      label: "Visão Geral",
      items: [
        { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, desc: "Acompanhe suas métricas de vendas, faturamento e receba alertas inteligentes." },
        { id: "agenda", title: "Agenda", icon: CalendarDays, desc: "Receba agendamentos 24h por dia direto da sua Vitrine, sem conflitos de horário." },
      ]
    },
    {
      label: "Vendas & Contratos",
      items: [
        { id: "propostas", title: "Propostas", icon: FileText, desc: "Crie orçamentos em 1 minuto e envie um link profissional para aprovação." },
        { id: "pedidos", title: "Pedidos", icon: ShoppingCart, desc: "Controle de pedidos de venda direta e faturamento rápido." },
        { id: "contratos", title: "Contratos", icon: FileSignature, desc: "Gere contratos automáticos com assinatura digital instantânea." },
        { id: "os", title: "Ordem de Serviço", icon: ClipboardList, desc: "Acompanhe a execução técnica dos serviços aprovados." },
      ]
    },
    {
      label: "Catálogo & Vitrine",
      items: [
        { id: "produtos", title: "Produtos & Serviços", icon: Grid, desc: "Seu catálogo completo com gestão de estoque integrada que baixa automaticamente." },
        { id: "vitrine", title: "Minha Vitrine", icon: Store, desc: "Seu link exclusivo para clientes verem seus serviços e agendarem horários." },
        { id: "pedidos_vitrine", title: "Pedidos Vitrine", icon: Inbox, desc: "Receba leads e pedidos de orçamentos diretamente dos visitantes." },
      ]
    },
    {
      label: "Cadastros & Dados",
      items: [
        { id: "clientes", title: "Clientes", icon: Users, desc: "CRM completo. Saiba todo o histórico, propostas e financeiro de cada cliente." },
        { id: "fornecedores", title: "Fornecedores", icon: Briefcase, desc: "Gestão dos seus parceiros de negócio e compras de estoque." },
        { id: "historico", title: "Histórico", icon: History, desc: "Timeline de tudo que aconteceu na sua conta para auditoria." },
      ]
    },
    {
      label: "Gestão",
      items: [
        { id: "financeiro", title: "Financeiro", icon: CircleDollarSign, desc: "Contas a pagar e receber, fluxo de caixa e relatórios precisos." },
        { id: "notas", title: "Notas Fiscais", icon: ReceiptText, desc: "Emissão de recibos e NFS-e automáticas." },
        { id: "calculadora", title: "Calculadora", icon: Calculator, desc: "Calcule sua margem de lucro e preço de hora com precisão." },
        { id: "relatorios", title: "Relatórios", icon: BarChart3, desc: "Gráficos detalhados sobre o crescimento da sua empresa." },
        { id: "configuracoes", title: "Configurações", icon: Settings, desc: "Personalize cores, logo, e mensagens automáticas." },
        { id: "assinatura", title: "Assinatura", icon: Crown, desc: "Gerencie seu plano Simbi Pro e limites de uso." },
      ]
    }
  ];

  const activeItem = navGroups.flatMap(g => g.items).find(i => i.id === activeMenu);

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="overflow-hidden rounded-xl bg-background text-foreground shadow-2xl relative border border-border flex h-[600px] w-full text-left font-sans transition-colors duration-300">
        
        {/* Sidebar */}
        <div className={`absolute z-20 md:relative w-64 h-full bg-card border-r border-border flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50 shrink-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-white font-bold text-lg shadow-[0_0_15px_rgba(42,157,143,0.4)]">S</div>
            <div>
              <div className="font-bold text-lg leading-tight">Simbi</div>
              <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Do orçamento ao serviço</div>
            </div>
            <button className="md:hidden ml-auto p-2" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2">{group.label}</div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                      <button 
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-r-lg text-sm transition-all border-l-[3px] ${isActive ? 'bg-gradient-to-r from-primary/20 to-transparent text-foreground border-primary font-bold' : 'text-muted-foreground hover:bg-muted border-transparent hover:text-foreground font-medium'}`}
                      >
                        <item.icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'opacity-70'}`} />
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 shrink-0">
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 border border-border/50 shadow-inner">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-white font-bold shadow-md">V</div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold opacity-90">sua.empresa</span>
                <span className="truncate text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Simbi Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5 text-foreground" />
              </button>
              <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
                Simbi <ArrowRight className="h-3 w-3" /> <span className="text-foreground font-medium">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-9 w-32 sm:w-64 bg-muted rounded-full hidden sm:flex items-center px-4 text-muted-foreground text-sm border border-border/50">
                <Search className="h-4 w-4 mr-2 opacity-50" /> <span className="opacity-70 truncate">Buscar clientes, propostas ou OS...</span>
              </div>
              <Button size="sm" className="h-9 rounded-full px-4 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 hidden sm:flex shadow-md">+ Novo</Button>
              
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                {isDarkMode ? <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
              </button>
              <button className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center relative transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>

          {/* Dashboard Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 relative">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Olá, [Seu Nome].</h1>
                <p className="text-muted-foreground text-sm">Acompanhe seu desempenho e métricas de vendas.</p>
              </div>
              <Button className="h-10 rounded-full px-6 text-sm font-bold bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)] transition-all">
                + Nova proposta
              </Button>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Central de Alertas</h3>
                <p className="text-sm text-indigo-400 font-medium">Tudo sob controle! Nenhum alerta crítico no momento.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { title: "PROPOSTAS", val: "3", icon: FileText, c: "text-indigo-400" },
                { title: "APROVADAS", val: "0", icon: CheckCircle2, c: "text-emerald-400" },
                { title: "TICKET MÉDIO", val: "R$ 0,00", icon: TrendingUp, c: "text-muted-foreground" },
                { title: "TOTAL APROVADO", val: "R$ 0,00", icon: DollarSign, c: "text-indigo-400" },
              ].map((card, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl border border-border/50 bg-card/50 shadow-sm flex flex-col justify-between h-28 sm:h-32 transition-transform hover:-translate-y-1 hover:border-primary/30 cursor-default">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{card.title}</span>
                    <div className={`h-6 w-6 rounded-md bg-background border border-border/50 flex items-center justify-center`}>
                      <card.icon className={`h-3.5 w-3.5 ${card.c} opacity-80`} />
                    </div>
                  </div>
                  <div className={`text-xl sm:text-3xl font-black ${i === 3 ? 'text-indigo-400' : 'text-foreground'}`}>{card.val}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/50 shadow-sm p-4 sm:p-6 h-64 sm:h-80 flex flex-col border-t-[3px] border-t-indigo-500">
                <h3 className="font-bold text-lg mb-4">Evolução do Faturamento</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Faturamento Aprovado</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-300" /> Valor Previsto (Aguardando Aprovação)</div>
                </div>
                <div className="flex-1 border-b border-l border-border/30 relative">
                  {/* Decorative chart lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_90%,rgba(128,128,128,0.05)_90%)] bg-[length:100%_25%]" />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/5 to-transparent" />
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/50 shadow-sm p-4 sm:p-6 h-64 sm:h-80 flex flex-col items-center justify-center text-center">
                <h3 className="font-bold text-lg w-full text-left mb-auto">Taxa de Conversão</h3>
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-[12px] sm:border-[16px] border-muted flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-400">0%</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Fechamento</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overlay Card for Active Feature (if not dashboard) */}
            {activeMenu !== "dashboard" && activeItem && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => setActiveMenu("dashboard")} />
                <div className="relative bg-card border border-border/50 shadow-2xl rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/5">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner ring-1 ring-primary/20">
                    <activeItem.icon className="h-8 w-8 drop-shadow-md" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground mb-3">{activeItem.title}</h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                    {activeItem.desc}
                  </p>
                  <Button onClick={() => setActiveMenu("dashboard")} className="w-full rounded-xl h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    Incrível, entendi! <Check className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function SocialProofBar() {
  const avatars = [
    "https://i.pravatar.cc/150?img=33",
    "https://i.pravatar.cc/150?img=11",
    "https://i.pravatar.cc/150?img=12",
    "https://i.pravatar.cc/150?img=15",
    "https://i.pravatar.cc/150?img=32",
    "https://i.pravatar.cc/150?img=60",
    "https://i.pravatar.cc/150?img=68",
    "https://i.pravatar.cc/150?img=65",
  ];

  return (
    <div className="bg-[#2a9d8f] w-full py-4 overflow-hidden border-y border-white/10 shadow-inner">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex -space-x-3 hover:space-x-0 transition-all duration-300">
          {avatars.map((url, i) => (
            <img key={i} className="inline-block h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-2 ring-white object-cover shadow-sm transition-transform hover:scale-110 hover:z-10" src={url} alt={`User ${i}`} />
          ))}
          <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-sm z-10">
            <span className="text-[#2a9d8f] font-bold text-lg">+</span>
          </div>
        </div>
        <p className="text-white font-medium text-sm sm:text-base tracking-wide text-center">
          +5.000 profissionais autônomos usam o Simbi todos os dias
        </p>
      </div>
    </div>
  );
}

function FeaturePillCloud() {
  const [activeTab, setActiveTab] = useState("Todos");
  
  const categories = ["Todos", "Vendas", "Estoque", "Financeiro", "Gestão"];

  const pills = [
    { icon: FileSignature, label: "Propostas Comerciais", category: "Vendas" },
    { icon: ClipboardList, label: "Ordem de Serviço", category: "Gestão" },
    { icon: Package, label: "Controle de Estoque", category: "Estoque" },
    { icon: Smartphone, label: "Catálogo e Vitrine", category: "Vendas" },
    { icon: CheckSquare, label: "Aprovação em 1 clique", category: "Vendas" },
    { icon: Calculator, label: "Cálculo de Orçamento", category: "Vendas" },
    { icon: Receipt, label: "Emissão de Recibos", category: "Financeiro" },
    { icon: Wrench, label: "Gestão de Serviços", category: "Gestão" },
    { icon: LineChart, label: "Dashboard Financeiro", category: "Financeiro" },
    { icon: Banknote, label: "Gestão de Fluxo de Caixa", category: "Financeiro" },
    { icon: Settings, label: "Automações", category: "Gestão" },
    { icon: Layers, label: "CRM Visual", category: "Gestão" },
    { icon: Shield, label: "Assinatura de Contrato", category: "Vendas" },
    { icon: Tag, label: "Categorias de Produtos", category: "Estoque" },
  ];

  return (
    <section className="bg-primary/5 py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
          Recursos e possibilidades infinitas para uma gestão <br className="hidden sm:block" /> inteligente, ágil e moderna? Tem no Simbi!
        </h2>
        
        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === cat ? "bg-primary text-primary-foreground shadow-md" : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-5xl mx-auto">
          {pills.map((pill, i) => {
            const isActive = activeTab === "Todos" || activeTab === pill.category;
            return (
              <div key={i} className={`flex items-center gap-2 rounded-full bg-white dark:bg-card border border-border shadow-sm px-4 md:px-6 py-2.5 md:py-3 transition-all duration-300 cursor-default group ${isActive ? "opacity-100 hover:border-primary hover:shadow-elevated hover:scale-105" : "opacity-30 scale-95"}`}>
                <pill.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary/70 group-hover:text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm md:text-base font-medium transition-colors ${isActive ? "text-foreground/80 group-hover:text-foreground" : "text-muted-foreground"}`}>{pill.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InteractiveWheel() {
  const [active, setActive] = useState(false);

  const functionalities = [
    // Inner Ring
    { icon: FileSignature, label: "Propostas", angle: 0, ring: 1 },
    { icon: ClipboardList, label: "Serviços", angle: 60, ring: 1 },
    { icon: Package, label: "Estoque", angle: 120, ring: 1 },
    { icon: Smartphone, label: "Vitrine", angle: 180, ring: 1 },
    { icon: Receipt, label: "Recibos", angle: 240, ring: 1 },
    { icon: LineChart, label: "Caixa", angle: 300, ring: 1 },
    // Outer Ring
    { icon: Shield, label: "Assinaturas", angle: 30, ring: 2 },
    { icon: MessageCircle, label: "Notificações", angle: 90, ring: 2 },
    { icon: CalendarDays, label: "Agenda", angle: 150, ring: 2 },
    { icon: CheckSquare, label: "Aprovações", angle: 210, ring: 2 },
    { icon: Layers, label: "Funil CRM", angle: 270, ring: 2 },
    { icon: Settings, label: "Automação", angle: 330, ring: 2 },
  ];

  return (
    <section className="py-24 sm:py-40 bg-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
          Uma plataforma centralizada
        </h2>
        <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
          Ative o Simbi e unifique a sua gestão. Abandone dezenas de ferramentas independentes e controle tudo em um só lugar de forma simples.
        </p>
        
        <div className="relative mx-auto w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] flex items-center justify-center mt-10">
          {/* Central Button */}
          <button 
            onClick={() => setActive(!active)}
            className={`z-30 relative h-28 w-28 sm:h-40 sm:w-40 rounded-full flex flex-col items-center justify-center transition-all duration-700 shadow-2xl border-4 ${
              active 
                ? "bg-primary border-primary/30 text-white shadow-[0_0_80px_rgba(42,157,143,0.8)] scale-105" 
                : "bg-gradient-to-br from-primary to-emerald-500 border-white/30 text-white shadow-[0_0_40px_rgba(52,211,153,0.5)] hover:scale-110 hover:shadow-[0_0_60px_rgba(52,211,153,0.7)] hover:brightness-110 hover:-translate-y-2"
            }`}
          >
            <Power className={`h-10 w-10 sm:h-14 sm:w-14 mb-1 transition-all duration-700 ${active ? "text-white animate-pulse" : "text-white drop-shadow-md"}`} />
            <span className="font-black text-sm sm:text-lg tracking-tight drop-shadow-sm">{active ? "Conectado" : "LIGAR SIMBI"}</span>
          </button>
          
          {/* Connection Lines (SVG) */}
          <svg className={`absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-1000 z-0 ${active ? "opacity-100" : "opacity-0"}`} viewBox="-300 -300 600 600">
            {/* Outer ring circular trace */}
            <circle cx="0" cy="0" r="240" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/10" strokeDasharray="8 8" />
            {/* Inner ring circular trace */}
            <circle cx="0" cy="0" r="150" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/20" strokeDasharray="4 4" />
            
            {/* Spokes */}
            {functionalities.map((item, i) => {
              const r = item.ring === 1 ? 150 : 240;
              const x = Math.cos((item.angle * Math.PI) / 180) * r;
              const y = Math.sin((item.angle * Math.PI) / 180) * r;
              return (
                <line key={i} x1="0" y1="0" x2={x} y2={y} stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="6 6">
                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur={item.ring === 1 ? "2s" : "3s"} repeatCount="indefinite" />
                </line>
              );
            })}
          </svg>

          {/* Orbiting Items */}
          {functionalities.map((item, i) => {
            const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
            // Define radii based on ring and screen size
            const radius = item.ring === 1 
              ? (isMobile ? 110 : 150) 
              : (isMobile ? 170 : 240);
              
            const x = Math.cos((item.angle * Math.PI) / 180) * radius;
            const y = Math.sin((item.angle * Math.PI) / 180) * radius;
            
            // Outer ring has slightly smaller icons to give 3D depth perspective
            const iconContainerClasses = item.ring === 1 
              ? "h-14 w-14 sm:h-16 sm:w-16 border-2" 
              : "h-10 w-10 sm:h-14 sm:w-14 border border-border/50";
              
            const iconClasses = item.ring === 1 
              ? "h-6 w-6 sm:h-8 sm:w-8" 
              : "h-5 w-5 sm:h-6 sm:w-6";
            
            return (
              <div 
                key={i}
                className={`absolute flex flex-col items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10`}
                style={{ 
                  transform: `translate(${active ? x : 0}px, ${active ? y : 0}px)`,
                  opacity: active ? (item.ring === 2 && isMobile ? 0.8 : 1) : 0,
                  scale: active ? 1 : 0.1,
                  transitionDelay: `${i * 50}ms`
                }}
              >
                <div className={`${iconContainerClasses} rounded-full flex items-center justify-center shadow-xl bg-card transition-colors duration-500 hover:scale-110 cursor-pointer ${active ? "border-primary/50 text-primary hover:bg-primary/10" : "border-border text-muted-foreground"}`}>
                  <item.icon className={iconClasses} />
                </div>
                <span className={`mt-2 ${item.ring === 1 ? "text-sm sm:text-base font-bold" : "text-xs sm:text-sm font-semibold text-muted-foreground"} transition-opacity duration-500 bg-background/50 backdrop-blur-sm px-2 rounded-md ${active ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: `${i * 50 + 400}ms` }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "O que é o Simbi?",
      a: "O Simbi é uma plataforma de gestão 'tudo-em-um' feita exclusivamente para prestadores de serviços, autônomos e pequenos negócios. Com ele, você cria propostas, assina contratos digitais, controla o financeiro e recebe agendamentos através de uma vitrine exclusiva. Tudo pelo celular ou computador."
    },
    {
      q: "Meus clientes precisam baixar algum aplicativo?",
      a: "Não! O seu cliente não precisa baixar absolutamente nada. Você compartilha o link da sua Vitrine (ou da Proposta) e ele acessa tudo direto do navegador do celular dele, aprova orçamentos e até assina o contrato com o dedo."
    },
    {
      q: "Como funciona o teste grátis?",
      a: "Você pode criar sua conta agora mesmo e começar a testar a plataforma na prática, enviando orçamentos reais para seus clientes, sem precisar cadastrar cartão de crédito. É só entrar e usar."
    },
    {
      q: "Posso cancelar quando eu quiser?",
      a: "Com certeza. O Simbi não tem taxas de cancelamento e nem fidelidade. O plano é cobrado mensalmente, e se você decidir parar de usar, basta cancelar a assinatura direto pelo painel."
    },
    {
      q: "Funciona bem no celular?",
      a: "Sim! Construímos o Simbi pensando primeiro em quem está na rua trabalhando. Todo o sistema de gestão é extremamente rápido e responsivo em qualquer modelo de smartphone, igualzinho a um app nativo."
    },
    {
      q: "Posso colocar a minha logo e as minhas cores?",
      a: "Sim. A sua Vitrine Online, os seus Orçamentos em PDF e os Contratos terão a identidade visual do seu negócio (sua logo e a sua cor principal), transmitindo muito mais credibilidade e profissionalismo."
    }
  ];

  return (
    <section id="faq" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-border/50">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-foreground text-center mb-10">Perguntas Frequentes</h2>
          <dl className="mt-10 space-y-6 divide-y divide-border/50">
            {faqs.map((faq, index) => (
              <div key={index} className="pt-6">
                <dt>
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="flex w-full items-start justify-between text-left text-foreground"
                  >
                    <span className="text-base font-semibold leading-7">{faq.q}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${openIndex === index ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                      />
                    </span>
                  </button>
                </dt>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                >
                  <dd className="overflow-hidden text-base leading-7 text-muted-foreground pr-12">
                    {faq.a}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

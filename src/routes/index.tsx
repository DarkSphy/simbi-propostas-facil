import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Check, Smartphone, Share2, Zap, MessageCircle, FileText, BarChart3, Star, Quote, Package, Grid, Calculator, FileSignature, ClipboardList, CalendarDays, Receipt, Tag, Bell, Settings, Wrench, Shield, CheckSquare, Layers, LineChart, Banknote, Power, Crown } from "lucide-react";

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
      <CTA />
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5531973175882?text=Ol%C3%A1!%20Vim%20do%20site%20do%20Simbi%20e%20gostaria%20de%20tirar%20algumas%20d%C3%BAvidas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-3.5 rounded-full shadow-elevated border border-white/10 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group hover:glow-primary"
        title="Fale conosco no WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90 group-hover:opacity-100 transition-opacity">
          <path d="M12.031 0C5.385 0 0 5.385 0 12.031C0 14.673 1.408 17.067 3.237 18.732L2.016 23.21L6.685 22.013C8.36 23.364 10.15 24 12.031 24C18.677 24 24 18.615 24 11.969C24 5.323 18.677 0 12.031 0ZM18.423 16.59C18.158 17.338 16.892 17.962 16.143 18.125C15.553 18.257 14.733 18.366 11.666 17.086C7.755 15.452 5.234 11.455 5.048 11.206C4.861 10.957 3.522 9.18 3.522 7.342C3.522 5.503 4.456 4.601 4.83 4.227C5.14 3.916 5.67 3.76 6.168 3.76C6.324 3.76 6.464 3.768 6.589 3.776C6.963 3.791 7.15 3.822 7.4 4.413C7.68 5.114 8.365 6.794 8.458 6.981C8.552 7.168 8.645 7.385 8.52 7.635C8.396 7.884 8.302 8.008 8.116 8.226C7.929 8.444 7.726 8.615 7.555 8.833C7.368 9.051 7.165 9.284 7.383 9.658C7.601 10.032 8.365 11.277 9.486 12.273C10.932 13.565 12.115 13.97 12.52 14.125C12.925 14.28 13.392 14.25 13.673 13.97C13.953 13.689 14.67 12.833 14.981 12.397C15.292 11.961 15.603 12.023 15.977 12.148C16.35 12.272 18.312 13.237 18.716 13.44C19.121 13.642 19.386 13.735 19.479 13.891C19.573 14.047 19.573 14.779 19.293 15.526L18.423 16.59Z"/>
        </svg>
        <span className="font-semibold text-sm tracking-tight">Falar com Suporte</span>
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
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            A verdadeira caixa de ferramentas digital do MEI e prestador de serviços.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Esqueça a bagunça no WhatsApp e no caderno. Com o Simbi você tem vitrine online, orçamentos magnéticos, contratos, estoque e financeiro em um único aplicativo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full bg-primary px-8 text-base text-primary-foreground shadow-lg shadow-primary/40 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5">
              <Link to="/register">Criar conta gratuitamente <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">Não requer cartão de crédito</p>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur-sm lg:rounded-3xl lg:p-4">
            <MockProposalHero />
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
    { icon: Smartphone, title: "[ 1. Atração ] Vitrine & Catálogo", desc: "Seu link na Bio. Exiba seus serviços de forma profissional. Deixe os clientes pedirem orçamentos direto pelo catálogo, com controle de estoque automático." },
    { icon: FileSignature, title: "[ 2. Fechamento ] Orçamentos & Contratos", desc: "O fim do orçamento de boca. Envie propostas impecáveis com aprovação em 1 clique e gere contratos com assinatura digital instantânea." },
    { icon: ClipboardList, title: "[ 3. Execução ] CRM & Ordens de Serviço", desc: "Acompanhe tudo no funil visual. Saiba exatamente quais orçamentos estão pendentes e gere Ordens de Serviço (OS) prontas para a execução técnica." },
    { icon: BarChart3, title: "[ 4. Gestão ] Financeiro & Agenda", desc: "Fluxo de caixa automático assim que uma proposta é aprovada, e agenda integrada para você nunca mais perder um compromisso ou esquecer uma cobrança." },
  ];

  return (
    <section id="recursos" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Feito para quem bota a mão na massa</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Tudo o que você precisa.</p>
          <p className="mt-4 text-lg text-muted-foreground">O Simbi consolida os 5 aplicativos que você usa hoje de forma confusa, em uma única esteira profissional e integrada.</p>
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
            <h2 className="text-base font-semibold leading-7 text-primary">O fim do retrabalho</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Canivete Suíço.</p>
            <p className="mt-4 text-lg text-white/70">
              Do primeiro contato ao pagamento, o Simbi automatiza cada etapa do seu serviço.
            </p>
            
            <div className="mt-10 space-y-8">
              {[
                { title: "O cliente acessa sua Vitrine", desc: "Ele escolhe o serviço ou produto no seu link exclusivo e clica em pedir orçamento." },
                { title: "Você envia a Proposta Mágica", desc: "Em 1 minuto, pelo celular, você aprova, envia o link e o cliente assina o contrato." },
                { title: "O sistema faz o resto", desc: "O estoque baixa automaticamente, o financeiro atualiza e a Ordem de Serviço fica pronta para uso." }
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
          <h2 className="text-base font-semibold leading-7 text-primary">Planos sob medida</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Cresça no seu ritmo.</p>
          <p className="mt-4 text-lg text-muted-foreground">Comece de graça para testar e mude para o plano Profissional quando quiser transformar seu negócio.</p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 items-center">
          {/* Free Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Básico (Grátis)</h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">O essencial para autônomos que querem sair do papel e enviar orçamentos digitais.</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-foreground">R$ 0</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/para sempre</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-muted-foreground" /> Painel de Orçamentos Simples</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-muted-foreground" /> Até 5 propostas por mês</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-muted-foreground" /> Limite de 10 clientes e 10 itens</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-muted-foreground" /> Envio rápido via link de WhatsApp</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-8 w-full rounded-full h-12">
              <Link to="/register">Começar grátis</Link>
            </Button>
          </div>

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
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Dashboard ERP Premium</strong> (Central de Alertas e Timeline)</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Vitrine Interativa</strong> para seus clientes</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> <strong>Propostas e Cadastros Ilimitados</strong></li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Personalização Total (Sua Cor, Sua Logo, Sua URL)</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-300" /> Status de Leitura Avançado (Saiba quando o cliente viu)</li>
              </ul>
            </div>
            <Button asChild className="mt-8 w-full rounded-full h-12 bg-white text-primary hover:bg-emerald-50 shadow-xl font-bold relative z-10 text-base">
              <Link to="/register">Assinar Simbi Pro</Link>
            </Button>
            <p className="mt-4 text-xs text-center text-emerald-100/70 font-medium flex items-center justify-center gap-1.5 relative z-10">
              <Shield className="h-3.5 w-3.5" /> Garantia incondicional de 7 dias ou seu dinheiro de volta.
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

function MockProposalHero() {
  return (
    <div className="overflow-hidden rounded-xl bg-[#fafafa] text-left shadow-2xl relative border border-white/20">
      {/* Browser bar */}
      <div className="flex items-center gap-2 border-b border-border/5 bg-[#f5f5f5] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-4 flex h-6 flex-1 items-center rounded-md bg-white px-3 text-[10px] font-medium text-gray-400 shadow-sm sm:text-xs">
          simbi.com/p/oficina-do-joao/orcamento-civic
        </div>
      </div>
      
      {/* Proposal Content */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        
        <div className="relative z-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white shadow-xl mb-4 border-4 border-white">
              O
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Oficina do João</h2>
            <div className="mt-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 border border-blue-200">Orçamento</div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="h-2 w-full bg-blue-600" />
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="rounded-full bg-blue-100/50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">Enviada</span>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Revisão Completa - Honda Civic</h1>
              <p className="mt-2 text-sm text-gray-500 font-medium">Preparado para <span className="font-bold text-blue-600">Carlos Eduardo</span></p>
              
              <div className="mt-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-2xl border border-gray-100 p-4 hover:border-blue-100 transition-colors gap-3">
                  <div>
                    <div className="font-bold text-gray-900 text-base">Troca de Óleo e Filtros</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">Qtd: 1</span>
                      <span className="text-xs text-gray-500 font-medium">Óleo Sintético 5W30 + Filtro de Óleo/Ar</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-black text-gray-900 text-lg">R$ 450,00</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-2xl border border-gray-100 p-4 hover:border-blue-100 transition-colors gap-3">
                  <div>
                    <div className="font-bold text-gray-900 text-base">Kit Correia Dentada</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">Qtd: 1</span>
                      <span className="text-xs text-gray-500 font-medium">Peça Original + Mão de Obra</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-black text-gray-900 text-lg">R$ 1.200,00</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-2xl border border-gray-100 p-4 hover:border-blue-100 transition-colors gap-3">
                  <div>
                    <div className="font-bold text-gray-900 text-base">Alinhamento e Balanceamento</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">Qtd: 1</span>
                      <span className="text-xs text-gray-500 font-medium">Geometria 3D Computadorizada</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-black text-gray-900 text-lg">R$ 180,00</div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-blue-50 px-6 py-5 border border-blue-100/50">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-800">Total do Orçamento</span>
                <span className="text-3xl font-black text-blue-600 mt-1 sm:mt-0">R$ 1.830,00</span>
              </div>
              
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="h-14 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-gray-200 bg-white font-bold text-gray-400 transition-colors hover:border-red-200 hover:text-red-500">
                  <span className="mr-2">✕</span> Recusar
                </div>
                <div className="h-14 flex cursor-pointer items-center justify-center rounded-2xl bg-green-600 font-bold text-white shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 hover:shadow-green-600/40">
                  <span className="mr-2">✓</span> Aprovar Orçamento
                </div>
              </div>
            </div>
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
          O verdadeiro Canivete Suíço
        </h2>
        <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
          Ative o Simbi e veja como dezenas de ferramentas independentes se unem em um único cérebro central para escalar o seu negócio.
        </p>
        
        <div className="relative mx-auto w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] flex items-center justify-center mt-10">
          {/* Central Button */}
          <button 
            onClick={() => setActive(!active)}
            className={`z-30 relative h-28 w-28 sm:h-40 sm:w-40 rounded-full flex flex-col items-center justify-center transition-all duration-700 shadow-2xl border-4 ${active ? "bg-primary border-primary/30 text-white shadow-[0_0_80px_rgba(42,157,143,0.6)] scale-105" : "bg-card border-border text-muted-foreground hover:bg-muted hover:scale-105"}`}
          >
            <Power className={`h-10 w-10 sm:h-14 sm:w-14 mb-2 transition-all duration-700 ${active ? "text-white animate-pulse" : "text-muted-foreground"}`} />
            <span className="font-black text-sm sm:text-lg tracking-tight">{active ? "Sincronizado" : "Ligar Simbi"}</span>
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

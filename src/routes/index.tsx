import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Check, Smartphone, Share2, Zap, MessageCircle, FileText, BarChart3, Star, Quote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simbi — Propostas que passam confiança" },
      { name: "description", content: "Crie orçamentos profissionais em minutos, envie pelo WhatsApp e feche serviços mais rápido. Mobile-first, sem complicação." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      <Hero />
      <InfiniteLogos />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo inverted />
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
          <a href="#recursos" className="transition-colors hover:text-white">Recursos</a>
          <a href="#como-funciona" className="transition-colors hover:text-white">Como funciona</a>
          <a href="#depoimentos" className="transition-colors hover:text-white">Depoimentos</a>
          <a href="#planos" className="transition-colors hover:text-white">Planos</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden text-sm font-semibold text-white transition-colors hover:text-white/80 sm:block">Log in</Link>
          <Button asChild size="sm" className="rounded-full bg-white px-5 text-black hover:bg-white/90">
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 mix-blend-screen">
        <div className="absolute top-0 left-0 w-[200%] h-full flex flex-col justify-center animate-wave">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-[600px] fill-primary/40">
            <path d="M0,200 C300,100 300,300 600,200 C900,100 900,300 1200,200 C1500,100 1500,300 1800,200 C2100,100 2100,300 2400,200 L2400,0 L0,0 Z"></path>
          </svg>
        </div>
        <div className="absolute top-10 left-0 w-[200%] h-full flex flex-col justify-center animate-wave-slow">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-[600px] fill-primary/20">
            <path d="M0,250 C300,150 300,350 600,250 C900,150 900,350 1200,250 C1500,150 1500,350 1800,250 C2100,150 2100,350 2400,250 L2400,0 L0,0 Z"></path>
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
            Propostas que encantam e fecham negócios.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/70">
            Destaque-se da concorrência com orçamentos elegantes. Crie em minutos, envie direto no WhatsApp e receba o "sim" do cliente mais rápido.
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
  const brands = [
    "Oficina do João", "Marcenaria Silva", "TechFix Assistência", "Construtora Alfa", "Mecânica Souza", 
    "Refrigeração Costa", "Eletro Service", "Serralheria Arte Ferro", "Mestre das Obras", "Resolve Assistência"
  ];
  // Duplicar a lista para o efeito infinito suave
  const infiniteBrands = [...brands, ...brands];

  return (
    <section className="border-b border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Aprovado por mais de 5.000 profissionais autônomos
        </p>
        <div className="mt-8 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max min-w-full shrink-0 animate-marquee items-center justify-around gap-16 py-2">
            {infiniteBrands.map((brand, i) => (
              <span key={i} className="text-xl font-bold tracking-tight text-foreground/20 transition-colors hover:text-foreground/40">
                {brand}
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
    { icon: Share2, title: "O fim do 'orçamento de boca'", desc: "Antes: você mandava um áudio confuso ou foto de caderno. Depois: o cliente clica num link e vê um orçamento com sua logo, impecável." },
    { icon: Zap, title: "Aprovação em um clique", desc: "Chega de 'vou pensar e te aviso'. O cliente lê no celular, aperta um botão verde de 'Aprovar' e você já pode começar o serviço." },
    { icon: MessageCircle, title: "Direto no WhatsApp", desc: "O cliente não precisa baixar nenhum aplicativo, nem abrir PDF pesado. Ele clica no link e já vê tudo ali mesmo, rapidinho." },
    { icon: FileText, title: "Preços na ponta do dedo", desc: "Não perca tempo calculando tudo de novo do zero. Salve os serviços e peças mais usados e monte um orçamento em 2 minutos." },
  ];

  return (
    <section id="recursos" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Feito para quem bota a mão na massa</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Do papel amassado para o digital.</p>
          <p className="mt-4 text-lg text-muted-foreground">O Simbi transforma a forma como você passa preço. Mostre que o seu serviço não é um 'quebra-galho', é um trabalho profissional.</p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
            <h2 className="text-base font-semibold leading-7 text-primary">Simples e direto</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Fluxo perfeito.</p>
            <p className="mt-4 text-lg text-white/70">
              Pare de perder horas formatando documentos. Focamos no que importa: clareza e velocidade.
            </p>
            
            <div className="mt-10 space-y-8">
              {[
                { title: "Adicione do Catálogo", desc: "Puxe serviços e valores cadastrados instantaneamente." },
                { title: "Compartilhe o Link", desc: "O cliente recebe uma página com a sua marca, impecável." },
                { title: "Receba a Notificação", desc: "Mude o status e acompanhe o pagamento no seu dashboard." }
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
            {/* Dark mode mock */}
            <div className="rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl">
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
                  <div className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">
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
    { body: "Antes eu perdia um tempão fazendo orçamento no bloco de notas para cada cliente. Com o Simbi, eu puxo os serviços do catálogo e mando pro cliente no zap em 2 minutos. Os clientes dão mais credibilidade e fecham mais rápido.", author: "Diego M.", role: "Mecânico Automotivo" },
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
          <h2 className="text-base font-semibold leading-7 text-primary">Preços justos e transparentes</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Comece de graça, cresça com o Simbi.</p>
          <p className="mt-4 text-lg text-muted-foreground">Planos pensados para caber no bolso do profissional autônomo e pequeno empreendedor.</p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 items-center">
          {/* Free Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-card border border-border p-8 shadow-sm">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Básico</h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Perfeito para quem está começando e precisa de agilidade nos orçamentos.</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-foreground">Grátis</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">para sempre</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Até 5 propostas por mês</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Catálogo com 10 itens</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Cadastro de até 10 clientes</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" /> Compartilhamento via WhatsApp</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-8 w-full rounded-full h-12">
              <Link to="/register">Começar grátis</Link>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-primary p-8 shadow-2xl ring-1 ring-primary relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
            <div>
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-2xl font-bold text-primary-foreground">Profissional</h3>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold leading-5 text-primary-foreground">Mais popular</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-primary-foreground/80">Acesso ilimitado a todas as funcionalidades de vendas e gestão.</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-primary-foreground">R$ 39,90</span>
                <span className="text-sm font-semibold leading-6 text-primary-foreground/80">/mês</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-primary-foreground/90">
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary-foreground" /> <strong>Propostas ilimitadas</strong></li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary-foreground" /> Catálogo e clientes <strong>ilimitados</strong></li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary-foreground" /> Personalização completa com sua logo e cores</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary-foreground" /> URL Personalizada (simbi.com/p/sua-marca)</li>
                <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary-foreground" /> Integração com botão de pagamento</li>
              </ul>
            </div>
            <Button asChild className="mt-8 w-full rounded-full h-12 bg-white text-primary hover:bg-white/90 shadow-lg font-bold">
              <Link to="/register">Assinar plano Profissional</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-primary px-6 py-24 text-center sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl">
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

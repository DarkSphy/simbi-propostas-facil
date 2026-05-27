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
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -ml-[30rem] w-[60rem] max-w-none -translate-y-1/2 sm:-ml-[40rem] sm:w-[80rem]">
        <div className="aspect-[2/1] bg-gradient-to-b from-primary/50 to-transparent blur-3xl opacity-70 glow-primary" />
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
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfiniteLogos() {
  const brands = [
    "Studio Vértice", "Marina Arquitetura", "Fix Reformas", "Bloom Decor", "Garoa Studio", 
    "Nova Marketing", "Léo Fotografias", "Doces da Maria", "Consultoria 360", "Evento.co"
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
    { icon: Share2, title: "Link de Alto Impacto", desc: "Esqueça PDFs pesados. Envie um link elegante que se adapta perfeitamente à tela do celular do cliente." },
    { icon: Zap, title: "Aprovação em um clique", desc: "O cliente lê a proposta e clica em 'Aprovar'. Simples assim. Menos atrito significa mais fechamentos." },
    { icon: MessageCircle, title: "Feito para o WhatsApp", desc: "Integração nativa com a forma que o brasileiro faz negócios. Compartilhe no WhatsApp com um toque." },
    { icon: FileText, title: "Catálogo Inteligente", desc: "Salve seus produtos e serviços frequentes. Monte orçamentos complexos em poucos segundos." },
  ];

  return (
    <section id="recursos" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Tudo o que você precisa</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Design que converte.</p>
          <p className="mt-4 text-lg text-muted-foreground">O Simbi não é apenas um gerador de orçamentos. É uma ferramenta de vendas focada em impressionar o seu cliente.</p>
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
                <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">M</div>
                <div>
                  <div className="text-sm font-semibold text-white">Marina Arquitetura</div>
                  <div className="text-xs text-white/50">Proposta #1024</div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center rounded-lg bg-white/5 p-3">
                  <span className="text-white/80 text-sm">Consultoria Inicial</span>
                  <span className="text-white font-medium">R$ 800,00</span>
                </div>
                <div className="flex justify-between items-center rounded-lg bg-white/5 p-3">
                  <span className="text-white/80 text-sm">Projeto 3D Completo</span>
                  <span className="text-white font-medium">R$ 4.200,00</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white text-xl font-bold text-primary">R$ 5.000,00</span>
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
    { body: "Antes eu perdia 40 minutos montando um PDF no Canva para cada cliente. Com o Simbi, eu puxo os itens do catálogo e mando em 2 minutos. Os clientes amam.", author: "Diego M.", role: "Designer Gráfico" },
    { body: "O design do link que o cliente recebe é absurdamente limpo. Passa muita autoridade. Consegui aumentar meus preços e a taxa de aprovação subiu.", author: "Camila R.", role: "Arquiteta" },
    { body: "A integração visual da proposta lida no celular mudou o jogo pra mim. Envio pelo WhatsApp e eles fecham na hora, sem precisar baixar arquivo nenhum.", author: "Felipe T.", role: "Fotógrafo" },
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
    <footer className="bg-background py-12 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
        <Logo />
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Simbi. Feito para criativos de alto nível.</p>
      </div>
    </footer>
  );
}

/* ---------------- Mockups ---------------- */

function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/80" />
          <div className="h-3 w-3 rounded-full bg-warning/80" />
          <div className="h-3 w-3 rounded-full bg-success/80" />
        </div>
        <div className="ml-4 flex h-6 flex-1 items-center rounded-md bg-background px-3 text-[10px] font-medium text-muted-foreground ring-1 ring-border sm:text-xs">
          simbi.app/dashboard
        </div>
      </div>
      <div className="flex">
        <div className="hidden w-48 flex-col gap-2 border-r border-border bg-muted/20 p-4 sm:flex">
          <div className="rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">Visão Geral</div>
          <div className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Propostas</div>
          <div className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Catálogo</div>
          <div className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Clientes</div>
        </div>
        <div className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Dashboard</h3>
            <div className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Nova proposta</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enviadas</div>
              <div className="mt-2 text-2xl font-bold">24</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aceitas</div>
              <div className="mt-2 text-2xl font-bold">18</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa de Conversão</div>
              <div className="mt-2 text-2xl font-bold text-success">75%</div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4 text-sm font-bold">Atividade Recente</div>
            <div className="divide-y divide-border">
              {[
                { n: "Identidade Visual Vértice", s: "Aceita", c: "text-success bg-success/10" },
                { n: "Redesign Site Institucional", s: "Visualizada", c: "text-blue-600 bg-blue-500/10" },
                { n: "Consultoria Mensal", s: "Enviada", c: "text-muted-foreground bg-muted" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 text-sm">
                  <span className="font-medium">{item.n}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.c}`}>{item.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

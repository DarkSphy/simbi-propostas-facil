import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Check, Smartphone, Share2, Zap, MessageCircle, FileText, BarChart3, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simbi — Propostas que passam confiança" },
      { name: "description", content: "Crie orçamentos profissionais em minutos, envie pelo WhatsApp e feche serviços mais rápido. Mobile-first, sem complicação." },
      { property: "og:title", content: "Simbi — Propostas que passam confiança" },
      { property: "og:description", content: "Crie orçamentos profissionais em minutos, envie pelo WhatsApp e feche serviços mais rápido." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Showcase />
      <ForWho />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#recursos" className="hover:text-foreground">Recursos</a>
          <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
          <a href="#depoimentos" className="hover:text-foreground">Depoimentos</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">Entrar</Link>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/register">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 text-center md:pt-28 md:pb-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
          <Sparkles className="h-3 w-3 text-primary" />
          Novo · Propostas com link compartilhável
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Envie propostas que <span className="text-gradient">passam confiança.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Crie orçamentos profissionais, compartilhe pelo WhatsApp e feche serviços mais rápido — direto do celular.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link to="/register">Criar minha conta <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link to="/login">Testar gratuitamente</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Sem cartão de crédito · Sem complicação</p>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-elevated">
            <MockDashboard />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden w-64 rotate-3 sm:block">
            <MockPhone />
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  return (
    <section className="border-y border-border/60 bg-muted/40 py-8">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Usado por profissionais autônomos e pequenos negócios</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-muted-foreground/70">
          <span>Studio Vértice</span><span>Marina Arquitetura</span><span>Fix Reformas</span><span>Bloom Decor</span><span>Garoa Studio</span><span>Nova Marketing</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Zap, title: "Aprovação rápida", desc: "Clientes aprovam com um clique direto pelo link." },
    { icon: Share2, title: "Link compartilhável", desc: "Cada proposta vira uma página bonita para compartilhar." },
    { icon: Smartphone, title: "Pensado pro celular", desc: "Crie e envie suas propostas em qualquer lugar." },
    { icon: MessageCircle, title: "Envio via WhatsApp", desc: "Um toque e a proposta vai direto pro seu cliente." },
    { icon: FileText, title: "Aparência profissional", desc: "Layout moderno que valoriza o seu trabalho." },
    { icon: BarChart3, title: "Histórico organizado", desc: "Acompanhe propostas enviadas, vistas e aprovadas." },
  ];
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tudo que você precisa para fechar mais.</h2>
        <p className="mt-3 text-muted-foreground">Simples, rápido e bonito. Como deveria ser.</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Adicione o cliente", d: "Cadastre nome, contato e observações em segundos." },
    { n: "02", t: "Monte a proposta", d: "Itens, valores, descrição e imagens opcionais." },
    { n: "03", t: "Envie e feche", d: "Compartilhe o link no WhatsApp e acompanhe a aprovação." },
  ];
  return (
    <section id="como-funciona" className="border-y border-border/60 bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Do orçamento ao “sim” em minutos.</h2>
          <p className="mt-3 text-muted-foreground">Três passos. Sem fricção.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs font-semibold text-primary">{s.n}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Uma página de proposta que vende por você.</h2>
          <p className="mt-3 text-muted-foreground">Cada orçamento vira um link elegante que o cliente abre no celular, lê, aprova e te chama no WhatsApp.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Identidade visual com sua logo", "Botão de aprovação em destaque", "Status em tempo real: visto / aprovado", "Funciona perfeitamente no celular"].map(t => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success"><Check className="h-3 w-3" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <MockProposal />
        </div>
      </div>
    </section>
  );
}

function ForWho() {
  const tags = ["Designers", "Arquitetos", "Fotógrafos", "Marketing", "Reformas", "Beleza", "Eventos", "Consultoria", "Freelancers", "Confeitaria"];
  return (
    <section className="border-y border-border/60 bg-muted/30 py-20">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Feito para quem vende serviços.</h2>
        <p className="mt-3 text-muted-foreground">Empreendedores que querem parecer profissionais sem perder tempo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tags.map(t => (
            <span key={t} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm shadow-soft">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { n: "Camila R.", r: "Arquiteta · São Paulo", q: "Minhas propostas ficaram com cara de escritório grande. Aumentei o ticket médio." },
    { n: "Diego M.", r: "Designer · Porto Alegre", q: "Fecho orçamento direto do celular entre uma reunião e outra. Mudou meu fluxo." },
    { n: "Beatriz F.", r: "Marketing · Recife", q: "Os clientes elogiam o link. Parece site de proposta de agência grande." },
  ];
  return (
    <section id="depoimentos" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Empreendedores fechando mais.</h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {items.map(i => (
          <div key={i.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex gap-0.5 text-warning">
              {[0,1,2,3,4].map(k => <Star key={k} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-3 text-sm">{i.q}</p>
            <div className="mt-4 text-sm">
              <div className="font-semibold">{i.n}</div>
              <div className="text-muted-foreground">{i.r}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-24">
      <div className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-elevated">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Comece a enviar propostas melhores hoje.</h2>
        <p className="mx-auto mt-3 max-w-lg opacity-80">Sem cartão. Sem fricção. É só criar a conta.</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
            <Link to="/register">Criar minha conta</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="rounded-full px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} Simbi · Feito para empreendedores brasileiros.</p>
      </div>
    </footer>
  );
}

/* ---------------- Mockups ---------------- */

function MockDashboard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <div className="ml-3 text-xs text-muted-foreground">simbi.app/dashboard</div>
      </div>
      <div className="grid grid-cols-12 gap-3 p-4">
        <div className="col-span-3 space-y-2 text-xs">
          <div className="rounded-md bg-primary/10 px-2 py-1.5 font-medium text-primary">Dashboard</div>
          <div className="px-2 py-1.5 text-muted-foreground">Propostas</div>
          <div className="px-2 py-1.5 text-muted-foreground">Clientes</div>
          <div className="px-2 py-1.5 text-muted-foreground">Histórico</div>
        </div>
        <div className="col-span-9 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[{l:"Enviadas",v:"24"},{l:"Aprovadas",v:"17"},{l:"Aprovação",v:"71%"}].map(c=>(
              <div key={c.l} className="rounded-lg border border-border p-3">
                <div className="text-[10px] uppercase text-muted-foreground">{c.l}</div>
                <div className="mt-1 text-xl font-semibold">{c.v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 text-xs font-medium">Últimas propostas</div>
            {["Site institucional · Marina","Logo + identidade · Bloom","Ensaio fotográfico · Léo"].map((r,i)=>(
              <div key={r} className="flex items-center justify-between border-t border-border py-2 text-xs first:border-t-0">
                <span>{r}</span>
                <span className={["text-success","text-primary","text-muted-foreground"][i]}>{["Aprovada","Visto","Enviada"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPhone() {
  return (
    <div className="rounded-[2rem] border-[6px] border-foreground/90 bg-background shadow-elevated">
      <div className="rounded-[1.5rem] bg-card p-4">
        <div className="text-[10px] font-medium text-muted-foreground">PROPOSTA</div>
        <div className="mt-1 text-sm font-semibold">Identidade Bloom</div>
        <div className="mt-3 space-y-1.5 text-[11px]">
          <Row l="Logo principal" v="R$ 1.200" />
          <Row l="Manual de marca" v="R$ 900" />
          <Row l="Cartão & papelaria" v="R$ 600" />
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-2 text-xs font-semibold">
          <span>Total</span><span>R$ 2.700</span>
        </div>
        <button className="mt-3 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Aprovar proposta</button>
      </div>
    </div>
  );
}

function MockProposal() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">B</div>
        <div className="text-sm font-semibold">Bloom Decor</div>
      </div>
      <div className="mt-5 text-xs text-muted-foreground">Proposta para</div>
      <div className="text-base font-semibold">Marina Arquitetura</div>
      <div className="mt-5 space-y-2 text-sm">
        <Row l="Consultoria inicial" v="R$ 800" />
        <Row l="Projeto completo" v="R$ 4.200" />
        <Row l="Acompanhamento" v="R$ 1.000" />
      </div>
      <div className="mt-5 flex justify-between border-t border-border pt-3 font-semibold">
        <span>Total</span><span>R$ 6.000</span>
      </div>
      <button className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Aprovar proposta</button>
      <button className="mt-2 w-full rounded-xl border border-border py-2.5 text-sm font-medium">Falar no WhatsApp</button>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{l}</span><span>{v}</span></div>;
}

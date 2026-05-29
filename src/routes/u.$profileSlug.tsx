import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, ShoppingCart, Send, Instagram, Phone, Mail, MapPin, CheckCircle2, Check, Linkedin, Globe } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring, useMotionValue, useTransform } from "framer-motion";

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX, transformOrigin: "0%" }} className="fixed top-0 left-0 right-0 h-1 bg-primary z-50" />;
}

function MarqueeBanner() {
  const words = ["Inovação", "Design Premium", "Alta Qualidade", "Resultados", "Autoridade", "Excelência"];
  return (
    <div className="overflow-hidden bg-primary/5 border-y border-border py-2.5 flex items-center">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-4">
            {words.map((w, idx) => <span key={idx} className="text-xs font-bold tracking-[0.2em] uppercase text-primary/80">{w} ✦</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BackgroundEffects({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none opacity-40">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-float" style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: Math.random() * 10 + 10 + 's'
          }} />
        ))}
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] animate-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[80px] animate-glow" style={{ animationDelay: '2s' }} />
    </div>
  );
}

function TiltCard({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}


export const Route = createFileRoute("/u/$profileSlug")({
  component: VitrinePageWrapper,
  loader: async ({ params }) => {
    const { data: profile, error } = await supabase.from("profiles")
      .select("*")
      .eq("profile_slug", params.profileSlug)
      .single();
      
    if (error || !profile) throw new Error("Perfil não encontrado");
    
    const { data: items } = await supabase.from("catalog_items")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    return { profile, items: items || [] };
  },
  errorComponent: () => <div className="min-h-screen flex items-center justify-center bg-background"><div className="p-10 text-center font-semibold text-lg text-muted-foreground border border-border rounded-2xl bg-card shadow-sm">Perfil não encontrado.</div></div>
});

function VitrinePageWrapper() {
  const { profile } = Route.useLoaderData();
  
  useEffect(() => {
    const root = document.documentElement;
    if (profile.ui_color) {
      root.className = "";
      root.classList.add(`theme-${profile.ui_color}`);
    }
    if (profile.vitrine_skin === "dark" || profile.ui_theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [profile.ui_color, profile.ui_theme, profile.vitrine_skin]);

  return <VitrinePage />;
}

function VitrinePage() {
  const { profile, items } = Route.useLoaderData();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "product" | "service">("all");

  const filteredItems = items.filter(it => filterType === "all" ? true : it.type === filterType);

  const cartItems = items.filter(it => cart[it.id]);
  const totalCart = cartItems.reduce((acc, it) => acc + (Number(it.unit_price) * cart[it.id]), 0);

  function toggleCart(id: string) {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id]) delete newCart[id];
      else newCart[id] = 1;
      return newCart;
    });
  }

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Preencha nome e WhatsApp.");
      return;
    }
    setSending(true);
    
    const pItems = cartItems.map(it => ({
      description: it.name,
      quantity: cart[it.id],
      unit_price: Number(it.unit_price)
    }));

    const { data, error } = await supabase.rpc("submit_quote_request", {
      p_profile_slug: profile.profile_slug,
      p_client_name: name,
      p_client_phone: phone,
      p_items: pItems
    });

    setSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success("Orçamento solicitado com sucesso!");
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl shadow-primary/10 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Solicitação enviada!</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sua solicitação de orçamento foi enviada diretamente para <strong>{profile.name || 'o profissional'}</strong>. Em breve entrarão em contato via WhatsApp.
          </p>
          <Button className="w-full rounded-full h-12 text-base font-semibold" onClick={() => { setDone(false); setCart({}); setOpen(false); }}>
            Voltar para a vitrine
          </Button>
        </div>
      </div>
    );
  }

  const testimonials = profile.vitrine_testimonials ? 
    (typeof profile.vitrine_testimonials === 'string' ? JSON.parse(profile.vitrine_testimonials) : profile.vitrine_testimonials) 
    : [];

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const pitchYoutubeId = profile.vitrine_pitch_video_url ? getYoutubeId(profile.vitrine_pitch_video_url) : null;

  const organicStyle = profile.vitrine_skin === "organic" ? {
    "--background": "45 30% 96%",
    "--foreground": "45 10% 20%",
    "--card": "0 0% 100%",
    "--card-foreground": "45 10% 20%",
    "--border": "40 20% 85%",
    "--muted": "40 20% 90%",
    "--muted-foreground": "45 5% 40%",
    "--radius": "1.5rem"
  } as React.CSSProperties : {};

  const containerAnim = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const isDark = profile.vitrine_skin === "dark" || profile.ui_theme === "dark";

  return (
    <div className="min-h-screen bg-transparent text-foreground pb-32" style={organicStyle}>
      <ProgressBar />
      <BackgroundEffects isDark={isDark} />
      
      {/* Header Profile / Hero */}
      <div className="relative border-b border-border shadow-sm overflow-hidden">
        {profile.vitrine_hero_type === 'image' && profile.vitrine_hero_url && (
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }}
              src={profile.vitrine_hero_url} alt="Cover" className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:bg-background/90" />
          </div>
        )}
        {profile.vitrine_hero_type === 'video' && profile.vitrine_hero_url && (
          <div className="absolute inset-0 z-0">
            <video src={profile.vitrine_hero_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:bg-background/90" />
          </div>
        )}
        
        <div className="relative z-10 max-w-4xl mx-auto px-5 py-12 md:py-16 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.company_name || profile.name} className="h-28 w-28 md:h-36 md:w-36 object-cover rounded-3xl mx-auto mb-6 shadow-2xl border-4 border-background/50 backdrop-blur-md" />
            ) : (
              <div className="h-28 w-28 md:h-36 md:w-36 rounded-3xl bg-primary text-primary-foreground mx-auto mb-6 flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-background/50 backdrop-blur-md">
                {(profile.company_name || profile.name)?.[0]?.toUpperCase() || 'S'}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2 drop-shadow-sm">{profile.company_name || profile.name}</h1>
            {profile.company_name && <p className="text-lg md:text-xl font-serif font-medium mb-4 text-foreground/80">{profile.name}</p>}
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4 text-sm text-foreground/80 mb-5 font-medium">
            {profile.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {profile.phone}</span>}
            {profile.email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</span>}
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex justify-center gap-3 mb-6">
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all p-2.5 bg-background/50 backdrop-blur-sm rounded-full hover:scale-110 shadow-sm border border-border/50">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all p-2.5 bg-background/50 backdrop-blur-sm rounded-full hover:scale-110 shadow-sm border border-border/50">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all p-2.5 bg-background/50 backdrop-blur-sm rounded-full hover:scale-110 shadow-sm border border-border/50">
                <Globe className="h-5 w-5" />
              </a>
            )}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto text-foreground/70 text-base md:text-lg leading-relaxed">
            Selecione abaixo os produtos ou serviços que você tem interesse e clique em "Solicitar Orçamento" para receber uma proposta personalizada nossa.
          </motion.p>
        </div>
      </div>

      {/* Marquee Banner */}
      <MarqueeBanner />

      {/* Pitch Section */}
      {(pitchYoutubeId || profile.vitrine_pitch_text) && (
        <div className="max-w-4xl mx-auto px-5 py-12 border-b border-border/20">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg flex flex-col md:flex-row gap-8 items-center">
            {pitchYoutubeId && (
              <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                <iframe 
                  src={`https://www.youtube.com/embed/${pitchYoutubeId}?rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full absolute inset-0"
                ></iframe>
              </div>
            )}
            <div className={cn("w-full", pitchYoutubeId ? "md:w-1/2" : "text-center")}>
              <h2 className="text-3xl font-serif tracking-tight mb-4 text-primary">Sobre a empresa</h2>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed font-medium">{profile.vitrine_pitch_text || "Assista ao vídeo para nos conhecer melhor e entender como podemos te ajudar a alcançar seus objetivos!"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="max-w-4xl mx-auto px-5 py-10">
        
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Button variant={filterType === 'all' ? 'default' : 'outline'} className="rounded-full shadow-sm" onClick={() => setFilterType('all')}>Todos</Button>
          <Button variant={filterType === 'service' ? 'default' : 'outline'} className="rounded-full shadow-sm" onClick={() => setFilterType('service')}>Serviços</Button>
          <Button variant={filterType === 'product' ? 'default' : 'outline'} className="rounded-full shadow-sm" onClick={() => setFilterType('product')}>Produtos</Button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center p-10 bg-card rounded-3xl border border-border">
            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <motion.div variants={containerAnim} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
            {filteredItems.map(it => {
              const selected = !!cart[it.id];
              return (
                <TiltCard 
                  key={it.id} 
                  onClick={() => toggleCart(it.id)}
                  className={cn(
                    "flex flex-col bg-card/80 backdrop-blur-md rounded-3xl border transition-colors cursor-pointer overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]",
                    selected ? "border-primary ring-2 ring-primary/40 shadow-lg" : "border-border/50"
                  )}
                >
                  <motion.div variants={itemAnim} className="flex flex-col h-full">
                    {it.image_url ? (
                      <div className="aspect-video w-full bg-muted/20 border-b border-border/30 relative overflow-hidden">
                        <img src={it.image_url} alt={it.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className={cn("absolute top-3 right-3 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all shadow-lg z-10", selected ? "bg-primary border-primary text-primary-foreground scale-110" : "bg-black/40 border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100")}>
                          {selected && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex justify-end">
                         <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm", selected ? "bg-primary border-primary text-primary-foreground scale-110" : "bg-card border-border")}>
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col relative">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-primary transition-colors">{it.name}</h3>
                      </div>
                      {it.description && <p className="text-sm text-foreground/70 line-clamp-2 mb-5 font-medium">{it.description}</p>}
                      <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-3 py-1 rounded-full tracking-widest">{it.type === 'product' ? 'Produto' : 'Serviço'}</span>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="max-w-4xl mx-auto px-5 py-16 mb-10">
          <h2 className="text-3xl font-serif tracking-tight text-center mb-10 text-primary">O que dizem os clientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-3xl shadow-lg flex flex-col hover:-translate-y-2 transition-transform duration-300">
                <div className="flex text-amber-400 mb-4 text-base">★★★★★</div>
                <p className="text-base text-foreground/80 flex-1 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="font-bold font-serif text-lg text-primary">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/30 backdrop-blur-xl border-t border-white/10 z-40 pointer-events-none flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <div className="pointer-events-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
              <div className="absolute -inset-1 bg-primary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
              <Button 
                size="lg" 
                className="relative rounded-full shadow-2xl h-14 px-10 font-bold text-base gap-3 transition-transform"
                onClick={() => setOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                Solicitar Orçamento ({cartItems.length})
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Solicitação</DialogTitle>
            <DialogDescription>
              Você selecionou {cartItems.length} item(s) para solicitar orçamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Seu Nome Completo</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="João da Silva" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Seu WhatsApp</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-11 rounded-xl" />
            </div>
            
            <div className="pt-2 bg-muted/30 rounded-xl p-4 border border-border/50 max-h-40 overflow-y-auto mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Resumo do Pedido</h4>
              <ul className="space-y-2">
                {cartItems.map(it => (
                  <li key={it.id} className="flex text-sm">
                    <span className="font-medium text-foreground">• {it.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full h-12 rounded-full font-bold text-base mt-2" onClick={submit} disabled={sending}>
              {sending ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

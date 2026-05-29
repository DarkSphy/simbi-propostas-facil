import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, ShoppingCart, Send, Instagram, Phone, Mail, MapPin, CheckCircle2, Check, Linkedin, Globe, Search, Plus } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring, useMotionValue, useTransform } from "framer-motion";

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX, transformOrigin: "0%" }} className="fixed top-0 left-0 right-0 h-1 bg-primary z-50" />;
}

function MarqueeBanner({ words }: { words: string[] }) {
  if (!words || words.length === 0) return null;
  
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
      .select(`*, catalog_categories(name)`)
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    const { data: categories } = await supabase.from("catalog_categories")
      .select("*")
      .eq("user_id", profile.id)
      .order("name", { ascending: true });

    return { profile, items: items || [], categories: categories || [] };
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
  const { profile, items, categories } = Route.useLoaderData();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const filteredItems = items.filter((it: any) => {
    if (categoryId && it.category_id !== categoryId) return false;
    if (search.trim() && !it.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

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
    <div className="min-h-screen bg-[#F8F9FA] text-foreground pb-32" style={organicStyle}>
      <ProgressBar />
      
      {/* Header E-Commerce */}
      <div className="bg-primary text-primary-foreground sticky top-0 z-40 w-full shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {profile.logo_url ? (
              <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full bg-white p-0.5 shadow-sm">
                <img src={profile.logo_url} alt={profile.company_name || profile.name} className="h-full w-full rounded-full object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full bg-white text-primary flex items-center justify-center font-black text-xl shadow-sm">
                {(profile.company_name || profile.name)?.[0]?.toUpperCase() || 'S'}
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="font-bold text-base md:text-lg leading-tight line-clamp-1">{profile.company_name || profile.name}</h1>
              <p className="text-[10px] md:text-xs opacity-90 line-clamp-1 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {profile.email || "Catálogo Digital"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setOpen(true)} variant="secondary" className="rounded-full shadow-sm bg-orange-500 hover:bg-orange-600 text-white border-0 h-10 w-10 md:w-auto md:px-4 md:gap-2 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline font-bold">Carrinho</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-orange-500 shadow-sm">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      {profile.vitrine_hero_url && (
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="w-full aspect-[21/9] md:aspect-[32/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-md relative bg-muted/20">
            {profile.vitrine_hero_type === 'image' ? (
               <img src={profile.vitrine_hero_url} className="w-full h-full object-cover" />
            ) : (
               <video src={profile.vitrine_hero_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}
      {/* Marquee Banner */}
      <MarqueeBanner words={
        profile.vitrine_marquee_words 
        ? (typeof profile.vitrine_marquee_words === 'string' ? JSON.parse(profile.vitrine_marquee_words) : profile.vitrine_marquee_words)
        : ["Inovação", "Design Premium", "Alta Qualidade", "Resultados", "Autoridade"]
      } />

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

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 mt-2 mb-6">
        <div className="relative mb-5 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input 
            placeholder="Buscar produtos e serviços..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-full shadow-sm bg-white border-border text-base"
          />
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          <Button 
            variant={!categoryId ? "default" : "outline"} 
            className="rounded-full shadow-sm shrink-0 font-bold px-6 h-10" 
            onClick={() => setCategoryId(null)}
          >
            Todos
          </Button>
          {categories.map((c: any) => (
            <Button 
              key={c.id} 
              variant={categoryId === c.id ? "default" : "outline"} 
              className={cn("rounded-full shadow-sm shrink-0 font-semibold px-5 h-10", categoryId === c.id ? "" : "bg-white")} 
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {categoryId && (
           <h2 className="text-2xl font-black tracking-tight mb-6">{categories.find((c: any) => c.id === categoryId)?.name || 'Todos'}</h2>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-border shadow-sm">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg">Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {filteredItems.map((it: any) => {
              const selected = !!cart[it.id];
              return (
                <div 
                  key={it.id} 
                  className={cn(
                    "flex flex-col bg-white rounded-2xl border transition-all overflow-hidden group hover:shadow-lg",
                    selected ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md" : "border-border/60"
                  )}
                >
                  <div className="aspect-[4/5] w-full relative bg-muted/10 border-b border-border/40 overflow-hidden">
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md z-10 shadow-sm uppercase tracking-wider">
                      OFERTA
                    </div>
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm md:text-base leading-tight mb-1 text-foreground line-clamp-2">{it.name}</h3>
                    {it.description && <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 mb-3">{it.description}</p>}
                    <div className="mt-auto pt-2">
                      <Button 
                        onClick={() => toggleCart(it.id)} 
                        variant={selected ? "secondary" : "default"} 
                        className={cn(
                          "w-full h-9 text-[11px] md:text-xs font-bold rounded-full gap-1.5 transition-colors",
                          selected ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-primary text-primary-foreground shadow-sm"
                        )}
                      >
                        {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {selected ? "No Carrinho" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Floating WhatsApp Button */}
      {profile.phone && (
        <a 
          href={`https://wa.me/55${profile.phone.replace(/\D/g, '')}?text=Olá! Vim pelo catálogo e gostaria de tirar uma dúvida.`}
          target="_blank" 
          rel="noreferrer" 
          className="fixed bottom-6 right-6 h-14 w-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
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

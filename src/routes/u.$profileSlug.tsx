import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send, Instagram, Phone, Mail, Globe, MapPin, Search } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error";

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

    const { data: categories } = await supabase.from("catalog_categories")
      .select("*")
      .eq("user_id", profile.id)
      .order("name", { ascending: true });

    return { profile, items: items || [], categories: categories || [] };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.profile) return {};
    const { profile } = loaderData;
    const title = profile.company_name || profile.full_name || "Portfólio";
    const desc = profile.vitrine_pitch_text || `Conheça os produtos e serviços de ${title}.`;
    const image = profile.logo_url || "https://simbi-propostas-facil.lovable.app/og-vitrine.png";
    
    return {
      meta: [
        { title: `${title} | Portfólio` },
        { name: "description", content: desc },
      ],
    };
  },
  errorComponent: () => <div className="min-h-screen flex items-center justify-center bg-background"><div className="p-10 text-center font-semibold text-lg text-muted-foreground border border-border rounded-2xl bg-card shadow-sm">Perfil não encontrado.</div></div>
});

function VitrinePageWrapper() {
  const { profile: rawProfile } = Route.useLoaderData();
  const profile = rawProfile as any;
  
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
  const { profile: rawProfile, items, categories } = Route.useLoaderData();
  const profile = rawProfile as any;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);

  // Group items by category
  const categorizedItems: Record<string, any[]> = { "Outros Serviços": [] };
  categories.forEach((c: any) => { categorizedItems[c.name] = []; });
  
  items.forEach((it: any) => {
    if (it.category_id) {
      const cat = categories.find((c: any) => c.id === it.category_id);
      if (cat) categorizedItems[cat.name].push(it);
      else categorizedItems["Outros Serviços"].push(it);
    } else {
      categorizedItems["Outros Serviços"].push(it);
    }
  });

  const activeCategories = Object.keys(categorizedItems).filter(k => categorizedItems[k].length > 0);

  function openRequestDialog(item: any) {
    setSelectedItem(item);
    setOpen(true);
  }

  async function submit() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Preencha Nome, WhatsApp e Endereço.");
      return;
    }
    setSending(true);
    
    // Fallback: Se a RPC com 5 parametros não existir, tenta a antiga.
    let success = false;
    try {
      const { data, error } = await supabase.rpc("submit_quote_request", {
        p_profile_slug: profile.profile_slug,
        p_client_name: name,
        p_client_phone: phone,
        p_client_email: email,
        p_client_address: address,
        p_items: [{
          description: selectedItem.name,
          quantity: 1,
          unit_price: selectedItem.unit_price || 0
        }]
      });
      if (error) throw error;
      success = true;
    } catch (err: any) {
      console.warn("Nova RPC falhou, tentando fallback");
      const { error } = await supabase.rpc("submit_quote_request", {
        p_profile_slug: profile.profile_slug,
        p_client_name: name,
        p_client_phone: phone,
        p_items: [{
          description: selectedItem.name,
          quantity: 1,
          unit_price: selectedItem.unit_price || 0
        }]
      });
      if (!error) success = true;
    }

    setSending(false);
    
    if (success) {
      toast.success("Solicitação salva! Redirecionando para o WhatsApp...");
      const msg = `Olá! Meu nome é *${name}*.\nMoro em: ${address}.\nTenho interesse no serviço: *${selectedItem.name}*.\nPodemos conversar?`;
      const p = profile.phone?.replace(/\D/g, "") || "";
      if (p) {
        window.open(`https://wa.me/${p.length <= 11 ? '55'+p : p}?text=${encodeURIComponent(msg)}`, "_blank");
      }
      setOpen(false);
    } else {
      toast.error("Erro ao solicitar. Tente chamar diretamente no WhatsApp.");
    }
  }

  const scrollToCat = (catName: string) => {
    const el = document.getElementById(`cat-${catName}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const testimonials = profile.vitrine_testimonials ? 
    (typeof profile.vitrine_testimonials === 'string' ? JSON.parse(profile.vitrine_testimonials) : profile.vitrine_testimonials) 
    : [];

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const pitchYoutubeId = getYoutubeId(profile.vitrine_pitch_video_url);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* 1. Header & Identidade Visual */}
      <header className="relative bg-card shadow-sm border-b border-border/50">
        {/* Banner Cover */}
        <div className="h-48 md:h-64 w-full bg-muted/30 relative overflow-hidden">
          {profile.vitrine_hero_url ? (
            <img src={profile.vitrine_hero_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary" />
          )}
        </div>
        
        {/* Avatar e Bio */}
        <div className="max-w-3xl mx-auto px-5 relative pb-8">
          <div className="flex justify-between items-end -mt-16 mb-4 relative z-10">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-lg bg-card" />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-background bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg">
                {(profile.company_name || profile.name)?.[0]?.toUpperCase() || 'S'}
              </div>
            )}
            
            {/* Social Links */}
            <div className="flex gap-2 mb-2">
              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors border border-border">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{profile.company_name || profile.name}</h1>
            <p className="text-muted-foreground text-sm font-medium mb-4 whitespace-pre-wrap">{profile.vitrine_pitch_text || "Profissional independente. Entre em contato para transformar suas ideias em realidade."}</p>
          </div>
        </div>
      </header>

      {/* Letreiro Rotativo */}
      <MarqueeBanner words={
        profile.vitrine_marquee_words 
        ? (typeof profile.vitrine_marquee_words === 'string' ? JSON.parse(profile.vitrine_marquee_words) : profile.vitrine_marquee_words)
        : ["Qualidade", "Confiança", "Atendimento Premium", "Resultados"]
      } />

      {/* Apresentação (Vídeo) */}
      {pitchYoutubeId && (
        <div className="max-w-3xl mx-auto px-5 py-8 border-b border-border/20">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Conheça nosso trabalho</h2>
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-border relative">
            <iframe 
              src={`https://www.youtube.com/embed/${pitchYoutubeId}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full absolute inset-0"
            ></iframe>
          </div>
        </div>
      )}

      {/* 2. Menu de Categorias Fixo (Sticky) */}
      {activeCategories.length > 1 && (
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="max-w-3xl mx-auto px-5 py-3 overflow-x-auto flex gap-2 hide-scrollbar">
            {activeCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => scrollToCat(cat)}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Lista de Serviços (Estilo iFood / Linktree) */}
      <main className="max-w-3xl mx-auto px-5 py-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhum serviço disponível no momento.</div>
        ) : (
          <div className="space-y-10">
            {activeCategories.map(cat => (
              <section key={cat} id={`cat-${cat}`}>
                <h2 className="text-2xl font-bold mb-4 tracking-tight">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedItems[cat].map(it => {
                    const isOutOfStock = it.stock_quantity === 0;
                    return (
                      <div 
                        key={it.id} 
                        className={cn(
                          "group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer",
                          isOutOfStock && "opacity-60 grayscale cursor-not-allowed"
                        )}
                        onClick={() => !isOutOfStock && openRequestDialog(it)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors">{it.name}</h3>
                          {it.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{it.description}</p>}
                          <div className="font-semibold text-sm text-foreground">
                            {Number(it.unit_price) > 0 ? formatBRL(Number(it.unit_price)) : "Sob consulta"}
                          </div>
                        </div>
                        {it.image_url ? (
                          <div className="h-24 w-24 rounded-xl overflow-hidden shrink-0 bg-muted/20 relative">
                            <img src={it.image_url} alt={it.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Esgotado</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-xl shrink-0 bg-muted/30 flex items-center justify-center border border-border/50">
                             <span className="text-muted-foreground/50 font-semibold text-xs">Sem foto</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Testimonials (Depoimentos) */}
      {testimonials.length > 0 && (
        <div className="bg-muted/30 border-y border-border/50 py-12 mt-8">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl font-bold mb-6 tracking-tight text-center">O que dizem os clientes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t: any, i: number) => (
                <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col">
                  <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                  <p className="text-sm text-muted-foreground flex-1 italic mb-4 leading-relaxed">"{t.text}"</p>
                  <div className="font-bold text-sm">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de Captação (Lead to WhatsApp) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pedir Orçamento</DialogTitle>
            <DialogDescription>
              Você está solicitando informações sobre <strong className="text-foreground">{selectedItem?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Seu Nome Completo</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Maria Silva" className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">WhatsApp</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Email (Opcional)</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="maria@email.com" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Endereço (Rua, Bairro e Cidade)</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Rua Direita, Centro - SP" className="h-11 rounded-xl" />
            </div>

            <Button className="w-full h-12 rounded-xl font-bold text-base mt-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" onClick={submit} disabled={sending}>
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Preparando..." : "Ir para o WhatsApp"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Você será redirecionado para o WhatsApp do profissional com uma mensagem pré-preenchida.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

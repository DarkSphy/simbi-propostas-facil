import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, ShoppingCart, Send, Instagram, Phone, Mail, MapPin, CheckCircle2, Check } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    if (profile.ui_theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [profile.ui_color, profile.ui_theme]);

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

  return (
    <div className="min-h-screen bg-muted/10 pb-32">
      {/* Header Profile */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-12 md:py-16 text-center">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt={profile.name} className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-3xl mx-auto mb-6 shadow-lg border-4 border-background" />
          ) : (
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-primary/10 text-primary mx-auto mb-6 flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-background">
              {profile.name?.[0]?.toUpperCase() || 'S'}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{profile.name}</h1>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-6">
            {profile.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {profile.phone}</span>}
            {profile.email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</span>}
          </div>

          <p className="max-w-2xl mx-auto text-muted-foreground/90 text-base md:text-lg leading-relaxed">
            Selecione abaixo os produtos ou serviços que você tem interesse e clique em "Solicitar Orçamento" para receber uma proposta personalizada nossa.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-4xl mx-auto px-5 py-10">
        {items.length === 0 ? (
          <div className="text-center p-10 bg-card rounded-3xl border border-border">
            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {items.map(it => {
              const selected = !!cart[it.id];
              return (
                <div 
                  key={it.id} 
                  onClick={() => toggleCart(it.id)}
                  className={cn(
                    "flex flex-col bg-card rounded-2xl border transition-all cursor-pointer overflow-hidden group hover:shadow-md",
                    selected ? "border-primary ring-1 ring-primary/20 shadow-sm" : "border-border hover:border-primary/40"
                  )}
                >
                  {it.image_url ? (
                    <div className="aspect-video w-full bg-muted/20 border-b border-border/50 relative overflow-hidden">
                      <img src={it.image_url} alt={it.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className={cn("absolute top-3 right-3 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm", selected ? "bg-primary border-primary text-primary-foreground" : "bg-background/80 border-border backdrop-blur-sm")}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex justify-end">
                       <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm", selected ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border")}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg leading-tight">{it.name}</h3>
                    </div>
                    {it.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{it.description}</p>}
                    <div className="mt-auto pt-2 font-black text-primary text-lg flex items-center justify-between">
                      {formatBRL(Number(it.unit_price))}
                      {!it.image_url && <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full tracking-wider">{it.type === 'product' ? 'Produto' : 'Serviço'}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/95 to-transparent z-40 pointer-events-none flex justify-center">
          <div className="pointer-events-auto">
            <Button 
              size="lg" 
              className="rounded-full shadow-2xl h-14 px-8 font-bold text-base gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 hover:scale-105 transition-transform"
              onClick={() => setOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              Solicitar Orçamento ({cartItems.length})
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Solicitação</DialogTitle>
            <DialogDescription>
              Você selecionou {cartItems.length} item(s) totalizando <strong>{formatBRL(totalCart)}</strong>.
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
                  <li key={it.id} className="flex justify-between text-sm">
                    <span className="font-medium">{it.name}</span>
                    <span className="text-muted-foreground font-semibold">{formatBRL(Number(it.unit_price))}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-black text-primary">
                <span>Total Estimado</span>
                <span>{formatBRL(totalCart)}</span>
              </div>
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

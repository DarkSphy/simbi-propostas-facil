import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Store, Link as LinkIcon, Image as ImageIcon, Video, Youtube, Palette, MessageSquareQuote, Check, Trash2, Plus, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/_authenticated/vitrine-settings")({
  head: () => ({ meta: [{ title: "Minha Vitrine · Simbi" }] }),
  component: VitrineSettings,
});

function VitrineSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos
  const [profileSlug, setProfileSlug] = useState("");
  const [heroType, setHeroType] = useState<"color" | "image" | "video">("color");
  const [heroUrl, setHeroUrl] = useState("");
  const [pitchVideoUrl, setPitchVideoUrl] = useState("");
  const [pitchText, setPitchText] = useState("");
  const [skin, setSkin] = useState<"minimal" | "dark" | "organic">("minimal");
  const [marqueeWords, setMarqueeWords] = useState("Inovação, Design Premium, Alta Qualidade, Resultados, Autoridade");
  
  // Depoimentos
  const [testimonials, setTestimonials] = useState<{name: string, text: string}[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: rawData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const data: any = rawData;
      if (data) {
        setProfileSlug(data.profile_slug ?? "");
        setHeroType((data.vitrine_hero_type as "color" | "image" | "video") ?? "color");
        setHeroUrl(data.vitrine_hero_url ?? "");
        setPitchVideoUrl(data.vitrine_pitch_video_url ?? "");
        setPitchText(data.vitrine_pitch_text ?? "");
        setSkin((data.vitrine_skin as "minimal" | "dark" | "organic") ?? "minimal");
        if (data.vitrine_testimonials) {
          try {
            setTestimonials(typeof data.vitrine_testimonials === 'string' ? JSON.parse(data.vitrine_testimonials) : data.vitrine_testimonials);
          } catch(e) {
            setTestimonials([]);
          }
        }
        if (data.vitrine_marquee_words) {
          try {
            const parsed = typeof data.vitrine_marquee_words === 'string' ? JSON.parse(data.vitrine_marquee_words) : data.vitrine_marquee_words;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMarqueeWords(parsed.join(", "));
            }
          } catch (e) {}
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);

    if (profileSlug) {
      const formattedSlug = profileSlug.toLowerCase().trim();
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(formattedSlug)) {
        toast.error("A URL da Vitrine deve conter apenas letras minúsculas, números e traços.");
        setSaving(false);
        return;
      }
      
      const { data: existing } = await supabase.from("profiles")
        .select("id")
        .eq("profile_slug", formattedSlug)
        .neq("id", user.id)
        .maybeSingle();
        
      if (existing) {
        toast.error("Esta URL já está em uso por outro profissional. Escolha outra.");
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase.from("profiles").update({
      profile_slug: profileSlug ? profileSlug.toLowerCase().trim() : null,
      vitrine_hero_type: heroType,
      vitrine_hero_url: heroUrl,
      vitrine_pitch_video_url: pitchVideoUrl,
      vitrine_pitch_text: pitchText,
      vitrine_skin: skin,
      vitrine_testimonials: testimonials,
      vitrine_marquee_words: marqueeWords.split(",").map(w => w.trim()).filter(Boolean),
    } as any).eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      toast.success("Vitrine atualizada com sucesso!");
    }
  }

  function addTestimonial() {
    if (testimonials.length >= 3) {
      toast.error("Você pode adicionar no máximo 3 depoimentos.");
      return;
    }
    setTestimonials([...testimonials, { name: "", text: "" }]);
  }

  function updateTestimonial(index: number, field: "name" | "text", value: string) {
    const newT = [...testimonials];
    newT[index][field] = value;
    setTestimonials(newT);
  }

  function removeTestimonial(index: number) {
    const newT = [...testimonials];
    newT.splice(index, 1);
    setTestimonials(newT);
  }

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-xl"><Store className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Vitrine</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure a sua página de vendas pública (Link-in-bio).</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* URL e Acesso */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><LinkIcon className="h-5 w-5 text-muted-foreground" /> Link da sua Vitrine</h2>
          <div className="space-y-3">
            <Label className="text-muted-foreground font-semibold">URL Personalizada / Slug</Label>
            <Input value={profileSlug} onChange={(e) => setProfileSlug(e.target.value)} placeholder="ex: marina-arquiteta" />
            <p className="text-[11px] text-muted-foreground mt-1">Sua vitrine ficará acessível em: {window.location.origin}/u/<b>{profileSlug || 'seu-nome'}</b></p>
            
            {profileSlug && (
              <div className="mt-4 bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1 block">Link Público Ativo</Label>
                  <a href={`/u/${profileSlug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                    {window.location.origin}/u/{profileSlug}
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(`/u/${profileSlug}`, "_blank")}>Abrir</Button>
                  <Button size="sm" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${profileSlug}`);
                    toast.success("Link da vitrine copiado!");
                  }}>Copiar Link</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tema / Skin */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Palette className="h-5 w-5 text-muted-foreground" /> Aparência (Skin)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              type="button" 
              onClick={() => setSkin("minimal")}
              className={cn("text-left p-4 rounded-xl border-2 transition-all", skin === "minimal" ? "border-primary bg-primary/5" : "border-border hover:border-border/80 bg-background")}
            >
              <div className="h-24 w-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden mb-3">
                <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-2"><div className="h-3 w-3 rounded-full bg-gray-200"></div></div>
                <div className="p-2 space-y-1"><div className="h-2 w-full bg-gray-100 rounded"></div><div className="h-2 w-2/3 bg-gray-100 rounded"></div></div>
              </div>
              <h3 className="font-semibold text-sm">Minimalista (Clean)</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Fundo claro, visual corporativo e elegante.</p>
            </button>
            
            <button 
              type="button" 
              onClick={() => setSkin("dark")}
              className={cn("text-left p-4 rounded-xl border-2 transition-all", skin === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-border/80 bg-background")}
            >
              <div className="h-24 w-full bg-gray-900 rounded-lg border border-gray-800 shadow-sm flex flex-col overflow-hidden mb-3">
                <div className="h-8 bg-black/50 flex items-center px-2"><div className="h-3 w-3 rounded-full bg-gray-700"></div></div>
                <div className="p-2 space-y-1"><div className="h-2 w-full bg-gray-800 rounded"></div><div className="h-2 w-2/3 bg-gray-800 rounded"></div></div>
              </div>
              <h3 className="font-semibold text-sm">Dark Mode</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Fundo escuro, visual premium e tecnológico.</p>
            </button>

            <button 
              type="button" 
              onClick={() => setSkin("organic")}
              className={cn("text-left p-4 rounded-xl border-2 transition-all", skin === "organic" ? "border-primary bg-primary/5" : "border-border hover:border-border/80 bg-background")}
            >
              <div className="h-24 w-full bg-[#faf7f2] rounded-lg border border-[#e8e0d5] shadow-sm flex flex-col overflow-hidden mb-3">
                <div className="h-8 bg-[#f0ebd8] flex items-center px-2"><div className="h-3 w-3 rounded-full bg-[#d4cbb3]"></div></div>
                <div className="p-2 space-y-1"><div className="h-2 w-full bg-[#e8e0d5] rounded"></div><div className="h-2 w-2/3 bg-[#e8e0d5] rounded"></div></div>
              </div>
              <h3 className="font-semibold text-sm">Orgânico (Soft)</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Tons pasteis suaves, ótimo para saúde/estética.</p>
            </button>
          </div>
        </div>

        {/* Fundo do Banner (Hero) */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><ImageIcon className="h-5 w-5 text-muted-foreground" /> Banner do Topo (Hero)</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={heroType === 'color' ? 'default' : 'outline'} onClick={() => setHeroType('color')} size="sm">Cor Sólida (Padrão)</Button>
              <Button type="button" variant={heroType === 'image' ? 'default' : 'outline'} onClick={() => setHeroType('image')} size="sm"><ImageIcon className="h-4 w-4 mr-1.5" /> Imagem de Capa</Button>
              <Button type="button" variant={heroType === 'video' ? 'default' : 'outline'} onClick={() => setHeroType('video')} size="sm"><Video className="h-4 w-4 mr-1.5" /> Vídeo em Loop (MP4)</Button>
            </div>
            
            {heroType !== 'color' && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                {heroType === 'image' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-semibold">Upload de Imagem (Máx 5MB)</Label>
                    
                    <Label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-primary/50" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Clique para fazer upload</span> ou arraste e solte</p>
                        <p className="text-xs text-muted-foreground/60">PNG, JPG ou WEBP (Max. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          if (file.size > 5 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 5MB.'); return; }
                          
                          const toastId = toast.loading("Enviando imagem...");
                          const ext = file.name.split('.').pop();
                          const filePath = `${user?.id}/vitrine-hero/${Date.now()}.${ext}`;
                          
                          const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
                          if (error) {
                            toast.error("Erro ao fazer upload da imagem.", { id: toastId });
                            return;
                          }
                          const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
                          setHeroUrl(data.publicUrl);
                          toast.success("Upload concluído!", { id: toastId });
                        }} 
                      />
                    </Label>
                  </div>
                )}

                {heroType === 'video' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-semibold">URL do Vídeo MP4 (Link direto)</Label>
                    <Input value={heroUrl} onChange={(e) => setHeroUrl(e.target.value)} placeholder={`https://exemplo.com/fundo.mp4`} />
                    <p className="text-xs text-muted-foreground mt-1">Dica: O vídeo deve ser um arquivo MP4 direto hospedado online.</p>
                  </div>
                )}
                
                {heroUrl && heroType === 'image' && (
                  <div className="mt-3 aspect-[21/9] w-full rounded-lg border border-border overflow-hidden bg-muted relative">
                    <img src={heroUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {heroUrl && heroType === 'video' && (
                  <div className="mt-3 aspect-[21/9] w-full rounded-lg border border-border overflow-hidden bg-muted relative">
                    <video src={heroUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pitch de Vendas */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Youtube className="h-5 w-5 text-muted-foreground" /> Apresentação / Mini-Pitch</h2>
          <p className="text-sm text-muted-foreground mb-4">Adicione um vídeo curto (Loom ou YouTube) se apresentando para gerar mais confiança, ou apenas um texto cativante.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-semibold">Vídeo Pitch (Link do YouTube ou Loom)</Label>
              <Input value={pitchVideoUrl} onChange={(e) => setPitchVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground font-semibold">Texto da Apresentação</Label>
              <Textarea value={pitchText} onChange={(e) => setPitchText(e.target.value)} placeholder="Olá! Eu sou especialista em..." className="h-24" />
            </div>
          </div>
        </div>

        {/* Marquee Settings */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Type className="h-5 w-5 text-muted-foreground" /> Letreiro Rotativo (Marquee)</h2>
          <p className="text-sm text-muted-foreground mb-4">Palavras-chave que ficam rolando infinitamente na vitrine para gerar autoridade.</p>
          <div className="space-y-2">
            <Label className="text-muted-foreground font-semibold">Palavras-chave (separadas por vírgula)</Label>
            <Input value={marqueeWords} onChange={(e) => setMarqueeWords(e.target.value)} placeholder="Inovação, Design, Autoridade..." />
            <p className="text-xs text-muted-foreground mt-1">Recomendamos de 4 a 6 palavras impactantes sobre o seu negócio.</p>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MessageSquareQuote className="h-5 w-5 text-muted-foreground" /> Depoimentos (Prova Social)</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTestimonial} disabled={testimonials.length >= 3}>
              <Plus className="h-4 w-4 mr-1.5" /> Adicionar
            </Button>
          </div>
          {testimonials.length === 0 ? (
            <div className="text-center p-6 bg-muted/30 border border-border/50 rounded-xl">
              <p className="text-sm text-muted-foreground">Nenhum depoimento. Adicione até 3 depoimentos de clientes satisfeitos para aumentar suas conversões!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t, idx) => (
                <div key={idx} className="p-4 border border-border rounded-xl relative group bg-background">
                  <button type="button" onClick={() => removeTestimonial(idx)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="space-y-3 pr-8">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome do Cliente</Label>
                      <Input value={t.name} onChange={(e) => updateTestimonial(idx, "name", e.target.value)} placeholder="João da Silva" className="h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Depoimento</Label>
                      <Textarea value={t.text} onChange={(e) => updateTestimonial(idx, "text", e.target.value)} placeholder="Trabalho incrível..." className="h-16 resize-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salvar */}
        <div className="flex justify-end pt-4">
          <Button variant="success" size="lg" className="rounded-full shadow-lg h-12 px-8 text-base shadow-emerald-500/20 hover:scale-105 transition-transform" onClick={save} disabled={saving}>
            <Check className="mr-2 h-5 w-5" /> {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

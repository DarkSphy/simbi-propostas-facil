import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · Simbi" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(""); 
  const [companyName, setCompanyName] = useState(""); 
  const [whatsapp, setWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [headerTexture, setHeaderTexture] = useState("none");
  const [fontFamily, setFontFamily] = useState("inter");
  const [itemLayout, setItemsLayout] = useState("minimal");
  const [bgType, setBgType] = useState<"color" | "texture" | "image">("color");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) { 
        setFullName(data.full_name ?? ""); 
        setCompanyName(data.company_name ?? ""); 
        setWhatsapp(data.whatsapp ?? ""); 
        setLogoUrl(data.logo_url ?? "");
        setThemeColor(data.theme_color ?? "#8b5cf6");
        setBackgroundColor(data.background_color ?? "");
        setBackgroundImageUrl(data.background_image_url ?? "");
        setHeaderTexture(data.header_texture ?? "none");
        setFontFamily(data.font_family ?? "inter");
        setItemsLayout(data.item_layout ?? "minimal");
        setInstagram(data.instagram_url ?? "");
        setLinkedin(data.linkedin_url ?? "");
        setWebsite(data.website_url ?? "");

        if (data.background_image_url) setBgType("image");
        else if (data.header_texture && data.header_texture !== "none") setBgType("texture");
        else setBgType("color");
      }
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);

    let finalBgUrl = backgroundImageUrl;
    let finalBgColor = backgroundColor;
    let finalTexture = headerTexture;

    if (bgType === "color") {
      finalBgUrl = "";
      finalTexture = "none";
    } else if (bgType === "texture") {
      finalBgUrl = "";
    } else if (bgType === "image") {
      finalBgColor = "";
      finalTexture = "none";
    }

    const { error } = await supabase.from("profiles").upsert({ 
      id: user.id, 
      full_name: fullName, 
      company_name: companyName, 
      whatsapp, 
      logo_url: logoUrl,
      theme_color: themeColor,
      background_color: finalBgColor,
      background_image_url: finalBgUrl,
      header_texture: finalTexture,
      font_family: fontFamily,
      item_layout: itemLayout,
      instagram_url: instagram,
      linkedin_url: linkedin,
      website_url: website,
      updated_at: new Date().toISOString() 
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!");
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/logos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
    if (error) {
      toast.error("Erro ao fazer upload da logo.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
    setLogoUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingBg(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/bg/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
    if (error) {
      toast.error("Erro ao fazer upload da imagem de fundo.");
      setUploadingBg(false);
      return;
    }
    const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
    setBackgroundImageUrl(data.publicUrl);
    setUploadingBg(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      <div className="mt-8 space-y-8 rounded-3xl border border-border bg-card p-8 shadow-elevated">
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2"><Label className="text-muted-foreground font-semibold">Nome</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="space-y-2"><Label className="text-muted-foreground font-semibold">Empresa / marca</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Aparece nas propostas" /></div>
          <div className="space-y-2"><Label className="text-muted-foreground font-semibold">WhatsApp</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" /></div>
          <div className="space-y-2"><Label className="text-muted-foreground font-semibold">E-mail</Label><Input value={user?.email ?? ""} disabled /></div>
        </div>

        <hr className="border-border" />
        
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">Personalização (Branding)</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold">Logo da Marca</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted/20">
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                    </div>
                    <button onClick={() => setLogoUrl("")} className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground hover:scale-110 transition-transform shadow-sm"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="h-20 w-20 rounded-xl border-dashed" onClick={() => fileRef.current?.click()}>
                    {uploading ? "..." : <Upload className="h-6 w-6 text-muted-foreground" />}
                  </Button>
                )}
                <div className="text-xs text-muted-foreground flex-1">Recomendado: PNG fundo transparente. Formato quadrado (1:1).</div>
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold">Cor Principal</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-12 w-16 cursor-pointer rounded-lg border border-border bg-card p-1 shadow-sm" />
                <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="font-mono uppercase w-32" />
              </div>
              <p className="text-xs text-muted-foreground">Essa cor será usada em todos os botões e detalhes da proposta enviada ao seu cliente.</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />
        
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">Estilo da Proposta</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold">Tipografia</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Moderna (Inter)</SelectItem>
                  <SelectItem value="playfair">Elegante (Playfair)</SelectItem>
                  <SelectItem value="quicksand">Criativa (Quicksand)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-muted-foreground font-semibold">Layout dos Itens</Label>
              <Select value={itemLayout} onValueChange={setItemsLayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Lista Minimalista</SelectItem>
                  <SelectItem value="cards">Cartões Detalhados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="text-lg font-bold tracking-tight mb-4">Fundo da Proposta</h3>
          <div className="rounded-2xl border border-border bg-muted/10 p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
              <Label className="text-muted-foreground font-semibold mb-3 block">Tipo de Fundo</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant={bgType === "color" ? "default" : "outline"} onClick={() => setBgType("color")} className="rounded-xl">Cor Sólida</Button>
                <Button type="button" variant={bgType === "texture" ? "default" : "outline"} onClick={() => setBgType("texture")} className="rounded-xl">Cor + Textura</Button>
                <Button type="button" variant={bgType === "image" ? "default" : "outline"} onClick={() => setBgType("image")} className="rounded-xl">Imagem de Fundo</Button>
              </div>
            </div>

            {bgType === "color" && (
              <div className="space-y-3 col-span-full sm:col-span-1">
                <Label className="text-muted-foreground font-semibold">Cor de Fundo</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1 shadow-sm" />
                  <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="font-mono uppercase w-28" />
                </div>
              </div>
            )}

            {bgType === "texture" && (
              <>
                <div className="space-y-3">
                  <Label className="text-muted-foreground font-semibold">Cor Base</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1 shadow-sm" />
                    <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="font-mono uppercase w-28" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-muted-foreground font-semibold">Textura</Label>
                  <Select value={headerTexture} onValueChange={setHeaderTexture}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waves">Ondas Elegantes</SelectItem>
                      <SelectItem value="dots">Pontilhados</SelectItem>
                      <SelectItem value="grid">Malha / Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {bgType === "image" && (
              <div className="space-y-3 col-span-full">
                <Label className="text-muted-foreground font-semibold">Imagem Escolhida</Label>
                <div className="flex items-center gap-4">
                  {backgroundImageUrl ? (
                    <div className="relative">
                      <div className="h-20 w-32 overflow-hidden rounded-lg border border-border bg-muted/20">
                        <img src={backgroundImageUrl} alt="Background" className="h-full w-full object-cover" />
                      </div>
                      <button onClick={() => setBackgroundImageUrl("")} className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground hover:scale-110 transition-transform shadow-sm"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="h-20 w-32 rounded-lg border-dashed" onClick={() => bgFileRef.current?.click()}>
                      {uploadingBg ? "Enviando..." : <div className="flex flex-col items-center"><Upload className="h-5 w-5 text-muted-foreground mb-1" /><span className="text-xs">Fazer Upload</span></div>}
                    </Button>
                  )}
                  <input type="file" ref={bgFileRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-border" />
        
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">Redes Sociais (Rodapé)</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2"><Label className="text-muted-foreground font-semibold">Instagram (URL)</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." /></div>
            <div className="space-y-2"><Label className="text-muted-foreground font-semibold">LinkedIn (URL)</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            <div className="space-y-2"><Label className="text-muted-foreground font-semibold">Site Web (URL)</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={save} disabled={saving} className="rounded-full px-8 shadow-lg shadow-primary/20 glow-primary hover:glow-primary-hover hover:-translate-y-0.5 transition-all">
            {saving ? "Salvando…" : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Package, Search, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/catalog")({
  head: () => ({ meta: [{ title: "Catálogo · Simbi" }] }),
  component: Catalog,
});

function Catalog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<"product" | "service">("product");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["catalog-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredItems = items.filter((it: any) => 
    it.name.toLowerCase().includes(search.toLowerCase()) || 
    (it.description && it.description.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleSave() {
    if (!name.trim()) { toast.error("Informe um nome."); return; }
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        type,
        name: name.trim(),
        description: description.trim() || null,
        unit_price: Number(unitPrice) || 0,
        image_url: imageUrl || null,
      };

      if (editingId) {
        const { error } = await supabase.from("catalog_items").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Item atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("catalog_items").insert(payload);
        if (error) throw error;
        toast.success("Item adicionado ao catálogo!");
      }
      resetForm();
      qc.invalidateQueries({ queryKey: ["catalog-items"] });
      qc.invalidateQueries({ queryKey: ["catalogCount"] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setUnitPrice("");
    setImageUrl("");
    setType("product");
    setOpen(false);
  }

  function editItem(it: any) {
    setEditingId(it.id);
    setName(it.name);
    setDescription(it.description || "");
    setUnitPrice(it.unit_price);
    setImageUrl(it.image_url || "");
    setType(it.type as "product" | "service");
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Excluir este item?")) return;
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item excluído.");
    qc.invalidateQueries({ queryKey: ["catalog-items"] });
    qc.invalidateQueries({ queryKey: ["catalogCount"] });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/catalog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
    if (error) { toast.error("Erro ao subir imagem."); setUploading(false); return; }
    const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar no catálogo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); else setOpen(true); }}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <div className="relative inline-block cursor-pointer">
                      {items.length === 0 && !isLoading && (
                        <>
                          <div className="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-blue-500 animate-ping opacity-75" />
                          <div className="absolute -top-1 -right-1 z-10 h-3 w-3 rounded-full bg-blue-500" />
                        </>
                      )}
                      <Button className="rounded-full whitespace-nowrap" onClick={() => resetForm()}>
                        <Plus className="mr-1 h-4 w-4" /> Novo item
                      </Button>
                    </div>
                  </DialogTrigger>
                </TooltipTrigger>
                {items.length === 0 && !isLoading && (
                  <TooltipContent side="bottom" align="end" className="bg-blue-600 text-white max-w-[200px] text-xs p-3 font-medium">
                    Dica: Cadastre suas peças ou serviços mais usados aqui para montar orçamentos muito mais rápido.
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Item" : "Adicionar ao Catálogo"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Criação de Logotipo" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (Opcional)</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do que está incluso..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Preço Unitário</Label>
                  <Input type="number" min="0" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Foto do item (Opcional)</Label>
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <div className="h-12 w-12 rounded border border-border bg-muted/20 overflow-hidden shrink-0">
                        <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="flex-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent">
              <Package className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="mt-3 font-semibold">Catálogo vazio</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cadastre seus produtos e serviços para usá-los nas propostas.</p>
            <Button onClick={() => setOpen(true)} variant="outline" className="mt-4 rounded-full"><Plus className="mr-1 h-4 w-4" /> Adicionar item</Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nenhum item encontrado na busca.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredItems.map(it => (
              <li key={it.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40">
                {it.image_url ? (
                  <div className="h-12 w-12 shrink-0 rounded-lg border border-border overflow-hidden bg-muted/20">
                    <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-lg border border-border border-dashed bg-muted/10 grid place-items-center">
                    <Package className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{it.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {it.type === "product" ? "Produto" : "Serviço"}
                    </span>
                  </div>
                  {it.description && <div className="mt-1 text-sm text-muted-foreground">{it.description}</div>}
                </div>
                <div className="text-right font-medium">{formatBRL(Number(it.unit_price))}</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => editItem(it)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemove(it.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

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
import { Plus, Trash2, Package } from "lucide-react";
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
  const [type, setType] = useState<"product" | "service">("product");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | string>("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["catalog-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleSave() {
    if (!name.trim()) { toast.error("Informe um nome."); return; }
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("catalog_items").insert({
        user_id: user.id,
        type,
        name: name.trim(),
        description: description.trim() || null,
        unit_price: Number(unitPrice) || 0,
      });
      if (error) throw error;
      toast.success("Item adicionado ao catálogo!");
      setOpen(false);
      setName("");
      setDescription("");
      setUnitPrice("");
      qc.invalidateQueries({ queryKey: ["catalog-items"] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Excluir este item?")) return;
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item excluído.");
    qc.invalidateQueries({ queryKey: ["catalog-items"] });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Novo item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao Catálogo</DialogTitle>
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
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
        ) : (
          <ul className="divide-y divide-border">
            {items.map(it => (
              <li key={it.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40">
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
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemove(it.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

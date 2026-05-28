import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/proposals/new")({
  head: () => ({ meta: [{ title: "Nova proposta · Simbi" }] }),
  component: NewProposal,
});

type Item = { description: string; quantity: number; unit_price: number; image_url?: string };
type Client = { id: string; name: string };

function NewProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientDocument, setNewClientDocument] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState<string>("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("clients").select("id,name").order("name").then(({ data }) => setClients(data ?? []));
    
    // Check for duplicate or edit actions
    const cloneStr = sessionStorage.getItem("cloneProposal");
    const editStr = sessionStorage.getItem("editProposal");
    if (cloneStr || editStr) {
      const d = JSON.parse((cloneStr || editStr) as string);
      if (editStr) setEditingId(d.id);
      setTitle(cloneStr ? d.title + " (Cópia)" : d.title);
      setDescription(d.description || "");
      setNotes(d.notes || "");
      setClientId(d.client_id || "");
      if (d.valid_until) {
        const diff = Math.ceil((new Date(d.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        setValidDays(diff > 0 ? String(diff) : "");
      }
      if (d.proposal_items?.length) {
        setItems(d.proposal_items.sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => ({
          description: i.description, quantity: i.quantity, unit_price: i.unit_price, image_url: i.image_url
        })));
      }
      sessionStorage.removeItem("cloneProposal");
      sessionStorage.removeItem("editProposal");
    }
  }, []);

  const { data: catalogItems = [] } = useQuery({
    queryKey: ["catalog-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    }
  });

  const total = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);

  function updateItem(i: number, patch: Partial<Item>) {
    setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }
  function addItem() { setItems([...items, { description: "", quantity: 1, unit_price: 0 }]); }
  function addFromCatalog(catItem: any) {
    const newIt = { description: catItem.name, quantity: 1, unit_price: catItem.unit_price, image_url: catItem.image_url };
    if (items.length === 1 && !items[0].description) {
      setItems([newIt]);
    } else {
      setItems([...items, newIt]);
    }
    setCatalogOpen(false);
    toast.success("Item importado!");
  }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/proposal-items/${Date.now()}.${ext}`;
    
    // Mostra um loading rápido no botão ou toast
    const loadingId = toast.loading("Subindo imagem...");
    const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
    if (error) { toast.error("Erro ao subir imagem.", { id: loadingId }); return; }
    
    const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
    updateItem(index, { image_url: data.publicUrl });
    toast.success("Imagem anexada!", { id: loadingId });
  }

  async function save() {
    console.log("Botão salvar clicado!");
    try {
      if (!title || !title.trim()) { 
        toast.error("Informe um título.");
        alert("Por favor, preencha o Título da proposta antes de criar.");
        return; 
      }
      if (!user) { 
        toast.error("Sua sessão expirou.");
        alert("Sua sessão expirou. Atualize a página e faça login novamente.");
        return; 
      }
      
      setSaving(true);
      
      let finalClientId = clientId || null;
      if (!finalClientId && newClientName && newClientName.trim()) {
        const { data, error } = await supabase.from("clients")
          .insert({ 
            user_id: user.id, 
            name: newClientName.trim(), 
            phone: newClientPhone.trim() || null,
            document: newClientDocument.trim() || null,
            address: newClientAddress.trim() || null
          })
          .select("id").single();
        if (error) throw error;
        finalClientId = data.id;
      }

      let propId = editingId;
      let pSlug = "";

      if (editingId) {
        const { data: prop, error: pErr } = await supabase.from("proposals")
          .update({ client_id: finalClientId, title, description, notes, total, valid_until: validUntil })
          .eq("id", editingId)
          .select("id,public_slug").single();
        if (pErr) throw pErr;
        pSlug = prop.public_slug;
        // Delete old items
        await supabase.from("proposal_items").delete().eq("proposal_id", editingId);
      } else {
        const public_slug = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 6);
        const { data: prop, error: pErr } = await supabase.from("proposals")
          .insert({ user_id: user.id, client_id: finalClientId, title, description, notes, total, status: "sent", public_slug, valid_until: validUntil })
          .select("id,public_slug").single();
        if (pErr) throw pErr;
        propId = prop.id;
        pSlug = prop.public_slug;
      }

      const cleanItems = items.filter(i => i.description && i.description.trim());
      if (cleanItems.length > 0) {
        const { error: iErr } = await supabase.from("proposal_items").insert(
          cleanItems.map((it, idx) => ({ proposal_id: propId, description: it.description, quantity: it.quantity, unit_price: it.unit_price, sort_order: idx, image_url: it.image_url || null }))
        );
        if (iErr) throw iErr;
      }
      
      toast.success(editingId ? "Proposta atualizada!" : "Proposta criada!");
      navigate({ to: "/proposals/$id", params: { id: pSlug } });
    } catch (e: any) {
      console.error("Erro no save da proposta:", e);
      toast.error(e?.message || "Erro ao criar proposta. Verifique o console.");
      alert("Ocorreu um erro ao salvar: " + (e?.message || "Erro desconhecido"));
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/proposals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{editingId ? "Editar proposta" : "Nova proposta"}</h1>

      <div className="mt-6 space-y-6">
        <Section title="Cliente">
          {clients.length > 0 && (
            <div className="space-y-1.5">
              <Label>Selecionar cliente existente</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="— novo cliente —" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {!clientId && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label>Nome do cliente</Label><Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Ex: Marina Arquitetura" /></div>
              <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
              <div className="space-y-1.5"><Label>CPF/CNPJ</Label><Input value={newClientDocument} onChange={(e) => setNewClientDocument(e.target.value)} placeholder="000.000.000-00" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Endereço</Label><Input value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} placeholder="Rua exemplo, 123 - Cidade" /></div>
            </div>
          )}
        </Section>

        <Section title="Detalhes">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Identidade visual completa" /></div>
            <div className="space-y-1.5"><Label>Validade (Dias)</Label><Input type="number" value={validDays} onChange={(e) => setValidDays(e.target.value)} placeholder="Opcional" /></div>
          </div>
          <div className="space-y-1.5 mt-4"><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Resumo do escopo do serviço…" rows={3} /></div>
        </Section>

        <Section title="Itens">
          <div className="space-y-4">
            {items.map((it, i) => (
              <div key={i} className="flex gap-2 p-3 border border-border rounded-xl bg-muted/10 relative">
                <div className="flex-1 space-y-2">
                  <Input placeholder="Descrição do item" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} className="font-medium" />
                  <div className="flex gap-2">
                    <Input className="w-20" type="number" min="0" step="0.01" placeholder="Qtd" value={it.quantity} onChange={(e) => updateItem(i, { quantity: +e.target.value })} />
                    <Input className="flex-1" type="number" min="0" step="0.01" placeholder="Valor unitário" value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: +e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-20 w-20 shrink-0 rounded-lg border border-border border-dashed bg-card overflow-hidden grid place-items-center">
                    {it.image_url ? (
                      <img src={it.image_url} alt="Item" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center px-1">Add Foto</span>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, i)} title="Adicionar foto ao item" />
                  </div>
                </div>
                <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={addItem}><Plus className="mr-1 h-4 w-4" /> Adicionar manual</Button>
              <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="rounded-full"><PackagePlus className="mr-1 h-4 w-4" /> Importar do catálogo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Catálogo de Itens</DialogTitle></DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto pt-4">
                    {catalogItems.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">Nenhum item cadastrado no catálogo.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {catalogItems.map(c => (
                          <li key={c.id} className="flex items-center justify-between py-3">
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{formatBRL(Number(c.unit_price))}</div>
                            </div>
                            <Button size="sm" onClick={() => addFromCatalog(c)}>Adicionar</Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatBRL(total)}</span></div>
        </Section>

        <Section title="Observações">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Prazo, condições de pagamento, etc." />
        </Section>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/proposals" })}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : (editingId ? "Atualizar proposta" : "Criar proposta")}</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

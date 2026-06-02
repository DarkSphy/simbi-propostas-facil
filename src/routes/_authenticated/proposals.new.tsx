import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, PackagePlus, Save, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/proposals/new")({
  head: () => ({ meta: [{ title: "Nova proposta · Simbi" }] }),
  component: NewProposal,
});

type Item = { description: string; quantity: number | string; unit_price: number | string; image_url?: string; is_optional?: boolean; catalog_item_id?: string };
type Client = { id: string; name: string };

function NewProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unit_price: "", is_optional: false }]);
  const [saving, setSaving] = useState(false);
  
  // Dialogs
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);
  
  // Templates state
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) supabase.from("clients").select("id,name").eq("user_id", user.id).order("name").then(({ data }) => setClients(data ?? []));
    
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
          description: i.description, quantity: i.quantity, unit_price: i.unit_price, image_url: i.image_url, is_optional: i.is_optional || false
        })));
      }
      sessionStorage.removeItem("cloneProposal");
      sessionStorage.removeItem("editProposal");
    }
  }, []);

  const { data: catalogItems = [] } = useQuery({
    queryKey: ["catalog-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items").select("*").eq("user_id", user!.id).order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["proposal-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposal_templates").select("*").eq("user_id", user!.id).order("name");
      if (error && error.code !== '42P01') throw error; // Ignore table does not exist error initially
      return data ?? [];
    },
    enabled: !!user
  });

  const total = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);

  function updateItem(i: number, patch: Partial<Item>) {
    setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }
  function addItem() { setItems([...items, { description: "", quantity: 1, unit_price: "", is_optional: false }]); }
  function addFromCatalog(catItem: any) {
    const newIt = { description: catItem.name, quantity: 1, unit_price: catItem.unit_price, image_url: catItem.image_url, is_optional: false, catalog_item_id: catItem.id };
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
    if (file.size > 5 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 5MB para conexões lentas.'); return; }
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/proposal-items/${Date.now()}.${ext}`;
    
    const loadingId = toast.loading("Subindo imagem...");
    const { error } = await supabase.storage.from("proposal-images").upload(filePath, file);
    if (error) { toast.error("Erro ao subir imagem.", { id: loadingId }); return; }
    
    const { data } = supabase.storage.from("proposal-images").getPublicUrl(filePath);
    updateItem(index, { image_url: data.publicUrl });
    toast.success("Imagem anexada!", { id: loadingId });
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      toast.error("Informe um nome para o modelo.");
      return;
    }
    if (!user) return;
    setSavingTemplate(true);
    try {
      const content = {
        title,
        description,
        notes,
        items
      };
      
      const { error } = await supabase.from("proposal_templates").insert({
        user_id: user.id,
        name: templateName.trim(),
        content: content as any
      });
      
      if (error) throw error;
      
      toast.success("Modelo salvo com sucesso!");
      setSaveTemplateOpen(false);
      setTemplateName("");
      queryClient.invalidateQueries({ queryKey: ["proposal-templates"] });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao salvar modelo. Verifique se criou a tabela no banco.");
    } finally {
      setSavingTemplate(false);
    }
  }

  function loadTemplate(template: any) {
    const content = template.content;
    if (content.title) setTitle(content.title);
    if (content.description) setDescription(content.description);
    if (content.notes) setNotes(content.notes);
    if (content.items && content.items.length > 0) setItems(content.items);
    
    setLoadTemplateOpen(false);
    toast.success("Modelo carregado!");
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Excluir este modelo?")) return;
    const { error } = await supabase.from("proposal_templates").delete().eq("id", id);
    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      toast.success("Modelo excluído.");
      queryClient.invalidateQueries({ queryKey: ["proposal-templates"] });
    }
  }

  async function save() {
    try {
      if (!title || !title.trim()) { 
        toast.error("Informe um título.");
        return; 
      }
      if (!user) { 
        toast.error("Sua sessão expirou.");
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

      let validUntil = null;
      if (validDays && !isNaN(Number(validDays))) {
        const d = new Date();
        d.setDate(d.getDate() + Number(validDays));
        validUntil = d.toISOString();
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
          cleanItems.map((it, idx) => ({ proposal_id: propId as string, description: it.description, quantity: Number(it.quantity), unit_price: Number(it.unit_price), sort_order: idx, image_url: it.image_url || null, is_optional: it.is_optional || false, catalog_item_id: it.catalog_item_id || null }))
        );
        if (iErr) throw iErr;
      }
      
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success(editingId ? "Proposta atualizada!" : "Proposta enviada com sucesso!");
      navigate({ to: "/proposals" });
    } catch (e: any) {
      console.error("Erro no save da proposta:", e);
      toast.error(getErrorMessage(e, "Erro ao criar proposta. Verifique o console."));
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <Link to="/proposals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar para lista</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{editingId ? "Editar proposta" : "Nova proposta"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* LOAD TEMPLATE DIALOG */}
          <Dialog open={loadTemplateOpen} onOpenChange={setLoadTemplateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-md hover:-translate-y-0.5 transition-transform">
                <FolderOpen className="mr-1.5 h-4 w-4" /> Carregar Modelo Prontos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Meus Modelos Salvos</DialogTitle></DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pt-4">
                {templates.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">Nenhum modelo salvo ainda. Crie uma proposta e clique em "Salvar como Modelo" no final da página.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {templates.map((t: any) => (
                      <li key={t.id} className="flex items-center justify-between py-3 group">
                        <div className="font-medium">{t.name}</div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => loadTemplate(t)}>Usar</Button>
                          <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTemplate(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
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
                    <Input className="w-20" type="number" min="0" step="0.01" placeholder="Qtd" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value === '' ? '' : +e.target.value })} />
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-muted-foreground text-sm">R$</span>
                      </div>
                      <Input className="pl-8" type="number" min="0" step="0.01" placeholder="0,00" value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: e.target.value === '' ? '' : +e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <div className="relative h-20 w-20 shrink-0 rounded-lg border border-border border-dashed bg-card overflow-hidden grid place-items-center">
                    {it.image_url ? (
                      <img src={it.image_url} alt="Item" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center px-1">Add Foto</span>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, i)} title="Adicionar foto ao item" />
                  </div>
                  <label className={`flex items-center justify-center gap-2 mt-2 px-3 py-1.5 rounded-lg border-2 shadow-sm transition-all cursor-pointer select-none w-full ${it.is_optional ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:border-primary/40 text-muted-foreground'}`}>
                    <input type="checkbox" checked={it.is_optional || false} onChange={e => updateItem(i, { is_optional: e.target.checked })} className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wide">Opcional</span>
                  </label>
                </div>
                <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="outline" size="default" className="rounded-full border-2 border-primary/30 text-primary hover:bg-primary/10 font-bold shadow-sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Item Manualmente
              </Button>
              <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 font-bold shadow-md" size="default">
                    <PackagePlus className="mr-2 h-4 w-4" /> Importar do Catálogo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Produtos & Serviços Cadastrados</DialogTitle></DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto pt-4">
                    {catalogItems.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">Nenhum produto ou serviço cadastrado ainda. Vá em "Produtos & Serviços" no menu lateral para cadastrar.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {catalogItems.map(c => (
                          <li key={c.id} className="flex items-center justify-between py-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {c.name}
                                {c.stock_quantity !== null && c.stock_quantity !== undefined && (
                                  <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                    c.stock_quantity === 0 ? "bg-red-100 text-red-700" : c.stock_quantity <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                  )}>
                                    {c.stock_quantity === 0 ? "Esgotado" : `Estoque: ${c.stock_quantity}`}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{formatBRL(Number(c.unit_price))}</div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={c.stock_quantity === 0 ? "outline" : "default"}
                              disabled={c.stock_quantity === 0}
                              onClick={() => addFromCatalog(c)}
                            >
                              {c.stock_quantity === 0 ? "Esgotado" : "Adicionar"}
                            </Button>
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

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 pb-8 border-t border-border/50">
          <div className="flex w-full sm:w-auto">
            {/* SAVE TEMPLATE DIALOG */}
            <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <Save className="mr-2 h-4 w-4" /> Salvar Proposta como Modelo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Modelo de Proposta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nome do Modelo</Label>
                    <Input 
                      placeholder="Ex: Instalação Padrão 12.000 BTUs" 
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Irá salvar o Título, Descrição, Itens (com preços) e Observações atuais.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>Cancelar</Button>
                    <Button onClick={saveTemplate} disabled={savingTemplate}>{savingTemplate ? "Salvando..." : "Salvar Modelo"}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate({ to: "/proposals" })} className="flex-1 sm:flex-none">Cancelar</Button>
            <Button onClick={save} disabled={saving} className="flex-1 sm:flex-none shadow-md">
              {saving ? "Salvando…" : (editingId ? "Atualizar proposta" : "Salvar Proposta Oficial")}
            </Button>
          </div>
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

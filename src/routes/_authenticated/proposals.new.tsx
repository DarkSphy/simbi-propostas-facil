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

type Item = { description: string; quantity: number; unit_price: number };
type Client = { id: string; name: string };

function NewProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    supabase.from("clients").select("id,name").order("name").then(({ data }) => setClients(data ?? []));
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
    const newIt = { description: catItem.name, quantity: 1, unit_price: catItem.unit_price };
    if (items.length === 1 && !items[0].description) {
      setItems([newIt]);
    } else {
      setItems([...items, newIt]);
    }
    setCatalogOpen(false);
    toast.success("Item importado!");
  }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }

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
          .insert({ user_id: user.id, name: newClientName.trim(), phone: newClientPhone.trim() || null })
          .select("id").single();
        if (error) throw error;
        finalClientId = data.id;
      }

      const public_slug = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 6);
      const { data: prop, error: pErr } = await supabase.from("proposals")
        .insert({ user_id: user.id, client_id: finalClientId, title, description, notes, total, status: "sent", public_slug })
        .select("id,public_slug").single();
      if (pErr) throw pErr;

      const cleanItems = items.filter(i => i.description && i.description.trim());
      if (cleanItems.length > 0) {
        const { error: iErr } = await supabase.from("proposal_items").insert(
          cleanItems.map((it, idx) => ({ proposal_id: prop.id, description: it.description, quantity: it.quantity, unit_price: it.unit_price, sort_order: idx }))
        );
        if (iErr) throw iErr;
      }
      
      toast.success("Proposta criada!");
      navigate({ to: "/proposals/$id", params: { id: prop.id } });
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
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Nova proposta</h1>

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
              <div className="space-y-1.5"><Label>Nome do cliente</Label><Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Marina Arquitetura" /></div>
              <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="(11) 99999-9999" /></div>
            </div>
          )}
        </Section>

        <Section title="Detalhes">
          <div className="space-y-1.5"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Identidade visual completa" /></div>
          <div className="space-y-1.5"><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Resumo do escopo do serviço…" rows={3} /></div>
        </Section>

        <Section title="Itens">
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-12 sm:col-span-6" placeholder="Descrição do item" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                <Input className="col-span-4 sm:col-span-2" type="number" min="0" step="0.01" placeholder="Qtd" value={it.quantity} onChange={(e) => updateItem(i, { quantity: +e.target.value })} />
                <Input className="col-span-6 sm:col-span-3" type="number" min="0" step="0.01" placeholder="Valor unit." value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: +e.target.value })} />
                <Button variant="ghost" size="icon" className="col-span-2 sm:col-span-1" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
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
          <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Criar proposta"}</Button>
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

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Search, Pencil, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { formatBRL } from "@/lib/format";
import { Clock, Eye, CheckCircle2, XCircle, Send, StickyNote, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Clientes · Simbi" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [address, setAddress] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newNote, setNewNote] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients")
        .select("*, proposals(status, created_at)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  const { data: crmData, isLoading: crmLoading } = useQuery({
    queryKey: ["client-crm", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return null;
      const { data: props } = await supabase.from("proposals")
        .select("*, proposal_logs(*)")
        .eq("client_id", selectedClient.id)
        .order("created_at", { ascending: false });
      
      const { data: notes } = await supabase.from("client_notes")
        .select("*")
        .eq("client_id", selectedClient.id)
        .order("created_at", { ascending: false });
        
      return { proposals: props || [], notes: notes || [] };
    },
    enabled: !!selectedClient
  });

  async function addNote() {
    if (!newNote.trim() || !selectedClient || !user) return;
    const { error } = await supabase.from("client_notes").insert({
      client_id: selectedClient.id,
      user_id: user.id,
      content: newNote.trim()
    });
    if (error) {
      toast.error(getErrorMessage(error));
    } else {
      setNewNote("");
      qc.invalidateQueries({ queryKey: ["client-crm", selectedClient.id] });
    }
  }

  async function saveClient() {
    if (!name.trim() || !user) return;
    
    const payload = { 
      name, 
      email: email || null, 
      phone: phone || null,
      document: document || null,
      address: address || null
    };

    if (editingId) {
      const { error } = await supabase.from("clients").update(payload).eq("id", editingId);
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Cliente atualizado");
    } else {
      const { error } = await supabase.from("clients").insert({ user_id: user.id, ...payload });
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Cliente adicionado");
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  function resetForm() {
    setName(""); setEmail(""); setPhone(""); setDocument(""); setAddress(""); setEditingId(null); setOpen(false);
  }

  function editClient(c: any) {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setDocument(c.document || "");
    setAddress(c.address || "");
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Excluir cliente?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { toast.error(getErrorMessage(error)); return; }
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); else setOpen(true); }}>
            <DialogTrigger asChild><Button className="rounded-full whitespace-nowrap" onClick={() => resetForm()}><Plus className="mr-1 h-4 w-4" /> Novo cliente</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>WhatsApp</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><Label>CPF/CNPJ</Label><Input value={document} onChange={(e) => setDocument(e.target.value)} /></div>
                <div><Label>Endereço</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              </div>
              <DialogFooter><Button onClick={saveClient}>Salvar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : clients.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><Users className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Sem clientes ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">Adicione clientes para enviar propostas mais rápido.</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredClients.map(c => {
              const approvedProposals = c.proposals?.filter((p: any) => p.status === 'approved') || [];
              let lastPurchaseBadge = <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Nunca comprou</span>;
              
              if (approvedProposals.length > 0) {
                const lastDate = new Date(Math.max(...approvedProposals.map((p: any) => new Date(p.created_at).getTime())));
                const daysAgo = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
                if (daysAgo === 0) lastPurchaseBadge = <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Comprou hoje</span>;
                else if (daysAgo < 30) lastPurchaseBadge = <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Há {daysAgo} dias</span>;
                else if (daysAgo < 60) lastPurchaseBadge = <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Há 1 mês</span>;
                else {
                  const months = Math.floor(daysAgo / 30);
                  lastPurchaseBadge = <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Sem comprar há {months} meses</span>;
                }
              }

              return (
              <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedClient(c)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="truncate font-bold text-base">{c.name}</div>
                    {lastPurchaseBadge}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    {[c.email, c.phone].filter(Boolean).join(" · ") || "Nenhum contato"}
                    {c.document && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {c.document}</span>}
                    {c.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.address}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => editClient(c)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* CRM Sheet */}
      <Sheet open={!!selectedClient} onOpenChange={(val) => { if (!val) setSelectedClient(null); }}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto border-l border-border bg-card p-0">
          {selectedClient && (
            <div className="flex h-full flex-col">
              <div className="border-b border-border bg-muted/20 px-6 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {selectedClient.name[0].toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedClient.name}</SheetTitle>
                    <SheetDescription>{selectedClient.phone || selectedClient.email || "Sem contato cadastrado"}</SheetDescription>
                  </div>
                </div>
                
                {crmData?.proposals && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-md">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Gasto</div>
                    <div className="text-xl font-bold">
                      {formatBRL(crmData.proposals.filter(p => p.status === 'approved').reduce((sum, p) => sum + Number(p.total), 0))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 px-6 py-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <StickyNote className="h-4 w-4" /> Anotações (CRM)
                </h3>
                
                <div className="mb-6 space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Adicionar nova anotação..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} className="bg-muted/50" />
                    <Button onClick={addNote} size="icon" variant="secondary"><Send className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {crmData?.notes?.map(note => (
                      <div key={note.id} className="rounded-lg border border-border/50 bg-amber-50/50 dark:bg-amber-950/10 p-3 text-sm">
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                    {crmData?.notes?.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhuma anotação.</p>}
                  </div>
                </div>

                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Activity className="h-4 w-4" /> Linha do Tempo
                </h3>

                {crmLoading ? (
                  <p className="text-center text-sm text-muted-foreground py-4">Carregando histórico...</p>
                ) : crmData?.proposals?.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">Nenhuma proposta enviada para este cliente ainda.</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {crmData?.proposals.map(prop => (
                      <div key={prop.id} className="relative pl-8 md:pl-0">
                        {/* Indicador principal da proposta */}
                        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:translate-y-1.5 md:flex items-center justify-center hidden">
                          <div className={`h-4 w-4 rounded-full border-2 border-background shadow-sm ${
                            prop.status === 'approved' ? 'bg-emerald-500' :
                            prop.status === 'rejected' ? 'bg-red-500' :
                            prop.status === 'viewed' ? 'bg-blue-500' : 'bg-primary'
                          }`} />
                        </div>
                        <div className="absolute left-0 top-1.5 md:hidden flex items-center justify-center">
                          <div className={`h-6 w-6 rounded-full border-4 border-background shadow-sm ${
                            prop.status === 'approved' ? 'bg-emerald-500' :
                            prop.status === 'rejected' ? 'bg-red-500' :
                            prop.status === 'viewed' ? 'bg-blue-500' : 'bg-primary'
                          }`} />
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm relative md:w-[calc(50%-2rem)] md:ml-auto md:even:ml-0 md:even:mr-auto">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {new Date(prop.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              prop.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              prop.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              prop.status === 'viewed' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
                            }`}>
                              {prop.status === 'approved' ? 'Aprovada' : prop.status === 'rejected' ? 'Recusada' : prop.status === 'viewed' ? 'Visualizada' : 'Enviada'}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm leading-tight mb-1">{prop.title}</h4>
                          <div className="text-sm font-semibold text-primary">{formatBRL(Number(prop.total))}</div>
                          
                          {/* Eventos da proposta (logs) */}
                          {prop.proposal_logs?.length > 0 && (
                            <div className="mt-3 space-y-1.5 pt-3 border-t border-border/50">
                              {prop.proposal_logs.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-2 text-xs">
                                  {log.event_type === 'view' && <Eye className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />}
                                  {log.event_type === 'approve' && <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />}
                                  {log.event_type === 'reject' && <XCircle className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />}
                                  <div>
                                    <span className="font-medium">
                                      {log.event_type === 'view' ? 'Visualizou' : log.event_type === 'approve' ? 'Aprovou' : 'Recusou'}
                                    </span>
                                    <span className="text-muted-foreground"> - {new Date(log.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    {log.location && <div className="text-[10px] text-muted-foreground/80 mt-0.5">{log.location}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

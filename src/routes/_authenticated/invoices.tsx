import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Pencil, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({ meta: [{ title: "Notas Fiscais · Simbi" }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState(""); 
  const [clientId, setClientId] = useState<string>("none"); 
  const [issueDate, setIssueDate] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("issued"); // issued, cancelled
  const [observations, setObservations] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").eq("user_id", user!.id).order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices")
        .select("*, clients(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error && error.code !== '42P01') throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
    (inv.clients?.name && inv.clients.name.toLowerCase().includes(search.toLowerCase()))
  );

  async function saveInvoice() {
    if (!invoiceNumber.trim() || !user) {
      toast.error("Número da nota é obrigatório.");
      return;
    }
    
    const payload = { 
      invoice_number: invoiceNumber, 
      client_id: clientId === "none" ? null : clientId, 
      issue_date: issueDate || new Date().toISOString().split('T')[0],
      value: Number(value) || 0,
      status,
      observations: observations || null
    };

    if (editingId) {
      const { error } = await supabase.from("invoices").update(payload).eq("id", editingId);
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Nota Fiscal atualizada");
    } else {
      const { error } = await supabase.from("invoices").insert({ user_id: user.id, ...payload });
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Nota Fiscal registrada");
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["invoices"] });
  }

  function resetForm() {
    setInvoiceNumber(""); 
    setClientId("none"); 
    setIssueDate(""); 
    setValue(""); 
    setStatus("issued"); 
    setObservations(""); 
    setEditingId(null); 
    setOpen(false);
  }

  function editInvoice(inv: any) {
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoice_number);
    setClientId(inv.client_id || "none");
    setIssueDate(inv.issue_date);
    setValue(inv.value.toString());
    setStatus(inv.status || "issued");
    setObservations(inv.observations || "");
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Excluir este registro de nota fiscal?")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast.error(getErrorMessage(error)); return; }
    qc.invalidateQueries({ queryKey: ["invoices"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas Fiscais</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle interno de NFs emitidas (sem integração direta com a SEFAZ).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por NF ou cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); else setOpen(true); }}>
            <DialogTrigger asChild><Button variant="success" className="rounded-full whitespace-nowrap shadow-emerald-500/20" onClick={() => resetForm()}><Plus className="mr-1 h-4 w-4" /> Registrar NF</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar Nota Fiscal" : "Registrar Nota Fiscal"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Número da NF</Label>
                    <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Ex: 12345" />
                  </div>
                  <div>
                    <Label>Data de Emissão</Label>
                    <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum / Não informado</SelectItem>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor da NF (R$)</Label>
                    <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="issued">Emitida</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} placeholder="Detalhes, retenções, etc." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button variant="success" onClick={saveInvoice}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : invoices.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><FileText className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Nenhuma nota registrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Registre manualmente as notas fiscais emitidas para controle interno.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma nota fiscal encontrada.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredInvoices.map((inv: any) => (
              <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-base">NF {inv.invoice_number}</div>
                    {inv.status === 'issued' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" /> Emitida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 uppercase tracking-wider">
                        <XCircle className="h-3 w-3" /> Cancelada
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{inv.clients?.name || "Cliente não vinculado"}</span>
                    <span>Emissão: {new Date(inv.issue_date).toLocaleDateString('pt-BR')}</span>
                    {inv.observations && <span className="line-clamp-1 italic max-w-xs">{inv.observations}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right font-bold text-primary">{formatBRL(Number(inv.value))}</div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => editInvoice(inv)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() => remove(inv.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Pencil, MapPin, FileText, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({ meta: [{ title: "Fornecedores · Simbi" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
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

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error && error.code !== '42P01') throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filteredSuppliers = suppliers.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  async function saveSupplier() {
    if (!name.trim() || !user) return;
    
    const payload = { 
      name, 
      email: email || null, 
      phone: phone || null,
      document: document || null,
      address: address || null
    };

    if (editingId) {
      const { error } = await supabase.from("suppliers").update(payload).eq("id", editingId);
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Fornecedor atualizado");
    } else {
      const { error } = await supabase.from("suppliers").insert({ user_id: user.id, ...payload });
      if (error) { toast.error(getErrorMessage(error)); return; }
      toast.success("Fornecedor adicionado");
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["suppliers"] });
  }

  function resetForm() {
    setName(""); setEmail(""); setPhone(""); setDocument(""); setAddress(""); setEditingId(null); setOpen(false);
  }

  function editSupplier(c: any) {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setDocument(c.document || "");
    setAddress(c.address || "");
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Excluir fornecedor?")) return;
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) { toast.error(getErrorMessage(error)); return; }
    qc.invalidateQueries({ queryKey: ["suppliers"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
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
            <DialogTrigger asChild><Button variant="success" className="rounded-full whitespace-nowrap shadow-emerald-500/20" onClick={() => resetForm()}><Plus className="mr-1 h-4 w-4" /> Novo fornecedor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome / Empresa</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>WhatsApp / Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><Label>CPF/CNPJ</Label><Input value={document} onChange={(e) => setDocument(e.target.value)} /></div>
                <div><Label>Endereço</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button variant="success" onClick={saveSupplier}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : suppliers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><Briefcase className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Sem fornecedores ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cadastre seus parceiros para vincular aos pedidos de venda.</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum fornecedor encontrado.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredSuppliers.map((c: any) => (
              <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="truncate font-bold text-base">{c.name}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    {[c.email, c.phone].filter(Boolean).join(" · ") || "Nenhum contato"}
                    {c.document && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {c.document}</span>}
                    {c.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.address}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => editSupplier(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

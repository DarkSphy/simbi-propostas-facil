import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Search, Pencil } from "lucide-react";
import { toast } from "sonner";

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
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  async function saveClient() {
    if (!name.trim() || !user) return;
    if (editingId) {
      const { error } = await supabase.from("clients").update({ name, email: email || null, phone: phone || null }).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Cliente atualizado");
    } else {
      const { error } = await supabase.from("clients").insert({ user_id: user.id, name, email: email || null, phone: phone || null });
      if (error) { toast.error(error.message); return; }
      toast.success("Cliente adicionado");
    }
    resetForm();
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  function resetForm() {
    setName(""); setEmail(""); setPhone(""); setEditingId(null); setOpen(false);
  }

  function editClient(c: any) {
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Excluir cliente?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
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
            {filteredClients.map(c => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{[c.email, c.phone].filter(Boolean).join(" · ") || "—"}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => editClient(c)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

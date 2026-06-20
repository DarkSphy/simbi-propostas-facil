import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Package, Eye } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Pedidos · Simbi" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("*, clients(name), suppliers(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error && error.code !== '42P01') throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filteredOrders = orders.filter((o: any) => 
    o.title.toLowerCase().includes(search.toLowerCase()) || 
    (o.clients?.name && o.clients.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.suppliers?.name && o.suppliers.name.toLowerCase().includes(search.toLowerCase()))
  );

  async function remove(id: string) {
    if (!confirm("Excluir pedido? (Isso não excluirá os lançamentos financeiros vinculados).")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error(getErrorMessage(error)); return; }
    qc.invalidateQueries({ queryKey: ["orders"] });
    toast.success("Pedido excluído.");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os pedidos que envolvem cliente e fornecedor.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar pedido..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Button asChild className="rounded-full shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/orders/new">
              <Plus className="mr-1 h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><Package className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Nenhum pedido lançado</h3>
            <p className="mt-1 text-sm text-muted-foreground">Lance pedidos para gerar automaticamente as contas a pagar e receber.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum pedido encontrado.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredOrders.map((o: any) => (
              <li key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-base">{o.title}</div>
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1 mt-1 text-sm">
                    <div className="text-emerald-700 font-medium">
                      Cliente: {o.clients?.name || "N/A"}
                    </div>
                    <div className="text-red-700 font-medium">
                      Fornecedor: {o.suppliers?.name || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 text-sm">Venda: {formatBRL(Number(o.sale_value))}</div>
                    <div className="font-bold text-red-600 text-sm">Custo: {formatBRL(Number(o.cost_price) + Number(o.freight_value))}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() => remove(o.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

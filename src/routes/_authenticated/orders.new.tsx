import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/_authenticated/orders/new")({
  head: () => ({ meta: [{ title: "Novo Pedido · Simbi" }] }),
  component: NewOrderPage,
});

function NewOrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [materialSold, setMaterialSold] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [clientDueDate, setClientDueDate] = useState("");

  const [supplierId, setSupplierId] = useState("");
  const [materialDelivered, setMaterialDelivered] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [freightValue, setFreightValue] = useState("0");
  const [supplierDueDate, setSupplierDueDate] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").eq("user_id", user!.id).order("name");
      if (error) throw error; return data ?? [];
    },
    enabled: !!user,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers-basic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, name").eq("user_id", user!.id).order("name");
      if (error && error.code !== '42P01') throw error; return data ?? [];
    },
    enabled: !!user,
  });

  async function handleSave() {
    if (!title.trim() || !clientId || !supplierId || !user) {
      toast.error("Preencha o título, selecione o cliente e o fornecedor.");
      return;
    }

    setSaving(true);
    try {
      // 1. Criar o Pedido
      const orderPayload = {
        user_id: user.id,
        title,
        client_id: clientId,
        supplier_id: supplierId,
        material_sold: materialSold || null,
        sale_value: Number(saleValue) || 0,
        payment_term: paymentTerm || null,
        material_delivered: materialDelivered || null,
        cost_price: Number(costPrice) || 0,
        freight_value: Number(freightValue) || 0,
        due_date: supplierDueDate || null
      };

      const { error: orderError } = await supabase.from("orders").insert(orderPayload);
      if (orderError) throw orderError;

      // 2. Gerar Contas a Receber (Venda)
      if (Number(saleValue) > 0) {
        const { error: incError } = await supabase.from("financial_transactions").insert({
          user_id: user.id,
          type: "income",
          description: `Venda - Pedido: ${title}`,
          amount: Number(saleValue),
          due_date: clientDueDate || new Date().toISOString().split('T')[0],
          status: "pending"
        });
        if (incError) console.error("Erro ao gerar conta a receber:", incError);
      }

      // 3. Gerar Contas a Pagar (Custo Fornecedor + Frete)
      const totalCost = (Number(costPrice) || 0) + (Number(freightValue) || 0);
      if (totalCost > 0) {
        const { error: expError } = await supabase.from("financial_transactions").insert({
          user_id: user.id,
          type: "expense",
          description: `Custo - Pedido: ${title}`,
          amount: totalCost,
          due_date: supplierDueDate || new Date().toISOString().split('T')[0],
          status: "pending"
        });
        if (expError) console.error("Erro ao gerar conta a pagar:", expError);
      }

      toast.success("Pedido lançado e financeiro gerado com sucesso!");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["finance"] });
      navigate({ to: "/orders" });
    } catch (e: any) {
      toast.error(getErrorMessage(e, "Erro ao lançar pedido."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Pedido</h1>
          <p className="text-sm text-muted-foreground">Lançamento de venda com geração automática de financeiro.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Identificação */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identificação</h2>
          <div className="space-y-4">
            <div>
              <Label>Título / Referência do Pedido</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Projeto Cozinha Mariana" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados do Cliente (Venda) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Cliente (Venda)</h2>
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Material / Serviço Vendido</Label>
                <Input value={materialSold} onChange={(e) => setMaterialSold(e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor da Venda (R$)</Label>
                  <Input type="number" step="0.01" value={saleValue} onChange={(e) => setSaleValue(e.target.value)} className="bg-background" placeholder="0,00" />
                </div>
                <div>
                  <Label>Cond. de Pagamento</Label>
                  <Input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} className="bg-background" placeholder="Ex: 50% / 50%" />
                </div>
              </div>
              <div>
                <Label>Previsão de Recebimento</Label>
                <Input type="date" value={clientDueDate} onChange={(e) => setClientDueDate(e.target.value)} className="bg-background" />
              </div>
            </div>
          </div>

          {/* Dados do Fornecedor (Custo) */}
          <div className="rounded-2xl border border-red-200 bg-red-50/30 p-5 shadow-sm dark:border-red-900 dark:bg-red-950/20">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-400">Fornecedor (Custo)</h2>
            <div className="space-y-4">
              <div>
                <Label>Fornecedor</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Material a Entregar</Label>
                <Input value={materialDelivered} onChange={(e) => setMaterialDelivered(e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço de Custo (R$)</Label>
                  <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="bg-background" placeholder="0,00" />
                </div>
                <div>
                  <Label>Frete (R$)</Label>
                  <Input type="number" step="0.01" value={freightValue} onChange={(e) => setFreightValue(e.target.value)} className="bg-background" placeholder="0,00" />
                </div>
              </div>
              <div>
                <Label>Vencimento do Boleto/Pgto</Label>
                <Input type="date" value={supplierDueDate} onChange={(e) => setSupplierDueDate(e.target.value)} className="bg-background" />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo e Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-muted/50 border border-border">
          <div className="text-sm">
            Ao salvar, o sistema irá registrar <strong>Contas a Receber</strong> de <span className="font-bold text-emerald-600">R$ {Number(saleValue || 0).toFixed(2)}</span> e <strong>Contas a Pagar</strong> de <span className="font-bold text-red-600">R$ {(Number(costPrice || 0) + Number(freightValue || 0)).toFixed(2)}</span>.
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link to="/orders">Cancelar</Link>
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando..." : "Lançar Pedido"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

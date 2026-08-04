import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CircleDollarSign, 
  CheckCircle2, 
  Clock, 
  Plus, 
  XCircle,
  FileText,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RecurringChargesTab } from "@/components/finance/RecurringChargesTab";

export const Route = createFileRoute("/_authenticated/finance")({
  component: FinancePage,
});

function FinancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<"income" | "expense">("income");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["finance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`*, proposals(title, public_slug)`)
        .eq("user_id", user?.id!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("financial_transactions").insert({
        user_id: user!.id,
        type: addType,
        amount: parseFloat(amount.replace(",", ".")),
        description: desc,
        due_date: dueDate,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Transação adicionada com sucesso!");
      setIsAddOpen(false);
      setDesc("");
      setAmount("");
      setDueDate("");
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (e) => toast.error("Erro ao adicionar: " + e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: "pending" | "paid" | "cancelled" }) => {
      const payload: any = { status };
      if (status === "paid") payload.paid_date = new Date().toISOString();
      if (status === "pending" || status === "cancelled") payload.paid_date = null;
      
      const { error } = await supabase
        .from("financial_transactions")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const handleAdd = () => {
    if (!desc || !amount || !dueDate) {
      toast.error("Preencha todos os campos");
      return;
    }
    addMutation.mutate();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const incomes = transactions?.filter(t => t.type === "income") || [];
  const expenses = transactions?.filter(t => t.type === "expense") || [];
  
  const totalIncomePaid = incomes.filter(t => t.status === "paid").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalIncomePending = incomes.filter(t => t.status === "pending").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpensePaid = expenses.filter(t => t.status === "paid").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpensePending = expenses.filter(t => t.status === "pending").reduce((acc, t) => acc + Number(t.amount), 0);
  
  const netProfit = totalIncomePaid - totalExpensePaid;

  const filteredTransactions = transactions?.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "income") return t.type === "income";
    if (activeTab === "expense") return t.type === "expense";
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-32 print:p-0 print:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Gestão de contas a pagar e receber</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="print:hidden hidden sm:flex" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setAddType("expense")} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                <ArrowDownCircle className="mr-2 h-4 w-4" /> Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button onClick={() => setAddType("income")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{addType === "income" ? "Nova Receita" : "Nova Despesa"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Pagamento de Fornecedor" />
                </div>
                <div className="space-y-1.5">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Data de Vencimento</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAdd} disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas (Pagas)</p>
              <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncomePaid)}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-13">A receber: {formatCurrency(totalIncomePending)}</p>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas (Pagas)</p>
              <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalExpensePaid)}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-13">A pagar: {formatCurrency(totalExpensePending)}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
              <h3 className="text-2xl font-bold">{formatCurrency(netProfit)}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-13">Receitas pagas - Despesas pagas</p>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="rounded-2xl border border-border bg-card shadow-soft print:shadow-none print:border-none">
        <div className="border-b border-border px-5 py-4 print:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="recurring">Recorrências</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {activeTab === "recurring" ? (
          <div className="p-4 sm:p-5">
            <RecurringChargesTab />
          </div>
        ) : (
          <>
            <div className="hidden print:block border-b border-border px-5 py-4">
              <h2 className="text-xl font-bold">Relatório de Contas a Pagar e Receber</h2>
              <p className="text-sm text-gray-500">Impresso em {new Date().toLocaleDateString('pt-BR')} - {activeTab === "all" ? "Todas as movimentações" : activeTab === "income" ? "Apenas Receitas" : "Apenas Despesas"}</p>
            </div>
        
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : filteredTransactions?.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  <th className="px-5 py-3 font-medium">Vencimento</th>
                  <th className="px-5 py-3 font-medium text-right">Valor</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions?.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {t.type === "income" ? (
                          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{t.description}</span>
                      </div>
                      {t.proposals && (
                        <div className="flex items-center gap-1 mt-1 ml-6 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>Proposta Original</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {format(parseISO(t.due_date), "dd 'de' MMM", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      <span className={t.type === "income" ? "text-emerald-600" : "text-red-600"}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {t.status === "paid" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Pago
                        </Badge>
                      ) : t.status === "pending" ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          <Clock className="mr-1 h-3 w-3" /> Pendente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="mr-1 h-3 w-3" /> Cancelado
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {t.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => statusMutation.mutate({ id: t.id, status: "paid" })}
                          disabled={statusMutation.isPending}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar Pago
                        </Button>
                      )}
                      {t.status === "paid" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-muted-foreground"
                          onClick={() => statusMutation.mutate({ id: t.id, status: "pending" })}
                          disabled={statusMutation.isPending}
                        >
                          Desfazer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

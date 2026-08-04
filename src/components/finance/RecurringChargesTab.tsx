import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Settings, MessageCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function RecurringChargesTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Add Plan form state
  const [clientName, setClientName] = useState("");
  const [planName, setPlanName] = useState("");
  const [amount, setAmount] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  // Config state
  const [pixKey, setPixKey] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: charges, isLoading } = useQuery({
    queryKey: ["recurring_charges", user?.id],
    queryFn: async () => {
      // Fetch charges with client info
      const { data, error } = await supabase
        .from("recurring_charges")
        .select(`*, clients(name, phone)`)
        .eq("user_id", user?.id!)
        .order("next_due_date", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        pix_key: pixKey,
        payment_link: paymentLink,
        whatsapp_billing_message: messageTemplate
      }).eq("id", user?.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      setIsConfigOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error("Erro ao salvar: " + e.message)
  });

  const addChargeMutation = useMutation({
    mutationFn: async () => {
      // Check if client exists by name, else create dummy
      let clientId = null;
      
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user?.id!)
        .ilike("name", clientName)
        .maybeSingle();
        
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: clientData, error: clientError } = await supabase.from("clients").insert({
          name: clientName,
          user_id: user?.id!,
        }).select().single();
        if (clientError) throw clientError;
        clientId = clientData.id;
      }

      const { error } = await supabase.from("recurring_charges").insert({
        user_id: user?.id!,
        client_id: clientId,
        plan_name: planName,
        amount: parseFloat(amount.replace(",", ".")),
        next_due_date: nextDueDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plano recorrente criado com sucesso!");
      setIsAddOpen(false);
      setClientName("");
      setPlanName("");
      setAmount("");
      setNextDueDate("");
      queryClient.invalidateQueries({ queryKey: ["recurring_charges"] });
    },
    onError: (e) => toast.error("Erro ao adicionar: " + e.message)
  });

  const handleOpenConfig = () => {
    if (profile) {
      setPixKey(profile.pix_key || "");
      setPaymentLink(profile.payment_link || "");
      setMessageTemplate(profile.whatsapp_billing_message || "Olá {nome_cliente}, sua fatura do plano {plano} no valor de {valor} vence no dia {vencimento}. Para pagar via PIX, use a chave: {pix}");
    }
    setIsConfigOpen(true);
  };

  const handleSendWhatsapp = (charge: any) => {
    const template = profile?.whatsapp_billing_message || "Olá {nome_cliente}, sua fatura do plano {plano} no valor de {valor} vence no dia {vencimento}. Para pagar via PIX, use a chave: {pix}";
    
    const amountFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(charge.amount);
    const dateFormatted = format(new Date(charge.next_due_date), "dd/MM/yyyy");

    let message = template
      .replace(/{nome_cliente}/g, charge.clients?.name || "Cliente")
      .replace(/{plano}/g, charge.plan_name)
      .replace(/{valor}/g, amountFormatted)
      .replace(/{vencimento}/g, dateFormatted)
      .replace(/{pix}/g, profile?.pix_key || "Não configurada");

    const phone = charge.clients?.phone?.replace(/\D/g, '') || "";
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-500" /> Cobranças Recorrentes</h2>
          <p className="text-sm text-muted-foreground">Automatize o envio de cobranças pelo WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenConfig} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Configurar Mensagem
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Plano Recorrente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Nome do Cliente (Se existir, será vinculado)</Label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João da Silva" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nome do Plano / Serviço</Label>
                  <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Ex: Manutenção Mensal" />
                </div>
                <div className="space-y-1.5">
                  <Label>Valor Mensal (R$)</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Próximo Vencimento</Label>
                  <Input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                  <Button onClick={() => addChargeMutation.mutate()} disabled={addChargeMutation.isPending || !clientName || !planName || !amount || !nextDueDate}>
                    {addChargeMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Sua Chave PIX</Label>
              <Input value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Email, CPF, Telefone ou Aleatória" />
            </div>
            <div className="space-y-1.5">
              <Label>Link de Pagamento (Opcional)</Label>
              <Input value={paymentLink} onChange={e => setPaymentLink(e.target.value)} placeholder="Ex: link do Mercado Pago, Asaas..." />
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem Automática (WhatsApp)</Label>
              <Textarea 
                value={messageTemplate} 
                onChange={e => setMessageTemplate(e.target.value)} 
                className="h-32"
              />
              <p className="text-xs text-muted-foreground mt-1">Variáveis disponíveis: {'{nome_cliente}, {plano}, {valor}, {vencimento}, {pix}'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
              <Button onClick={() => saveConfigMutation.mutate()} disabled={saveConfigMutation.isPending}>
                {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
      ) : charges?.length === 0 ? (
        <div className="p-10 text-center flex flex-col items-center gap-3 border border-dashed rounded-xl border-border bg-card/50">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-medium">Nenhum plano recorrente</h3>
            <p className="text-sm text-muted-foreground mt-1">Crie planos mensais para cobrar seus clientes recorrentes de forma rápida.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charges?.map(charge => (
            <div key={charge.id} className="border border-border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">Mensal</span>
              </div>
              <h3 className="font-bold text-lg">{charge.clients?.name || "Cliente sem nome"}</h3>
              <p className="text-muted-foreground text-sm font-medium">{charge.plan_name}</p>
              
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Valor do plano</p>
                  <p className="font-bold text-xl text-emerald-600">{formatCurrency(charge.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Próx. Vencimento</p>
                  <p className="font-semibold">{format(new Date(charge.next_due_date), "dd/MM")}</p>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-border flex gap-2">
                <Button 
                  onClick={() => handleSendWhatsapp(charge)}
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Cobrar Cliente
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

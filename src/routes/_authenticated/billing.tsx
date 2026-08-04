import { createFileRoute } from "@tanstack/react-router";
import { Copy, QrCode, ShieldCheck, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { status, loading, isPro, isTrialActive, daysRemaining, isActive } = useSubscription();
  const [copied, setCopied] = useState(false);

  const pixKey = "65.615.316/0001-33"; // CNPJ

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success("Chave PIX (CNPJ) copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando…</div>;
  }

  // Gera um QR Code estático genérico apontando para o CNPJ (se tivermos a string do BR Code, colocamos aqui)
  // Como não temos a string BR Code exata do banco, usaremos um QR API para gerar a chave para o usuário ler, 
  // mas o ideal é o copia e cola no CNPJ.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixKey}`;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Assinatura e Pagamento</h1>
        <p className="text-muted-foreground">Gerencie o seu acesso ao sistema</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="text-xl font-bold">Plano Profissional (R$ 39,90 / mês)</h2>
            <p className="text-sm mt-1 flex items-center gap-2">
              Status do seu acesso:
              <span className={`font-semibold capitalize ${isActive ? "text-emerald-600" : "text-destructive"}`}>
                {isPro ? "Ativo (PRO)" : isTrialActive ? "Período de Teste" : "Acesso Bloqueado/Vencido"}
              </span>
            </p>
          </div>
        </div>

        {isActive ? (
          <div className="flex items-center gap-2 text-sm mb-6 bg-secondary/50 p-3 rounded-lg border border-border">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>
              {isPro
                ? `Seu plano PRO está ativo. Vence em ${status?.pro_expires_at ? new Date(status.pro_expires_at).toLocaleDateString("pt-BR") : "N/A"} (${daysRemaining} dias restantes).`
                : `Seu período de teste grátis vence em ${status?.trial_ends_at ? new Date(status.trial_ends_at).toLocaleDateString("pt-BR") : "N/A"} (${daysRemaining} dias restantes).`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm mb-6 bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
            <Clock className="h-5 w-5 shrink-0" />
            <span>Seu período de acesso expirou. Realize o pagamento abaixo para reativar seu acesso.</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 items-center bg-card border rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamento via PIX
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Transfira o valor de <strong>R$ 39,90</strong> para a chave CNPJ abaixo. O acesso será liberado em até 2 horas úteis após a confirmação.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg flex justify-between items-center border">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Chave PIX (CNPJ)</p>
                <p className="font-mono text-lg">{pixKey}</p>
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyPix}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <p className="text-xs text-emerald-600 font-medium">Chave copiada com sucesso!</p>}

            <div className="flex gap-2 text-sm text-muted-foreground items-start">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
              <p>Envie o comprovante para o nosso suporte no WhatsApp caso precise de liberação imediata.</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 p-4 border-l border-border md:border-l-2 md:border-dashed">
            <div className="bg-white p-2 rounded-lg border shadow-sm">
              <img src={qrCodeUrl} alt="QR Code PIX" className="w-40 h-40" />
            </div>
            <p className="text-xs text-center text-muted-foreground flex items-center gap-1">
              <QrCode className="h-4 w-4" />
              Escaneie com o app do seu banco
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

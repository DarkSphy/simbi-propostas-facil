import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ExternalLink, Sparkles, Shield, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/billing")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  component: BillingPage,
});

function BillingPage() {
  const { subscription, isPro, loading } = useSubscription();
  const { session_id } = useSearch({ from: "/_authenticated/billing" });
  const [opening, setOpening] = useState(false);

  const openPortal = async () => {
    setOpening(true);
    try {
      const result = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/billing`,
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Erro ao abrir portal");
    } finally {
      setOpening(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <>
      <PaymentTestModeBanner />
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {session_id && (
          <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Pagamento processado! Sua assinatura será ativada em instantes.</span>
            </div>
          </Card>
        )}

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano e pagamentos</p>
        </div>

        {isPro && subscription ? (
          <>
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    <Sparkles className="h-3 w-3" /> PLANO PROFISSIONAL
                  </div>
                  <h2 className="text-xl font-bold">R$ 39,90 / mês</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status:{" "}
                    <span className="font-semibold capitalize">
                      {subscription.status === "active" ? "Ativa" :
                        subscription.status === "trialing" ? "Em teste" :
                        subscription.status === "past_due" ? "Pagamento pendente" :
                        subscription.status === "canceled" ? "Cancelada" :
                        subscription.status}
                    </span>
                  </p>
                </div>
              </div>

              {subscription.current_period_end && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {subscription.cancel_at_period_end || subscription.status === "canceled"
                      ? `Acesso expira em ${new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}`
                      : `Próxima cobrança em ${new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}`}
                  </span>
                </div>
              )}

              <div className="mt-6 flex gap-3 flex-wrap">
                <Button onClick={openPortal} disabled={opening}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {opening ? "Abrindo…" : "Gerenciar pagamento / cancelar"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>

            <Card className="p-4 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">Garantia de 7 dias</p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Cancelou em até 7 dias da contratação? Entre em contato pelo suporte e devolvemos 100%.
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Histórico completo de pagamentos, recibos e atualização de cartão estão disponíveis no portal seguro do Stripe (botão acima).
              </p>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-bold mb-1">Plano Gratuito</h2>
            <p className="text-muted-foreground mb-6">
              Você está no plano gratuito. Faça upgrade para desbloquear recursos ilimitados.
            </p>
            <Button asChild size="lg">
              <Link to="/upgrade">Conhecer o Plano Profissional</Link>
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}

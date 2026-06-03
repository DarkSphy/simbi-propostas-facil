import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/upgrade")({
  component: UpgradePage,
});

const FEATURES = [
  "Propostas ilimitadas",
  "Clientes ilimitados",
  "Itens e serviços ilimitados",
  "Dashboard ERP Premium",
  "Central de Alertas",
  "Vitrine interativa",
  "Rastreamento avançado",
  "Branding personalizado",
  "URL customizada",
];

function UpgradePage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  if (isPro) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Você já é Profissional ✨</h1>
        <p className="text-muted-foreground mb-6">Aproveite todos os recursos premium do Simbi.</p>
        <Button asChild><Link to="/billing">Gerenciar assinatura</Link></Button>
      </div>
    );
  }

  return (
    <>
      <PaymentTestModeBanner />
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3" /> PLANO PROFISSIONAL
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Desbloqueie todo o poder do Simbi</h1>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">R$ 39,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-3 mb-6">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">Garantia de 7 dias</p>
                <p className="text-emerald-700 dark:text-emerald-400">Cancele em até 7 dias e receba 100% do valor de volta, sem perguntas.</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden shadow-lg">
            <StripeEmbeddedCheckout
              priceId="pro_monthly"
              customerEmail={user?.email}
              userId={user?.id}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/billing?session_id={CHECKOUT_SESSION_ID}`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

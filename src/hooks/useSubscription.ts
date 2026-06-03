import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/auth";

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
  created_at: string;
  updated_at: string;
}

const PREMIUM_FEATURES = new Set([
  "premium_dashboard",
  "interactive_showcase",
  "advanced_tracking",
  "custom_branding",
  "custom_url",
  "unlimited_proposals",
  "unlimited_clients",
  "unlimited_items",
]);

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    let env: string;
    try { env = getStripeEnvironment(); } catch { env = "sandbox"; }
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as SubscriptionRow | null) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSub();
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, () => fetchSub())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const now = Date.now();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).getTime() : null;
  const isActive = !!subscription && (
    (["active", "trialing", "past_due"].includes(subscription.status) && (periodEnd === null || periodEnd > now)) ||
    (subscription.status === "canceled" && periodEnd !== null && periodEnd > now)
  );

  const isPro = isActive;
  const hasFeature = (flag: string) => !PREMIUM_FEATURES.has(flag) || isPro;

  return { subscription, loading, isActive, isPro, hasFeature, refetch: fetchSub };
}

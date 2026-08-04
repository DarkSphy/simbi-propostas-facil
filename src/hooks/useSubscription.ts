import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface SubscriptionStatus {
  role: string;
  trial_ends_at: string | null;
  pro_expires_at: string | null;
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
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role, trial_ends_at, pro_expires_at")
      .eq("id", user.id)
      .single();
      
    setStatus((data as unknown as SubscriptionStatus) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSub();
    if (!user) return;
    const channel = supabase
      .channel(`profile_status:${user.id}:${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, () => fetchSub())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const now = Date.now();
  
  const trialEnd = status?.trial_ends_at ? new Date(status.trial_ends_at).getTime() : null;
  const proEnd = status?.pro_expires_at ? new Date(status.pro_expires_at).getTime() : null;
  
  const isTrialActive = trialEnd !== null && trialEnd > now;
  const isProActive = proEnd !== null && proEnd > now;
  const isAdmin = status?.role === "admin";

  const isPro = isProActive || isAdmin; // Admin tem tudo
  const isActive = isTrialActive || isPro; // Se pode usar o sistema

  let daysRemaining = 0;
  if (isProActive && proEnd) {
    daysRemaining = Math.ceil((proEnd - now) / (1000 * 60 * 60 * 24));
  } else if (isTrialActive && trialEnd) {
    daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  } else if (!isActive) {
    // Quantos dias já se passaram desde o vencimento do trial ou pro
    const lastValidDate = proEnd ? proEnd : (trialEnd ? trialEnd : now);
    daysRemaining = Math.floor((lastValidDate - now) / (1000 * 60 * 60 * 24)); // Será negativo
  }

  const hasFeature = (flag: string) => !PREMIUM_FEATURES.has(flag) || isPro;

  return { status, loading, isActive, isPro, isTrialActive, isAdmin, daysRemaining, hasFeature, refetch: fetchSub };
}

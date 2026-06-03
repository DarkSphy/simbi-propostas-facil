import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";

export const FREE_LIMITS = {
  proposals: 5,   // por mês
  clients: 10,
  items: 10,
} as const;

export function usePlanLimits() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [counts, setCounts] = useState({ proposals: 0, clients: 0, items: 0 });
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) return;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [p, c, i] = await Promise.all([
      supabase.from("proposals").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startOfMonth.toISOString()),
      supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setCounts({
      proposals: p.count ?? 0,
      clients: c.count ?? 0,
      items: i.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { refetch(); /* eslint-disable-next-line */ }, [user?.id]);

  const canCreate = (resource: keyof typeof FREE_LIMITS) => isPro || counts[resource] < FREE_LIMITS[resource];
  const remaining = (resource: keyof typeof FREE_LIMITS) => isPro ? Infinity : Math.max(0, FREE_LIMITS[resource] - counts[resource]);

  return { counts, loading, isPro, canCreate, remaining, refetch, limits: FREE_LIMITS };
}

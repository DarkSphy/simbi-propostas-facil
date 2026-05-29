import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function RealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Send native notification helper
    const sendNativeNotification = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico", 
        });
      }
    };

    const channel = supabase
      .channel('proposals-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newRow = payload.new;
          if (!newRow) return;

          const status = newRow.status;
          const title = newRow.title;
          const id = newRow.id;

          // We use localStorage to track if we already notified this specific state transition
          // because Supabase by default doesn't send the full 'old' record unless REPLICA IDENTITY FULL is enabled.
          const notifKey = `notif_seen_${id}_${status}`;
          
          if (!localStorage.getItem(notifKey)) {
            localStorage.setItem(notifKey, 'true');

            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            if (status === "viewed") {
              toast.info(`👀 O cliente está visualizando a proposta!`);
              sendNativeNotification("Proposta Visualizada!", `O cliente está analisando: ${title}`);
            } else if (status === "approved") {
              toast.success(`🎉 Proposta APROVADA!`);
              sendNativeNotification("Proposta Aprovada! 🎉", `Boas notícias! O cliente aprovou: ${title}`);
            } else if (status === "refused") {
              toast.error(`❌ Proposta Recusada.`);
              sendNativeNotification("Proposta Recusada", `O cliente recusou: ${title}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return null; // Invisible component
}

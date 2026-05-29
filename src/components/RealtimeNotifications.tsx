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
          event: '*',
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

          // Se for uma nova inserção vinda da vitrine
          if (payload.eventType === 'INSERT' && status === 'in_progress') {
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            toast.success(`Nova solicitação de orçamento recebida na sua Vitrine!`);
            sendNativeNotification("Novo Orçamento", `Um cliente acaba de enviar uma solicitação pela Vitrine.`);
            return;
          }

          // Para atualizações normais (UPDATE)
          if (payload.eventType !== 'UPDATE') return;

          // We use localStorage to track if we already notified this specific state transition
          // because Supabase by default doesn't send the full 'old' record unless REPLICA IDENTITY FULL is enabled.
          const notifKey = `notif_seen_${id}_${status}`;
          
          if (!localStorage.getItem(notifKey)) {
            localStorage.setItem(notifKey, 'true');

            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            if (status === "viewed") {
              toast.info(`A proposta "${title}" acaba de ser aberta pelo cliente.`);
              sendNativeNotification("Proposta Aberta", `A proposta "${title}" está sendo visualizada neste momento.`);
            } else if (status === "approved") {
              toast.success(`A proposta "${title}" foi aprovada.`);
              sendNativeNotification("Proposta Aprovada", `O cliente aceitou os termos da proposta "${title}".`);
            } else if (status === "rejected" || status === "refused") {
              toast.error(`A proposta "${title}" foi recusada.`);
              sendNativeNotification("Proposta Recusada", `A proposta "${title}" foi declinada pelo cliente.`);
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

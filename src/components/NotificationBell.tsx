import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/sidebar"; // wait, popover from components/ui/popover is better
import { Popover as BasePopover, PopoverContent as BasePopoverContent, PopoverTrigger as BasePopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Trash2, CheckCircle2, FileSignature, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar notificações:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsList.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;

    // Subscrição em tempo real para novas notificações do usuário
    const channel = supabase
      .channel(`public:notifications:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
      return;
    }

    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir links ou fechar o popover acidentalmente
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao apagar notificação.");
      console.error(error);
      return;
    }

    toast.success("Notificação apagada!");
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const clearAll = async () => {
    if (!user || notificationsList.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao limpar notificações.");
      console.error(error);
      return;
    }

    toast.success("Todas as notificações foram limpas!");
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const getNotificationIcon = (title: string) => {
    const titleLower = (title || "").toLowerCase();
    if (titleLower.includes("aprovad") || titleLower.includes("aceit")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }
    if (titleLower.includes("assinad")) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <FileSignature className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <AlertCircle className="h-4 w-4" />
      </div>
    );
  };

  return (
    <BasePopover onOpenChange={(open) => open && markAllAsRead()}>
      <BasePopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border bg-background/50 hover:bg-muted"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </BasePopoverTrigger>

      <BasePopoverContent className="w-80 p-0 sm:w-[360px]" align="end">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {unreadCount} nova{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {notificationsList.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-auto text-xs font-semibold text-muted-foreground hover:text-destructive px-2 py-1"
            >
              Limpar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[350px]">
          {notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm">Nenhuma notificação</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Você será avisado aqui assim que seus clientes aceitarem propostas ou assinarem contratos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  {getNotificationIcon(notification.title)}
                  
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-semibold leading-none ${!notification.read ? "text-primary" : ""}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed pr-6">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => deleteNotification(notification.id, e)}
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </BasePopoverContent>
    </BasePopover>
  );
}

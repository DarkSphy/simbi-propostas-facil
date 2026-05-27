import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Users, History, Settings, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Propostas", url: "/proposals", icon: FileText },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Configurações", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        {!collapsed ? <Logo /> : <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = path === it.url || path.startsWith(it.url + "/");
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={it.url} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        {!collapsed && <span>{it.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 pb-3">
        {!collapsed && user && (
          <div className="mb-2 truncate rounded-md px-2 py-1 text-xs text-muted-foreground">{user.email}</div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

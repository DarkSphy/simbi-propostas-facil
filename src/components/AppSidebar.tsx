import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Users, History, Settings, LogOut, Package, ClipboardList, Calculator, BarChart3 } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Propostas", url: "/proposals", icon: FileText },
  { title: "Catálogo", url: "/catalog", icon: Package },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Gerar OS", url: "/work-orders", icon: ClipboardList },
  { title: "Calculadora", url: "/calculator", icon: Calculator },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
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
        {!collapsed ? <Logo inverted /> : <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = path === it.url || path.startsWith(it.url + "/");
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active} className="transition-all data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:font-semibold hover:bg-white/5 hover:text-white text-sidebar-foreground/80">
                      <Link to={it.url} className="flex items-center gap-3 py-1">
                        <it.icon className={`h-[1.125rem] w-[1.125rem] transition-colors ${active ? "text-white drop-shadow-sm" : "text-sidebar-foreground/60"}`} />
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

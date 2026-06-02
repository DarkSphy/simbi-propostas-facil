import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, FileSignature, Users, History, Settings, LogOut, Package, ClipboardList, Calculator, BarChart3, CalendarDays, Grid, Inbox, Store, CircleDollarSign } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const navGroups = [
  {
    label: "Visão Geral",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Agenda", url: "/agenda", icon: CalendarDays },
    ]
  },
  {
    label: "Vendas & Contratos",
    items: [
      { title: "Propostas", url: "/proposals", icon: FileText },
      { title: "Contratos", url: "/contracts", icon: FileSignature },
      { title: "Ordem de Serviço", url: "/work-orders", icon: ClipboardList },
    ]
  },
  {
    label: "Catálogo & Vitrine",
    items: [
      { title: "Produtos & Serviços", url: "/catalog", icon: Grid },
      { title: "Minha Vitrine", url: "/vitrine-settings", icon: Store },
      { title: "Pedidos Vitrine", url: "/requests", icon: Inbox },
    ]
  },
  {
    label: "Clientes & Dados",
    items: [
      { title: "Clientes", url: "/clients", icon: Users },
      { title: "Histórico", url: "/history", icon: History },
    ]
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", url: "/finance", icon: CircleDollarSign },
      { title: "Calculadora", url: "/calculator", icon: Calculator },
      { title: "Relatórios", url: "/reports", icon: BarChart3 },
      { title: "Configurações", url: "/settings", icon: Settings },
    ]
  }
];

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
        {navGroups.map((group, index) => (
          <SidebarGroup key={index} className="pt-2">
            {!collapsed && <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-1">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((it) => {
                  const active = path === it.url || path.startsWith(it.url + "/");
                  return (
                    <SidebarMenuItem key={it.url}>
                      <SidebarMenuButton asChild isActive={active} className="transition-all data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:border-l-4 data-[active=true]:border-primary hover:bg-white/5 hover:text-white text-sidebar-foreground/80 rounded-none border-l-4 border-transparent">
                        <Link to={it.url} className="flex items-center gap-3 py-1">
                          <it.icon className={`h-[1.125rem] w-[1.125rem] transition-colors ${active ? "text-primary drop-shadow-sm" : "text-sidebar-foreground/60"}`} />
                          {!collapsed && <span>{it.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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

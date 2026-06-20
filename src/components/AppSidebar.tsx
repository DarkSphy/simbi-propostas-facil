import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, FileSignature, Users, History, Settings, LogOut, Package, ClipboardList, Calculator, BarChart3, CalendarDays, Grid, Inbox, Store, CircleDollarSign, Briefcase, ReceiptText, ShoppingCart } from "lucide-react";
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
      { title: "Pedidos", url: "/orders", icon: ShoppingCart },
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
    label: "Cadastros & Dados",
    items: [
      { title: "Clientes", url: "/clients", icon: Users },
      { title: "Fornecedores", url: "/suppliers", icon: Briefcase },
      { title: "Histórico", url: "/history", icon: History },
    ]
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", url: "/finance", icon: CircleDollarSign },
      { title: "Notas Fiscais", url: "/invoices", icon: ReceiptText },
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
      <SidebarHeader className="px-4 py-5 border-b border-white/5 mb-2">
        <div className="flex items-center justify-center w-full">
          {!collapsed ? (
            <div className="drop-shadow-lg transition-transform hover:scale-105"><Logo inverted /></div>
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 shadow-[0_0_15px_rgba(42,157,143,0.4)] text-white text-lg font-black tracking-tighter">S</div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {navGroups.map((group, index) => (
          <SidebarGroup key={index} className="pt-2">
            {!collapsed && <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-1">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((it) => {
                  const active = path === it.url || path.startsWith(it.url + "/");
                  return (
                    <SidebarMenuItem key={it.url}>
                      <SidebarMenuButton asChild isActive={active} className="transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-transparent data-[active=true]:text-white data-[active=true]:font-bold data-[active=true]:border-l-[3px] data-[active=true]:border-primary hover:bg-white/5 hover:text-white text-sidebar-foreground/80 rounded-r-lg rounded-l-none border-l-[3px] border-transparent my-0.5">
                        <Link to={it.url} className="flex items-center gap-3 py-1.5">
                          <it.icon className={`h-[1.125rem] w-[1.125rem] transition-colors ${active ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "text-sidebar-foreground/60"}`} />
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
      <SidebarFooter className="p-4 border-t border-white/5 mt-auto">
        {!collapsed && user ? (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/5 shadow-inner">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-sm font-bold text-white shadow-md">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-white/90">{user.email?.split('@')[0]}</span>
              <span className="truncate text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Simbi Pro</span>
            </div>
          </div>
        ) : null}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => supabase.auth.signOut()} className="hover:bg-red-500/10 hover:text-red-400 transition-colors text-sidebar-foreground/70">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Encerrar Sessão</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

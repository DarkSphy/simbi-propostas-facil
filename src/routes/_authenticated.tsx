import { createFileRoute, Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Plus, FileText, Users, Grid, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  // Generate breadcrumb path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbName = pathSegments.length > 0 
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1).replace("-", " ")
    : "Visão Geral";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar / Command Center */}
          <header className="print:hidden sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 glass-panel px-4 shadow-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span className="truncate max-w-[100px]">Simbi</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{breadcrumbName}</span>
            </div>

            <div className="flex-1 flex items-center justify-end sm:justify-center px-2">
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes, propostas ou OS..."
                  className="w-full bg-muted/50 border-none pl-9 focus-visible:ring-1 focus-visible:bg-background rounded-full shadow-inner h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden sm:flex rounded-full bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 h-8 px-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Novo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Criar Novo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/proposals/new" className="cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Proposta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/clients" className="cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" /> Cliente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/catalog" className="cursor-pointer flex items-center gap-2">
                      <Grid className="h-4 w-4 text-orange-500" /> Produto/Serviço
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1 border-l border-border pl-3">
                <ThemeToggle />
                <NotificationBell />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

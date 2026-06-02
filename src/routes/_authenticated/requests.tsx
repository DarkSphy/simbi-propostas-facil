import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Inbox, Search, ExternalLink } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { MessageCircle, UserPlus, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Pedidos Vitrine · Simbi" }] }),
  component: RequestsList,
});

function RequestsList() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,public_slug,clients(id,name,phone,email,address,is_lead),proposal_items(description)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("profile_slug").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const filteredProposals = proposals.filter((p: any) => {
    if (p.status !== "in_progress") return false; // Somente pedidos da vitrine
    const term = search.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const clientMatch = p.clients?.name?.toLowerCase().includes(term);
    return titleMatch || clientMatch;
  });

  function handleFollowUp(e: React.MouseEvent, p: any) {
    e.preventDefault();
    const publicUrl = profile?.profile_slug 
      ? `${window.location.origin}/p/${profile.profile_slug}/${p.public_slug}`
      : `${window.location.origin}/p/${p.public_slug}`;
      
    const phone = (p.clients as any)?.phone?.replace(/\D/g, "") ?? "";
    if (!phone) {
      alert("Este cliente não tem telefone cadastrado.");
      return;
    }
    
    const clientFirstName = (p.clients as any)?.name?.split(" ")[0] || "Cliente";
    const msg = `Olá ${clientFirstName}! Recebi sua solicitação de orçamento pela minha Vitrine. Podemos falar sobre os detalhes do projeto?`;

    // Se o número não tiver DDI, assume Brasil
    const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function handleMakeClient(e: React.MouseEvent, clientId: string) {
    e.preventDefault();
    if (!clientId) return;
    const { error } = await supabase.from("clients").update({ is_lead: false } as any).eq("id", clientId);
    if (error) {
      toast.error("Erro ao converter lead.");
    } else {
      toast.success("Lead convertido em Cliente Definitivo!");
      qc.invalidateQueries({ queryKey: ["proposals-list"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos da Vitrine</h1>
          <p className="text-sm text-muted-foreground mt-1">Orçamentos solicitados publicamente através do seu link-in-bio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          {profile?.profile_slug && (
            <Button asChild variant="outline" className="rounded-full shadow-sm hover:-translate-y-0.5 transition-all">
              <a href={`/u/${profile.profile_slug}`} target="_blank" rel="noreferrer">
                Ver Vitrine <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto overflow-y-hidden rounded-3xl border border-border/50 bg-card shadow-elevated">
        <div className="min-w-[500px]">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : filteredProposals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <Inbox className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Nenhum pedido novo</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">Quando seus clientes pedirem orçamentos pelo seu link público, eles aparecerão aqui.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filteredProposals.map(p => (
              <li key={p.id}>
                <Link to="/proposals/$id" params={{ id: p.id }} className="group flex items-center gap-4 px-6 py-5 transition-all hover:bg-muted/30 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80"></div>
                  <div className="flex-1 min-w-0 pl-2">
                    <div className="truncate text-base font-semibold transition-colors group-hover:text-primary">{p.title}</div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">{(p as any).clients?.name ?? "Sem cliente"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                    
                    {/* Lead Details */}
                    {p.clients && (
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground/80">
                        {(p.clients as any).phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {(p.clients as any).phone}</div>}
                        {(p.clients as any).email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {(p.clients as any).email}</div>}
                        {(p.clients as any).address && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {(p.clients as any).address}</div>}
                      </div>
                    )}

                    {p.proposal_items && p.proposal_items.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.proposal_items.map((item: any, i: number) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-muted/60 border border-border/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {item.description}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-auto min-w-[150px] flex flex-col items-end gap-2 shrink-0">
                    {statusBadge(p.status)}
                    {(p.clients as any)?.is_lead === true && (
                      <Button size="sm" variant="outline" className="h-8 text-[11px] uppercase font-bold tracking-wider rounded-full w-full justify-center px-4 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors" onClick={(e) => handleMakeClient(e, (p.clients as any).id)}>
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Tornar Cliente
                      </Button>
                    )}
                    <Button size="sm" variant="default" className="h-8 text-[11px] uppercase font-bold tracking-wider rounded-full w-full justify-center bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 px-4 transition-transform hover:scale-105" onClick={(e) => handleFollowUp(e, p)}>
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Responder no Whats
                    </Button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
}

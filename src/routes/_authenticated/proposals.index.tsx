import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { formatBRL, statusBadge } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/proposals/")({
  head: () => ({ meta: [{ title: "Propostas · Simbi" }] }),
  component: ProposalsList,
});

function ProposalsList() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,public_slug,clients(name,phone)")
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
    if (p.status === "in_progress") return false; // Hide vitrine requests from this view
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
    let msg = "";

    if (p.status === 'in_progress') {
      msg = `Olá ${clientFirstName}! Recebi sua solicitação de orçamento pela minha Vitrine. Podemos falar sobre os detalhes do projeto?`;
    } else if (p.status === 'viewed') {
      msg = `Olá ${clientFirstName}! Vi que você analisou a proposta "${p.title}". Ficou com alguma dúvida? Estou à disposição para conversarmos e ajustarmos o que for preciso!`;
    } else {
      msg = `Olá ${clientFirstName}! Tudo bem?\nPassando para saber se conseguiu acessar o link do orçamento "${p.title}". Qualquer dúvida, estou à disposição!\n\nLink: ${publicUrl}`;
    }

    // Se o número não tiver DDI, assume Brasil
    const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título ou cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Button asChild className="rounded-full shadow-lg shadow-primary/30 glow-primary transition-all hover:bg-primary/90 hover:glow-primary-hover hover:-translate-y-0.5 whitespace-nowrap">
            <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Nova proposta</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto overflow-y-hidden rounded-3xl border border-border/50 bg-card shadow-elevated">
        <div className="min-w-[500px]">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : proposals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Sem propostas por aqui</h3>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta e envie pelo WhatsApp.</p>
            <Button asChild className="mt-6 rounded-full shadow-lg shadow-primary/20 glow-primary hover:glow-primary-hover hover:-translate-y-0.5">
              <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Criar proposta</Link>
            </Button>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma proposta encontrada na busca.</div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filteredProposals.map(p => (
              <li key={p.id}>
                <Link to="/proposals/$id" params={{ id: p.id }} className="group flex items-center gap-4 px-6 py-5 transition-all hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-base font-semibold transition-colors group-hover:text-primary">{p.title}</div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">{(p as any).clients?.name ?? "Sem cliente"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="hidden sm:block w-32 text-right text-base font-medium">{formatBRL(Number(p.total))}</div>
                  <div className="w-auto min-w-[130px] flex flex-col items-end gap-2 shrink-0">
                    {statusBadge(p.status)}
                    {['sent', 'viewed'].includes(p.status) && (
                      <Button size="sm" variant="default" className="h-8 text-[11px] uppercase font-bold tracking-wider rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 px-4 transition-transform hover:scale-105" onClick={(e) => handleFollowUp(e, p)}>
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Cobrar
                      </Button>
                    )}
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

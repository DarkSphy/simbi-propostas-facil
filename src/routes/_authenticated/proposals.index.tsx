import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, MessageCircle, GripVertical } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/proposals/")({
  head: () => ({ meta: [{ title: "Propostas · Simbi" }] }),
  component: ProposalsKanban,
});

const columnsConfig = [
  { id: "draft", title: "Rascunho", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20" },
  { id: "sent", title: "Enviada", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
  { id: "viewed", title: "Visualizada", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" },
  { id: "approved", title: "Aprovada", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
  { id: "rejected", title: "Recusada", color: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20" },
];

function ProposalsKanban() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [localData, setLocalData] = useState<any[]>([]);
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals")
        .select("id,title,total,status,created_at,public_slug,clients(name,phone)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("profile_slug").eq("id", user?.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Sync server data to local data for optimistic UI dragging
  useEffect(() => {
    setLocalData(proposals);
  }, [proposals]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["proposals-list"] });
      const previousProposals = queryClient.getQueryData(["proposals-list"]);
      
      setLocalData(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      
      return { previousProposals };
    },
    onError: (err, variables, context: any) => {
      toast.error("Erro ao atualizar o status da proposta.");
      if (context?.previousProposals) {
        setLocalData(context.previousProposals);
        queryClient.setQueryData(["proposals-list"], context.previousProposals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals-list"] });
    }
  });

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    // Apply locally instantly
    setLocalData(prev => prev.map(p => p.id === draggableId ? { ...p, status: newStatus } : p));
    
    // Mutate in server
    updateStatusMutation.mutate({ id: draggableId, status: newStatus });
  };

  const filteredProposals = localData.filter((p: any) => {
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
    const msg = encodeURIComponent(`Olá, ${(p.clients as any)?.name.split(" ")[0]}! Tudo bem?\nSó passando para ver se conseguiu analisar o orçamento que te enviei. Qualquer dúvida, estou à disposição!\n\nLink: ${publicUrl}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col px-5 py-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
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

      <div className="mt-8 flex-1 overflow-x-auto pb-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Carregando pipeline…</div>
        ) : localData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Sem propostas por aqui</h3>
            <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira proposta e arraste pelo Kanban.</p>
            <Button asChild className="mt-6 rounded-full shadow-lg shadow-primary/20 glow-primary">
              <Link to="/proposals/new"><Plus className="mr-1.5 h-4 w-4" /> Criar proposta</Link>
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-5 items-start">
              {columnsConfig.map((col) => {
                const columnProposals = filteredProposals.filter(p => p.status === col.id);
                const columnTotal = columnProposals.reduce((acc, p) => acc + Number(p.total), 0);

                return (
                  <div key={col.id} className="flex h-full w-[320px] shrink-0 flex-col rounded-2xl bg-muted/40 border border-border">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider border ${col.color}`}>
                          {col.title}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">{columnProposals.length}</span>
                      </div>
                      <div className="text-sm font-bold opacity-80">{formatBRL(columnTotal)}</div>
                    </div>
                    
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                        >
                          <AnimatePresence>
                            {columnProposals.map((p, index) => (
                              <Draggable key={p.id} draggableId={p.id} index={index}>
                                {(provided, snapshot) => (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style}
                                    className={`mb-3 group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:border-primary/50 hover:shadow-md ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl z-50 ring-2 ring-primary border-primary' : ''}`}
                                  >
                                    <Link to="/proposals/$id" params={{ id: p.id }} className="block">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="font-semibold leading-tight">{p.title}</div>
                                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {(p as any).clients?.name ?? "Sem cliente"}
                                      </div>
                                      <div className="mt-4 flex items-end justify-between">
                                        <div className="font-bold text-emerald-600 dark:text-emerald-500">
                                          {formatBRL(Number(p.total))}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                          {new Date(p.created_at).toLocaleDateString("pt-BR")}
                                        </div>
                                      </div>
                                    </Link>
                                    
                                    {p.status === 'sent' && differenceInDays(new Date(), parseISO(p.created_at)) >= 3 && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="mt-3 w-full h-8 text-xs bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400" 
                                        onClick={(e) => handleFollowUp(e, p)}
                                      >
                                        <MessageCircle className="mr-1.5 h-3 w-3" /> Lembrar Cliente
                                      </Button>
                                    )}
                                  </motion.div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}

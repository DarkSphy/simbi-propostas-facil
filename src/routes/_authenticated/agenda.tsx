import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isToday, startOfWeek, endOfWeek, parseISO, isSameDay
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda · Simbi" }] }),
  component: AgendaPage,
});

function AgendaPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [proposalId, setProposalId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Fetch Appointments
  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients(name), proposals(title)")
        .eq("user_id", user?.id)
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch Clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").eq("user_id", user?.id).order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch Proposals for dropdown
  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals", "agenda"],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals").select("id, title, clients(name)").eq("user_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const openNewAppointment = (date: Date) => {
    setSelectedDate(date);
    setTitle("");
    setDescription("");
    setTime("09:00");
    setClientId("");
    setProposalId("");
    setIsNewOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !user) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        title,
        description: description || null,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: time || null,
        client_id: clientId || null,
        proposal_id: proposalId || null,
        status: "scheduled"
      });
      
      if (error) throw error;
      toast.success("Compromisso salvo!");
      setIsNewOpen(false);
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard_metrics"] }); // if we add it to dashboard
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "scheduled" : "completed";
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    qc.invalidateQueries({ queryKey: ["appointments"] });
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Excluir este compromisso?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Compromisso excluído");
    qc.invalidateQueries({ queryKey: ["appointments"] });
  };

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Upcoming list (next 30 days or all future)
  const upcomingAppointments = appointments.filter(a => {
    const aptDate = parseISO(a.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return aptDate >= today;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Agenda
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie seus compromissos e lembretes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <Button 
              variant={viewMode === "calendar" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("calendar")}
              className="rounded-md"
            >
              Calendário
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("list")}
              className="rounded-md"
            >
              Lista
            </Button>
          </div>
          <Button onClick={() => openNewAppointment(new Date())}>
            <Plus className="mr-2 h-4 w-4" /> Novo Compromisso
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>Hoje</Button>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/10">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((day, i) => {
              const dayAppointments = appointments.filter(a => a.date === format(day, "yyyy-MM-dd"));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`
                    min-h-[120px] p-2 border-b border-r border-border/50 relative group transition-colors hover:bg-muted/30
                    ${!isCurrentMonth ? "bg-muted/20 text-muted-foreground/50" : ""}
                    ${i % 7 === 6 ? "border-r-0" : ""}
                  `}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.apt-item')) return;
                    openNewAppointment(day);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isCurrentDay ? "bg-primary text-primary-foreground font-bold shadow-sm" : ""}
                    `}>
                      {format(day, dateFormat)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={(e) => { e.stopPropagation(); openNewAppointment(day); }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {dayAppointments.map(apt => (
                      <div 
                        key={apt.id} 
                        className={`
                          apt-item text-xs px-2 py-1 rounded truncate cursor-pointer transition-all hover:brightness-95 flex items-center gap-1
                          ${apt.status === 'completed' ? 'bg-gray-100 text-gray-500 line-through' : 'bg-blue-50 text-blue-700 border border-blue-100/50'}
                        `}
                        title={`${apt.time ? apt.time.substring(0,5) + ' - ' : ''}${apt.title}`}
                        onClick={() => toggleStatus(apt.id, apt.status)}
                      >
                        {apt.time && <span className="font-semibold opacity-70">{apt.time.substring(0,5)}</span>}
                        <span className="truncate">{apt.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold">Próximos Compromissos</h2>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p>Nenhum compromisso futuro agendado.</p>
              <Button variant="outline" className="mt-4" onClick={() => openNewAppointment(new Date())}>Agendar agora</Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingAppointments.map((apt) => {
                const dateObj = parseISO(apt.date);
                const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <li key={apt.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${apt.status === 'completed' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${isToday(dateObj) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border'}`}>
                        <span className="text-xs font-bold uppercase">{format(dateObj, "MMM", { locale: ptBR })}</span>
                        <span className="text-lg font-black leading-none">{format(dateObj, "dd")}</span>
                      </div>
                      <div>
                        <h4 className={`font-bold text-base ${apt.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{apt.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {apt.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.time.substring(0,5)}</span>}
                          {apt.clients?.name && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {apt.clients.name}</span>}
                          {apt.proposals?.title && <span className="flex items-center gap-1 text-primary/80"><FileText className="h-3 w-3" /> {apt.proposals.title}</span>}
                        </div>
                        {apt.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{apt.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={apt.status === 'completed' ? "outline" : "default"} 
                        size="sm" 
                        className={apt.status !== 'completed' ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        onClick={() => toggleStatus(apt.id, apt.status)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> 
                        {apt.status === 'completed' ? 'Reabrir' : 'Concluir'}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAppointment(apt.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* New Appointment Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveAppointment}>
            <DialogHeader>
              <DialogTitle>Novo Compromisso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input 
                    type="date" 
                    required 
                    value={format(selectedDate, "yyyy-MM-dd")} 
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  required 
                  placeholder="Ex: Visita técnica, Reunião, Entrega" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Vincular a um Cliente (Opcional)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum cliente</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {clientId && proposals.some((p:any) => p.clients?.name === clients.find((c:any) => c.id === clientId)?.name) && (
                <div className="space-y-2">
                  <Label>Vincular a uma Proposta (Opcional)</Label>
                  <Select value={proposalId} onValueChange={setProposalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma proposta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma proposta</SelectItem>
                      {proposals.filter((p:any) => p.clients?.name === clients.find((c:any) => c.id === clientId)?.name).map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Descrição ou Endereço</Label>
                <Textarea 
                  placeholder="Detalhes adicionais..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="resize-none h-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || !title}>
                {isSubmitting ? "Salvando..." : "Salvar Compromisso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

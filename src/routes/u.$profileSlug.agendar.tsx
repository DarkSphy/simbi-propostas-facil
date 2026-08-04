import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, ArrowLeft, Send, User, Phone } from "lucide-react";
import { format, parseISO, isSameDay, addMinutes, isBefore, startOfDay, endOfDay, setHours, setMinutes, formatISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$profileSlug/agendar")({
  component: SchedulingPage,
  loader: async ({ params }) => {
    const { data, error } = await supabase.rpc("get_public_profile", {
      p_slug: params.profileSlug,
    });

    const raw = data as any;
    if (error || !raw) throw new Error("Perfil não encontrado");

    const profile = {
      ...raw,
      name: raw.full_name,
      phone: raw.whatsapp,
      ui_color: raw.theme_color,
      ui_theme: null as string | null,
    };

    // Check if enabled
    const settings = profile.scheduling_settings as any;
    if (!settings || !settings.enabled) {
      throw new Error("O agendamento online está desativado para este profissional.");
    }

    return { profile };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-5">
      <div className="text-center max-w-md p-8 border border-border rounded-3xl bg-card shadow-xl">
        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Ops!</h2>
        <p className="text-muted-foreground mb-6">{(error as Error).message || "Não foi possível carregar a página de agendamento."}</p>
        <Button onClick={() => window.history.back()}>Voltar</Button>
      </div>
    </div>
  )
});

function SchedulingPage() {
  const { profile } = Route.useLoaderData();
  const settings = profile.scheduling_settings as any;
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // Styling
  useEffect(() => {
    const root = document.documentElement;
    if (profile.ui_color) {
      root.className = "";
      root.classList.add(`theme-${profile.ui_color}`);
    }
    if (profile.ui_theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [profile.ui_color, profile.ui_theme]);

  // Load booked slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadBookedSlots(selectedDate);
      setSelectedTime(null);
    }
  }, [selectedDate]);

  async function loadBookedSlots(date: Date) {
    setLoadingSlots(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const { data, error } = await supabase.rpc("get_public_booked_slots", {
        p_profile_slug: profile.profile_slug!,
        p_date: formattedDate
      });
      
      if (error) throw error;
      setBookedSlots(data.map((d: any) => d.booked_time.substring(0, 5)));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar horários disponíveis.");
    } finally {
      setLoadingSlots(false);
    }
  }

  const workDays = settings.work_days || [1,2,3,4,5];
  
  // Disable dates logic
  const isDateDisabled = (date: Date) => {
    // Disable past days
    if (startOfDay(date) < startOfDay(new Date())) return true;
    
    // Disable non-working days
    const dayOfWeek = date.getDay();
    if (!workDays.includes(dayOfWeek)) return true;

    return false;
  };

  // Generate available times
  const generateTimeSlots = () => {
    if (!selectedDate) return [];
    
    const slots: string[] = [];
    const duration = Number(settings.slot_duration || 60);
    
    const [startH, startM] = (settings.start_time || "09:00").split(":");
    const [endH, endM] = (settings.end_time || "18:00").split(":");
    const [lunchStartH, lunchStartM] = (settings.lunch_start || "12:00").split(":");
    const [lunchEndH, lunchEndM] = (settings.lunch_end || "13:00").split(":");
    
    let current = setMinutes(setHours(selectedDate, Number(startH)), Number(startM));
    const end = setMinutes(setHours(selectedDate, Number(endH)), Number(endM));
    
    const lunchStart = setMinutes(setHours(selectedDate, Number(lunchStartH)), Number(lunchStartM));
    const lunchEnd = setMinutes(setHours(selectedDate, Number(lunchEndH)), Number(lunchEndM));

    const now = new Date();

    while (isBefore(current, end)) {
      const slotEnd = addMinutes(current, duration);
      
      // Skip if overlaps with lunch
      const overlapsLunch = (current >= lunchStart && current < lunchEnd) || (slotEnd > lunchStart && slotEnd <= lunchEnd);
      
      // Skip if it's today and time has passed
      const isPastToday = isSameDay(current, now) && current < now;

      if (!overlapsLunch && !isPastToday && isBefore(slotEnd, addMinutes(end, 1))) {
        const timeStr = format(current, "HH:mm");
        if (!bookedSlots.includes(timeStr)) {
          slots.push(timeStr);
        }
      }
      current = slotEnd;
    }

    return slots;
  };

  const availableSlots = generateTimeSlots();

  async function handleBook() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Por favor, preencha nome e WhatsApp.");
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("book_public_appointment", {
        p_profile_slug: profile.profile_slug!,
        p_date: format(selectedDate!, "yyyy-MM-dd"),
        p_time: selectedTime! + ":00",
        p_guest_name: name,
        p_guest_phone: phone,
        p_description: description
      });

      if (error) {
        if (error.message.includes("disponível")) {
          toast.error("Este horário não está mais disponível. Por favor, escolha outro.");
          setStep(2);
          loadBookedSlots(selectedDate!);
        } else {
          throw error;
        }
        return;
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao realizar agendamento: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function sendWhatsApp() {
    const msg = `Olá! Acabei de fazer um agendamento pelo seu site para o dia *${format(selectedDate!, "dd/MM/yyyy")}* às *${selectedTime}*.\nMeu nome é *${name}*.`;
    const p = profile.phone?.replace(/\D/g, "") || "";
    if (p) {
      window.open(`https://wa.me/${p.length <= 11 ? '55'+p : p}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-5">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-xl text-center border border-border">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Agendado!</h2>
          <p className="text-muted-foreground mb-6">
            Seu horário foi marcado para <strong className="text-foreground">{format(selectedDate!, "dd/MM", { locale: ptBR })} às {selectedTime}</strong>.
          </p>
          
          <div className="bg-muted p-4 rounded-xl text-sm mb-6 text-left">
            <div className="font-semibold mb-1">{profile.company_name || profile.name}</div>
            <div className="text-muted-foreground mb-2">Foi notificado(a) do seu agendamento.</div>
          </div>

          <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-500/20" onClick={sendWhatsApp}>
            Confirmar no WhatsApp
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => window.location.href = `/u/${profile.profile_slug}`}>
            Voltar para a página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agendamento</span>
            <span className="text-sm font-semibold">{profile.company_name || profile.name}</span>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        
        {step === 1 && (
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Qual melhor dia?</h2>
              <p className="text-muted-foreground text-sm mt-1">Selecione uma data disponível no calendário.</p>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setStep(2);
                  }
                }}
                disabled={isDateDisabled}
                className="rounded-2xl border p-4 shadow-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Qual melhor horário?</h2>
              <p className="text-muted-foreground text-sm mt-1 capitalize">{format(selectedDate!, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
            </div>

            {loadingSlots ? (
              <div className="py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum horário disponível para este dia.</p>
                <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>Escolher outro dia</Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setStep(3);
                    }}
                    className={cn(
                      "py-3 rounded-xl border text-center font-bold text-lg transition-all",
                      selectedTime === time 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-background border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-right-4">
            <div className="mb-6 flex items-center justify-between bg-muted/50 p-4 rounded-2xl border border-border">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Horário Selecionado</p>
                <p className="font-bold text-lg">{format(selectedDate!, "dd/MM", { locale: ptBR })} às {selectedTime}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Mudar</Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Seu Nome Completo</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" className="h-12 rounded-xl text-base" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Seu WhatsApp</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-12 rounded-xl text-base" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold">O que você precisa? (Opcional)</Label>
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Breve descrição sobre o serviço ou motivo do agendamento..." 
                  className="resize-none h-24 rounded-xl text-base" 
                />
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-lg shadow-primary/20" 
                onClick={handleBook} 
                disabled={submitting}
              >
                {submitting ? "Confirmando..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
}

export function SchedulingSettingsModal({ open, onOpenChange, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [slotDuration, setSlotDuration] = useState("60");
  const [workDays, setWorkDays] = useState<number[]>([1,2,3,4,5]);
  const [profileSlug, setProfileSlug] = useState("");

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("scheduling_settings, profile_slug")
      .eq("id", userId)
      .single();
      
    if (data) {
      setProfileSlug(data.profile_slug || "");
      if (data.scheduling_settings) {
        const s = data.scheduling_settings as any;
        setEnabled(s.enabled ?? false);
        setStartTime(s.start_time ?? "09:00");
        setEndTime(s.end_time ?? "18:00");
        setLunchStart(s.lunch_start ?? "12:00");
        setLunchEnd(s.lunch_end ?? "13:00");
        setSlotDuration(String(s.slot_duration ?? 60));
        setWorkDays(s.work_days ?? [1,2,3,4,5]);
      }
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const settings = {
      enabled,
      start_time: startTime,
      end_time: endTime,
      lunch_start: lunchStart,
      lunch_end: lunchEnd,
      slot_duration: Number(slotDuration),
      work_days: workDays
    };

    const { error } = await supabase
      .from("profiles")
      .update({ scheduling_settings: settings })
      .eq("id", userId);

    setSaving(false);
    
    if (error) {
      toast.error("Erro ao salvar configurações");
    } else {
      toast.success("Configurações salvas!");
      onOpenChange(false);
    }
  }

  const toggleDay = (day: number) => {
    setWorkDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const daysOfWeek = [
    { num: 0, label: "Dom" },
    { num: 1, label: "Seg" },
    { num: 2, label: "Ter" },
    { num: 3, label: "Qua" },
    { num: 4, label: "Qui" },
    { num: 5, label: "Sex" },
    { num: 6, label: "Sáb" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendamento Online</DialogTitle>
          <DialogDescription>
            Configure seus horários para que os clientes possam agendar diretamente pela sua Vitrine.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Label className="text-base font-bold text-foreground">Habilitar Agendamento</Label>
                <p className="text-xs text-muted-foreground">Permitir que clientes marquem horário sozinhos.</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="space-y-3">
              <Label className="font-semibold">Dias de Trabalho</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(d => (
                  <button
                    key={d.num}
                    onClick={() => toggleDay(d.num)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${workDays.includes(d.num) ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Horário de Início</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Horário de Término</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Início do Almoço</Label>
                <Input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim do Almoço</Label>
                <Input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Duração de cada Agendamento</Label>
              <Select value={slotDuration} onValueChange={setSlotDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora e meia</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {enabled && profileSlug && (
              <div className="bg-muted p-3 rounded-lg border border-border mt-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Link do seu agendamento</Label>
                <div className="text-sm font-mono break-all text-primary font-medium">
                  https://simbi-propostas-facil.lovable.app/u/{profileSlug}/agendar
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={saveSettings} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

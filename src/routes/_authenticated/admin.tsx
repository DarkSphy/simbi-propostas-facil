import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { ShieldAlert, Users, Trash2, CheckCircle, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

interface Profile {
  id: string;
  full_name: string;
  whatsapp: string;
  role: string;
  trial_ends_at: string | null;
  pro_expires_at: string | null;
  created_at: string;
}

function AdminPage() {
  const { isAdmin, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState("");
  const [proExpiresAt, setProExpiresAt] = useState("");

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, whatsapp, role, trial_ends_at, pro_expires_at, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!subLoading && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    } else if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin, subLoading, navigate]);

  const handleActivatePro = async (userId: string) => {
    if (!confirm("Tem certeza que deseja adicionar 30 dias de PRO para este usuário?")) return;
    
    const { error } = await supabase.rpc("activate_pro_by_admin", { target_user_id: userId });
    if (error) {
      toast.error("Erro ao ativar PRO: " + error.message);
    } else {
      toast.success("Plano PRO ativado com sucesso!");
      fetchProfiles();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("ATENÇÃO: Tem certeza que deseja DELETAR PERMANENTEMENTE este usuário e todos os seus dados?")) return;
    
    const { error } = await supabase.rpc("delete_user_by_admin", { target_user_id: userId });
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      toast.success("Usuário deletado com sucesso.");
      fetchProfiles();
    }
  };

  const handleSaveDates = async () => {
    if (!editProfile) return;
    
    const { error } = await supabase.rpc("update_user_dates_by_admin", {
      target_user_id: editProfile.id,
      p_trial_ends_at: trialEndsAt || null,
      p_pro_expires_at: proExpiresAt || null,
    });

    if (error) {
      toast.error("Erro ao salvar datas: " + error.message);
    } else {
      toast.success("Datas atualizadas com sucesso!");
      setEditProfile(null);
      fetchProfiles();
    }
  };

  if (subLoading || loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando painel admin…</div>;
  }

  if (!isAdmin) return null;

  const now = Date.now();
  const activeProCount = profiles.filter(p => p.pro_expires_at && new Date(p.pro_expires_at).getTime() > now).length;
  const mrr = activeProCount * 39.90;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gestão de clientes e faturamento</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Faturamento (MRR)</h3>
          <p className="text-3xl font-bold text-emerald-600">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mrr)}
          </p>
        </Card>
        <Card className="p-6 bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total de Clientes</h3>
          <p className="text-3xl font-bold">{profiles.length}</p>
        </Card>
        <Card className="p-6 bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Assinantes Ativos (PRO)</h3>
          <p className="text-3xl font-bold text-primary">{activeProCount}</p>
        </Card>
      </div>

      <Card className="border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vencimento PRO</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const proEnd = p.pro_expires_at ? new Date(p.pro_expires_at).getTime() : null;
                const trialEnd = p.trial_ends_at ? new Date(p.trial_ends_at).getTime() : null;
                
                const isProActive = proEnd && proEnd > now;
                const isTrialActive = trialEnd && trialEnd > now;
                
                let statusBadge = <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">Bloqueado</span>;
                if (p.role === "admin") {
                  statusBadge = <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">Admin</span>;
                } else if (isProActive) {
                  statusBadge = <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">PRO</span>;
                } else if (isTrialActive) {
                  statusBadge = <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Teste</span>;
                }

                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.full_name || "Sem nome"}</td>
                    <td className="px-4 py-3">{p.whatsapp || "-"}</td>
                    <td className="px-4 py-3">{statusBadge}</td>
                    <td className="px-4 py-3">
                      {p.pro_expires_at ? new Date(p.pro_expires_at).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" className="h-8" onClick={() => handleActivatePro(p.id)} title="Ativar 30 dias PRO">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => {
                        setEditProfile(p);
                        setTrialEndsAt(p.trial_ends_at ? new Date(p.trial_ends_at).toISOString().slice(0, 16) : "");
                        setProExpiresAt(p.pro_expires_at ? new Date(p.pro_expires_at).toISOString().slice(0, 16) : "");
                      }} title="Editar datas">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteUser(p.id)} title="Excluir Usuário">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!editProfile} onOpenChange={(open) => !open && setEditProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Datas - {editProfile?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fim do Teste (Trial Ends At)</Label>
              <Input type="datetime-local" value={trialEndsAt} onChange={e => setTrialEndsAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vencimento PRO (Pro Expires At)</Label>
              <Input type="datetime-local" value={proExpiresAt} onChange={e => setProExpiresAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfile(null)}>Cancelar</Button>
            <Button onClick={handleSaveDates}>Salvar Datas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

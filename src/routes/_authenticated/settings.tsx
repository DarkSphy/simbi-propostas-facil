import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · Simbi" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(""); const [companyName, setCompanyName] = useState(""); const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name ?? ""); setCompanyName(data.company_name ?? ""); setWhatsapp(data.whatsapp ?? ""); }
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, company_name: companyName, whatsapp, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo!");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="space-y-1.5"><Label>Nome</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Empresa / marca</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Aparece no topo das suas propostas" /></div>
        <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" /></div>
        <div className="space-y-1.5"><Label>E-mail</Label><Input value={user?.email ?? ""} disabled /></div>
        <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button></div>
      </div>
    </div>
  );
}

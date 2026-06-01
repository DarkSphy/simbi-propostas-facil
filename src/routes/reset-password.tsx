import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Nova senha · Simbi" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Mínimo 6 caracteres."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(getErrorMessage(error)); return; }
    toast.success("Senha redefinida!");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell title="Definir nova senha">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="password" label="Nova senha"><Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Salvando…" : "Salvar nova senha"}</Button>
      </form>
    </AuthShell>
  );
}

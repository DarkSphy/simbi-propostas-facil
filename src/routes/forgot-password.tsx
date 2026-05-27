import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha · Simbi" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Enviamos um link de redefinição para seu e-mail.");
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Vamos te enviar um link para redefinir.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="email" label="E-mail"><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar link"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline">Voltar para entrar</Link>
      </p>
    </AuthShell>
  );
}

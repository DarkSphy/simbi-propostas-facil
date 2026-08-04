import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta · Simbi" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Senha precisa ter pelo menos 6 caracteres."); return; }
    if (!whatsapp) { toast.error("WhatsApp é obrigatório."); return; }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, whatsapp }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) { toast.error(getErrorMessage(error)); return; }
    toast.success("Conta criada! Redirecionando…");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell title="Criar sua conta" subtitle="Comece a enviar propostas profissionais em minutos.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="name" label="Nome"><Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Field id="whatsapp" label="WhatsApp"><Input id="whatsapp" required placeholder="(11) 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
        <Field id="email" label="E-mail"><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field id="password" label="Senha"><Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Criando…" : "Criar conta"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar · Simbi" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(getErrorMessage(error)); return; }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell title="Entrar no Simbi" subtitle="Acesse sua conta para continuar.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="email" label="E-mail"><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field id="password" label="Senha"><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="text-right text-xs"><Link to="/forgot-password" className="text-muted-foreground hover:text-primary">Esqueci minha senha</Link></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta? <Link to="/register" className="font-medium text-primary hover:underline">Criar conta</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative flex h-full flex-col justify-end p-10 text-primary-foreground">
          <blockquote className="text-2xl font-medium leading-snug">
            “Minhas propostas ficaram com cara de escritório grande. Aumentei o ticket médio em poucas semanas.”
          </blockquote>
          <div className="mt-4 text-sm opacity-80">Camila R. · Arquiteta, São Paulo</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

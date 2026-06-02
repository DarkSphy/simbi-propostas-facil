export function formatBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    sent: { label: "Enviada", cls: "bg-muted/50 text-muted-foreground border-border", dot: "bg-muted-foreground" },
    viewed: { label: "Visualizada", cls: "bg-accent/20 text-accent-foreground border-accent/30", dot: "bg-accent-foreground animate-pulse" },
    approved: { label: "Aceita", cls: "bg-success/15 text-success border-success/30", dot: "bg-success shadow-[0_0_8px_var(--color-success)] animate-pulse" },
    in_progress: { label: "Em execução", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", dot: "bg-blue-500 animate-pulse" },
    finished: { label: "Finalizada", cls: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary shadow-[0_0_8px_var(--color-primary)]" },
    paid: { label: "Paga", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" },
    rejected: { label: "Recusada", cls: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
    canceled: { label: "Cancelada", cls: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  };
  const s = map[status] ?? map.sent;
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${s.cls} shadow-sm backdrop-blur-md transition-transform hover:scale-105 cursor-default`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

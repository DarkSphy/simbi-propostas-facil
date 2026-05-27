export function formatBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "Enviada", cls: "bg-muted text-muted-foreground" },
    viewed: { label: "Visualizada", cls: "bg-accent text-accent-foreground" },
    approved: { label: "Aceita", cls: "bg-success/15 text-success" },
    in_progress: { label: "Em execução", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
    finished: { label: "Finalizada", cls: "bg-primary/15 text-primary" },
    paid: { label: "Paga", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    rejected: { label: "Recusada", cls: "bg-destructive/15 text-destructive" },
    canceled: { label: "Cancelada", cls: "bg-destructive/15 text-destructive" },
  };
  const s = map[status] ?? map.sent;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

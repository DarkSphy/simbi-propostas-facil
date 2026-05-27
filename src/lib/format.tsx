export function formatBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "Enviada", cls: "bg-muted text-muted-foreground" },
    viewed: { label: "Visualizada", cls: "bg-accent text-accent-foreground" },
    approved: { label: "Aprovada", cls: "bg-success/15 text-success" },
    rejected: { label: "Recusada", cls: "bg-destructive/15 text-destructive" },
  };
  const s = map[status] ?? map.sent;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

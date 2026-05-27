import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</span>
      <span className="text-lg">Simbi</span>
    </Link>
  );
}

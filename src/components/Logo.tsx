import { Link } from "@tanstack/react-router";

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className} ${inverted ? "text-white" : "text-foreground"}`}>
      <div className="relative flex shrink-0 items-center justify-center">
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-8 w-8"
        >
          {/* Círculo vazado (gap no canto superior direito) */}
          <path d="M12 4 A 14 14 0 1 0 28 20" />
          {/* Avião de papel minimalista saindo do círculo */}
          <path d="M28 4 L 11 11 L 17 15 L 21 24 L 28 4 Z" />
          <path d="M28 4 L 17 15" />
        </svg>
      </div>
      <span className="text-xl font-medium tracking-[0.2em] uppercase">
        Simbi
      </span>
    </Link>
  );
}

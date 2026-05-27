import { Link } from "@tanstack/react-router";

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-3 transition-opacity hover:opacity-90 ${className} ${inverted ? "text-white" : "text-foreground"}`}>
      <div className={`relative flex shrink-0 items-center justify-center ${inverted ? "text-white" : "text-primary"}`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-9 w-9"
        >
          {/* Top right dot */}
          <path d="M 18.5 4 L 19 4" />
          {/* Top curve */}
          <path d="M 14 4 L 10.5 4 A 5 5 0 0 0 10.5 14 L 14 14" />
          {/* Bottom left dot */}
          <path d="M 5 20 L 5.5 20" />
          {/* Bottom curve */}
          <path d="M 10 20 L 13.5 20 A 5 5 0 0 0 13.5 10 L 10 10" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[1.5rem] font-bold tracking-tight leading-none">
          Simbi
        </span>
        <span className={`text-[0.55rem] font-bold uppercase tracking-[0.2em] mt-1 ${inverted ? "text-white/80" : "text-primary"}`}>
          Propostas que fecham
        </span>
      </div>
    </Link>
  );
}

import { Link } from "@tanstack/react-router";

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-bold tracking-tight ${className} ${inverted ? "text-white" : "text-foreground"}`}>
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full drop-shadow-md">
          <defs>
            <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
            <linearGradient id="logo-s" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="10" fill="url(#logo-bg)" />
          <path d="M20 12C20 10.3431 18.6569 9 17 9H15C13.3431 9 12 10.3431 12 12C12 13.6569 13.3431 15 15 15H17C18.6569 15 20 16.3431 20 18C20 19.6569 18.6569 21 17 21H14" stroke="url(#logo-s)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="21" r="1.5" fill="white" />
        </svg>
      </div>
      <span className="text-2xl font-black tracking-tighter">
        Simbi<span className="text-primary">.</span>
      </span>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem("theme");
    
    const useDark = 
      initialTheme === "dark" || 
      (!initialTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (useDark) {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full border border-border bg-background/50 hover:bg-muted transition-colors"
      title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      {isDark ? (
        <Sun className="h-[1.15rem] w-[1.15rem] text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem] text-violet-500 transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-medium p-4 transition-all duration-300",
          description: "group-[.toast]:text-muted-foreground text-sm mt-1",
          success: "group-[.toaster]:border-emerald-500/40 group-[.toaster]:bg-emerald-50/90 dark:group-[.toaster]:bg-emerald-950/60 group-[.toaster]:text-emerald-800 dark:group-[.toaster]:text-emerald-300 backdrop-blur-md",
          error: "group-[.toaster]:border-red-500/40 group-[.toaster]:bg-red-50/90 dark:group-[.toaster]:bg-red-950/60 group-[.toaster]:text-red-800 dark:group-[.toaster]:text-red-300 backdrop-blur-md",
          info: "group-[.toaster]:border-blue-500/40 group-[.toaster]:bg-blue-50/90 dark:group-[.toaster]:bg-blue-950/60 group-[.toaster]:text-blue-800 dark:group-[.toaster]:text-blue-300 backdrop-blur-md",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold rounded-lg px-3 py-2",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-lg px-3 py-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

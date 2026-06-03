import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: "proposals" | "clients" | "items";
}

const LABELS = {
  proposals: { title: "Limite de propostas atingido", desc: "Você usou suas 5 propostas gratuitas deste mês." },
  clients: { title: "Limite de clientes atingido", desc: "Você cadastrou 10 clientes — o limite do plano gratuito." },
  items: { title: "Limite de itens atingido", desc: "Você cadastrou 10 itens — o limite do plano gratuito." },
};

export function UpgradeGate({ open, onOpenChange, resource }: Props) {
  const { title, desc } = LABELS[resource];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center p-8">
        <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-1">{desc}</p>
        <p className="text-sm text-muted-foreground mb-6">
          Faça upgrade para o <span className="font-semibold text-foreground">Plano Profissional</span> e tenha tudo ilimitado por <span className="font-semibold text-foreground">R$ 39,90/mês</span>.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link to="/upgrade" onClick={() => onOpenChange(false)}>
            <Sparkles className="h-4 w-4 mr-2" /> Fazer upgrade
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Garantia de 7 dias · Cancele quando quiser</p>
      </DialogContent>
    </Dialog>
  );
}

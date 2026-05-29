import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Settings2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface PrintSettings {
  margin: 'compact' | 'default' | 'wide';
  font: 'inter' | 'playfair' | 'quicksand' | 'courier';
  showLogo: boolean;
  showFooter: boolean;
  ecoMode: boolean;
}

interface PrintCustomizerProps {
  settings: PrintSettings;
  onChange: (s: PrintSettings) => void;
  onPrint: () => void;
}

export function PrintCustomizer({ settings, onChange, onPrint }: PrintCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-card text-card-foreground border border-border shadow-xl rounded-2xl p-5 w-80 mb-2 animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Configurar PDF
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Margens</label>
              <select 
                className="w-full flex h-9 items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.margin} 
                onChange={e => updateSetting('margin', e.target.value as any)}
              >
                <option value="compact" className="text-foreground bg-background">Compacta (Estreita)</option>
                <option value="default" className="text-foreground bg-background">Padrão</option>
                <option value="wide" className="text-foreground bg-background">Larga (Espaçosa)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Tipografia PDF</label>
              <select 
                className="w-full flex h-9 items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={settings.font} 
                onChange={e => updateSetting('font', e.target.value as any)}
              >
                <option value="inter" className="text-foreground bg-background">Inter (Sem serifa)</option>
                <option value="playfair" className="text-foreground bg-background">Playfair (Com serifa)</option>
                <option value="quicksand" className="text-foreground bg-background">Quicksand (Arredondada)</option>
                <option value="courier" className="text-foreground bg-background">Courier (Monospace)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="font-medium cursor-pointer" htmlFor="showLogo">Exibir Logotipo</label>
              <Switch id="showLogo" checked={settings.showLogo} onCheckedChange={c => updateSetting('showLogo', c)} />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-medium cursor-pointer" htmlFor="showFooter">Exibir Rodapé Simbi</label>
              <Switch id="showFooter" checked={settings.showFooter} onCheckedChange={c => updateSetting('showFooter', c)} />
            </div>

            <div className="flex items-center justify-between pb-2">
              <label className="font-medium cursor-pointer" htmlFor="ecoMode">Modo Econômico (P&B)</label>
              <Switch id="ecoMode" checked={settings.ecoMode} onCheckedChange={c => updateSetting('ecoMode', c)} />
            </div>

            <Button className="w-full mt-4 font-bold" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-2xl h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          <Settings2 className="w-5 h-5 mr-2" />
          Personalizar PDF
        </Button>
      )}
    </div>
  );
}

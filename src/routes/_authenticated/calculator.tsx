import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/format";
import { Calculator as CalcIcon, DollarSign, Clock, Wrench, Receipt, Percent, Info, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({ meta: [{ title: "Calculadora de Custos · Simbi" }] }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [materialCost, setMaterialCost] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [overhead, setOverhead] = useState<string>("");
  const [margin, setMargin] = useState<string>("30");

  // Calculate numbers
  const valMaterial = Number(materialCost) || 0;
  const valHours = Number(hours) || 0;
  const valHourlyRate = Number(hourlyRate) || 0;
  const valOverhead = Number(overhead) || 0;
  let valMargin = Number(margin) || 0;
  
  if (valMargin >= 100) valMargin = 99.9; // Prevent division by zero or negative prices

  const laborCost = valHours * valHourlyRate;
  const totalCost = valMaterial + laborCost + valOverhead;
  const suggestedPrice = totalCost / (1 - valMargin / 100);
  const profit = suggestedPrice - totalCost;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Calculadora de Preço Ideal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Descubra o preço mínimo para não ter prejuízo e o valor ideal para garantir seu lucro.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <CalcIcon className="h-5 w-5 text-primary" /> 
              Custos do Serviço
            </h2>
            
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-muted-foreground font-semibold"><PackageIcon /> Materiais e Peças</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" min="0" step="0.01" className="pl-9 h-12 text-lg" placeholder="0.00" value={materialCost} onChange={(e) => setMaterialCost(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">O que você gasta comprando peças ou insumos para esse serviço.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground font-semibold"><Clock className="h-4 w-4" /> Horas Estimadas</Label>
                  <Input type="number" min="0" step="0.5" className="h-12 text-lg" placeholder="Ex: 2" value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground font-semibold"><Wrench className="h-4 w-4" /> Valor da sua Hora</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="0" step="0.01" className="pl-9 h-12 text-lg" placeholder="0.00" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-muted-foreground font-semibold"><Receipt className="h-4 w-4" /> Custos Fixos (Rateio)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" min="0" step="0.01" className="pl-9 h-12 text-lg" placeholder="0.00" value={overhead} onChange={(e) => setOverhead(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">Um valor estimado para cobrir gasolina, aluguel, luz e desgaste de ferramentas.</p>
              </div>

              <div className="pt-4 border-t border-border mt-2">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-primary font-bold"><Percent className="h-4 w-4" /> Margem de Lucro Desejada</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" min="0" max="99" step="1" className="h-12 text-lg w-24 font-bold" placeholder="30" value={margin} onChange={(e) => setMargin(e.target.value)} />
                    <span className="text-lg font-bold text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Quanto de lucro limpo você quer colocar no bolso após cobrir todos os custos.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <CalcIcon className="w-32 h-32" />
            </div>
            
            <h2 className="text-lg font-bold text-gray-300 mb-6">Resultado do Cálculo</h2>

            <div className="space-y-6 relative z-10">
              
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Custo Total (Mínimo)
                  <div className="group relative cursor-help">
                    <Info className="h-4 w-4 text-gray-500" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-black p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      Preço de custo. Se cobrar menos que isso, você paga para trabalhar.
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-3xl font-bold text-gray-100">{formatBRL(totalCost)}</div>
                {totalCost > 0 && (
                  <div className="mt-2 text-xs text-gray-400 space-y-1">
                    {valMaterial > 0 && <div>Material: {formatBRL(valMaterial)}</div>}
                    {laborCost > 0 && <div>Mão de Obra: {formatBRL(laborCost)}</div>}
                    {valOverhead > 0 && <div>Custos Fixos: {formatBRL(valOverhead)}</div>}
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-700/50 w-full" />

              <div>
                <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
                  Preço Sugerido
                </div>
                <div className="mt-1 text-5xl font-black text-white glow-text-emerald">
                  {formatBRL(suggestedPrice)}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Lucro Líquido: {formatBRL(profit)}
                </div>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 text-sm text-blue-800 shadow-sm">
            <p className="font-bold mb-1 flex items-center gap-2"><Info className="h-4 w-4" /> Como funciona?</p>
            <p className="leading-relaxed">
              O Simbi usa a fórmula de <strong>Markup Divisor</strong>. Isso garante que a sua margem seja calculada sobre o <em>preço de venda</em> e não sobre o custo. Se você quer 30% de lucro, ao cobrar o preço sugerido, 30% exatos desse valor irão para o seu bolso como lucro líquido.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><polyline points="12 22 12 12"/></svg>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Route = createFileRoute("/os/$id")({
  component: OSPrintPage,
});

function OSPrintPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login", replace: true });
  }, [user, authLoading, navigate]);

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["os", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, clients(*)")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();
      if (error) {
        console.error("OS Supabase Error:", error);
        throw error;
      }
      
      // Fetch profile separately since there is no direct foreign key
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      
      const { data: items, error: itemsError } = await supabase
        .from("proposal_items")
        .select("*")
        .eq("proposal_id", id)
        .order("sort_order");
      if (itemsError) throw itemsError;

      return { ...data, profiles: profile, items };
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando Ordem de Serviço...</div>;
  if (!proposal) return <div className="p-8 text-center text-red-500">Ordem de Serviço não encontrada.</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:p-0 print:bg-white text-gray-900 font-sans">
      
      {/* Botões de Ação - Escondidos na Impressão */}
      <div className="mx-auto max-w-4xl mb-6 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => navigate({ to: "/work-orders" })} className="bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Printer className="mr-2 h-4 w-4" /> Imprimir OS
        </Button>
      </div>

      {/* Papel A4 / Documento OS */}
      <div className="mx-auto max-w-4xl bg-white shadow-xl sm:rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Cabeçalho */}
        <div className="border-b-4 border-gray-900 p-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900">Ordem de Serviço</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">OS N°: {proposal.id.split("-")[0].toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">{(proposal.profiles as any)?.full_name ?? "Profissional"}</h2>
            <p className="text-sm text-gray-500 mt-1">Gerada em: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Dados do Cliente */}
          <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Dados do Cliente</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold text-gray-900">Nome:</span> {(proposal.clients as any)?.name}</p>
                <p><span className="font-semibold text-gray-900">Documento:</span> {(proposal.clients as any)?.document || "—"}</p>
                <p><span className="font-semibold text-gray-900">Telefone:</span> {(proposal.clients as any)?.phone || "—"}</p>
                <p><span className="font-semibold text-gray-900">Email:</span> {(proposal.clients as any)?.email || "—"}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Endereço e Local</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-800">{(proposal.clients as any)?.address || "Endereço não cadastrado."}</p>
              </div>
            </div>
          </div>

          {/* Dados do Serviço/Projeto */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-2">Referência do Serviço</h3>
            <p className="font-bold text-lg text-gray-900">{proposal.title}</p>
            {proposal.description && (
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{proposal.description}</p>
            )}
          </div>

          {/* Tabela de Itens */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Escopo de Execução</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900 text-sm">
                  <th className="py-3 px-2 font-bold text-gray-900">Item / Descrição</th>
                  <th className="py-3 px-2 font-bold text-gray-900 w-24 text-center">Qtd</th>
                  <th className="py-3 px-2 font-bold text-gray-900 w-32 text-right">Valor Unit.</th>
                  <th className="py-3 px-2 font-bold text-gray-900 w-32 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {proposal.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4 px-2">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      {item.description && <div className="text-gray-500 mt-1 text-xs">{item.description}</div>}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-900">{item.quantity}</td>
                    <td className="py-4 px-2 text-right text-gray-900">{formatBRL(Number(item.price))}</td>
                    <td className="py-4 px-2 text-right font-semibold text-gray-900">{formatBRL(Number(item.price) * Number(item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900">
                  <td colSpan={3} className="py-4 px-2 text-right font-bold uppercase tracking-wider text-gray-500 text-xs">Total do Serviço</td>
                  <td className="py-4 px-2 text-right font-black text-lg text-gray-900">{formatBRL(Number(proposal.total))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Campo para Observações Técnicas (Preenchimento manual pós-impressão) */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Observações Técnicas / Relatório</h3>
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg"></div>
          </div>

          {/* Assinaturas */}
          <div className="mt-16 grid grid-cols-2 gap-16 pt-8">
            <div className="text-center">
              <div className="border-t border-gray-900 pt-2">
                <p className="font-bold text-sm text-gray-900">{(proposal.profiles as any)?.full_name ?? "Profissional Responsável"}</p>
                <p className="text-xs text-gray-500">Assinatura do Profissional</p>
                <p className="text-xs text-gray-400 mt-4">Data: ___/___/20___</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-900 pt-2">
                <p className="font-bold text-sm text-gray-900">{(proposal.clients as any)?.name ?? "Cliente"}</p>
                <p className="text-xs text-gray-500">Aceite e Aprovação</p>
                <p className="text-xs text-gray-400 mt-4">Data: ___/___/20___</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileSignature, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { SignatureCanvas } from "@/components/SignatureCanvas";

export const Route = createFileRoute("/c/$contractSlug")({
  component: PublicContractPage,
});

function PublicContractPage() {
  const { contractSlug } = Route.useParams();
  const qc = useQueryClient();
  const [showCanvas, setShowCanvas] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["public_contract", contractSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, proposals(title, clients(name))")
        .eq("public_slug", contractSlug)
        .single();
      
      if (error) {
        console.error("Contract fetch error:", error);
        throw error;
      }
      return data;
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground min-h-screen flex items-center justify-center bg-gray-100">Carregando documento...</div>;
  if (!contract) return <div className="p-8 text-center text-red-500 min-h-screen flex items-center justify-center bg-gray-100">Contrato não encontrado ou indisponível.</div>;

  const isSignedByPro = !!contract.professional_signature;
  const isSignedByClient = !!contract.client_signature;

  const handleClientSign = async (signatureData: string) => {
    // Because we use RLS, we need to ensure the public policy allows anonymous updates.
    // The policy "Anyone can update contracts by slug" allows this.
    const { error } = await supabase
      .from("contracts")
      .update({ 
        client_signature: signatureData,
        status: 'signed'
      })
      .eq("public_slug", contractSlug);
    
    if (error) { 
      toast.error("Erro ao salvar assinatura. Tente novamente."); 
      console.error(error);
      return; 
    }
    
    toast.success("Contrato assinado com sucesso!");
    setShowCanvas(false);
    qc.invalidateQueries({ queryKey: ["public_contract", contractSlug] });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-8 print:p-0 print:bg-white text-gray-900 font-sans">
      
      {/* Header / Actions - Hidden on Print */}
      <div className="mx-auto max-w-4xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Documento Digital</h1>
          <p className="text-sm text-gray-500">Leia atentamente antes de assinar.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="bg-white">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Documento
          </Button>
        </div>
      </div>

      {/* Contract Paper */}
      <div className="mx-auto max-w-4xl bg-white shadow-xl sm:rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Document Status Banner */}
        {(isSignedByClient || isSignedByPro) && (
          <div className={`${isSignedByClient ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-blue-50 border-blue-100 text-blue-800'} border-b px-8 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden`}>
            {isSignedByClient ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <Lock className="h-6 w-6 shrink-0" />}
            <span className="font-medium text-sm text-center">
              {isSignedByClient 
                ? "Este contrato foi assinado digitalmente e possui validade legal. O documento está bloqueado para edições." 
                : "Este documento já recebeu assinaturas e está bloqueado para alterações, garantindo a segurança jurídica das partes."}
            </span>
          </div>
        )}

        <div className="p-8 sm:p-16 print:p-0">
          
          {/* Content */}
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-800">
            <div className="whitespace-pre-wrap leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: contract.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>

          {/* Signatures Area */}
          <div className="mt-20 grid sm:grid-cols-2 gap-12 sm:gap-16">
            
            {/* Professional Signature (Already signed usually) */}
            <div className="flex flex-col items-center">
              {isSignedByPro ? (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <img src={contract.professional_signature} alt="Assinatura Profissional" className="max-h-full max-w-full" />
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                    Contratado(a) / Vendedor(a)
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400 font-mono text-center">Assinado Eletronicamente</div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 w-full flex items-center justify-center mb-2 text-gray-300 text-sm italic print:text-transparent">
                    Aguardando assinatura
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700 mt-auto">
                    Contratado(a) / Vendedor(a)
                  </div>
                </div>
              )}
            </div>

            {/* Client Signature */}
            <div className="flex flex-col items-center">
              {isSignedByClient ? (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <img src={contract.client_signature} alt="Sua Assinatura" className="max-h-full max-w-full" />
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                    {contract.proposals?.clients?.name || "Contratante / Comprador(a)"}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400 font-mono text-center">Assinado Eletronicamente</div>
                </div>
              ) : showCanvas ? (
                <div className="w-full print:hidden bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-center text-sm font-semibold mb-4 text-gray-700">Desenhe sua assinatura abaixo:</p>
                  <SignatureCanvas onSave={handleClientSign} onClear={() => {}} />
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-gray-500" onClick={() => setShowCanvas(false)}>Cancelar</Button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 w-full flex flex-col items-center justify-center mb-2 print:hidden gap-3">
                    <span className="text-sm text-amber-600 font-medium">Ação Necessária:</span>
                    <Button onClick={() => setShowCanvas(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md">
                      <FileSignature className="mr-2 h-5 w-5" /> Assinar Documento
                    </Button>
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700 mt-auto">
                    {contract.proposals?.clients?.name || "Contratante / Comprador(a)"}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer Branding - Hidden on Print */}
      <div className="mt-12 text-center text-sm text-gray-400 print:hidden">
        <p>Documento gerado através da plataforma <span className="font-semibold text-gray-500">Simbi</span></p>
      </div>
    </div>
  );
}

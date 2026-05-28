import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Printer, Share2, CheckCircle2, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { SignatureCanvas } from "@/components/SignatureCanvas";

export const Route = createFileRoute("/_authenticated/contract/$id")({
  component: ContractDetailsPage,
});

function ContractDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, proposals(title, clients(name))")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (contract && !content) {
      setContent(contract.content);
    }
  }, [contract]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando contrato...</div>;
  if (!contract) return <div className="p-8 text-center text-red-500">Contrato não encontrado.</div>;

  const handleSaveText = async () => {
    setSaving(true);
    const { error } = await supabase.from("contracts").update({ content }).eq("id", contract.id);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar."); return; }
    toast.success("Texto atualizado com sucesso!");
    setIsEditing(false);
    qc.invalidateQueries({ queryKey: ["contract", id] });
  };

  const handleProfessionalSign = async (signatureData: string) => {
    const { error } = await supabase
      .from("contracts")
      .update({ 
        professional_signature: signatureData,
        status: contract.status === 'draft' ? 'sent' : contract.status
      })
      .eq("id", contract.id);
    
    if (error) { toast.error("Erro ao assinar."); return; }
    toast.success("Assinatura salva com sucesso!");
    setShowCanvas(false);
    qc.invalidateQueries({ queryKey: ["contract", id] });
  };

  const shareLink = () => {
    const url = `${window.location.origin}/c/${contract.public_slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado! Envie para o seu cliente pelo WhatsApp.");
    
    // Auto update status to sent if it's draft
    if (contract.status === 'draft') {
      supabase.from("contracts").update({ status: 'sent' }).eq("id", contract.id).then(() => {
        qc.invalidateQueries({ queryKey: ["contract", id] });
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isSignedByPro = !!contract.professional_signature;
  const isSignedByClient = !!contract.client_signature;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 print:p-0 print:max-w-none print:w-full font-sans">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/contracts" })} size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contrato: {contract.proposals?.title}</h1>
            <p className="text-sm text-muted-foreground">Cliente: {contract.proposals?.clients?.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
          </Button>
          <Button onClick={shareLink} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Share2 className="mr-2 h-4 w-4" /> Link para o Cliente
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Status Bar */}
        <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-4 text-sm print:hidden">
          <div className="flex items-center gap-2 font-medium">
            Status: 
            {contract.status === 'signed' ? <span className="text-emerald-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Assinado</span> : 
             contract.status === 'sent' ? <span className="text-blue-600">Aguardando Cliente</span> : 
             <span className="text-amber-600">Rascunho (Não enviado)</span>}
          </div>
        </div>

        <div className="p-8 sm:p-12 print:p-0">
          {/* Contract Text */}
          {isEditing ? (
            <div className="space-y-4 print:hidden">
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="min-h-[500px] font-mono text-sm leading-relaxed" 
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setContent(contract.content); setIsEditing(false); }}>Cancelar</Button>
                <Button onClick={handleSaveText} disabled={saving}><Save className="mr-2 h-4 w-4" /> Salvar Alterações</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-800">
              <div className="whitespace-pre-wrap leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              
              <div className="mt-6 flex justify-end print:hidden">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Editar Texto do Contrato</Button>
              </div>
            </div>
          )}

          {/* Signatures Area */}
          <div className="mt-16 grid sm:grid-cols-2 gap-12">
            
            {/* Professional Signature */}
            <div className="flex flex-col items-center">
              {isSignedByPro ? (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <img src={contract.professional_signature} alt="Assinatura Profissional" className="max-h-full max-w-full" />
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                    Contratado(a) / Vendedor(a)
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 print:hidden text-muted-foreground text-xs" onClick={() => setShowCanvas(true)}>
                    Assinar Novamente
                  </Button>
                </div>
              ) : showCanvas ? (
                <div className="w-full print:hidden">
                  <p className="text-center text-sm font-semibold mb-2">Desenhe sua assinatura abaixo:</p>
                  <SignatureCanvas onSave={handleProfessionalSign} onClear={() => {}} />
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowCanvas(false)}>Cancelar</Button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 w-full flex items-center justify-center mb-2 print:hidden">
                    <Button onClick={() => setShowCanvas(true)} variant="outline" className="border-dashed h-20 w-full text-muted-foreground bg-muted/20">
                      <FileSignature className="mr-2 h-5 w-5" /> Assinar Digitalmente
                    </Button>
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
                    <img src={contract.client_signature} alt="Assinatura Cliente" className="max-h-full max-w-full" />
                  </div>
                  <div className="w-full border-t border-gray-900 pt-2 text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                    {contract.proposals?.clients?.name || "Contratante / Comprador(a)"}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400 font-mono text-center">Assinado via Link Seguro</div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="h-32 w-full flex items-center justify-center mb-2 text-gray-300 text-sm italic print:text-transparent">
                    Aguardando assinatura do cliente
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
    </div>
  );
}

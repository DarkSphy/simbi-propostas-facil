import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileSignature, Trash2, Edit, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SERVICE_CONTRACT_TEMPLATE, PRODUCT_CONTRACT_TEMPLATE } from "@/lib/templates";
import { formatBRL } from "@/lib/format";
import { getErrorMessage } from "@/lib/utils/error";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({ meta: [{ title: "Contratos · Simbi" }] }),
  component: ContractsPage,
});

function ContractsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [contractType, setContractType] = useState<"service" | "product">("service");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Contracts
  const { data: contracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, proposals(title, clients(name))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch Proposals for Dropdown
  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: ["proposals", "dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, title, status, total, clients(*), proposal_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch Profile for professional data
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredContracts = contracts.filter((c: any) => 
    c.proposals?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.proposals?.clients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Assinado</span>;
      case 'sent': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Enviado</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">Rascunho</span>;
    }
  };

  async function handleGenerateContract() {
    if (!selectedProposalId || !profile || !user) {
      toast.error("Selecione uma proposta válida");
      return;
    }

    setIsGenerating(true);
    try {
      const proposal = proposals.find(p => p.id === selectedProposalId);
      if (!proposal) throw new Error("Proposta não encontrada");

      // Replace tags
      let content = contractType === "service" ? SERVICE_CONTRACT_TEMPLATE : PRODUCT_CONTRACT_TEMPLATE;
      const client = proposal.clients as any;
      const prof = profile as any;

      content = content.replace(/{{PROFESSIONAL_NAME}}/g, prof.full_name || prof.company_name || "_______________");
      content = content.replace(/{{PROFESSIONAL_DOCUMENT}}/g, prof.document || "_______________");
      content = content.replace(/{{PROFESSIONAL_ADDRESS}}/g, prof.address || "_______________");
      
      content = content.replace(/{{CLIENT_NAME}}/g, client.name || "_______________");
      content = content.replace(/{{CLIENT_DOCUMENT}}/g, client.document || "_______________");
      content = content.replace(/{{CLIENT_ADDRESS}}/g, client.address || "_______________");

      content = content.replace(/{{PROPOSAL_TITLE}}/g, proposal.title || "Proposta");
      content = content.replace(/{{PROPOSAL_TOTAL}}/g, formatBRL(Number(proposal.total)));

      const itemsList = proposal.proposal_items?.map((i: any) => `- ${i.quantity}x ${i.description} (${formatBRL(Number(i.unit_price))})`).join("\n") || "Nenhum item.";
      content = content.replace(/{{PROPOSAL_ITEMS}}/g, itemsList);

      const { data, error } = await supabase.from("contracts").insert({
        user_id: user.id,
        proposal_id: proposal.id,
        type: contractType,
        content: content,
        status: "draft"
      }).select("id").single();

      if (error) throw error;
      toast.success("Contrato gerado com sucesso!");
      setIsNewOpen(false);
      qc.invalidateQueries({ queryKey: ["contracts"] });
      
      // Navigate to contract detail
      if (data) navigate({ to: `/contract/${data.id}` });

    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar contrato");
    } finally {
      setIsGenerating(false);
    }
  }

  async function removeContract(id: string) {
    if (!confirm("Deseja realmente excluir este contrato?")) return;
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) { toast.error(getErrorMessage(error)); return; }
    toast.success("Contrato excluído!");
    qc.invalidateQueries({ queryKey: ["contracts"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente ou título..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-card"
            />
          </div>
          <Button className="rounded-full whitespace-nowrap" onClick={() => setIsNewOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Gerar Contrato
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        {loadingContracts ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando contratos…</div>
        ) : contracts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent"><FileSignature className="h-5 w-5 text-accent-foreground" /></div>
            <h3 className="mt-3 font-semibold">Nenhum contrato</h3>
            <p className="mt-1 text-sm text-muted-foreground">Você ainda não gerou nenhum contrato.</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum contrato encontrado para essa busca.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredContracts.map((c: any) => (
              <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="truncate font-bold text-base">{c.proposals?.title}</div>
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>Cliente: {c.proposals?.clients?.name}</span>
                    <span>•</span>
                    <span>{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/contract/${c.id}` })}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  {c.public_slug && (
                    <Button variant="ghost" size="icon" onClick={() => window.open(`/c/${c.public_slug}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeContract(c.id)}>
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Novo Contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecione a Proposta base</Label>
              <Select value={selectedProposalId} onValueChange={setSelectedProposalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma proposta" />
                </SelectTrigger>
                <SelectContent>
                  {proposals.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} - {p.clients?.name} ({formatBRL(Number(p.total))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Contrato</Label>
              <Select value={contractType} onValueChange={(val: any) => setContractType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Prestação de Serviço</SelectItem>
                  <SelectItem value="product">Venda de Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md mt-4">
              <strong>Atenção:</strong> Certifique-se de que o seu Perfil e o Cliente possuam os dados de CPF/CNPJ e Endereço preenchidos para gerar o contrato corretamente.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerateContract} disabled={isGenerating || !selectedProposalId}>
              {isGenerating ? "Gerando..." : "Gerar Contrato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

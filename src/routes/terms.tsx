import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Termos de Uso · Simbi" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Link>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold tracking-tight mb-8">Termos de Uso</h1>
          
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Simbi, você concorda em cumprir e ficar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">2. Descrição do Serviço</h2>
            <p>
              O Simbi é uma plataforma SaaS (Software as a Service) projetada para facilitar a criação, 
              envio e gerenciamento de propostas comerciais e orçamentos para profissionais autônomos 
              e pequenas empresas. O serviço permite gerenciar clientes, itens de catálogo e acompanhar 
              o status de aprovação de orçamentos.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">3. Contas de Usuário</h2>
            <p>
              Para utilizar as funcionalidades do Simbi, você precisará criar uma conta. 
              Você é responsável por manter a confidencialidade das credenciais da sua conta e por 
              todas as atividades que ocorrem sob ela. Você concorda em nos notificar imediatamente 
              sobre qualquer uso não autorizado da sua conta.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">4. Conduta do Usuário</h2>
            <p>
              Você concorda em usar o serviço apenas para fins legais e da forma como foi concebido. 
              É estritamente proibido:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o serviço para enviar propostas enganosas, fraudulentas ou ilícitas.</li>
              <li>Tentar violar a segurança ou integridade do sistema.</li>
              <li>Fazer upload de conteúdo que infrinja direitos de propriedade intelectual de terceiros.</li>
              <li>Revender ou distribuir o acesso à sua conta para terceiros.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">5. Propriedade Intelectual</h2>
            <p>
              O design, código-fonte, marca e todos os elementos visuais do Simbi são de nossa 
              propriedade exclusiva. O conteúdo gerado por você (suas propostas, logos e dados de clientes) 
              pertence exclusivamente a você.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">6. Limitação de Responsabilidade</h2>
            <p>
              O Simbi fornece as ferramentas para emissão de propostas, mas não tem qualquer 
              envolvimento nas negociações comerciais entre você e seus clientes. Não garantimos o 
              fechamento de negócios e não nos responsabilizamos por perdas financeiras decorrentes 
              do uso da plataforma.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">7. Modificações do Serviço</h2>
            <p>
              Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do 
              serviço a qualquer momento, com ou sem aviso prévio. Também podemos alterar estes termos, 
              e o uso continuado da plataforma após as alterações constituirá sua aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">8. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato através dos nossos 
              canais oficiais de suporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

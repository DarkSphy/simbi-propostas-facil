import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Política de Privacidade · Simbi" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Link>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold tracking-tight mb-8">Política de Privacidade</h1>
          
          <p className="text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">1. Informações Gerais</h2>
            <p>
              A sua privacidade é fundamental para nós. Esta Política de Privacidade descreve como o Simbi coleta, usa, protege e compartilha suas informações pessoais e os dados dos seus negócios quando você utiliza nossa plataforma.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">2. Coleta de Dados</h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Registro:</strong> Nome, e-mail e senha para criação da sua conta.</li>
              <li><strong>Dados do Perfil Profissional:</strong> Nome da empresa, logotipo, telefone de contato (WhatsApp), identidade visual (cores/fontes) e links de redes sociais.</li>
              <li><strong>Dados de Clientes e Propostas:</strong> Informações sobre seus clientes (nomes, documentos, telefones) e os detalhes comerciais das propostas que você cria na plataforma.</li>
              <li><strong>Dados de Uso e Navegação:</strong> Informações geradas automaticamente sobre como você interage com nossa plataforma para fins de melhoria de desempenho.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">3. Uso das Informações</h2>
            <p>Utilizamos seus dados para os seguintes propósitos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter o serviço de emissão e gerenciamento de propostas.</li>
              <li>Autenticar seu acesso à plataforma de forma segura.</li>
              <li>Gerar os links públicos (SaaS) das suas propostas para seus clientes.</li>
              <li>Comunicar atualizações do sistema, avisos de segurança ou informações relevantes para o seu plano.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">4. Compartilhamento de Dados</h2>
            <p>
              Nós <strong>não vendemos</strong> suas informações pessoais nem os dados comerciais das suas propostas para terceiros. Seus dados só são compartilhados:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com seus clientes, estritamente através dos links públicos das propostas que você gerar e decidir enviar para eles.</li>
              <li>Com prestadores de serviços essenciais (provedores de hospedagem em nuvem, bancos de dados) que nos ajudam a manter a plataforma no ar sob rigorosos acordos de confidencialidade.</li>
              <li>Em caso de exigência legal ou determinação judicial.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">5. Segurança dos Dados</h2>
            <p>
              Empregamos medidas de segurança rígidas (como criptografia em trânsito e em repouso via provedores confiáveis de nuvem) para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição acidental. No entanto, nenhum método de transmissão na internet é 100% seguro.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">6. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou solicitar a exclusão permanente de seus dados e de sua conta a qualquer momento diretamente nas configurações do sistema ou entrando em contato com nosso suporte.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">7. Contato</h2>
            <p>
              Se tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre como gerenciamos seus dados, entre em contato através dos nossos canais de atendimento oficiais.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

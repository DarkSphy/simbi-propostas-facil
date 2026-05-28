export const SERVICE_CONTRACT_TEMPLATE = `
**CONTRATO DE PRESTAÇÃO DE SERVIÇOS**

**CONTRATADO(A):** {{PROFESSIONAL_NAME}}, inscrito(a) no CPF/CNPJ nº {{PROFESSIONAL_DOCUMENT}}, com endereço em {{PROFESSIONAL_ADDRESS}}.

**CONTRATANTE:** {{CLIENT_NAME}}, inscrito(a) no CPF/CNPJ nº {{CLIENT_DOCUMENT}}, com endereço em {{CLIENT_ADDRESS}}.

Pelo presente instrumento particular, as partes acima qualificadas celebram o presente Contrato de Prestação de Serviços, regido pelas cláusulas e condições seguintes:

**CLÁUSULA PRIMEIRA - DO OBJETO**
O presente contrato tem por objeto a prestação dos serviços descritos na proposta aprovada (Ref: {{PROPOSAL_TITLE}}), cujo escopo encontra-se detalhado a seguir:
{{PROPOSAL_ITEMS}}

**CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO**
Pela prestação dos serviços ora contratados, a CONTRATANTE pagará ao(à) CONTRATADO(A) o valor total de {{PROPOSAL_TOTAL}}, conforme as condições previamente acordadas entre as partes na proposta original.

**CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DAS PARTES**
I - O(A) CONTRATADO(A) obriga-se a prestar os serviços com zelo, diligência e no prazo estipulado.
II - A CONTRATANTE obriga-se a fornecer todas as informações e condições necessárias para a execução dos serviços, além de efetuar o pagamento nos prazos estipulados.

**CLÁUSULA QUARTA - DA RESCISÃO**
O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio, sujeitando-se a parte infratora ao pagamento de multa proporcional aos serviços já executados.

**CLÁUSULA QUINTA - DO FORO**
Fica eleito o foro da comarca de domicílio do(a) CONTRATADO(A) para dirimir quaisquer dúvidas oriundas deste contrato.

E, por estarem assim justos e contratados, assinam o presente instrumento.
`;

export const PRODUCT_CONTRACT_TEMPLATE = `
**CONTRATO DE COMPRA E VENDA DE PRODUTOS**

**VENDEDOR(A):** {{PROFESSIONAL_NAME}}, inscrito(a) no CPF/CNPJ nº {{PROFESSIONAL_DOCUMENT}}, com endereço em {{PROFESSIONAL_ADDRESS}}.

**COMPRADOR(A):** {{CLIENT_NAME}}, inscrito(a) no CPF/CNPJ nº {{CLIENT_DOCUMENT}}, com endereço em {{CLIENT_ADDRESS}}.

Pelo presente instrumento particular, as partes acima qualificadas celebram o presente Contrato de Compra e Venda, regido pelas cláusulas e condições seguintes:

**CLÁUSULA PRIMEIRA - DO OBJETO**
O presente contrato tem por objeto a venda dos produtos descritos na proposta (Ref: {{PROPOSAL_TITLE}}), especificados a seguir:
{{PROPOSAL_ITEMS}}

**CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO**
Pela compra dos produtos, o(a) COMPRADOR(A) pagará ao(à) VENDEDOR(A) o valor total de {{PROPOSAL_TOTAL}}, conforme as condições de pagamento previamente acordadas.

**CLÁUSULA TERCEIRA - DA ENTREGA E PRAZOS**
O(A) VENDEDOR(A) compromete-se a entregar os produtos no prazo estipulado após a confirmação do pagamento. O(A) COMPRADOR(A) deverá verificar os produtos no ato do recebimento.

**CLÁUSULA QUARTA - DA GARANTIA E DEVOLUÇÃO**
Os produtos comercializados possuem garantia legal contra defeitos de fabricação. Trocas e devoluções obedecerão ao Código de Defesa do Consumidor.

**CLÁUSULA QUINTA - DO FORO**
Fica eleito o foro da comarca de domicílio do(a) VENDEDOR(A) para dirimir quaisquer dúvidas oriundas deste contrato.

E, por estarem assim justos e contratados, assinam o presente instrumento.
`;

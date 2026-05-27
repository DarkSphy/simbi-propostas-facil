-- Adiciona suporte a cor de fundo customizada para a proposta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_color text;

-- Atualiza a estrutura do banco imediatamente
NOTIFY pgrst, 'reload schema';

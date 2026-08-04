-- Adicionando campos globais de cobrança no perfil do usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pix_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_billing_message TEXT DEFAULT 'Olá {nome_cliente}, sua fatura do plano {plano} no valor de {valor} vence no dia {vencimento}. Para pagar via PIX, use a chave: {pix}';

-- Tabela de Cobranças Recorrentes (Planos/Assinaturas dos clientes do usuário)
CREATE TABLE public.recurring_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    plan_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    interval_months INTEGER NOT NULL DEFAULT 1, -- 1 = Mensal, 3 = Trimestral, etc.
    
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE NOT NULL,
    
    active BOOLEAN NOT NULL DEFAULT true,
    
    custom_pix_key TEXT,
    custom_payment_link TEXT,
    custom_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Histórico/Parcelas Geradas (Charge Installments)
CREATE TABLE public.charge_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_charge_id UUID NOT NULL REFERENCES public.recurring_charges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
    paid_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.recurring_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring charges" ON public.recurring_charges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own charge installments" ON public.charge_installments
    FOR ALL USING (auth.uid() = user_id);

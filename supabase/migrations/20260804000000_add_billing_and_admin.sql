-- Adicionar novas colunas na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '7 days');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_expires_at timestamptz;

-- Atualizar trigger handle_new_user para pegar whatsapp e definir trial_ends_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name, whatsapp, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'whatsapp',
    now() + interval '7 days'
  );
  RETURN NEW;
END;
$$;

-- Criar função RPC para Admin ativar PRO (adiciona 30 dias a partir da data atual ou do fim do vencimento se ainda válido)
CREATE OR REPLACE FUNCTION public.activate_pro_by_admin(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role text;
  v_current_expires timestamptz;
  v_new_expires timestamptz;
BEGIN
  -- Verificar se quem chama é admin
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ativar planos.';
  END IF;

  -- Calcular nova data (30 dias)
  SELECT pro_expires_at INTO v_current_expires FROM public.profiles WHERE id = target_user_id;
  
  IF v_current_expires IS NOT NULL AND v_current_expires > now() THEN
    v_new_expires := v_current_expires + interval '30 days';
  ELSE
    v_new_expires := now() + interval '30 days';
  END IF;

  UPDATE public.profiles SET pro_expires_at = v_new_expires WHERE id = target_user_id;
END;
$$;

-- Função para Admin ajustar datas manualmente
CREATE OR REPLACE FUNCTION public.update_user_dates_by_admin(target_user_id uuid, p_trial_ends_at timestamptz, p_pro_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  UPDATE public.profiles 
  SET trial_ends_at = p_trial_ends_at, pro_expires_at = p_pro_expires_at
  WHERE id = target_user_id;
END;
$$;

-- Função para Admin deletar um usuário
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  -- Exclui o auth.users, o que deve gerar CASCADE no profile e outras tabelas vinculadas
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

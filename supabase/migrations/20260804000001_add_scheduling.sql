-- 1. Add columns to profiles for settings
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS scheduling_settings JSONB DEFAULT '{"enabled": false, "start_time": "09:00", "end_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00", "slot_duration": 60, "work_days": [1,2,3,4,5]}';

-- 2. Add columns to appointments for guest details
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 3. RPC to get booked slots for a specific date and profile slug
CREATE OR REPLACE FUNCTION get_public_booked_slots(p_profile_slug TEXT, p_date DATE)
RETURNS TABLE (booked_time TIME)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from slug
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE profile_slug = p_profile_slug
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN QUERY
  SELECT time::TIME
  FROM public.appointments
  WHERE user_id = v_user_id
    AND date = p_date::TEXT
    AND time IS NOT NULL;
END;
$$;

-- 4. RPC to book a public appointment
CREATE OR REPLACE FUNCTION book_public_appointment(
  p_profile_slug TEXT,
  p_date DATE,
  p_time TIME,
  p_guest_name TEXT,
  p_guest_phone TEXT,
  p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_conflict_id UUID;
  v_appointment_id UUID;
BEGIN
  -- Get user_id from slug
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE profile_slug = p_profile_slug
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Check for conflicts (comparing as text since it might be stored as text)
  SELECT id INTO v_conflict_id
  FROM public.appointments
  WHERE user_id = v_user_id
    AND date = p_date::TEXT
    AND time::TIME = p_time;

  IF v_conflict_id IS NOT NULL THEN
    RAISE EXCEPTION 'Este horário não está mais disponível.';
  END IF;

  -- Insert appointment
  INSERT INTO public.appointments (
    user_id,
    title,
    description,
    date,
    time,
    guest_name,
    guest_phone,
    status
  ) VALUES (
    v_user_id,
    'Agendamento Online: ' || p_guest_name,
    p_description,
    p_date::TEXT,
    p_time::TEXT, 
    p_guest_name,
    p_guest_phone,
    'scheduled'
  ) RETURNING id INTO v_appointment_id;

  RETURN v_appointment_id;
END;
$$;

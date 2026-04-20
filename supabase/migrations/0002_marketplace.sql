-- Phase 17: Legal Marketplace tables

CREATE TABLE IF NOT EXISTS public.legal_experts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    specialization TEXT[] NOT NULL,
    state_code TEXT NOT NULL,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    fee_estimate TEXT,
    is_verified BOOLEAN DEFAULT false,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for legal_experts
ALTER TABLE public.legal_experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for legal experts" ON public.legal_experts FOR SELECT USING (true);
CREATE POLICY "Experts can edit their own profiles" ON public.legal_experts FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.legal_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expert_id UUID REFERENCES public.legal_experts(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES auth.users(id),
    case_summary TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for legal_leads
ALTER TABLE public.legal_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can insert leads" ON public.legal_leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Citizens can read their own leads" ON public.legal_leads FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Experts can read leads assigned to them" ON public.legal_leads FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.legal_experts WHERE id = expert_id AND user_id = auth.uid())
);
CREATE POLICY "Experts can update leads assigned to them" ON public.legal_leads FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.legal_experts WHERE id = expert_id AND user_id = auth.uid())
);

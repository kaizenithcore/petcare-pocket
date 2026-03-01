
-- Create legal_acceptance table to track user consent to terms and privacy policy
CREATE TABLE public.legal_acceptance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  terms_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own legal acceptance"
  ON public.legal_acceptance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own legal acceptance"
  ON public.legal_acceptance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow profiles to be deleted (needed for account deletion)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

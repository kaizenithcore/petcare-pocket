
-- Add plan_type and stripe_price_id to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Add index for plan_type lookups
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);

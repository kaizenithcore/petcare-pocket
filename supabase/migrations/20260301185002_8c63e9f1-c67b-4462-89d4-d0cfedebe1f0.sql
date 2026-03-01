
-- Add missing columns to profiles for full Stripe subscription tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none';

-- Add index on stripe_customer_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles (stripe_customer_id);

-- Add index on stripe_subscription_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles (stripe_subscription_id);

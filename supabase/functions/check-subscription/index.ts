import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2025-01-27.acacia' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const user = userData.user;
    const email = user.email!;

    // Look up Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, tier: 'free', subscription_status: 'none' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });

    if (subscriptions.data.length === 0) {
      // Sync DB state
      await supabase.from('profiles').update({
        subscription_tier: 'free',
        subscription_status: 'none',
        stripe_customer_id: customerId,
      }).eq('user_id', user.id);

      return new Response(JSON.stringify({ subscribed: false, tier: 'free', subscription_status: 'none' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sub = subscriptions.data[0];
    const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();

    // Sync DB
    await supabase.from('profiles').update({
      subscription_tier: 'premium',
      subscription_status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_expires_at: subscriptionEnd,
    }).eq('user_id', user.id);

    return new Response(JSON.stringify({
      subscribed: true,
      tier: 'premium',
      subscription_status: 'active',
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

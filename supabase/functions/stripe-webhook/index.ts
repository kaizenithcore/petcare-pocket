import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const MONTHLY_PRICE_ID = Deno.env.get('STRIPE_PRICE_MONTHLY');
const YEARLY_PRICE_ID = Deno.env.get('STRIPE_PRICE_YEARLY');

function detectPlanType(priceId: string | null): 'monthly' | 'yearly' | 'free' {
  if (!priceId) return 'free';
  if (priceId === YEARLY_PRICE_ID) return 'yearly';
  if (priceId === MONTHLY_PRICE_ID) return 'monthly';
  // Fallback: treat any unknown price as monthly
  return 'monthly';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    if (stripeKey.startsWith('sk_test')) {
      console.warn('[SECURITY] Using test Stripe key in production webhook!');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' });
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
    } else {
      console.warn('[SECURITY] No webhook secret configured - skipping signature verification');
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[WEBHOOK] Processing event: ${event.type} (${event.id})`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        
        const userId = session.metadata?.user_id;
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id || null;
          const planType = detectPlanType(priceId);
          
          await supabaseAdmin.from('profiles').update({
            subscription_tier: 'premium',
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_type: planType,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('user_id', userId);
          console.log(`[WEBHOOK] User ${userId} upgraded to premium (${planType})`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const { data: profile } = await supabaseAdmin.from('profiles').select('user_id').eq('stripe_customer_id', customerId).single();
        if (profile) {
          const isActive = subscription.status === 'active';
          const priceId = subscription.items.data[0]?.price?.id || null;
          const planType = isActive ? detectPlanType(priceId) : 'free';
          
          await supabaseAdmin.from('profiles').update({
            subscription_tier: isActive ? 'premium' : 'free',
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan_type: planType,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('user_id', profile.user_id);
          console.log(`[WEBHOOK] Subscription updated for user ${profile.user_id}: ${subscription.status} (${planType})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const { data: profile } = await supabaseAdmin.from('profiles').select('user_id').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            plan_type: 'free',
            stripe_price_id: null,
            subscription_expires_at: null,
          }).eq('user_id', profile.user_id);
          console.log(`[WEBHOOK] Subscription canceled for user ${profile.user_id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: profile } = await supabaseAdmin.from('profiles').select('user_id').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due',
          }).eq('user_id', profile.user_id);
          console.log(`[WEBHOOK] Payment failed for user ${profile.user_id}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { data: profile } = await supabaseAdmin.from('profiles').select('user_id').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
          }).eq('user_id', profile.user_id);
          console.log(`[WEBHOOK] Invoice paid for user ${profile.user_id}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

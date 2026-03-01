import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePetStore } from '@/lib/store';

export type SubscriptionTier = 'free' | 'premium';
export type PlanType = 'free' | 'monthly' | 'yearly';

interface PremiumState {
  tier: SubscriptionTier;
  planType: PlanType;
  loading: boolean;
  canAddPet: boolean;
  canAddRecord: (category: 'vaccines' | 'medications' | 'visits' | 'reminders' | 'symptomLogs') => boolean;
  isPremium: boolean;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  checkoutLoading: boolean;
  startCheckout: (plan: 'monthly' | 'yearly') => Promise<void>;
  openBillingPortal: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const FREE_PET_LIMIT = 1;
const FREE_RECORD_LIMIT = 10;

export const usePremium = (): PremiumState => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [planType, setPlanType] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('none');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { pets, vaccines, medications, visits, reminders, symptomLogs } = usePetStore();

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setTier('free');
      setPlanType('free');
      setSubscriptionStatus('none');
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        setTier(data.subscribed ? 'premium' : 'free');
        setPlanType(data.plan_type || 'free');
        setSubscriptionStatus(data.subscription_status || 'none');
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (e) {
      console.error('Error checking subscription:', e);
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, plan_type')
        .eq('user_id', user.id)
        .single();
      setTier((profile?.subscription_tier as SubscriptionTier) || 'free');
      setPlanType((profile?.plan_type as PlanType) || 'free');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  const startCheckout = useCallback(async (plan: 'monthly' | 'yearly') => {
    if (!user || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setCheckoutLoading(false);
    }
  }, [user, checkoutLoading]);

  const openBillingPortal = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('create-billing-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Billing portal error:', e);
    }
  }, [user]);

  const isPremium = tier === 'premium';
  const canAddPet = isPremium || pets.length < FREE_PET_LIMIT;

  const canAddRecord = (category: 'vaccines' | 'medications' | 'visits' | 'reminders' | 'symptomLogs') => {
    if (isPremium) return true;
    const counts: Record<string, number> = {
      vaccines: vaccines.length,
      medications: medications.length,
      visits: visits.length,
      reminders: reminders.length,
      symptomLogs: symptomLogs.length,
    };
    return (counts[category] || 0) < FREE_RECORD_LIMIT;
  };

  return {
    tier, planType, loading, canAddPet, canAddRecord, isPremium,
    subscriptionStatus, subscriptionEnd,
    checkoutLoading, startCheckout, openBillingPortal, refreshSubscription,
  };
};

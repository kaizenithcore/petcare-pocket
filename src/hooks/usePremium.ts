import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePetStore } from '@/lib/store';

export type SubscriptionTier = 'free' | 'premium';

interface PremiumState {
  tier: SubscriptionTier;
  loading: boolean;
  canAddPet: boolean;
  canAddRecord: (category: 'vaccines' | 'medications' | 'visits' | 'reminders' | 'symptomLogs') => boolean;
  isPremium: boolean;
}

const FREE_PET_LIMIT = 1;
const FREE_RECORD_LIMIT = 10;

export const usePremium = (): PremiumState => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const { pets, vaccines, medications, visits, reminders, symptomLogs } = usePetStore();

  useEffect(() => {
    if (!user) {
      setTier('free');
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();
      setTier((data?.subscription_tier as SubscriptionTier) || 'free');
      setLoading(false);
    };

    fetchTier();
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

  return { tier, loading, canAddPet, canAddRecord, isPremium };
};

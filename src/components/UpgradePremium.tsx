import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';

interface UpgradePremiumProps {
  onBack: () => void;
}

const UpgradePremium = ({ onBack }: UpgradePremiumProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier, isPremium, checkoutLoading, startCheckout, subscriptionStatus, subscriptionEnd, openBillingPortal } = usePremium();

  const features = [
    t('premium.unlimitedPets'),
    t('premium.unlimitedHistory'),
    t('premium.cloudSync'),
    t('premium.advancedReminders'),
    t('premium.noAds'),
    t('premium.pdfHistory'),
  ];

  const canUpgrade = !!user && !isPremium && subscriptionStatus !== 'active' && subscriptionStatus !== 'incomplete';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> {t('settings.title')}
      </button>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-peach/30 rounded-full mb-4">
          <Crown size={32} className="text-peach-foreground" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">{t('premium.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('premium.subtitle')}</p>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check size={12} className="text-primary" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-foreground">{t('premium.price')}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('premium.currentPlan', { plan: tier })}
        </p>
      </div>

      {canUpgrade && (
        <Button
          className="w-full rounded-xl text-base py-6 gap-2"
          onClick={startCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Crown size={18} />
          )}
          {checkoutLoading ? t('premium.processing') : t('premium.upgrade')}
        </Button>
      )}

      {isPremium && (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-primary">✓ {t('premium.activeSubscription')}</p>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('premium.nextBilling')}: {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="outline" className="w-full rounded-xl gap-2" onClick={openBillingPortal}>
            {t('premium.manageSubscription')}
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-xs text-center text-muted-foreground">
          {t('premium.signInRequired')}
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        {t('premium.freeLimits')}
      </p>
    </motion.div>
  );
};

export default UpgradePremium;

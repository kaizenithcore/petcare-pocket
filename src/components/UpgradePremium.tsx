import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';

interface UpgradePremiumProps {
  onBack: () => void;
}

const UpgradePremium = ({ onBack }: UpgradePremiumProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier, planType, isPremium, checkoutLoading, startCheckout, subscriptionStatus, subscriptionEnd, openBillingPortal } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    t('premium.unlimitedPets'),
    t('premium.unlimitedHistory'),
    t('premium.cloudSync'),
    t('premium.advancedReminders'),
    t('premium.noAds'),
    t('premium.pdfHistory'),
  ];

  const canUpgrade = !!user && !isPremium && subscriptionStatus !== 'active' && subscriptionStatus !== 'incomplete';

  const monthlyPrice = 4.99;
  const yearlyPrice = 44.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);
  const savingsPerYear = (monthlyPrice * 12 - yearlyPrice).toFixed(2);
  const savingsPercent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  const handleCheckout = () => {
    startCheckout(selectedPlan);
  };

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

      {canUpgrade && (
        <div className="space-y-3">
          {/* Monthly Plan Card */}
          <Card
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === 'monthly'
                ? 'border-primary shadow-md'
                : 'border-border hover:border-muted-foreground/30'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{t('premium.monthlyPlan')}</p>
                <p className="text-xs text-muted-foreground">{t('premium.cancelAnytime')}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-foreground">€{monthlyPrice}</p>
                <p className="text-xs text-muted-foreground">/{t('premium.perMonth')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Plan Card - Highlighted */}
          <Card
            className={`cursor-pointer transition-all border-2 relative overflow-hidden ${
              selectedPlan === 'yearly'
                ? 'border-primary shadow-md'
                : 'border-border hover:border-muted-foreground/30'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground text-[10px] px-2 py-0.5 flex items-center gap-1">
                <Star size={10} /> {t('premium.mostPopular')}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{t('premium.yearlyPlan')}</p>
                  <p className="text-xs text-muted-foreground">
                    €{yearlyMonthly}/{t('premium.perMonth')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-foreground">€{yearlyPrice}</p>
                  <p className="text-xs text-muted-foreground">/{t('premium.perYear')}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
                  {t('premium.save')} {savingsPercent}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t('premium.saveAmount', { amount: savingsPerYear })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full rounded-xl text-base py-6 gap-2"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Crown size={18} />
            )}
            {checkoutLoading
              ? t('premium.processing')
              : selectedPlan === 'yearly'
                ? t('premium.startYearly')
                : t('premium.startMonthly')}
          </Button>
        </div>
      )}

      {isPremium && (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-primary">✓ {t('premium.activeSubscription')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {planType === 'yearly' ? t('premium.yearlyPlan') : t('premium.monthlyPlan')}
            </p>
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

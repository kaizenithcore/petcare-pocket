import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';

interface UpgradePremiumProps {
  onBack: () => void;
}

const UpgradePremium = ({ onBack }: UpgradePremiumProps) => {
  const { t } = useTranslation();
  const { tier, isPremium } = usePremium();

  const features = [
    t('premium.unlimitedPets'),
    t('premium.unlimitedHistory'),
    t('premium.cloudSync'),
    t('premium.advancedReminders'),
    t('premium.noAds'),
    t('premium.pdfHistory'),
  ];

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

      {!isPremium && (
        <Button className="w-full rounded-xl text-base py-6 gap-2" disabled>
          <Crown size={18} /> {t('premium.upgrade')}
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground">
        {t('premium.freeLimits')}
      </p>
    </motion.div>
  );
};

export default UpgradePremium;

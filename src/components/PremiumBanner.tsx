import { Crown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';

interface PremiumBannerProps {
  variant?: 'default' | 'sync' | 'vaccine';
  onUpgrade: () => void;
}

const PremiumBanner = ({ variant = 'default', onUpgrade }: PremiumBannerProps) => {
  const { t } = useTranslation();
  const { isPremium } = usePremium();

  if (isPremium) return null;

  const messages: Record<string, string> = {
    default: t('premium.bannerUnlimited'),
    sync: t('premium.bannerSync'),
    vaccine: t('premium.bannerVaccine'),
  };

  return (
    <button
      onClick={onUpgrade}
      className="w-full bg-lavender/20 hover:bg-lavender/30 rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
    >
      <div className="w-10 h-10 bg-peach/30 rounded-full flex items-center justify-center shrink-0">
        <Crown size={18} className="text-peach-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{messages[variant]}</p>
        <p className="text-xs text-primary font-semibold mt-0.5">{t('settings.upgradeToPremium')} →</p>
      </div>
    </button>
  );
};

export default PremiumBanner;

import { motion } from 'framer-motion';
import { Crown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface PremiumGateModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  limitType: 'pet' | 'record';
}

const PremiumGateModal = ({ open, onClose, onUpgrade, limitType }: PremiumGateModalProps) => {
  const { t } = useTranslation();

  if (!open) return null;

  const benefits = [
    t('premium.unlimitedPets'),
    t('premium.unlimitedHistory'),
    t('premium.cloudSync'),
    t('premium.advancedReminders'),
    t('premium.noAds'),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-float text-center space-y-4"
      >
        <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 hover:bg-muted">
          <X size={18} className="text-muted-foreground" />
        </button>

        <div className="inline-flex items-center justify-center w-14 h-14 bg-peach/30 rounded-full">
          <Crown size={28} className="text-peach-foreground" />
        </div>

        <h3 className="text-lg font-extrabold text-foreground">{t('premium.limitReached')}</h3>
        <p className="text-sm text-muted-foreground">
          {limitType === 'pet' ? t('premium.petLimitDesc') : t('premium.recordLimitDesc')}
        </p>

        <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check size={10} className="text-primary" />
              </div>
              <span className="text-xs text-foreground">{b}</span>
            </div>
          ))}
        </div>

        <Button onClick={onUpgrade} className="w-full rounded-xl gap-2">
          <Crown size={16} /> {t('premium.upgrade')}
        </Button>

        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t('premium.maybeLater')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PremiumGateModal;

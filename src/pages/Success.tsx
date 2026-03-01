import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';

const Success = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        // Call check-subscription to sync Stripe state with DB
        await supabase.functions.invoke('check-subscription');
      } catch (e) {
        console.error('Subscription check error:', e);
      }
      setChecking(false);
    };

    verify();

    // Redirect to dashboard after 4 seconds
    const timer = setTimeout(() => navigate('/', { replace: true }), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto"
        >
          <Crown size={40} className="text-primary" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {t('premium.activated')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('premium.activatedDesc')}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          {[
            t('premium.unlimitedPets'),
            t('premium.unlimitedHistory'),
            t('premium.cloudSync'),
            t('premium.advancedReminders'),
            t('premium.noAds'),
            t('premium.pdfHistory'),
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground animate-pulse">
          {checking ? t('premium.verifying') : t('premium.redirecting')}
        </p>
      </motion.div>
    </div>
  );
};

export default Success;

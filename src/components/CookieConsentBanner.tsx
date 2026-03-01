import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'petcare-cookie-consent';

const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, accepted_at: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, non_essential: false, accepted_at: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
        >
          <div className="max-w-lg mx-auto bg-card rounded-2xl p-5 shadow-float border border-border">
            <p className="text-sm text-foreground font-semibold mb-1">{t('legal.cookieConsentTitle')}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {t('legal.cookieConsentDesc')}{' '}
              <Link to="/cookies" className="text-primary underline">{t('legal.learnMore')}</Link>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reject} className="flex-1 rounded-xl text-xs">
                {t('legal.rejectNonEssential')}
              </Button>
              <Button size="sm" onClick={accept} className="flex-1 rounded-xl text-xs">
                {t('legal.acceptAll')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;

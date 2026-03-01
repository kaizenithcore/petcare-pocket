import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = '2026-03-01';

const CookiePolicy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">{t('legal.cookiePolicy')}</h1>
        <p className="text-xs text-muted-foreground mb-6">{t('legal.lastUpdated')}: {LAST_UPDATED}</p>

        <div className="space-y-6">
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.whatAreCookies')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.whatAreCookiesText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.cookiesWeUse')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.cookiesWeUseText')}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>{t('legal.essentialCookies')}:</strong> {t('legal.essentialCookiesDesc')}</li>
              <li><strong>Stripe:</strong> {t('legal.stripeCookiesDesc')}</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.noTrackingCookies')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.noTrackingCookiesText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.manageCookies')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.manageCookiesText')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;

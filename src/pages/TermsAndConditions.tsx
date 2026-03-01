import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = '2026-03-01';

const TermsAndConditions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">{t('legal.termsAndConditions')}</h1>
        <p className="text-xs text-muted-foreground mb-6">{t('legal.lastUpdated')}: {LAST_UPDATED}</p>

        <div className="space-y-6">
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.serviceDescription')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.serviceDescriptionText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.planLimitations')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.planLimitationsText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.medicalDisclaimer')}</h2>
            <p className="text-sm text-muted-foreground font-semibold">{t('legal.medicalDisclaimerText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.acceptableUse')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.acceptableUseText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.intellectualProperty')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.intellectualPropertyText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.subscriptionTerms')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.subscriptionTermsText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.limitationOfLiability')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.limitationOfLiabilityText')}</p>
          </section>

          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.governingLaw')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.governingLawText')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

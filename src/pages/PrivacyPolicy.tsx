import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEGAL_EMAIL = 'legal@kaizenith.es';
const COMPANY_NAME = 'Kaizenith';
const COMPANY_ADDRESS = 'Spain, EU';
const LAST_UPDATED = '2026-03-01';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">{t('legal.privacyPolicy')}</h1>
        <p className="text-xs text-muted-foreground mb-6">{t('legal.lastUpdated')}: {LAST_UPDATED}</p>

        <div className="prose prose-sm max-w-none space-y-6">
          {/* Data Controller */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.dataController')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('legal.dataControllerDesc', { company: COMPANY_NAME, address: COMPANY_ADDRESS })}
            </p>
            <p className="text-sm text-muted-foreground">{t('legal.contactEmail')}: <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary">{LEGAL_EMAIL}</a></p>
          </section>

          {/* Data Collected */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.dataCollected')}</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>{t('legal.dataAccount')}</li>
              <li>{t('legal.dataPet')}</li>
              <li>{t('legal.dataUsage')}</li>
              <li>{t('legal.dataPayment')}</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.legalBasis')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.legalBasisDesc')}</p>
          </section>

          {/* Data Storage */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.dataStorage')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.dataStorageDesc')}</p>
          </section>

          {/* Data Retention */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.dataRetention')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.dataRetentionDesc')}</p>
          </section>

          {/* User Rights */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.userRights')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.userRightsDesc')}</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>{t('legal.rightAccess')}</li>
              <li>{t('legal.rightRectification')}</li>
              <li>{t('legal.rightErasure')}</li>
              <li>{t('legal.rightPortability')}</li>
              <li>{t('legal.rightRestriction')}</li>
            </ul>
            <p className="text-sm text-muted-foreground">{t('legal.exerciseRights', { email: LEGAL_EMAIL })}</p>
          </section>

          {/* Third-party Processors */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.thirdParty')}</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Stripe ({t('legal.thirdPartyPayments')})</li>
              <li>Lovable Cloud ({t('legal.thirdPartyHosting')})</li>
              <li>Google OAuth ({t('legal.thirdPartyAuth')})</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.internationalTransfers')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.internationalTransfersDesc')}</p>
          </section>

          {/* Security */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.security')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.securityDesc')}</p>
          </section>

          {/* Complaints */}
          <section className="bg-card rounded-xl p-5 shadow-card space-y-2">
            <h2 className="text-base font-bold text-foreground">{t('legal.complaints')}</h2>
            <p className="text-sm text-muted-foreground">{t('legal.complaintsDesc')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

const LegalFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border bg-card/50 py-4 px-4">
      <div className="max-w-lg mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground transition-colors">{t('legal.privacyPolicy')}</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-foreground transition-colors">{t('legal.termsAndConditions')}</Link>
        <span>·</span>
        <Link to="/cookies" className="hover:text-foreground transition-colors">{t('legal.cookiePolicy')}</Link>
        <span>·</span>
        <a href="mailto:legal@kaizenith.es" className="hover:text-foreground transition-colors">{t('legal.contact')}</a>
      </div>
      <p className="text-center text-[9px] text-muted-foreground mt-1">© {new Date().getFullYear()} Kaizenith</p>
    </footer>
  );
};

export default LegalFooter;

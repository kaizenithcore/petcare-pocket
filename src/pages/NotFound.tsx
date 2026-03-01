import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from '@/lib/i18n';
import LegalFooter from '@/components/LegalFooter';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="mb-2 text-4xl font-extrabold text-foreground">404</h1>
          <p className="mb-4 text-sm text-muted-foreground">Page not found</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold">
            {t('common.back')}
          </Link>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

export default NotFound;
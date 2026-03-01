import { useAuth } from '@/hooks/useAuth';
import { useTranslation, type Language } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';
import { Crown, Globe, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SettingsViewProps {
  onUpgrade: () => void;
}

const SettingsView = ({ onUpgrade }: SettingsViewProps) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, isGuest, signOut } = useAuth();
  const { tier, isPremium } = usePremium();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">{t('settings.title')}</h2>

      {/* Language */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('settings.language')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-28 rounded-xl h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('settings.english')}</SelectItem>
              <SelectItem value="es">{t('settings.spanish')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown size={18} className={isPremium ? 'text-peach-foreground' : 'text-muted-foreground'} />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('settings.subscription')}</p>
              <p className="text-xs text-muted-foreground">
                {t('settings.currentPlan')}: {isPremium ? t('settings.premium') : t('settings.free')}
              </p>
            </div>
          </div>
          {!isPremium && (
            <button onClick={onUpgrade} className="text-xs font-semibold text-primary">
              {t('settings.upgradeToPremium')}
            </button>
          )}
        </div>
      </div>

      {/* Other settings */}
      {[
        { label: t('settings.notifications'), desc: t('settings.notificationsDesc') },
        { label: t('settings.dataExport'), desc: t('settings.dataExportDesc') },
        { label: t('settings.account'), desc: t('settings.accountDesc') },
        { label: t('settings.about'), desc: t('settings.version') },
      ].map((item) => (
        <div key={item.label} className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
      ))}

      {/* Auth actions */}
      {user && !isGuest ? (
        <Button variant="outline" onClick={handleSignOut} className="w-full rounded-xl gap-2">
          <LogOut size={16} /> {t('auth.signOut')}
        </Button>
      ) : isGuest ? (
        <div className="space-y-2">
          <Button onClick={() => navigate('/auth')} className="w-full rounded-xl">
            {t('auth.signIn')} / {t('auth.signUp')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">{t('app.guestMode')}</p>
        </div>
      ) : null}
    </div>
  );
};

export default SettingsView;

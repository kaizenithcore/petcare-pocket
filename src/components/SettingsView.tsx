import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation, type Language } from '@/lib/i18n';
import { usePremium } from '@/hooks/usePremium';
import { useCloudStore, type UserSettings } from '@/hooks/useCloudStore';
import { usePetStore } from '@/lib/store';
import { Crown, Globe, LogOut, Bell, Download, User, ChevronRight, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SettingsViewProps {
  onUpgrade: () => void;
}

const SettingsView = ({ onUpgrade }: SettingsViewProps) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, isGuest, signOut, resetPassword, updatePassword } = useAuth();
  const { tier, isPremium } = usePremium();
  const { loadSettings, saveSettings, deleteAccount, isCloud } = useCloudStore();
  const { pets, vaccines, medications, visits, symptomLogs } = usePetStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notification_enabled: true,
    reminder_default_time: '09:00',
    overdue_alerts_enabled: true,
    default_reminder_recurrence: 'none',
    default_snooze_duration: '1h',
    language: language,
  });
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (isCloud) {
      loadSettings().then((s) => {
        if (s) setSettings(s);
      });
    }
  }, [isCloud, loadSettings]);

  const handleSettingChange = useCallback(async (key: keyof UserSettings, value: unknown) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated as UserSettings);
    if (isCloud) {
      setSavingSettings(true);
      await saveSettings({ [key]: value } as Partial<UserSettings>);
      setSavingSettings(false);
      toast({ title: t('settings.savedToCloud') });
    }
  }, [settings, isCloud, saveSettings, toast, t]);

  const handleLanguageChange = useCallback(async (lang: Language) => {
    setLanguage(lang);
    if (isCloud) {
      await saveSettings({ language: lang });
    }
  }, [setLanguage, isCloud, saveSettings]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) return;
    const result = await updatePassword(newPassword);
    if (result.error) {
      toast({ title: t('app.error'), description: result.error, variant: 'destructive' });
    } else {
      toast({ title: t('auth.passwordUpdated') });
      setNewPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    await deleteAccount();
    setDeletingAccount(false);
    navigate('/auth');
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csvSections: string[] = [];
      csvSections.push('=== PETS ===');
      csvSections.push('Name,Species,Breed,Birthdate,Weight,Microchip ID,Emergency Contact');
      pets.forEach(p => csvSections.push(`"${p.name}","${p.species}","${p.breed}","${p.birthdate}",${p.weight},"${p.microchipId || ''}","${p.emergencyContact}"`));

      csvSections.push('\n=== VACCINES ===');
      csvSections.push('Pet,Name,Date Administered,Next Due,Clinic,Notes');
      vaccines.forEach(v => {
        const pet = pets.find(p => p.id === v.petId);
        csvSections.push(`"${pet?.name || ''}","${v.name}","${v.dateAdministered}","${v.nextDueDate}","${v.clinicName}","${v.notes}"`);
      });

      csvSections.push('\n=== MEDICATIONS ===');
      csvSections.push('Pet,Name,Dose,Frequency,Start,End,Notes');
      medications.forEach(m => {
        const pet = pets.find(p => p.id === m.petId);
        csvSections.push(`"${pet?.name || ''}","${m.name}","${m.dose}","${m.frequency}","${m.startDate}","${m.endDate}","${m.notes}"`);
      });

      csvSections.push('\n=== VISITS ===');
      csvSections.push('Pet,Date,Reason,Diagnosis,Notes');
      visits.forEach(v => {
        const pet = pets.find(p => p.id === v.petId);
        csvSections.push(`"${pet?.name || ''}","${v.date}","${v.reason}","${v.diagnosis}","${v.notes}"`);
      });

      csvSections.push('\n=== SYMPTOM LOGS ===');
      csvSections.push('Pet,Date,Symptoms,Duration,Urgency,Notes');
      symptomLogs.forEach(s => {
        const pet = pets.find(p => p.id === s.petId);
        csvSections.push(`"${pet?.name || ''}","${s.date}","${s.symptoms.join('; ')}","${s.duration}","${s.urgency}","${s.notes}"`);
      });

      const csv = csvSections.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `petcare-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t('settings.exported') });
    } catch {
      toast({ title: t('app.error'), variant: 'destructive' });
    }
    setExporting(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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
          <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
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

      {/* Notifications */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <button onClick={() => toggleSection('notifications')} className="w-full p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('settings.notifications')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.notificationsDesc')}</p>
            </div>
          </div>
          <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expandedSection === 'notifications' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'notifications' && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('settings.pushNotifications')}</span>
              <Switch checked={settings.notification_enabled} onCheckedChange={(v) => handleSettingChange('notification_enabled', v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('settings.reminderDefaultTime')}</span>
              <Input
                type="time"
                value={settings.reminder_default_time}
                onChange={(e) => handleSettingChange('reminder_default_time', e.target.value)}
                className="w-28 h-8 rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('settings.overdueAlerts')}</span>
              <Switch checked={settings.overdue_alerts_enabled} onCheckedChange={(v) => handleSettingChange('overdue_alerts_enabled', v)} />
            </div>
          </div>
        )}
      </div>

      {/* Manage Reminders */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <button onClick={() => toggleSection('reminders')} className="w-full p-4 flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">{t('settings.manageReminders')}</p>
            <p className="text-xs text-muted-foreground">{t('settings.manageRemindersDesc')}</p>
          </div>
          <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expandedSection === 'reminders' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'reminders' && (
          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('settings.defaultRecurrence')}</span>
              <Select value={settings.default_reminder_recurrence} onValueChange={(v) => handleSettingChange('default_reminder_recurrence', v)}>
                <SelectTrigger className="w-28 rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('settings.none')}</SelectItem>
                  <SelectItem value="weekly">{t('settings.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('settings.monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{t('settings.defaultSnooze')}</span>
              <Select value={settings.default_snooze_duration} onValueChange={(v) => handleSettingChange('default_snooze_duration', v)}>
                <SelectTrigger className="w-28 rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">{t('settings.snooze1h')}</SelectItem>
                  <SelectItem value="4h">{t('settings.snooze4h')}</SelectItem>
                  <SelectItem value="1d">{t('settings.snooze1d')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Data Export */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('settings.dataExport')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.dataExportDesc')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={exporting} className="rounded-xl text-xs">
            {exporting ? t('settings.exporting') : t('settings.exportAll')}
          </Button>
        </div>
      </div>

      {/* Account */}
      {user && !isGuest && (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <button onClick={() => toggleSection('account')} className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <User size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">{t('settings.account')}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <ChevronRight size={16} className={`text-muted-foreground transition-transform ${expandedSection === 'account' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'account' && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">{t('auth.changePassword')}</p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('auth.newPassword')}
                    className="rounded-xl text-sm flex-1"
                  />
                  <Button size="sm" onClick={handlePasswordChange} disabled={newPassword.length < 6} className="rounded-xl">
                    {t('auth.updatePassword')}
                  </Button>
                </div>
              </div>

              {/* Delete Account - Enhanced with type DELETE */}
              <div className="pt-2 border-t border-border">
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-destructive">
                    <Trash2 size={14} /> {t('auth.deleteAccount')}
                  </button>
                ) : (
                  <div className="bg-destructive/5 rounded-xl p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">{t('auth.deleteAccountWarning')}</p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={t('settings.typeDelete')}
                      className="rounded-xl text-sm"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} className="flex-1 rounded-xl">{t('common.no')}</Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                        className="flex-1 rounded-xl"
                      >
                        {deletingAccount ? t('settings.deleting') : t('common.delete')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* About */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <p className="text-sm font-semibold text-foreground">{t('settings.about')}</p>
        <p className="text-xs text-muted-foreground">{t('settings.version')}</p>
      </div>

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

      {/* Legal links */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2 text-[10px] text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground transition-colors">{t('legal.privacyPolicy')}</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-foreground transition-colors">{t('legal.termsAndConditions')}</Link>
        <span>·</span>
        <Link to="/cookies" className="hover:text-foreground transition-colors">{t('legal.cookiePolicy')}</Link>
      </div>
    </div>
  );
};

export default SettingsView;
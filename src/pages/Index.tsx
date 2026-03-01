import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Syringe, Pill, Stethoscope, Bell, Thermometer, Crown } from 'lucide-react';
import PetCarousel from '@/components/PetCarousel';
import AddPetDialog from '@/components/AddPetDialog';
import AddRecordDialog from '@/components/AddRecordDialog';
import SymptomChecker from '@/components/SymptomChecker';
import PetHealthTabs from '@/components/PetHealthTabs';
import RemindersList from '@/components/RemindersList';
import CalendarView from '@/components/CalendarView';
import UpgradePremium from '@/components/UpgradePremium';
import SettingsView from '@/components/SettingsView';
import BottomNav, { type TabId } from '@/components/BottomNav';
import { usePetStore, speciesEmoji } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useTranslation } from '@/lib/i18n';

const quickActions = [
  { id: 'vaccine' as const, label: 'quickActions.vaccine', icon: Syringe, bg: 'bg-primary/10', color: 'text-primary' },
  { id: 'medication' as const, label: 'quickActions.medication', icon: Pill, bg: 'bg-accent/10', color: 'text-accent' },
  { id: 'visit' as const, label: 'quickActions.vetVisit', icon: Stethoscope, bg: 'bg-sky/20', color: 'text-sky-foreground' },
  { id: 'reminder' as const, label: 'quickActions.reminder', icon: Bell, bg: 'bg-peach/30', color: 'text-peach-foreground' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showAddPet, setShowAddPet] = useState(false);
  const [recordType, setRecordType] = useState<'vaccine' | 'medication' | 'visit' | 'reminder' | null>(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { pets, activePetId, reminders } = usePetStore();
  const cloudStore = useCloudStore();
  const { t } = useTranslation();
  const activePet = pets.find((p) => p.id === activePetId);

  const today = new Date().toISOString().split('T')[0];
  const upcomingReminders = reminders
    .filter((r) => r.petId === activePetId && !r.completed && r.dueDate >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  const overdueCount = reminders.filter((r) => r.petId === activePetId && !r.completed && r.dueDate < today).length;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">{t('app.name')}</h1>
            <p className="text-xs text-muted-foreground">
              {activePet ? `${speciesEmoji[activePet.species]} ${activePet.name}` : t('app.welcome')}
            </p>
          </div>
          <div className="text-2xl animate-float">🐾</div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" {...pageVariants} className="space-y-6">
              <section>
                <PetCarousel onAddPet={() => setShowAddPet(true)} />
              </section>

              {activePet && (
                <>
                  {overdueCount > 0 && (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-destructive/8 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {overdueCount} {t('reminders.overdue').toLowerCase()} {overdueCount > 1 ? t('reminders.title').toLowerCase() : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('reminders.tapToReview')}</p>
                      </div>
                    </motion.div>
                  )}

                  <section>
                    <h2 className="text-sm font-bold text-foreground mb-3">{t('quickActions.title')}</h2>
                    <div className="grid grid-cols-4 gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <motion.button key={action.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRecordType(action.id)} className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 ${action.bg} transition-all`}>
                            <Icon size={20} className={action.color} />
                            <span className="text-[11px] font-semibold text-foreground">{t(action.label)}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setShowSymptoms(true)} className="w-full bg-lavender/30 rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:bg-lavender/40">
                    <Thermometer size={22} className="text-lavender-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t('symptoms.title')}</p>
                      <p className="text-xs text-muted-foreground">{t('symptoms.subtitle')}</p>
                    </div>
                  </motion.button>

                  {upcomingReminders.length > 0 && (
                    <section>
                      <h2 className="text-sm font-bold text-foreground mb-3">{t('reminders.upcoming')}</h2>
                      <div className="space-y-2">
                        {upcomingReminders.map((r) => (
                          <div key={r.id} className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3">
                            <span className="text-lg">{r.type === 'vaccine' ? '💉' : r.type === 'medication' ? '💊' : r.type === 'grooming' ? '✂️' : '📋'}</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{r.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="bg-card rounded-2xl p-5 shadow-card">
                    <h2 className="text-sm font-bold text-foreground mb-3">{t('pets.petInfo')}</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-muted-foreground">{t('pets.species')}</p><p className="font-semibold text-foreground capitalize">{activePet.species}</p></div>
                      <div><p className="text-xs text-muted-foreground">{t('pets.breed')}</p><p className="font-semibold text-foreground">{activePet.breed || '—'}</p></div>
                      <div><p className="text-xs text-muted-foreground">{t('pets.birthdate')}</p><p className="font-semibold text-foreground">{activePet.birthdate || '—'}</p></div>
                      <div><p className="text-xs text-muted-foreground">{t('pets.weight')}</p><p className="font-semibold text-foreground">{activePet.weight ? `${activePet.weight} ${t('pets.weightUnit')}` : '—'}</p></div>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div key="health" {...pageVariants} className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">{t('health.title')}</h2>
              {activePet ? (
                <>
                  <div className="flex gap-2">
                    {quickActions.slice(0, 3).map((a) => (
                      <button key={a.id} onClick={() => setRecordType(a.id)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${a.bg} ${a.color}`}>
                        <Plus size={14} /> {t(a.label)}
                      </button>
                    ))}
                  </div>
                  <PetHealthTabs />
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">{t('health.addRecord')}</p>
              )}
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div key="calendar" {...pageVariants}>
              {activePet ? (
                <CalendarView onAddReminder={() => setRecordType('reminder')} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">{t('reminders.addPetFirst')}</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div key="reminders" {...pageVariants} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{t('reminders.title')}</h2>
                <button onClick={() => setRecordType('reminder')} className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
                  <Plus size={14} /> {t('reminders.add')}
                </button>
              </div>
              {activePet ? <RemindersList /> : <p className="text-sm text-muted-foreground text-center py-8">{t('reminders.addPetFirst')}</p>}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" {...pageVariants}>
              {showUpgrade ? (
                <UpgradePremium onBack={() => setShowUpgrade(false)} />
              ) : (
                <SettingsView onUpgrade={() => setShowUpgrade(true)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {activeTab === 'home' && pets.length > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowAddPet(true)} className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-float flex items-center justify-center">
          <Plus size={24} />
        </motion.button>
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <AddPetDialog open={showAddPet} onClose={() => setShowAddPet(false)} />
      <AddRecordDialog open={!!recordType} onClose={() => setRecordType(null)} type={recordType || 'vaccine'} />
      <SymptomChecker open={showSymptoms} onClose={() => setShowSymptoms(false)} />
    </div>
  );
};

export default Index;

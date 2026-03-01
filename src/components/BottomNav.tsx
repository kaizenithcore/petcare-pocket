import { Home, Heart, CalendarDays, Bell, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export type TabId = 'home' | 'health' | 'calendar' | 'reminders' | 'settings';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  const { t } = useTranslation();

  const tabs: { id: TabId; labelKey: string; icon: typeof Home }[] = [
    { id: 'home', labelKey: 'nav.home', icon: Home },
    { id: 'health', labelKey: 'nav.health', icon: Heart },
    { id: 'calendar', labelKey: 'nav.calendar', icon: CalendarDays },
    { id: 'reminders', labelKey: 'nav.reminders', icon: Bell },
    { id: 'settings', labelKey: 'nav.settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-2 min-w-[56px] rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-6 h-1 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className={`text-[9px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

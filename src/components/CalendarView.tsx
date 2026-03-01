import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { usePetStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  onAddReminder: () => void;
}

const CalendarView = ({ onAddReminder }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { activePetId, reminders } = usePetStore();
  const { t, language } = useTranslation();
  const locale = language === 'es' ? es : undefined;

  const petReminders = reminders.filter((r) => r.petId === activePetId);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const remindersByDate = useMemo(() => {
    const map: Record<string, typeof petReminders> = {};
    petReminders.forEach((r) => {
      if (!map[r.dueDate]) map[r.dueDate] = [];
      map[r.dueDate].push(r);
    });
    return map;
  }, [petReminders]);

  const getDayStatus = (dateStr: string) => {
    const dayReminders = remindersByDate[dateStr] || [];
    if (dayReminders.length === 0) return null;
    const allCompleted = dayReminders.every((r) => r.completed);
    if (allCompleted) return 'completed';
    const hasOverdue = dayReminders.some((r) => !r.completed && r.dueDate < todayStr);
    if (hasOverdue) return 'overdue';
    return 'upcoming';
  };

  const statusColors: Record<string, string> = {
    overdue: 'bg-accent/30 text-accent-foreground',
    upcoming: 'bg-primary/20 text-primary',
    completed: 'bg-sky/30 text-sky-foreground',
  };

  const dotColors: Record<string, string> = {
    overdue: 'bg-accent',
    upcoming: 'bg-primary',
    completed: 'bg-sky',
  };

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedReminders = selectedDateStr ? (remindersByDate[selectedDateStr] || []) : [];

  const weekDays = language === 'es'
    ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{t('calendar.title')}</h2>
        <button
          onClick={onAddReminder}
          className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold"
        >
          <Plus size={14} /> {t('reminders.add')}
        </button>
      </div>

      {/* Month navigation */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>
          <h3 className="text-sm font-bold text-foreground capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale })}
          </h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded-full hover:bg-muted transition-colors">
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const status = getDayStatus(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                    !isCurrentMonth ? 'opacity-30' : ''
                  } ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''} ${
                    isToday && !isSelected ? 'font-bold text-primary' : 'text-foreground'
                  } hover:bg-muted/50`}
                >
                  <span className="text-xs">{format(day, 'd')}</span>
                  {status && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColors[status]}`} />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selected date reminders */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-bold text-foreground">
            {format(selectedDate, 'EEEE, MMM d', { locale })}
          </h3>
          {selectedReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 shadow-card">
              {t('calendar.noEvents')}
            </p>
          ) : (
            selectedReminders.map((r) => {
              const typeEmoji: Record<string, string> = { vaccine: '💉', medication: '💊', grooming: '✂️', appointment: '📋' };
              const status = r.completed ? 'completed' : r.dueDate < todayStr ? 'overdue' : 'upcoming';
              return (
                <div
                  key={r.id}
                  className={`rounded-xl p-3 shadow-card flex items-center gap-3 ${statusColors[status] || 'bg-card'}`}
                >
                  <span className="text-lg">{typeEmoji[r.type] || '🔔'}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${r.completed ? 'line-through opacity-60' : ''}`}>{r.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t(`reminders.${r.type}` as any)}</p>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CalendarView;

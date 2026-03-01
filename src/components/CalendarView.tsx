import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { usePetStore } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import EditRecordDialog from './EditRecordDialog';
import type { Vaccine, Medication, Visit, Reminder } from '@/lib/store';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  emoji: string;
  type: 'vaccine' | 'medication' | 'visit' | 'reminder';
  completed?: boolean;
  record: Vaccine | Medication | Visit | Reminder;
}

interface CalendarViewProps {
  onAddReminder: () => void;
}

const CalendarView = ({ onAddReminder }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { activePetId, reminders, vaccines, medications, visits } = usePetStore();
  const cloud = useCloudStore();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const locale = language === 'es' ? es : undefined;

  const [editRecord, setEditRecord] = useState<{ type: 'vaccine' | 'medication' | 'visit' | 'reminder'; record: Vaccine | Medication | Visit | Reminder } | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Build unified events from all record types
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const push = (dateStr: string, event: CalendarEvent) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    };

    // Reminders
    reminders.filter((r) => r.petId === activePetId).forEach((r) => {
      push(r.dueDate, { id: r.id, date: r.dueDate, title: r.title, emoji: r.type === 'vaccine' ? '💉' : r.type === 'medication' ? '💊' : r.type === 'grooming' ? '✂️' : '📋', type: 'reminder', completed: r.completed, record: r });
    });

    // Vaccines (use nextDueDate as the calendar date, fallback to dateAdministered)
    vaccines.filter((v) => v.petId === activePetId).forEach((v) => {
      const dateStr = v.nextDueDate || v.dateAdministered;
      if (dateStr) push(dateStr, { id: v.id, date: dateStr, title: v.name, emoji: '💉', type: 'vaccine', record: v });
      if (v.dateAdministered && v.dateAdministered !== dateStr) {
        push(v.dateAdministered, { id: `${v.id}-admin`, date: v.dateAdministered, title: `${v.name} (${t('health.given')})`, emoji: '💉', type: 'vaccine', record: v });
      }
    });

    // Medications (show start date)
    medications.filter((m) => m.petId === activePetId).forEach((m) => {
      if (m.startDate) push(m.startDate, { id: m.id, date: m.startDate, title: m.name, emoji: '💊', type: 'medication', record: m });
    });

    // Visits
    visits.filter((v) => v.petId === activePetId).forEach((v) => {
      if (v.date) push(v.date, { id: v.id, date: v.date, title: v.reason || t('health.visits'), emoji: '🩺', type: 'visit', record: v });
    });

    return map;
  }, [activePetId, reminders, vaccines, medications, visits, t]);

  const getDayStatus = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    if (dayEvents.length === 0) return null;
    const hasOverdue = dayEvents.some((e) => e.type === 'reminder' && !e.completed && e.date < todayStr);
    if (hasOverdue) return 'overdue';
    const allCompleted = dayEvents.every((e) => e.type !== 'reminder' || e.completed);
    if (allCompleted && dayEvents.some((e) => e.type === 'reminder')) return 'completed';
    return 'upcoming';
  };

  const dotColors: Record<string, string> = {
    overdue: 'bg-destructive',
    upcoming: 'bg-primary',
    completed: 'bg-sky',
  };

  const statusColors: Record<string, string> = {
    overdue: 'bg-destructive/10 text-destructive',
    upcoming: 'bg-primary/10 text-primary',
    completed: 'bg-sky/20 text-sky-foreground',
    vaccine: 'bg-primary/10 text-primary',
    medication: 'bg-accent/10 text-accent',
    visit: 'bg-sky/10 text-sky-foreground',
  };

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  const weekDays = language === 'es'
    ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleToggleReminder = (r: Reminder) => {
    if (cloud.isCloud) cloud.toggleReminderCloud(r.id, r.completed);
    else usePetStore.getState().toggleReminder(r.id);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (event.type === 'vaccine') {
      if (cloud.isCloud) await cloud.deleteVaccineCloud(event.record.id);
      else usePetStore.getState().deleteVaccine(event.record.id);
    } else if (event.type === 'medication') {
      if (cloud.isCloud) await cloud.deleteMedicationCloud(event.record.id);
      else usePetStore.getState().deleteMedication(event.record.id);
    } else if (event.type === 'visit') {
      if (cloud.isCloud) await cloud.deleteVisitCloud(event.record.id);
      else usePetStore.getState().deleteVisit(event.record.id);
    } else if (event.type === 'reminder') {
      if (cloud.isCloud) await cloud.deleteReminderCloud(event.record.id);
      else usePetStore.getState().deleteReminder(event.record.id);
    }
    toast({ title: t('records.deleted') });
  };

  // Count dots per type for a day
  const getDayDots = (dateStr: string) => {
    const events = eventsByDate[dateStr] || [];
    const types = new Set(events.map((e) => e.type));
    return Array.from(types).slice(0, 3);
  };

  const typeDotColor: Record<string, string> = {
    reminder: 'bg-primary',
    vaccine: 'bg-emerald-500',
    medication: 'bg-accent',
    visit: 'bg-sky',
  };

  return (
    <>
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
                const dots = getDayDots(dateStr);

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
                    {dots.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dots.map((type) => (
                          <div key={type} className={`w-1 h-1 rounded-full ${typeDotColor[type] || 'bg-primary'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected date events */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-bold text-foreground">
              {format(selectedDate, 'EEEE, MMM d', { locale })}
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 shadow-card">
                {t('calendar.noEvents')}
              </p>
            ) : (
              selectedEvents.map((event) => {
                const isReminder = event.type === 'reminder';
                const reminder = isReminder ? event.record as Reminder : null;
                const bgColor = isReminder
                  ? (reminder!.completed ? statusColors.completed : event.date < todayStr && !reminder!.completed ? statusColors.overdue : statusColors.upcoming)
                  : (statusColors[event.type] || 'bg-card');

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl p-3 shadow-card flex items-center gap-3 ${bgColor}`}
                  >
                    {isReminder ? (
                      <button onClick={() => handleToggleReminder(reminder!)} className="text-lg">
                        {reminder!.completed ? '✅' : event.emoji}
                      </button>
                    ) : (
                      <span className="text-lg">{event.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isReminder && reminder!.completed ? 'line-through opacity-60' : ''}`}>{event.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{t(`health.${event.type === 'reminder' ? 'visits' : event.type + 's'}` as any)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!event.id.includes('-admin') && (
                        <>
                          <button
                            onClick={() => setEditRecord({ type: event.type, record: event.record })}
                            className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors"
                          >
                            <Pencil size={14} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      <EditRecordDialog
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        type={editRecord?.type || 'vaccine'}
        record={editRecord?.record || null}
      />
    </>
  );
};

export default CalendarView;

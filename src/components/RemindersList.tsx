import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePetStore } from '@/lib/store';

const RemindersList = () => {
  const { activePetId, reminders, toggleReminder, pets } = usePetStore();
  const petReminders = reminders
    .filter((r) => r.petId === activePetId)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const today = new Date().toISOString().split('T')[0];
  const overdue = petReminders.filter((r) => !r.completed && r.dueDate < today);
  const upcoming = petReminders.filter((r) => !r.completed && r.dueDate >= today);
  const completed = petReminders.filter((r) => r.completed);

  const typeEmoji: Record<string, string> = {
    vaccine: '💉', medication: '💊', grooming: '✂️', appointment: '📋',
  };

  const ReminderCard = ({ r, isOverdue = false }: { r: typeof reminders[0]; isOverdue?: boolean }) => (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => toggleReminder(r.id)}
      className={`w-full text-left rounded-xl p-4 transition-all ${
        r.completed
          ? 'bg-muted/50 opacity-60'
          : isOverdue
          ? 'bg-destructive/5 ring-1 ring-destructive/20'
          : 'bg-card shadow-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{typeEmoji[r.type] || '🔔'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${r.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {r.title}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock size={11} />
            {r.dueDate}
            {isOverdue && <span className="text-destructive font-semibold ml-1">Overdue</span>}
          </p>
        </div>
        {r.completed ? (
          <CheckCircle size={20} className="text-primary shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
        )}
      </div>
    </motion.button>
  );

  if (petReminders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Bell size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No reminders set</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-destructive" />
            <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Overdue</span>
          </div>
          <div className="space-y-2">
            {overdue.map((r) => <ReminderCard key={r.id} r={r} isOverdue />)}
          </div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</span>
          <div className="space-y-2 mt-2">
            {upcoming.map((r) => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed</span>
          <div className="space-y-2 mt-2">
            {completed.slice(0, 5).map((r) => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersList;

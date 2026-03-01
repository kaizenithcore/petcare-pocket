import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePetStore, generateId, SYMPTOM_OPTIONS, getUrgency } from '@/lib/store';

interface SymptomCheckerProps {
  open: boolean;
  onClose: () => void;
}

const urgencyConfig = {
  low: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Low urgency' },
  moderate: { icon: Info, color: 'text-peach-foreground', bg: 'bg-peach', label: 'Moderate urgency' },
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'High urgency' },
};

const SymptomChecker = ({ open, onClose }: SymptomCheckerProps) => {
  const { activePetId, pets, addSymptomLog } = usePetStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [showResult, setShowResult] = useState(false);

  const pet = pets.find((p) => p.id === activePetId);

  const toggle = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (!activePetId || selected.length === 0) return;
    setShowResult(true);
  };

  const handleSave = () => {
    if (!activePetId) return;
    addSymptomLog({
      id: generateId(),
      petId: activePetId,
      date: new Date().toISOString().split('T')[0],
      symptoms: selected,
      notes,
      duration,
      urgency: getUrgency(selected),
    });
    setSelected([]); setNotes(''); setDuration(''); setShowResult(false);
    onClose();
  };

  if (!open) return null;

  const urgency = getUrgency(selected);
  const config = urgencyConfig[urgency];
  const UrgencyIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-2xl p-6 shadow-float max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Symptom Check {pet ? `for ${pet.name}` : ''}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-muted-foreground mb-4">Select all symptoms you've noticed:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggle(symptom)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all ${
                      selected.includes(symptom)
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="How long?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 1 day">Less than a day</SelectItem>
                      <SelectItem value="1-3 days">1–3 days</SelectItem>
                      <SelectItem value="3-7 days">3–7 days</SelectItem>
                      <SelectItem value="> 7 days">More than a week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Additional notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any other observations..."
                    className="mt-1 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={selected.length === 0} className="w-full mt-4 rounded-xl">
                Check Symptoms
              </Button>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`rounded-2xl p-5 ${config.bg} mb-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <UrgencyIcon size={24} className={config.color} />
                  <span className={`font-bold text-lg ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-sm text-foreground/80">
                  {urgency === 'high'
                    ? 'We recommend contacting your veterinarian as soon as possible.'
                    : urgency === 'moderate'
                    ? 'Monitor closely. If symptoms persist or worsen, consult your vet.'
                    : 'Keep an eye on your pet. These symptoms are usually mild.'}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-2">Logged symptoms:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((s) => (
                    <span key={s} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 italic">
                ⚠️ This is for informational purposes only and is not medical advice.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1 rounded-xl">Back</Button>
                <Button onClick={handleSave} className="flex-1 rounded-xl">Save Log</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SymptomChecker;

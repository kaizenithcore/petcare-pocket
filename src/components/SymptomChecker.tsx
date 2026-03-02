import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePetStore, generateId, SYMPTOM_OPTIONS, getUrgency } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

const SYMPTOM_KEYS: Record<string, string> = {
  'Vomiting': 'symptoms.vomiting',
  'Diarrhea': 'symptoms.diarrhea',
  'Lethargy': 'symptoms.lethargy',
  'Fever': 'symptoms.fever',
  'Appetite loss': 'symptoms.appetiteLoss',
  'Coughing': 'symptoms.coughing',
  'Sneezing': 'symptoms.sneezing',
  'Limping': 'symptoms.limping',
  'Scratching': 'symptoms.scratching',
  'Eye discharge': 'symptoms.eyeDischarge',
  'Ear issues': 'symptoms.earIssues',
  'Skin issues': 'symptoms.skinIssues',
  'Breathing difficulty': 'symptoms.breathingDifficulty',
  'Weight loss': 'symptoms.weightLoss',
};

interface SymptomCheckerProps {
  open: boolean;
  onClose: () => void;
}

const SymptomChecker = ({ open, onClose }: SymptomCheckerProps) => {
  const { activePetId, pets, addSymptomLog } = usePetStore();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [showResult, setShowResult] = useState(false);

  const pet = pets.find((p) => p.id === activePetId);

  const urgencyConfig = {
    low: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: t('symptoms.low') },
    moderate: { icon: Info, color: 'text-peach-foreground', bg: 'bg-peach', label: t('symptoms.moderate') },
    high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: t('symptoms.high') },
  };

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
            {pet ? t('symptoms.checkFor', { name: pet.name }) : t('symptoms.title')}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Medical disclaimer - always visible before using */}
        <div className="bg-peach/20 rounded-xl p-3 mb-4 flex items-start gap-2">
          <ShieldAlert size={18} className="text-peach-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-peach-foreground leading-relaxed">
            {t('symptoms.medicalDisclaimer')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-muted-foreground mb-4">{t('symptoms.selectSymptoms')}</p>
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
                    {t(SYMPTOM_KEYS[symptom] || symptom)}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <Label>{t('symptoms.duration')}</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={t('symptoms.howLong')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 1 day">{t('symptoms.lessThanDay')}</SelectItem>
                      <SelectItem value="1-3 days">{t('symptoms.oneToThree')}</SelectItem>
                      <SelectItem value="3-7 days">{t('symptoms.threeToSeven')}</SelectItem>
                      <SelectItem value="> 7 days">{t('symptoms.moreThanWeek')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('symptoms.additionalNotes')}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('symptoms.notesPlaceholder')}
                    className="mt-1 rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={selected.length === 0} className="w-full mt-4 rounded-xl">
                {t('symptoms.checkSymptoms')}
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
                    ? t('symptoms.highAdvice')
                    : urgency === 'moderate'
                    ? t('symptoms.moderateAdvice')
                    : t('symptoms.lowAdvice')}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-2">{t('symptoms.loggedSymptoms')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((s) => (
                    <span key={s} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{t(SYMPTOM_KEYS[s] || s)}</span>
                  ))}
                </div>
              </div>

              {/* Medical disclaimer in results */}
              <div className="bg-peach/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                <ShieldAlert size={16} className="text-peach-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-peach-foreground leading-relaxed">
                  {t('symptoms.medicalDisclaimer')}
                </p>
              </div>

              <p className="text-xs text-muted-foreground mb-4 italic">
                {t('symptoms.disclaimer')}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1 rounded-xl">{t('symptoms.back')}</Button>
                <Button onClick={handleSave} className="flex-1 rounded-xl">{t('symptoms.saveLog')}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SymptomChecker;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePetStore, generateId } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

type RecordType = 'vaccine' | 'medication' | 'visit' | 'reminder';

interface AddRecordDialogProps {
  open: boolean;
  onClose: () => void;
  type: RecordType;
}

const AddRecordDialog = ({ open, onClose, type }: AddRecordDialogProps) => {
  const { activePetId, addVaccine, addMedication, addVisit, addReminder } = usePetStore();
  const { addVaccineCloud, addMedicationCloud, addVisitCloud, addReminderCloud, isCloud } = useCloudStore();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!activePetId) return;
    setSaving(true);

    if (isCloud && user) {
      if (type === 'vaccine') {
        await addVaccineCloud({
          petId: activePetId, name: form.name || '',
          dateAdministered: form.date || '', nextDueDate: form.nextDue || '',
          clinicName: form.clinic || '', notes: form.notes || '',
        });
      } else if (type === 'medication') {
        await addMedicationCloud({
          petId: activePetId, name: form.name || '', dose: form.dose || '',
          frequency: (form.frequency as 'daily' | 'weekly' | 'custom') || 'daily',
          startDate: form.startDate || '', endDate: form.endDate || '', notes: form.notes || '',
        });
      } else if (type === 'visit') {
        await addVisitCloud({
          petId: activePetId, date: form.date || '',
          reason: form.reason || '', diagnosis: form.diagnosis || '', notes: form.notes || '',
        });
      } else if (type === 'reminder') {
        await addReminderCloud({
          petId: activePetId, title: form.title || '',
          type: (form.reminderType as 'vaccine' | 'medication' | 'grooming' | 'appointment') || 'appointment',
          dueDate: form.dueDate || '', completed: false, snoozed: false,
        });
      }
    } else {
      const id = generateId();
      if (type === 'vaccine') {
        addVaccine({ id, petId: activePetId, name: form.name || '', dateAdministered: form.date || '', nextDueDate: form.nextDue || '', clinicName: form.clinic || '', notes: form.notes || '' });
      } else if (type === 'medication') {
        addMedication({ id, petId: activePetId, name: form.name || '', dose: form.dose || '', frequency: (form.frequency as 'daily' | 'weekly' | 'custom') || 'daily', startDate: form.startDate || '', endDate: form.endDate || '', notes: form.notes || '' });
      } else if (type === 'visit') {
        addVisit({ id, petId: activePetId, date: form.date || '', reason: form.reason || '', diagnosis: form.diagnosis || '', notes: form.notes || '' });
      } else if (type === 'reminder') {
        addReminder({ id, petId: activePetId, title: form.title || '', type: (form.reminderType as 'vaccine' | 'medication' | 'grooming' | 'appointment') || 'appointment', dueDate: form.dueDate || '', completed: false, snoozed: false });
      }
    }

    setSaving(false);
    setForm({});
    onClose();
  };

  if (!open) return null;

  const titles: Record<RecordType, string> = {
    vaccine: t('records.addVaccine'),
    medication: t('records.addMedication'),
    visit: t('records.addVisit'),
    reminder: t('records.addReminder'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-2xl p-6 shadow-float max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{titles[type]}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted"><X size={20} className="text-muted-foreground" /></button>
        </div>

        <div className="space-y-4">
          {type === 'vaccine' && (
            <>
              <div><Label>{t('records.vaccineName')}</Label><Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} className="mt-1 rounded-xl" placeholder="Rabies" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t('records.date')}</Label><Input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} className="mt-1 rounded-xl" /></div>
                <div><Label>{t('records.nextDue')}</Label><Input type="date" value={form.nextDue || ''} onChange={(e) => set('nextDue', e.target.value)} className="mt-1 rounded-xl" /></div>
              </div>
              <div><Label>{t('records.clinic')}</Label><Input value={form.clinic || ''} onChange={(e) => set('clinic', e.target.value)} className="mt-1 rounded-xl" /></div>
            </>
          )}
          {type === 'medication' && (
            <>
              <div><Label>{t('records.medicationName')}</Label><Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} className="mt-1 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t('records.dose')}</Label><Input value={form.dose || ''} onChange={(e) => set('dose', e.target.value)} className="mt-1 rounded-xl" placeholder="10mg" /></div>
                <div><Label>{t('records.frequency')}</Label>
                  <Select value={form.frequency || 'daily'} onValueChange={(v) => set('frequency', v)}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('records.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('records.weekly')}</SelectItem>
                      <SelectItem value="custom">{t('records.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t('records.startDate')}</Label><Input type="date" value={form.startDate || ''} onChange={(e) => set('startDate', e.target.value)} className="mt-1 rounded-xl" /></div>
                <div><Label>{t('records.endDate')}</Label><Input type="date" value={form.endDate || ''} onChange={(e) => set('endDate', e.target.value)} className="mt-1 rounded-xl" /></div>
              </div>
            </>
          )}
          {type === 'visit' && (
            <>
              <div><Label>{t('records.date')}</Label><Input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} className="mt-1 rounded-xl" /></div>
              <div><Label>{t('records.reason')}</Label><Input value={form.reason || ''} onChange={(e) => set('reason', e.target.value)} className="mt-1 rounded-xl" /></div>
              <div><Label>{t('records.diagnosis')}</Label><Input value={form.diagnosis || ''} onChange={(e) => set('diagnosis', e.target.value)} className="mt-1 rounded-xl" /></div>
            </>
          )}
          {type === 'reminder' && (
            <>
              <div><Label>{t('records.title')}</Label><Input value={form.title || ''} onChange={(e) => set('title', e.target.value)} className="mt-1 rounded-xl" /></div>
              <div><Label>{t('records.type')}</Label>
                <Select value={form.reminderType || 'appointment'} onValueChange={(v) => set('reminderType', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccine">💉 {t('reminders.vaccine')}</SelectItem>
                    <SelectItem value="medication">💊 {t('reminders.medication')}</SelectItem>
                    <SelectItem value="grooming">✂️ {t('reminders.grooming')}</SelectItem>
                    <SelectItem value="appointment">📋 {t('reminders.appointment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t('records.dueDate')}</Label><Input type="date" value={form.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} className="mt-1 rounded-xl" /></div>
            </>
          )}
          <div><Label>{t('records.notes')}</Label><Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} className="mt-1 rounded-xl resize-none" rows={2} /></div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t('records.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl">
            {saving ? t('app.loading') : t('records.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddRecordDialog;

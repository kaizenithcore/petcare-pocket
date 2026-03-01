import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePetStore } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import type { Vaccine, Medication, Visit, Reminder } from '@/lib/store';

type RecordType = 'vaccine' | 'medication' | 'visit' | 'reminder';

interface EditRecordDialogProps {
  open: boolean;
  onClose: () => void;
  type: RecordType;
  record: Vaccine | Medication | Visit | Reminder | null;
}

const EditRecordDialog = ({ open, onClose, type, record }: EditRecordDialogProps) => {
  const store = usePetStore();
  const cloud = useCloudStore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!record) return;
    if (type === 'vaccine') {
      const v = record as Vaccine;
      setForm({ name: v.name, date: v.dateAdministered, nextDue: v.nextDueDate, clinic: v.clinicName, notes: v.notes });
    } else if (type === 'medication') {
      const m = record as Medication;
      setForm({ name: m.name, dose: m.dose, frequency: m.frequency, startDate: m.startDate, endDate: m.endDate, notes: m.notes });
    } else if (type === 'visit') {
      const v = record as Visit;
      setForm({ date: v.date, reason: v.reason, diagnosis: v.diagnosis, notes: v.notes });
    } else if (type === 'reminder') {
      const r = record as Reminder;
      setForm({ title: r.title, reminderType: r.type, dueDate: r.dueDate, notes: '' });
    }
  }, [record, type]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);

    if (type === 'vaccine') {
      const data = { name: form.name, dateAdministered: form.date, nextDueDate: form.nextDue, clinicName: form.clinic, notes: form.notes };
      if (cloud.isCloud) await cloud.updateVaccineCloud(record.id, data);
      else store.updateVaccine(record.id, data);
    } else if (type === 'medication') {
      const data = { name: form.name, dose: form.dose, frequency: form.frequency as Medication['frequency'], startDate: form.startDate, endDate: form.endDate, notes: form.notes };
      if (cloud.isCloud) await cloud.updateMedicationCloud(record.id, data);
      else store.updateMedication(record.id, data);
    } else if (type === 'visit') {
      const data = { date: form.date, reason: form.reason, diagnosis: form.diagnosis, notes: form.notes };
      if (cloud.isCloud) await cloud.updateVisitCloud(record.id, data);
      else store.updateVisit(record.id, data);
    } else if (type === 'reminder') {
      // Reminders don't have an update in cloud yet, toggle only
    }

    setSaving(false);
    toast({ title: t('records.updated') });
    onClose();
  };

  const handleDelete = async () => {
    if (!record) return;
    setSaving(true);

    if (type === 'vaccine') {
      if (cloud.isCloud) await cloud.deleteVaccineCloud(record.id);
      else store.deleteVaccine(record.id);
    } else if (type === 'medication') {
      if (cloud.isCloud) await cloud.deleteMedicationCloud(record.id);
      else store.deleteMedication(record.id);
    } else if (type === 'visit') {
      if (cloud.isCloud) await cloud.deleteVisitCloud(record.id);
      else store.deleteVisit(record.id);
    } else if (type === 'reminder') {
      if (cloud.isCloud) await cloud.deleteReminderCloud(record.id);
      else store.deleteReminder(record.id);
    }

    setSaving(false);
    toast({ title: t('records.deleted') });
    onClose();
  };

  if (!open || !record) return null;

  const titles: Record<RecordType, string> = {
    vaccine: t('records.editVaccine'),
    medication: t('records.editMedication'),
    visit: t('records.editVisit'),
    reminder: t('records.editReminder'),
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
              <div><Label>{t('records.vaccineName')}</Label><Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} className="mt-1 rounded-xl" /></div>
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
                <div><Label>{t('records.dose')}</Label><Input value={form.dose || ''} onChange={(e) => set('dose', e.target.value)} className="mt-1 rounded-xl" /></div>
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
              <div><Label>{t('records.title')}</Label><Input value={form.title || ''} onChange={(e) => set('title', e.target.value)} className="mt-1 rounded-xl" disabled /></div>
              <div><Label>{t('records.dueDate')}</Label><Input type="date" value={form.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} className="mt-1 rounded-xl" disabled /></div>
            </>
          )}
          {type !== 'reminder' && (
            <div><Label>{t('records.notes')}</Label><Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} className="mt-1 rounded-xl resize-none" rows={2} /></div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="destructive" onClick={handleDelete} disabled={saving} className="rounded-xl">
            {t('common.delete')}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="rounded-xl">{t('records.cancel')}</Button>
          {type !== 'reminder' && (
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              {saving ? t('common.saving') : t('records.save')}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditRecordDialog;

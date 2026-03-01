import { useState } from 'react';
import { motion } from 'framer-motion';
import { Syringe, Pill, Stethoscope, Calendar, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { usePetStore } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EditRecordDialog from './EditRecordDialog';
import type { Vaccine, Medication, Visit } from '@/lib/store';

const PetHealthTabs = () => {
  const { activePetId, vaccines, medications, visits } = usePetStore();
  const cloud = useCloudStore();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [editRecord, setEditRecord] = useState<{ type: 'vaccine' | 'medication' | 'visit'; record: Vaccine | Medication | Visit } | null>(null);

  const petVaccines = vaccines.filter((v) => v.petId === activePetId);
  const petMeds = medications.filter((m) => m.petId === activePetId);
  const petVisits = visits.filter((v) => v.petId === activePetId);

  const handleDelete = async (type: 'vaccine' | 'medication' | 'visit', id: string) => {
    if (type === 'vaccine') {
      if (cloud.isCloud) await cloud.deleteVaccineCloud(id);
      else usePetStore.getState().deleteVaccine(id);
    } else if (type === 'medication') {
      if (cloud.isCloud) await cloud.deleteMedicationCloud(id);
      else usePetStore.getState().deleteMedication(id);
    } else if (type === 'visit') {
      if (cloud.isCloud) await cloud.deleteVisitCloud(id);
      else usePetStore.getState().deleteVisit(id);
    }
    toast({ title: t('records.deleted') });
  };

  const EmptyState = ({ label }: { label: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">{label}</p>
    </div>
  );

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const RecordActions = ({ type, record }: { type: 'vaccine' | 'medication' | 'visit'; record: Vaccine | Medication | Visit }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-full hover:bg-muted transition-colors shrink-0">
          <MoreVertical size={16} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditRecord({ type, record })}>
          <Pencil size={14} className="mr-2" /> {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(type, record.id)} className="text-destructive focus:text-destructive">
          <Trash2 size={14} className="mr-2" /> {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Tabs defaultValue="vaccines" className="w-full">
        <TabsList className="w-full bg-muted rounded-xl p-1 h-auto">
          <TabsTrigger value="vaccines" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
            💉 {t('health.vaccines')}
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
            💊 {t('health.medications')}
          </TabsTrigger>
          <TabsTrigger value="visits" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
            🩺 {t('health.visits')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccines" className="mt-3">
          {petVaccines.length === 0 ? <EmptyState label={t('health.noVaccines')} /> : (
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
              {petVaccines.map((v) => (
                <motion.div key={v.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Syringe size={16} className="text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">{v.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.nextDueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} /> {v.nextDueDate}
                        </span>
                      )}
                      <RecordActions type="vaccine" record={v} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('health.given')} {v.dateAdministered} {v.clinicName && `${t('health.at')} ${v.clinicName}`}
                  </p>
                  {v.notes && <p className="text-xs text-muted-foreground mt-1 italic">{v.notes}</p>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="medications" className="mt-3">
          {petMeds.length === 0 ? <EmptyState label={t('health.noMedications')} /> : (
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
              {petMeds.map((m) => (
                <motion.div key={m.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Pill size={16} className="text-accent shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">{m.name}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">{m.frequency}</span>
                    </div>
                    <RecordActions type="medication" record={m} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.dose} · {m.startDate} → {m.endDate || t('health.ongoing')}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="visits" className="mt-3">
          {petVisits.length === 0 ? <EmptyState label={t('health.noVisits')} /> : (
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
              {petVisits.map((v) => (
                <motion.div key={v.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Stethoscope size={16} className="text-sky shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">{v.reason}</span>
                    </div>
                    <RecordActions type="visit" record={v} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{v.date}</p>
                  {v.diagnosis && <p className="text-xs text-foreground/70 mt-1">{t('health.diagnosis')}: {v.diagnosis}</p>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <EditRecordDialog
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        type={editRecord?.type || 'vaccine'}
        record={editRecord?.record || null}
      />
    </>
  );
};

export default PetHealthTabs;

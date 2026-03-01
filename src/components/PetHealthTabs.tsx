import { motion } from 'framer-motion';
import { Syringe, Pill, Stethoscope, Calendar, CheckCircle } from 'lucide-react';
import { usePetStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const typeIcons = {
  vaccine: Syringe,
  medication: Pill,
  visit: Stethoscope,
};

const PetHealthTabs = () => {
  const { activePetId, vaccines, medications, visits } = usePetStore();
  
  const petVaccines = vaccines.filter((v) => v.petId === activePetId);
  const petMeds = medications.filter((m) => m.petId === activePetId);
  const petVisits = visits.filter((v) => v.petId === activePetId);

  const EmptyState = ({ label }: { label: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">No {label} recorded yet</p>
    </div>
  );

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Tabs defaultValue="vaccines" className="w-full">
      <TabsList className="w-full bg-muted rounded-xl p-1 h-auto">
        <TabsTrigger value="vaccines" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
          💉 Vaccines
        </TabsTrigger>
        <TabsTrigger value="medications" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
          💊 Meds
        </TabsTrigger>
        <TabsTrigger value="visits" className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-card">
          🩺 Visits
        </TabsTrigger>
      </TabsList>

      <TabsContent value="vaccines" className="mt-3">
        {petVaccines.length === 0 ? <EmptyState label="vaccines" /> : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
            {petVaccines.map((v) => (
              <motion.div key={v.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Syringe size={16} className="text-primary" />
                    <span className="font-semibold text-sm text-foreground">{v.name}</span>
                  </div>
                  {v.nextDueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> Due {v.nextDueDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Given {v.dateAdministered} {v.clinicName && `at ${v.clinicName}`}
                </p>
                {v.notes && <p className="text-xs text-muted-foreground mt-1 italic">{v.notes}</p>}
              </motion.div>
            ))}
          </motion.div>
        )}
      </TabsContent>

      <TabsContent value="medications" className="mt-3">
        {petMeds.length === 0 ? <EmptyState label="medications" /> : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
            {petMeds.map((m) => (
              <motion.div key={m.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-accent" />
                  <span className="font-semibold text-sm text-foreground">{m.name}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m.frequency}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{m.dose} · {m.startDate} → {m.endDate || 'ongoing'}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </TabsContent>

      <TabsContent value="visits" className="mt-3">
        {petVisits.length === 0 ? <EmptyState label="vet visits" /> : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-2">
            {petVisits.map((v) => (
              <motion.div key={v.id} variants={item} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-sky" />
                  <span className="font-semibold text-sm text-foreground">{v.reason}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{v.date}</p>
                {v.diagnosis && <p className="text-xs text-foreground/70 mt-1">Diagnosis: {v.diagnosis}</p>}
              </motion.div>
            ))}
          </motion.div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PetHealthTabs;

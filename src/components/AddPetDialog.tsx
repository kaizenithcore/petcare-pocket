import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePetStore, generateId, type Species } from '@/lib/store';
import { useCloudStore } from '@/hooks/useCloudStore';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

interface AddPetDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddPetDialog = ({ open, onClose }: AddPetDialogProps) => {
  const { addPet } = usePetStore();
  const { addPetCloud, isCloud } = useCloudStore();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const petData = {
      name: name.trim(),
      species,
      breed,
      birthdate,
      weight: parseFloat(weight) || 0,
      microchipId: microchipId || undefined,
      emergencyContact,
    };

    if (isCloud && user) {
      await addPetCloud(petData);
      toast({ title: t('app.success'), description: t('pets.addNewPet') });
    } else {
      addPet({ id: generateId(), ...petData });
    }

    setSaving(false);
    setName(''); setBreed(''); setBirthdate(''); setWeight(''); setMicrochipId(''); setEmergencyContact('');
    onClose();
  };

  if (!open) return null;

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{t('pets.addNewPet')}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t('pets.name')} *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Luna" className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label>{t('pets.species')}</Label>
            <Select value={species} onValueChange={(v) => setSpecies(v as Species)}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">🐕 {t('pets.dog')}</SelectItem>
                <SelectItem value="cat">🐈 {t('pets.cat')}</SelectItem>
                <SelectItem value="other">🐾 {t('pets.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="breed">{t('pets.breed')}</Label>
            <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Golden Retriever" className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="birthdate">{t('pets.birthdate')}</Label>
              <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="weight">{t('pets.weight')} ({t('pets.weightUnit')})</Label>
              <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="12" className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label htmlFor="microchip">{t('pets.microchipId')}</Label>
            <Input id="microchip" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="emergency">{t('pets.emergencyContact')}</Label>
            <Input id="emergency" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="+1 555 0123" className="mt-1 rounded-xl" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t('records.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving} className="flex-1 rounded-xl">
            {saving ? t('app.loading') : t('pets.addPet')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddPetDialog;

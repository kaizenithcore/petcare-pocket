import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import type { Pet, Species } from '@/lib/store';

interface EditPetDialogProps {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
  onSave: (id: string, data: Partial<Pet>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const EditPetDialog = ({ open, onClose, pet, onSave, onDelete }: EditPetDialogProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed);
      setBirthdate(pet.birthdate);
      setWeight(pet.weight ? String(pet.weight) : '');
      setMicrochipId(pet.microchipId || '');
      setEmergencyContact(pet.emergencyContact);
      setShowDeleteConfirm(false);
    }
  }, [pet]);

  const handleSave = async () => {
    if (!pet || !name.trim()) return;
    setSaving(true);
    await onSave(pet.id, {
      name: name.trim(),
      species,
      breed,
      birthdate,
      weight: parseFloat(weight) || 0,
      microchipId: microchipId || undefined,
      emergencyContact,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!pet) return;
    setDeleting(true);
    await onDelete(pet.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!open || !pet) return null;

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
          <h2 className="text-xl font-bold text-foreground">{t('pets.editPet')}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">{t('pets.name')} *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
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
            <Label htmlFor="edit-breed">{t('pets.breed')}</Label>
            <Input id="edit-breed" value={breed} onChange={(e) => setBreed(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-birthdate">{t('pets.birthdate')}</Label>
              <Input id="edit-birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="edit-weight">{t('pets.weight')} ({t('pets.weightUnit')})</Label>
              <Input id="edit-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-microchip">{t('pets.microchipId')}</Label>
            <Input id="edit-microchip" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label htmlFor="edit-emergency">{t('pets.emergencyContact')}</Label>
            <Input id="edit-emergency" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="+1 555 0123" className="mt-1 rounded-xl" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t('records.cancel')}</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="flex-1 rounded-xl">
            {saving ? t('app.loading') : t('records.save')}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 pt-4 border-t border-border">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              <Trash2 size={16} />
              {t('pets.deletePet')}
            </button>
          ) : (
            <div className="bg-destructive/5 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{t('common.areYouSure')}</p>
              <p className="text-xs text-muted-foreground">{t('pets.deleteWarning')}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl">
                  {t('common.no')}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl">
                  {deleting ? t('app.loading') : t('common.delete')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditPetDialog;

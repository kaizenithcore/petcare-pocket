import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { usePetStore, speciesEmoji } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface PetCarouselProps {
  onAddPet: () => void;
  onEditPet?: () => void;
}

const PetCarousel = ({ onAddPet, onEditPet }: PetCarouselProps) => {
  const { pets, activePetId, setActivePet } = usePetStore();
  const { t } = useTranslation();
  const [scrollIndex, setScrollIndex] = useState(0);

  if (pets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-card"
      >
        <div className="text-5xl animate-float">🐾</div>
        <p className="text-lg font-semibold text-foreground">{t('pets.noPets')}</p>
        <p className="text-sm text-muted-foreground">{t('pets.noPetsDesc')}</p>
        <Button onClick={onAddPet} className="rounded-full gap-2">
          <Plus size={18} /> {t('pets.addPet')}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {pets.length > 3 && (
          <button
            onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex gap-3 overflow-hidden flex-1">
          <AnimatePresence mode="popLayout">
            {pets.slice(scrollIndex, scrollIndex + 4).map((pet) => (
              <motion.button
                key={pet.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setActivePet(pet.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 min-w-[80px] transition-all ${
                  activePetId === pet.id
                    ? 'bg-primary/10 ring-2 ring-primary shadow-soft'
                    : 'bg-card shadow-card hover:shadow-soft'
                }`}
              >
                {activePetId === pet.id && onEditPet && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditPet(); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                  >
                    <Pencil size={10} className="text-primary" />
                  </button>
                )}
                <span className="text-3xl">{speciesEmoji[pet.species]}</span>
                <span className="text-xs font-semibold text-foreground truncate max-w-[72px]">
                  {pet.name}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddPet}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-primary/30 p-3 min-w-[80px] text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus size={24} />
            <span className="text-xs font-semibold">{t('pets.addPet')}</span>
          </motion.button>
        </div>
        {pets.length > 3 && (
          <button
            onClick={() => setScrollIndex(Math.min(pets.length - 3, scrollIndex + 1))}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PetCarousel;

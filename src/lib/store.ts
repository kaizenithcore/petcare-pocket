import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Species = 'dog' | 'cat' | 'other';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  birthdate: string;
  weight: number;
  microchipId?: string;
  photoUrl?: string;
  emergencyContact: string;
}

export interface Vaccine {
  id: string;
  petId: string;
  name: string;
  dateAdministered: string;
  nextDueDate: string;
  clinicName: string;
  notes: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dose: string;
  frequency: 'daily' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  notes: string;
}

export interface Visit {
  id: string;
  petId: string;
  date: string;
  reason: string;
  diagnosis: string;
  notes: string;
}

export interface Reminder {
  id: string;
  petId: string;
  title: string;
  type: 'vaccine' | 'medication' | 'grooming' | 'appointment';
  dueDate: string;
  completed: boolean;
  snoozed: boolean;
}

export interface SymptomLog {
  id: string;
  petId: string;
  date: string;
  symptoms: string[];
  notes: string;
  duration: string;
  urgency: 'low' | 'moderate' | 'high';
}

interface PetStore {
  pets: Pet[];
  vaccines: Vaccine[];
  medications: Medication[];
  visits: Visit[];
  reminders: Reminder[];
  symptomLogs: SymptomLog[];
  activePetId: string | null;
  
  setActivePet: (id: string) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, data: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  
  addVaccine: (v: Vaccine) => void;
  updateVaccine: (id: string, data: Partial<Vaccine>) => void;
  deleteVaccine: (id: string) => void;
  addMedication: (m: Medication) => void;
  updateMedication: (id: string, data: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addVisit: (v: Visit) => void;
  updateVisit: (id: string, data: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  
  addReminder: (r: Reminder) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  
  addSymptomLog: (s: SymptomLog) => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set) => ({
      pets: [],
      vaccines: [],
      medications: [],
      visits: [],
      reminders: [],
      symptomLogs: [],
      activePetId: null,

      setActivePet: (id) => set({ activePetId: id }),
      
      addPet: (pet) => set((s) => ({ 
        pets: [...s.pets, pet],
        activePetId: s.activePetId ?? pet.id,
      })),
      
      updatePet: (id, data) => set((s) => ({
        pets: s.pets.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      
      deletePet: (id) => set((s) => ({
        pets: s.pets.filter((p) => p.id !== id),
        activePetId: s.activePetId === id ? (s.pets[0]?.id ?? null) : s.activePetId,
      })),

      addVaccine: (v) => set((s) => ({ vaccines: [...s.vaccines, v] })),
      updateVaccine: (id, data) => set((s) => ({ vaccines: s.vaccines.map((v) => v.id === id ? { ...v, ...data } : v) })),
      deleteVaccine: (id) => set((s) => ({ vaccines: s.vaccines.filter((v) => v.id !== id) })),
      addMedication: (m) => set((s) => ({ medications: [...s.medications, m] })),
      updateMedication: (id, data) => set((s) => ({ medications: s.medications.map((m) => m.id === id ? { ...m, ...data } : m) })),
      deleteMedication: (id) => set((s) => ({ medications: s.medications.filter((m) => m.id !== id) })),
      addVisit: (v) => set((s) => ({ visits: [...s.visits, v] })),
      updateVisit: (id, data) => set((s) => ({ visits: s.visits.map((v) => v.id === id ? { ...v, ...data } : v) })),
      deleteVisit: (id) => set((s) => ({ visits: s.visits.filter((v) => v.id !== id) })),
      
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, r] })),
      toggleReminder: (id) => set((s) => ({
        reminders: s.reminders.map((r) => r.id === id ? { ...r, completed: !r.completed } : r),
      })),
      deleteReminder: (id) => set((s) => ({
        reminders: s.reminders.filter((r) => r.id !== id),
      })),
      
      addSymptomLog: (s_) => set((s) => ({ symptomLogs: [...s.symptomLogs, s_] })),
    }),
    { name: 'petcare-pocket' }
  )
);

export const generateId = () => crypto.randomUUID();

export const SYMPTOM_OPTIONS = [
  'Vomiting', 'Diarrhea', 'Lethargy', 'Fever', 'Appetite loss',
  'Coughing', 'Sneezing', 'Limping', 'Scratching', 'Eye discharge',
  'Ear issues', 'Skin issues', 'Breathing difficulty', 'Weight loss',
];

export const getUrgency = (symptoms: string[]): 'low' | 'moderate' | 'high' => {
  const highUrgency = ['Breathing difficulty', 'Fever', 'Vomiting'];
  const modUrgency = ['Diarrhea', 'Lethargy', 'Appetite loss', 'Limping'];
  const hasHigh = symptoms.some((s) => highUrgency.includes(s));
  const hasMod = symptoms.some((s) => modUrgency.includes(s));
  if (hasHigh || symptoms.length >= 4) return 'high';
  if (hasMod || symptoms.length >= 2) return 'moderate';
  return 'low';
};

export const speciesEmoji: Record<Species, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐾',
};

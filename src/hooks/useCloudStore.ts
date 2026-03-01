import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePetStore, type Pet, type Vaccine, type Medication, type Visit, type Reminder, type SymptomLog } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  notification_enabled: boolean;
  reminder_default_time: string;
  overdue_alerts_enabled: boolean;
  default_reminder_recurrence: string;
  default_snooze_duration: string;
  language: string;
}

export const useCloudStore = () => {
  const { user, isGuest } = useAuth();
  const store = usePetStore();
  const { toast } = useToast();

  const loadCloudData = useCallback(async () => {
    if (!user) return;

    try {
      const [petsRes, vaccinesRes, medsRes, visitsRes, remindersRes, symptomsRes] = await Promise.all([
        supabase.from('pets').select('*').eq('user_id', user.id),
        supabase.from('vaccines').select('*').eq('user_id', user.id),
        supabase.from('medications').select('*').eq('user_id', user.id),
        supabase.from('visits').select('*').eq('user_id', user.id),
        supabase.from('reminders').select('*').eq('user_id', user.id),
        supabase.from('symptom_logs').select('*').eq('user_id', user.id),
      ]);

      const pets: Pet[] = (petsRes.data || []).map((p) => ({
        id: p.id, name: p.name, species: p.species as Pet['species'],
        breed: p.breed || '', birthdate: p.birthdate || '',
        weight: Number(p.weight) || 0, microchipId: p.microchip_id || undefined,
        photoUrl: p.photo_url || undefined, emergencyContact: p.emergency_contact || '',
      }));

      const vaccines: Vaccine[] = (vaccinesRes.data || []).map((v) => ({
        id: v.id, petId: v.pet_id, name: v.name,
        dateAdministered: v.date_administered, nextDueDate: v.next_due_date,
        clinicName: v.clinic_name || '', notes: v.notes || '',
      }));

      const medications: Medication[] = (medsRes.data || []).map((m) => ({
        id: m.id, petId: m.pet_id, name: m.name, dose: m.dose || '',
        frequency: m.frequency as Medication['frequency'],
        startDate: m.start_date, endDate: m.end_date || '', notes: m.notes || '',
      }));

      const visits: Visit[] = (visitsRes.data || []).map((v) => ({
        id: v.id, petId: v.pet_id, date: v.date,
        reason: v.reason || '', diagnosis: v.diagnosis || '', notes: v.notes || '',
      }));

      const reminders: Reminder[] = (remindersRes.data || []).map((r) => ({
        id: r.id, petId: r.pet_id, title: r.title,
        type: r.type as Reminder['type'], dueDate: r.due_date,
        completed: r.completed, snoozed: r.snoozed,
      }));

      const symptomLogs: SymptomLog[] = (symptomsRes.data || []).map((s) => ({
        id: s.id, petId: s.pet_id, date: s.date,
        symptoms: s.symptoms || [], notes: s.notes || '',
        duration: s.duration || '', urgency: s.urgency as SymptomLog['urgency'],
      }));

      usePetStore.setState({
        pets, vaccines, medications, visits, reminders, symptomLogs,
        activePetId: pets[0]?.id ?? null,
      });
    } catch (err) {
      console.error('Failed to load cloud data:', err);
    }
  }, [user]);

  const migrateLocalData = useCallback(async () => {
    if (!user) return;
    const { pets, vaccines, medications, visits, reminders, symptomLogs } = usePetStore.getState();
    
    if (pets.length === 0) return;

    try {
      for (const pet of pets) {
        const { data: inserted } = await supabase.from('pets').insert({
          user_id: user.id, name: pet.name, species: pet.species,
          breed: pet.breed, birthdate: pet.birthdate,
          weight: pet.weight, microchip_id: pet.microchipId,
          emergency_contact: pet.emergencyContact,
        }).select().single();

        if (!inserted) continue;
        const oldId = pet.id;
        const newId = inserted.id;

        const petVaccines = vaccines.filter(v => v.petId === oldId);
        for (const v of petVaccines) {
          await supabase.from('vaccines').insert({
            user_id: user.id, pet_id: newId, name: v.name,
            date_administered: v.dateAdministered, next_due_date: v.nextDueDate,
            clinic_name: v.clinicName, notes: v.notes,
          });
        }

        const petMeds = medications.filter(m => m.petId === oldId);
        for (const m of petMeds) {
          await supabase.from('medications').insert({
            user_id: user.id, pet_id: newId, name: m.name,
            dose: m.dose, frequency: m.frequency,
            start_date: m.startDate, end_date: m.endDate, notes: m.notes,
          });
        }

        const petVisits = visits.filter(v => v.petId === oldId);
        for (const v of petVisits) {
          await supabase.from('visits').insert({
            user_id: user.id, pet_id: newId, date: v.date,
            reason: v.reason, diagnosis: v.diagnosis, notes: v.notes,
          });
        }

        const petReminders = reminders.filter(r => r.petId === oldId);
        for (const r of petReminders) {
          await supabase.from('reminders').insert({
            user_id: user.id, pet_id: newId, title: r.title,
            type: r.type, due_date: r.dueDate,
            completed: r.completed, snoozed: r.snoozed,
          });
        }

        const petSymptoms = symptomLogs.filter(s => s.petId === oldId);
        for (const s of petSymptoms) {
          await supabase.from('symptom_logs').insert({
            user_id: user.id, pet_id: newId, date: s.date,
            symptoms: s.symptoms, notes: s.notes,
            duration: s.duration, urgency: s.urgency,
          });
        }
      }

      localStorage.removeItem('petcare-pocket');
      toast({ title: 'Data migrated to cloud successfully!' });
      await loadCloudData();
    } catch (err) {
      console.error('Migration failed:', err);
      toast({ title: 'Migration failed', description: 'Your local data is still safe.', variant: 'destructive' });
    }
  }, [user, loadCloudData, toast]);

  // Cloud CRUD operations
  const addPetCloud = useCallback(async (pet: Omit<Pet, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('pets').insert({
      user_id: user.id, name: pet.name, species: pet.species,
      breed: pet.breed, birthdate: pet.birthdate,
      weight: pet.weight, microchip_id: pet.microchipId,
      emergency_contact: pet.emergencyContact,
    }).select().single();
    if (data) await loadCloudData();
    return data;
  }, [user, loadCloudData]);

  const updatePetCloud = useCallback(async (id: string, data: Partial<Pet>) => {
    if (!user) return;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.species !== undefined) updateData.species = data.species;
    if (data.breed !== undefined) updateData.breed = data.breed;
    if (data.birthdate !== undefined) updateData.birthdate = data.birthdate;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.microchipId !== undefined) updateData.microchip_id = data.microchipId;
    if (data.emergencyContact !== undefined) updateData.emergency_contact = data.emergencyContact;
    if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;

    const { error } = await supabase.from('pets').update(updateData).eq('id', id).eq('user_id', user.id);
    if (!error) await loadCloudData();
    return { error };
  }, [user, loadCloudData]);

  const deletePetCloud = useCallback(async (id: string) => {
    if (!user) return;
    // CASCADE delete handles related records via FK constraints
    const { error } = await supabase.from('pets').delete().eq('id', id).eq('user_id', user.id);
    if (!error) await loadCloudData();
    return { error };
  }, [user, loadCloudData]);

  const addVaccineCloud = useCallback(async (v: Omit<Vaccine, 'id'>) => {
    if (!user) return;
    await supabase.from('vaccines').insert({
      user_id: user.id, pet_id: v.petId, name: v.name,
      date_administered: v.dateAdministered, next_due_date: v.nextDueDate,
      clinic_name: v.clinicName, notes: v.notes,
    });
    await loadCloudData();
  }, [user, loadCloudData]);

  const addMedicationCloud = useCallback(async (m: Omit<Medication, 'id'>) => {
    if (!user) return;
    await supabase.from('medications').insert({
      user_id: user.id, pet_id: m.petId, name: m.name,
      dose: m.dose, frequency: m.frequency,
      start_date: m.startDate, end_date: m.endDate, notes: m.notes,
    });
    await loadCloudData();
  }, [user, loadCloudData]);

  const addVisitCloud = useCallback(async (v: Omit<Visit, 'id'>) => {
    if (!user) return;
    await supabase.from('visits').insert({
      user_id: user.id, pet_id: v.petId, date: v.date,
      reason: v.reason, diagnosis: v.diagnosis, notes: v.notes,
    });
    await loadCloudData();
  }, [user, loadCloudData]);

  const addReminderCloud = useCallback(async (r: Omit<Reminder, 'id'>) => {
    if (!user) return;
    await supabase.from('reminders').insert({
      user_id: user.id, pet_id: r.petId, title: r.title,
      type: r.type, due_date: r.dueDate,
      completed: r.completed, snoozed: r.snoozed,
    });
    await loadCloudData();
  }, [user, loadCloudData]);

  const toggleReminderCloud = useCallback(async (id: string, completed: boolean) => {
    if (!user) return;
    await supabase.from('reminders').update({ completed: !completed }).eq('id', id);
    await loadCloudData();
  }, [user, loadCloudData]);

  const deleteReminderCloud = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('reminders').delete().eq('id', id);
    await loadCloudData();
  }, [user, loadCloudData]);

  const addSymptomLogCloud = useCallback(async (s: Omit<SymptomLog, 'id'>) => {
    if (!user) return;
    await supabase.from('symptom_logs').insert({
      user_id: user.id, pet_id: s.petId, date: s.date,
      symptoms: s.symptoms, notes: s.notes,
      duration: s.duration, urgency: s.urgency,
    });
    await loadCloudData();
  }, [user, loadCloudData]);

  // Settings operations
  const loadSettings = useCallback(async (): Promise<UserSettings | null> => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('notification_enabled, reminder_default_time, overdue_alerts_enabled, default_reminder_recurrence, default_snooze_duration, language').eq('user_id', user.id).single();
    if (!data) return null;
    return {
      notification_enabled: data.notification_enabled ?? true,
      reminder_default_time: data.reminder_default_time ?? '09:00',
      overdue_alerts_enabled: data.overdue_alerts_enabled ?? true,
      default_reminder_recurrence: data.default_reminder_recurrence ?? 'none',
      default_snooze_duration: data.default_snooze_duration ?? '1h',
      language: data.language ?? 'en',
    };
  }, [user]);

  const saveSettings = useCallback(async (settings: Partial<UserSettings>) => {
    if (!user) return;
    await supabase.from('profiles').update(settings as any).eq('user_id', user.id);
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    // Delete all user data (pets cascade handles records)
    await supabase.from('pets').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('user_id', user.id);
    // Sign out
    await supabase.auth.signOut();
  }, [user]);

  // Auto-load cloud data on auth
  useEffect(() => {
    if (user && !isGuest) {
      const localData = localStorage.getItem('petcare-pocket');
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed?.state?.pets?.length > 0) {
          migrateLocalData();
          return;
        }
      }
      loadCloudData();
    }
  }, [user, isGuest, loadCloudData, migrateLocalData]);

  return {
    loadCloudData,
    migrateLocalData,
    addPetCloud,
    updatePetCloud,
    deletePetCloud,
    addVaccineCloud,
    addMedicationCloud,
    addVisitCloud,
    addReminderCloud,
    toggleReminderCloud,
    deleteReminderCloud,
    addSymptomLogCloud,
    loadSettings,
    saveSettings,
    deleteAccount,
    isCloud: !!user && !isGuest,
  };
};

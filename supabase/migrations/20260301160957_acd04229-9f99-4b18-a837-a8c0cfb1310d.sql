
-- Add notification preferences and settings columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_default_time text NOT NULL DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS overdue_alerts_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS default_reminder_recurrence text NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS default_snooze_duration text NOT NULL DEFAULT '1h';

-- Add cascade delete for pets -> related records
-- First drop existing foreign keys and re-add with CASCADE
ALTER TABLE public.vaccines DROP CONSTRAINT IF EXISTS vaccines_pet_id_fkey;
ALTER TABLE public.vaccines ADD CONSTRAINT vaccines_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.medications DROP CONSTRAINT IF EXISTS medications_pet_id_fkey;
ALTER TABLE public.medications ADD CONSTRAINT medications_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_pet_id_fkey;
ALTER TABLE public.visits ADD CONSTRAINT visits_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_pet_id_fkey;
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_pet_id_fkey;
ALTER TABLE public.reminders ADD CONSTRAINT reminders_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

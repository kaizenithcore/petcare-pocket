
-- Step 1: Clean up duplicate pets - keep only the earliest record per (user_id, name, species)
DELETE FROM pets
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name, species) id
  FROM pets
  ORDER BY user_id, name, species, created_at ASC
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.pets
ADD CONSTRAINT unique_user_pet_name_species UNIQUE (user_id, name, species);

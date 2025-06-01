-- Add category_name column to tickets table
ALTER TABLE tickets ADD COLUMN category_name TEXT;

-- Update existing tickets with category names from the categories table
UPDATE tickets 
SET category_name = categories.name 
FROM categories 
WHERE tickets.category_id = categories.id;

-- Make category_name NOT NULL after populating existing data
ALTER TABLE tickets ALTER COLUMN category_name SET NOT NULL;
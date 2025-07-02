-- Migration: Add unique constraint for upsert on theme_templates
ALTER TABLE theme_templates
ADD CONSTRAINT theme_templates_theme_id_name_unique UNIQUE (theme_id, name); 
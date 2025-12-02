-- Ejecutar en Supabase SQL Editor
ALTER TABLE matches 
ADD COLUMN team_a TEXT DEFAULT 'Equipo A',
ADD COLUMN team_b TEXT DEFAULT 'Equipo B',
ADD COLUMN score_a INTEGER,
ADD COLUMN score_b INTEGER;

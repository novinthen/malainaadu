-- Add column to track Facebook/Make.com posting status
ALTER TABLE public.articles 
ADD COLUMN posted_to_facebook boolean NOT NULL DEFAULT false;
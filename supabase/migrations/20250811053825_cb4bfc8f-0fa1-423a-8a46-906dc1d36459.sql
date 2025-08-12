-- Add hotel and number_of_people columns to trips table
ALTER TABLE public.trips 
ADD COLUMN hotel_name TEXT,
ADD COLUMN hotel_address TEXT,
ADD COLUMN number_of_people INTEGER DEFAULT 2;
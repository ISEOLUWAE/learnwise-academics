-- Add phone_number column to profiles table for Twilio voice calls
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create an index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);

-- Add a comment explaining the column purpose
COMMENT ON COLUMN public.profiles.phone_number IS 'Phone number for urgent voice call notifications via Twilio';
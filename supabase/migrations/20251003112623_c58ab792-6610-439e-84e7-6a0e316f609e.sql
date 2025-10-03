-- This migration should be run AFTER the head admin user signs up with email: emaluwaseun@gmail.com
-- To complete setup:
-- 1. User must sign up at /login with email: emaluwaseun@gmail.com and password: Oluwaseun@7
-- 2. Then run this query manually in Supabase SQL Editor, replacing USER_ID with actual user ID from auth.users

-- MANUAL STEP: After signup, get the user ID from auth.users table where email = 'emaluwaseun@gmail.com'
-- Then run these commands:

-- Example (replace 'ACTUAL-USER-ID-HERE' with the real UUID):
-- INSERT INTO public.user_roles (user_id, role, created_by) 
-- VALUES ('ACTUAL-USER-ID-HERE', 'head_admin', 'ACTUAL-USER-ID-HERE')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- INSERT INTO public.profiles (id, username, full_name)
-- VALUES ('ACTUAL-USER-ID-HERE', 'Mannytech', 'Mannytech')
-- ON CONFLICT (id) DO UPDATE SET username = 'Mannytech', full_name = 'Mannytech';

-- This comment is a placeholder migration to document the manual setup required
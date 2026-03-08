-- Add DELETE policy for admin_actions (audit log cleanup)
CREATE POLICY "Head admins can delete audit logs"
  ON public.admin_actions
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'head_admin'::app_role));

-- Secure department-files bucket: make private
UPDATE storage.buckets SET public = false WHERE id = 'department-files';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view department files" ON storage.objects;

-- Add authenticated-only view policy for department files
CREATE POLICY "Authenticated users can view department files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'department-files');
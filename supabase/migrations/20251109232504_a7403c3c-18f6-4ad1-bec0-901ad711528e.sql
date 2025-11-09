-- Update semester format to match the component's expected format
UPDATE departmental_courses 
SET semester = '1st semester'
WHERE department = 'Computer Science' 
  AND level = '100' 
  AND semester = 'First';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DepartmentSpace {
  id: string;
  school: string;
  department: string;
  level: string;
  display_tag: string;
}

interface DepartmentMembership {
  id: string;
  role: 'student' | 'class_rep' | 'dept_admin';
  joined_at: string;
  department_spaces: DepartmentSpace;
}

export const useDepartmentSpace = () => {
  const { user, session } = useAuth();
  const [memberships, setMemberships] = useState<DepartmentMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSpace, setCurrentSpace] = useState<DepartmentMembership | null>(null);

  const fetchMemberships = useCallback(async () => {
    if (!user || !session) {
      setMemberships([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'get_user_spaces' }),
        }
      );

      const data = await response.json();
      
      if (data.spaces) {
        setMemberships(data.spaces);
        // Set the first space as current if none selected
        if (data.spaces.length > 0 && !currentSpace) {
          setCurrentSpace(data.spaces[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching department spaces:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session, currentSpace]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const joinOrCreateSpace = async (
    school: string,
    department: string,
    level: string,
    code: string
  ): Promise<{ success: boolean; message: string; isNew?: boolean }> => {
    if (!session) {
      return { success: false, message: 'You must be logged in' };
    }

    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create_or_join',
            school,
            department,
            level,
            code,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchMemberships();
        return { success: true, message: data.message, isNew: data.isNew };
      } else {
        return { success: false, message: data.error || 'Failed to join department space' };
      }
    } catch (error) {
      console.error('Error joining department space:', error);
      return { success: false, message: 'An error occurred' };
    }
  };

  const isPublicUser = memberships.length === 0;
  const isDepartmentUser = memberships.length > 0;
  const currentRole = currentSpace?.role || null;
  const canManageDepartment = currentRole === 'class_rep' || currentRole === 'dept_admin';
  const isDeptAdmin = currentRole === 'dept_admin';

  return {
    memberships,
    currentSpace,
    setCurrentSpace,
    loading,
    isPublicUser,
    isDepartmentUser,
    currentRole,
    canManageDepartment,
    isDeptAdmin,
    joinOrCreateSpace,
    refetch: fetchMemberships,
  };
};
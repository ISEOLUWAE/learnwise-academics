import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOnlineStatus = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = async () => {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          online_at: new Date().toISOString(),
        });
    };

    // Update online status immediately
    updateOnlineStatus();

    // Update every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      // Mark as offline when component unmounts
      supabase
        .from('profiles')
        .update({ online_at: null })
        .eq('id', user.id)
        .then(() => {});
    };
  }, [user]);
};

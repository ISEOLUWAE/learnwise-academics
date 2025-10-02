import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdVerification = () => {
  const { user } = useAuth();
  const [hasWatchedAds, setHasWatchedAds] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdStatus();
  }, [user]);

  const checkAdStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("ad_views")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setHasWatchedAds(data?.video_1_watched && data?.video_2_watched);
    } catch (error) {
      console.error("Error checking ad status:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAdsAsWatched = () => {
    setHasWatchedAds(true);
  };

  return { hasWatchedAds, loading, checkAdStatus, markAdsAsWatched };
};

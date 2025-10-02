import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdViewerModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  video1Url?: string;
  video2Url?: string;
}

export const AdViewerModal = ({ 
  open, 
  onClose, 
  onComplete,
  video1Url = "",
  video2Url = ""
}: AdViewerModalProps) => {
  const { user } = useAuth();
  const [currentVideo, setCurrentVideo] = useState(1);
  const [canProceed, setCanProceed] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds per video

  useEffect(() => {
    if (!open) {
      setCurrentVideo(1);
      setCanProceed(false);
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanProceed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, currentVideo]);

  const handleNextVideo = async () => {
    if (currentVideo === 1) {
      // Mark video 1 as watched
      await updateAdView(true, false);
      setCurrentVideo(2);
      setCanProceed(false);
      setCountdown(30);
    } else {
      // Mark video 2 as watched
      await updateAdView(true, true);
      toast.success("Thank you for watching! You can now access the content.");
      onComplete();
    }
  };

  const updateAdView = async (video1: boolean, video2: boolean) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("ad_views")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("ad_views")
          .update({
            video_1_watched: video1,
            video_2_watched: video2,
            last_watched_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("ad_views").insert({
          user_id: user.id,
          video_1_watched: video1,
          video_2_watched: video2,
          last_watched_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating ad view:", error);
    }
  };

  const progress = ((30 - countdown) / 30) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Support Our Platform</DialogTitle>
          <DialogDescription>
            To keep this platform free and accessible to all students, we rely on ad revenue. 
            Please watch these short videos (Video {currentVideo} of 2) to unlock access. 
            Your support helps us provide quality educational resources to everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {currentVideo === 1 && video1Url ? (
              <iframe
                src={video1Url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : currentVideo === 2 && video2Url ? (
              <iframe
                src={video2Url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Video will appear here
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Please wait {countdown} seconds...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleNextVideo} 
              disabled={!canProceed}
            >
              {currentVideo === 1 ? "Next Video" : "Complete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

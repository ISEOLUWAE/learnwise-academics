import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX, Eye, Copy } from "lucide-react";

interface AntiCheatWrapperProps {
  children: React.ReactNode;
  isActive: boolean;
  onCheatDetected?: () => void;
}

const AntiCheatWrapper = ({ children, isActive, onCheatDetected }: AntiCheatWrapperProps) => {
  const [cheatAttempts, setCheatAttempts] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addCheatAttempt("Right-click detected");
      return false;
    };

    // Disable copy/paste keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+S, F12, etc.
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 's')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        addCheatAttempt(`Keyboard shortcut blocked: ${e.key}`);
        return false;
      }
    };

    // Detect print screen
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        addCheatAttempt("Screenshot attempt detected");
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Detect tab switching/window blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addCheatAttempt("Tab/window switch detected");
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const addCheatAttempt = (attempt: string) => {
      setCheatAttempts(prev => [...prev, attempt]);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      onCheatDetected?.();
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('dragstart', handleDragStart);

    // Add CSS to disable text selection
    const style = document.createElement('style');
    style.textContent = `
      .anti-cheat-active {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      .anti-cheat-active * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    if (isActive) {
      document.body.classList.add('anti-cheat-active');
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('dragstart', handleDragStart);
      document.body.classList.remove('anti-cheat-active');
      document.head.removeChild(style);
    };
  }, [isActive, onCheatDetected]);

  return (
    <div className="relative">
      {/* Warning overlay */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Alert className="bg-red-500/20 border-red-500 text-red-400">
            <ShieldX className="h-4 w-4" />
            <AlertDescription>
              Suspicious activity detected! Your quiz is being monitored.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Anti-cheat indicators */}
      {isActive && (
        <div className="fixed top-4 right-4 z-40 flex gap-2">
          <div className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Monitored</span>
          </div>
          <div className="bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 flex items-center gap-2">
            <Copy className="h-4 w-4 text-red-400 line-through" />
            <span className="text-red-400 text-sm font-medium">Copy Disabled</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default AntiCheatWrapper;
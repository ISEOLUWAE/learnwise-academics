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

    // Enhanced keyboard shortcut blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block function keys and special keys
      const blockedKeys = [
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
        'PrintScreen'
      ];

      // Block dangerous combinations
      const blockedCombinations = [
        { key: 'c', ctrlKey: true }, // Copy
        { key: 'v', ctrlKey: true }, // Paste
        { key: 'a', ctrlKey: true }, // Select all
        { key: 's', ctrlKey: true }, // Save
        { key: 'u', ctrlKey: true }, // View source
        { key: 'r', ctrlKey: true }, // Refresh
        { key: 'f', ctrlKey: true }, // Find
        { key: 'i', ctrlKey: true, shiftKey: true }, // Dev tools
        { key: 'j', ctrlKey: true, shiftKey: true }, // Console
        { key: 'c', ctrlKey: true, shiftKey: true }, // Inspector
        { key: 'Tab', altKey: true }, // Alt+Tab
      ];

      // Check blocked keys
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        addCheatAttempt(`Function key blocked: ${e.key}`);
        return false;
      }

      // Check blocked combinations
      const isBlocked = blockedCombinations.some(combo => 
        e.key.toLowerCase() === combo.key.toLowerCase() &&
        !!e.ctrlKey === !!combo.ctrlKey &&
        !!e.shiftKey === !!combo.shiftKey &&
        !!e.altKey === !!combo.altKey
      );

      if (isBlocked) {
        e.preventDefault();
        addCheatAttempt(`Keyboard shortcut blocked: ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`);
        return false;
      }
    };

    // Enhanced screenshot detection
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        addCheatAttempt("Screenshot attempt detected");
        // Try to clear clipboard
        try {
          navigator.clipboard.writeText("Screenshot blocked during quiz");
        } catch (err) {
          console.log("Could not access clipboard");
        }
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

    // Enhanced CSS to prevent text selection and screenshots
    const style = document.createElement('style');
    style.id = 'anti-cheat-styles';
    style.textContent = `
      .anti-cheat-active {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
        pointer-events: auto !important;
      }
      .anti-cheat-active * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      /* Prevent screenshot overlay */
      .anti-cheat-active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: transparent;
        z-index: -1;
        pointer-events: none;
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
      
      // Remove style element safely
      const styleElement = document.getElementById('anti-cheat-styles');
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
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
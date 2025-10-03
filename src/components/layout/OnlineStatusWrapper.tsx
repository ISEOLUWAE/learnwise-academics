import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OnlineStatusWrapper = ({ children }: { children: React.ReactNode }) => {
  useOnlineStatus();
  return <>{children}</>;
};

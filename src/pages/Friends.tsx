import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FriendsManager } from '@/components/social/FriendsManager';
import { DirectMessaging } from '@/components/social/DirectMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Friends = () => {
  const { user } = useAuth();
  const [activeChatFriendId, setActiveChatFriendId] = useState<string | null>(null);
  const [activeChatFriendName, setActiveChatFriendName] = useState<string>('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleOpenChat = (friendId: string, friendName: string) => {
    setActiveChatFriendId(friendId);
    setActiveChatFriendName(friendName);
  };

  const handleCloseChat = () => {
    setActiveChatFriendId(null);
    setActiveChatFriendName('');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Friends & Messages</h1>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <FriendsManager onOpenChat={handleOpenChat} />
            </div>
            
            <div>
              {activeChatFriendId ? (
                <DirectMessaging
                  friendId={activeChatFriendId}
                  friendName={activeChatFriendName}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="h-[600px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Select a friend to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Friends;

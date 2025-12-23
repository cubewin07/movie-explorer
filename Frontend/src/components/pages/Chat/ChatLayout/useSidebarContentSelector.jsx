/**
 * useSidebarContentSelector Hook
 * Determines and returns appropriate sidebar content based on active tab
 */

import ChatList from '../ChatList';
import FriendsList from '../FriendsList';
import FriendRequests from '../FriendRequests';
import { CHAT_TABS } from './chatTabConstants';

export const useSidebarContentSelector = (activeTab, navigate) => {
  /**
   * Returns the appropriate sidebar component based on active tab
   */
  const getSidebarContent = () => {
    switch (activeTab) {
      case CHAT_TABS.CHATS:
        return (
          <ChatList 
            onChatSelect={(chatId) => navigate(`/friend/chat/${chatId}`)} 
          />
        );
      
      case CHAT_TABS.FRIENDS:
        return (
          <FriendsList 
            onFriendSelect={(friendId) => navigate(`/friend/friends/${friendId}`)} 
          />
        );
      
      case CHAT_TABS.REQUESTS:
        return (
          <FriendRequests 
            onRequestSelect={(requestId) => navigate(`/friend/requests/${requestId}`)} 
          />
        );
      
      default:
        return null;
    }
  };

  return { getSidebarContent };
};

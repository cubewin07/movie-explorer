/**
 * useChatTabs Hook
 * Manages tab state and navigation logic for chat interface
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CHAT_TABS, TAB_PATHS, PATH_TO_TAB_MAP } from './chatTabConstants';

export const useChatTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(CHAT_TABS.CHATS);

  /**
   * Determines initial tab based on current route pathname
   */
  const getInitialTab = () => {
    const path = location.pathname;
    
    if (path.includes('/friend/chat')) return CHAT_TABS.CHATS;
    if (path.includes('/friend/friends')) return CHAT_TABS.FRIENDS;
    if (path.includes('/friend/requests')) return CHAT_TABS.REQUESTS;
    
    return CHAT_TABS.CHATS;
  };

  /**
   * Handles tab change and navigation
   */
  const handleTabChange = (tabValue, onMobileChange) => {
    setActiveTab(tabValue);
    navigate(TAB_PATHS[tabValue]);
    
    if (onMobileChange) {
      onMobileChange(true);
    }
  };

  /**
   * Sync active tab with route changes
   */
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
  };
};

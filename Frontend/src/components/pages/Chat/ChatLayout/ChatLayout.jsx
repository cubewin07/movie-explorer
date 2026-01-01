/**
 * ChatLayout Component
 * Main layout component for chat interface with tabs and responsive design
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatTabs } from './useChatTabs';
import { useSidebarContentSelector } from './useSidebarContentSelector.jsx';
import { TAB_CONFIG, CHAT_TABS } from './chatTabConstants';
import { useChat } from '@/context/ChatProvider';

export default function ChatLayout() {
  const [showMobileContent, setShowMobileContent] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const { activeTab, handleTabChange } = useChatTabs();
  const navigate = useNavigate();
  const { getSidebarContent } = useSidebarContentSelector(activeTab, navigate);
  const { activeChat, setActiveChat } = useChat();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileTabChange = (value) => {
    // If navigating away from Chats, clear activeChat first to avoid redirecting back
    if (value !== CHAT_TABS.CHATS) {
      setActiveChat(null);
    }
    handleTabChange(value, setShowMobileContent);
  };

  // Note: We avoid auto-navigation on activeChat here to prevent flicker.
  // Navigation to conversations happens explicitly at action call sites.

  return (
    <div className="h-[calc(100vh-9.5rem)] flex rounded-md">
      {/* Sidebar with Tabs */}
      <div 
        className={`w-full md:w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col rounded-tl-md rounded-bl-md
          ${showMobileContent && isSmallScreen ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Friend Header */}
        <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Friend
        </div>

        {/* Tabs Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Tabs 
            value={activeTab} 
            className="w-full" 
            onValueChange={handleMobileTabChange}
          >
            <TabsList className="w-full flex justify-around">
              {TAB_CONFIG.map((tab) => (
                <motion.div
                  key={tab.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <TabsTrigger value={tab.id} className="w-full text-center">
                    {tab.label}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Sidebar Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {isSmallScreen && showMobileContent ? (
                <Outlet context={{ setShowMobileContent }} />
              ) : (
                getSidebarContent()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area */}
      {!isSmallScreen && (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-tr-md rounded-br-md">
          <Outlet context={{ setShowMobileContent }} />
        </div>
      )}

      {/* Back Button for Mobile */}
      {isSmallScreen && showMobileContent && (
        <Button 
          variant="ghost" 
          className="md:hidden m-2"
          onClick={() => setShowMobileContent(false)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
    </div>
  );
}

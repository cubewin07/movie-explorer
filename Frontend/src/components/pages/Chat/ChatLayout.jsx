import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatList from './ChatList';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';

export default function ChatLayout() {
  const [showMobileContent, setShowMobileContent] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Track screen size
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize activeTab based on current path
  const getInitialTab = () => {
    if (location.pathname.includes('/friend/chat')) return 'chats';
    if (location.pathname.includes('/friend/friends')) return 'friends';
    if (location.pathname.includes('/friend/requests')) return 'requests';
    return 'chats';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabChange = (value) => {
    setActiveTab(value);
    // Set default paths for each tab
    const paths = {
      chats: '/friend/chat',
      friends: '/friend/friends',
      requests: '/friend/requests'
    };
    navigate(paths[value]);
    setShowMobileContent(true); // Show content area on small screens
  };

  const getSidebarContent = () => {
    switch (activeTab) {
      case 'chats':
        return <ChatList onChatSelect={(chatId) => navigate(`/friend/chat/${chatId}`)} />;
      case 'friends':
        return <FriendsList onFriendSelect={(friendId) => navigate(`/friend/friends/${friendId}`)} />;
      case 'requests':
        return <FriendRequests onRequestSelect={(requestId) => navigate(`/friend/requests/${requestId}`)} />;
      default:
        return null;
    }
  };

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  // Update screen size state on window resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-[calc(100vh-9.5rem)] flex rounded-md">
      {/* Sidebar with Tabs */}
      <div className={`w-full md:w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col rounded-tl-md rounded-bl-md
        ${showMobileContent && isSmallScreen ? 'hidden md:flex' : 'flex'}`}>
        {/* "Friend" text */}
        <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Friend
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList className="w-full flex justify-around">
              {['chats', 'friends', 'requests'].map((tab) => (
                <motion.div
                  key={tab}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <TabsTrigger value={tab} className="w-full text-center">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>
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

      {/* Content Area */}
      {!isSmallScreen && (
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-tr-md rounded-br-md`}>
          <Outlet context={{ setShowMobileContent }} />
        </div>
      )}

      {/* Back Button for Small Screens */}
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

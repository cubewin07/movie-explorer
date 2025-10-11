import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import ChatList from './ChatList';
import FriendsList from './FriendsList';
import RequestTabs from './RequestTabs';

export default function ChatLayout() {
  const [showMobileContent, setShowMobileContent] = useState(false);
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
    setShowMobileContent(false);
  };

  const getSidebarContent = () => {
    switch(activeTab) {
      case 'chats':
        return <ChatList onChatSelect={(chatId) => {
          navigate(`/friend/chat/${chatId}`);
          setShowMobileContent(true);
        }} />;
      case 'friends':
        return <FriendsList onFriendSelect={(friendId) => {
          navigate(`/friend/friends/${friendId}`);
          setShowMobileContent(true);
        }} />;
      case 'requests':
        return <RequestTabs onRequestSelect={(requestId) => {
          navigate(`/friend/requests/${requestId}`);
          setShowMobileContent(true);
        }} />;
      default:
        return null;
    }
  };

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  return (
    <div className="h-[calc(100vh-4.61rem)] flex mt-2 rounded-md">
      {/* Sidebar with Tabs */}
      <div className={`w-full md:w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col rounded-tl-md rounded-bl-md
        ${showMobileContent ? 'hidden md:flex' : 'flex'}`}>
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1 overflow-y-auto">
          {getSidebarContent()}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-tr-md rounded-br-md  
        ${!showMobileContent ? 'hidden md:block' : 'block'}`}>
        {showMobileContent && (
          <Button 
            variant="ghost" 
            className="md:hidden m-2"
            onClick={() => setShowMobileContent(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Outlet context={{ setShowMobileContent }} />
      </div>
    </div>
  );
}

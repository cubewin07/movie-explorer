import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export default function ChatLayout() {
  const [showMobileContent, setShowMobileContent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleTabChange = (value) => {
    navigate(value);
    setShowMobileContent(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        ${showMobileContent ? 'hidden md:block' : 'block'}`}>
        <Tabs defaultValue="/chat" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="/chat">Chats</TabsTrigger>
            <TabsTrigger value="/chat/friends">Friends</TabsTrigger>
            <TabsTrigger value="/chat/requests">Requests</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className={`flex-1 bg-white dark:bg-slate-900 
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

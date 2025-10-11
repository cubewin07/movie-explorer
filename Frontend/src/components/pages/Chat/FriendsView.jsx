import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from 'lucide-react';

export default function FriendsView() {
  return (
    <div className="h-full p-4">
      <div className="flex gap-2 mb-4">
        <Input 
          placeholder="Search friends or add new..." 
          className="flex-1"
        />
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100%-4rem)]">
        {/* Friends list will go here */}
      </ScrollArea>
    </div>
  );
}

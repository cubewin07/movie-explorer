import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

export default function RequestTabs({ onRequestSelect }) {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          {/* Request items will go here */}
        </ScrollArea>
      </Tabs>
    </div>
  );
}

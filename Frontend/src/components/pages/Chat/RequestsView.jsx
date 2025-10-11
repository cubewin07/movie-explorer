import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RequestsView() {
  const { type = 'incoming' } = useParams();
  
  return (
    <div className="h-full p-4">
      <Tabs defaultValue={type} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100%-4rem)]">
          {/* Request details will go here based on type */}
        </ScrollArea>
      </Tabs>
    </div>
  );
}

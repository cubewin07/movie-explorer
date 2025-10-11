import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SAMPLE_REQUESTS = [
  { id: 1, name: 'David Brown', mutualFriends: 3 },
  { id: 2, name: 'Emily White', mutualFriends: 1 },
];

export default function FriendRequests() {
  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Friend Requests</h2>
      
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4">
          {SAMPLE_REQUESTS.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${request.id}.png`} />
                  <AvatarFallback>{request.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{request.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1" variant="default">Accept</Button>
                <Button className="flex-1" variant="outline">Decline</Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

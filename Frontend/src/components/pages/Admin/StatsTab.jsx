import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const items = [
  { key: 'usersTotal', label: 'Users' },
  { key: 'adminsTotal', label: 'Admins' },
  { key: 'onlineUsers', label: 'Online' },
  { key: 'reviewsTotal', label: 'Reviews' },
  { key: 'reviewsRepliesTotal', label: 'Review Replies' },
  { key: 'chatsTotal', label: 'Chats' },
  { key: 'messagesTotal', label: 'Messages' },
  { key: 'friendshipsAccepted', label: 'Friends' },
  { key: 'friendshipsPending', label: 'Pending Requests' },
  { key: 'watchlistedMoviesTotal', label: 'Watchlisted Movies' },
  { key: 'watchlistedSeriesTotal', label: 'Watchlisted Series' },
];

export default function StatsTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async ({ signal }) => {
      const res = await instance.get('/admin/stats/summary', { signal });
      return res.data;
    },
    staleTime: 1000 * 15,
  });

  if (isError) {
    return (
      <div className="p-4 border rounded-md">
        <p className="text-red-600 text-sm">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-base">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {isLoading ? '...' : data?.[key] ?? 0}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


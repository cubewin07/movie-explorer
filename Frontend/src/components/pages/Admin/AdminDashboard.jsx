import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UsersTab from './UsersTab';
import StatsTab from './StatsTab';

export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and monitor platform activity.
        </p>
      </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <StatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

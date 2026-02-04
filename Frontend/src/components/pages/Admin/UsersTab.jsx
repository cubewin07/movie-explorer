import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function UsersTab() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [confirm, setConfirm] = useState(null); // {id, username, targetRole}
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch],
    queryFn: async ({ signal }) => {
      const res = await instance.get('/admin/users', {
        params: {
          page,
          ...(debouncedSearch ? { query: debouncedSearch } : {}),
        },
        signal,
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

  const size = data?.size ?? 20;
  const number = data?.number ?? page;
  const totalPages = data?.totalPages ?? (data?.content ? (data.content.length < size ? number + 1 : number + 2) : 1);
  const content = data?.content ?? [];
  const last = data?.last ?? number >= totalPages - 1;
  const first = data?.first ?? number === 0;

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await instance.patch(`/admin/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirm(null);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || 'Failed to update role';
      toast.error(msg);
    },
  });

  const handlePromote = (user) => {
    setConfirm({ id: user.id, username: user.username, targetRole: 'ROLE_ADMIN' });
  };
  const handleDemote = (user) => {
    setConfirm({ id: user.id, username: user.username, targetRole: 'ROLE_USER' });
  };
  const confirmAction = () => {
    if (!confirm) return;
    roleMutation.mutate({ id: confirm.id, role: confirm.targetRole });
  };

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const header = useMemo(() => (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search by username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {isFetching ? 'Refreshing...' : null}
      </div>
    </div>
  ), [search, isFetching]);

  if (isError) {
    const msg = error?.response?.data?.message || 'Failed to load users';
    return (
      <div className="p-4 border rounded-md">
        <p className="text-red-600">{msg}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })} className="mt-3">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Username</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>Loading...</td>
              </tr>
            ) : content.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No users found
                </td>
              </tr>
            ) : (
              content.map((u) => {
                const isAdmin = String(u.role || '').toUpperCase().includes('ADMIN');
                return (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isAdmin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end">
                        {isAdmin ? (
                          <Button variant="outline" size="sm" onClick={() => handleDemote(u)}>
                            Demote
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handlePromote(u)}>
                            Promote
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {number + 1} {Number.isFinite(totalPages) ? `of ${Math.max(totalPages, 1)}` : ''}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={first || isLoading}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={last || isLoading}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Change {confirm?.username}'s role to {confirm?.targetRole}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button onClick={confirmAction} disabled={roleMutation.isPending}>
              {roleMutation.isPending ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


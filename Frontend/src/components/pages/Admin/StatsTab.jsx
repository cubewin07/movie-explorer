import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  Activity,
  Star,
  MessageCircle,
  MessageSquare,
  Film,
  Tv,
} from 'lucide-react';

function AnimatedNumber({ value = 0, duration = 0.8, className = '' }) {
  const formatted = (v) => {
    try {
      return Math.round(v).toLocaleString();
    } catch {
      return Math.round(v);
    }
  };
  const Wrapper = ({ children }) => <span className={className}>{children}</span>;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, Number(value || 0), {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);
  return <Wrapper>{formatted(display)}</Wrapper>;
}

function BarChart({ items = [], max = null, loading = false }) {
  const computedMax = items.reduce(
    (m, it) => (Number.isFinite(it.value) ? Math.max(m, it.value) : m),
    0
  );
  const maxValue = max ?? (computedMax > 0 ? computedMax : 1);
  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const pct = Math.min(100, Math.round((it.value / maxValue) * 100));
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="font-medium">{loading ? '...' : it.value?.toLocaleString?.() ?? it.value ?? 0}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background:
                    it.gradient ||
                    `linear-gradient(90deg, ${it.color ?? '#6366F1'} 0%, ${it.color2 ?? '#22D3EE'} 100%)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  segments = [],
  size = 160,
  thickness = 18,
  loading = false,
  center,
}) {
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map((seg, i) => {
          const frac = (seg.value || 0) / total;
          const len = circumference * frac;
          const dashArray = `${len} ${circumference - len}`;
          const dashOffset = circumference - acc * circumference;
          acc += frac;
          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeLinecap="round"
              stroke={seg.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.05 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {center}
      </div>
    </div>
  );
}

const kpis = [
  { key: 'usersTotal', label: 'Users', icon: Users, gradient: 'from-indigo-500 via-sky-500 to-cyan-500' },
  { key: 'adminsTotal', label: 'Admins', icon: Shield, gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { key: 'onlineUsers', label: 'Online', icon: Activity, gradient: 'from-amber-500 via-orange-500 to-rose-500' },
  { key: 'reviewsTotal', label: 'Reviews', icon: Star, gradient: 'from-yellow-400 via-amber-500 to-orange-500' },
  { key: 'chatsTotal', label: 'Chats', icon: MessageCircle, gradient: 'from-fuchsia-500 via-pink-500 to-rose-500' },
  { key: 'messagesTotal', label: 'Messages', icon: MessageSquare, gradient: 'from-purple-500 via-violet-500 to-indigo-500' },
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

  const d = data || {};
  const rolesTotal = (d.usersTotal || 0);
  const admins = d.adminsTotal || 0;
  const nonAdmins = Math.max(0, rolesTotal - admins);

  const engagement = [
    { label: 'Reviews', value: d.reviewsTotal || 0, color: '#eab308', color2: '#f59e0b' },
    { label: 'Replies', value: d.reviewsRepliesTotal || 0, color: '#f97316', color2: '#fb7185' },
    { label: 'Chats', value: d.chatsTotal || 0, color: '#8b5cf6', color2: '#6366f1' },
    { label: 'Messages', value: d.messagesTotal || 0, color: '#06b6d4', color2: '#22d3ee' },
  ];

  const relationships = [
    { label: 'Friends', value: d.friendshipsAccepted || 0, color: '#10b981', color2: '#34d399' },
    { label: 'Pending', value: d.friendshipsPending || 0, color: '#f59e0b', color2: '#fbbf24' },
  ];

  const watchlist = [
    { label: 'Movies', value: d.watchlistedMoviesTotal || 0, color: '#ef4444', color2: '#fb7185' },
    { label: 'Series', value: d.watchlistedSeriesTotal || 0, color: '#06b6d4', color2: '#22d3ee' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ key, label, icon: Icon, gradient }) => (
          <Card key={key} className="overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{label}</CardTitle>
              <div className={`rounded-md p-2 bg-gradient-to-br ${gradient} text-white shadow`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {isLoading ? '...' : <AnimatedNumber value={d?.[key] ?? 0} />}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={engagement} loading={isLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Roles</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart
              loading={isLoading}
              segments={[
                { label: 'Admins', value: admins, color: '#10b981' },
                { label: 'Users', value: nonAdmins, color: '#6366f1' },
              ]}
              center={
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total Users</div>
                  <div className="text-2xl font-semibold">
                    {isLoading ? '...' : <AnimatedNumber value={rolesTotal} />}
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={relationships} loading={isLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Watchlist Breakdown</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-rose-500"><Film className="h-3.5 w-3.5" /> Movies</span>
              <span className="inline-flex items-center gap-1 text-cyan-500"><Tv className="h-3.5 w-3.5" /> Series</span>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart items={watchlist} loading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

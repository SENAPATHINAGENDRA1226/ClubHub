import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  GraduationCap,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface TimeSeriesPoint {
  month: string;
  value: number;
}

interface BarChartPoint {
  label: string;
  value: number;
}

interface AdminDashboardData {
  total_events: number;
  total_members: number;
  total_alumni: number;
  upcoming_events_count: number;
  registrations_over_time: TimeSeriesPoint[];
  most_popular_events: BarChartPoint[];
}

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { user } = useAuth();
  const adminName = user?.profile?.full_name || user?.email?.split('@')[0] || 'Administrator';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto p-2">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-96 bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-3xl bg-slate-900 border border-slate-800" />
          <Skeleton className="h-80 rounded-3xl bg-slate-900 border border-slate-800" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: data?.total_events ?? 0,
      icon: Calendar,
      gradient: 'from-sky-500/20 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-500/30',
      iconBg: 'bg-sky-500/10 text-sky-400',
      badgeText: 'All time',
    },
    {
      title: 'Student Members',
      value: data?.total_members ?? 0,
      icon: Users,
      gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      badgeText: 'Active',
    },
    {
      title: 'Alumni Registered',
      value: data?.total_alumni ?? 0,
      icon: GraduationCap,
      gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400',
      badgeText: 'Network',
    },
    {
      title: 'Upcoming Events',
      value: data?.upcoming_events_count ?? 0,
      icon: Clock,
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      badgeText: 'Scheduled',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Admin Workspace Banner */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-eight p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-eight flex items-center justify-center text-primary dark:text-sky-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Admin &amp; Committee Workspace</h2>
            <p className="text-primary dark:text-sky-400 text-xs font-bold tracking-widest uppercase mt-1">Role: {user?.role || 'Admin'}</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-4 border-l border-slate-200 dark:border-slate-800 pl-8">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.email || 'admin@clubhub.com'}</p>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide capitalize">{user?.role || 'Admin'} Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-eight bg-primary text-white font-bold flex items-center justify-center shadow-sm">
            {adminName.charAt(0).toUpperCase()}
          </div>
        </div>
      </section>

      {/* Primary Hero Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/60 border border-slate-200 dark:border-slate-800 rounded-eight p-8 lg:p-10 shadow-card">
        {/* Background accent Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 dark:bg-sky-500/10 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-primary/10 text-primary dark:text-sky-400 text-[11px] font-extrabold uppercase tracking-[0.18em] px-3.5 py-1 rounded-full mb-5 border border-primary/20">
            Management Dashboard
          </span>
          <h1 className="text-3xl lg:text-5xl font-display font-extrabold leading-tight text-slate-900 dark:text-white mb-5 tracking-tight">
            Live Event Controls &amp; <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-600">
              QR Verification Desk
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base leading-relaxed mb-6">
            Scan attendee QR codes, generate bulk certificate ZIPs, and monitor real-time event analytics from a centralized command center.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/verify"
              className="px-5 py-2.5 rounded-eight bg-primary hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-4 h-4" />
              <span>Open QR Scanner</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-purpose="action-grid">
        {/* QR Scanner Card */}
        <Link
          to="/admin/verify"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-eight card-hover group cursor-pointer shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/40 rounded-eight flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:scale-105 transition-transform border border-cyan-100 dark:border-cyan-900/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2.5">QR Check-in Scanner</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Verify attendee registration HMAC signatures in real time with high-speed processing.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Launch Check-in Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Analytics Card */}
        <a
          href="#analytics-section"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-eight card-hover group cursor-pointer shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 rounded-eight flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-105 transition-transform border border-purple-100 dark:border-purple-900/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2.5">Analytics &amp; Charts</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              View monthly registration trends, heatmaps, and popular event engagement statistics.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Explore Trends</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* User Management Card */}
        <Link
          to="/admin/users"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-eight card-hover group cursor-pointer shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-eight flex items-center justify-center text-primary dark:text-indigo-400 mb-6 group-hover:scale-105 transition-transform border border-indigo-100 dark:border-indigo-900/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2.5">User Management</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Create committee logins, manage access tiers, and assign scoped committee permissions.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-primary dark:text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Manage Access</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </section>

      {/* KPI Cards Grid */}
      <div id="analytics-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`relative overflow-hidden rounded-eight bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-card card-hover transition-all group`}
          >
            <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${card.gradient} pointer-events-none`} />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className={`p-3 rounded-eight ${card.iconBg}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {card.badgeText}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{card.value.toLocaleString()}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{card.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-eight bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-card flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-eight bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">Registration Trends</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly student event sign-ups</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.registrations_over_time && data.registrations_over_time.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.registrations_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'light' ? '#1e40af' : '#38bdf8'} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={theme === 'light' ? '#1e40af' : '#38bdf8'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#1e293b'} />
                  <XAxis dataKey="month" stroke={theme === 'light' ? '#94a3b8' : '#64748b'} tick={{ fill: theme === 'light' ? '#475569' : '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke={theme === 'light' ? '#94a3b8' : '#64748b'} tick={{ fill: theme === 'light' ? '#475569' : '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={theme === 'light'
                      ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.08)' }
                      : { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }
                    }
                    itemStyle={{ color: theme === 'light' ? '#1e40af' : '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke={theme === 'light' ? '#1e40af' : '#38bdf8'} strokeWidth={2.5} fillOpacity={1} fill="url(#regGrad)" name="Registrations" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No registration history available yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* Most Popular Events Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-eight bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-card flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-eight bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">Top Events by Turnout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Most registered campus activities</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.most_popular_events && data.most_popular_events.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.most_popular_events} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#1e293b'} />
                  <XAxis type="number" stroke={theme === 'light' ? '#94a3b8' : '#64748b'} tick={{ fill: theme === 'light' ? '#475569' : '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" stroke={theme === 'light' ? '#94a3b8' : '#64748b'} tick={{ fill: theme === 'light' ? '#475569' : '#94a3b8', fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={theme === 'light'
                      ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.08)' }
                      : { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }
                    }
                    itemStyle={{ color: '#1e40af' }}
                  />
                  <Bar dataKey="value" fill="#1e40af" radius={[0, 8, 8, 0]} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No event turnout data available.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Action Banner */}
      <div className="rounded-eight bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-eight bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">Event Door Verification System</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scan student QR tickets or conduct manual attendance searches at event entrances.</p>
          </div>
        </div>
        <Link
          to="/admin/verify"
          className="px-5 py-2.5 rounded-eight bg-primary hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Open QR Scanner</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">ClubHub Management Console &copy; 2026</p>
      </footer>
    </div>
  );
};
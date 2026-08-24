'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, IndianRupee, Activity, Eye, ShieldCheck, 
  ArrowLeft, RefreshCw, BarChart2, Award, Calendar, TrendingUp,
  Search, Mail, Download, Clock, Receipt
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface DailyTraffic {
  date: string;
  count: number;
}

interface SubscriberRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  plan_type: string | null;
  enrolled_package: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  paid_amount: number | null;
  payment_reference_id: string | null;
  current_session_token: string | null;
  created_at: string;
}

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  dailyTrend: DailyTraffic[];
  fullCbtAttempts: number;
  demoAttempts: number;
  totalSubscribers: number;
  estimatedRevenue: number;
  recentAttempts: any[];
  subscribersList: SubscriberRecord[];
}

const PACKAGE_PRICING: Record<string, number> = {
  BCBF: 399,
  DRA: 499,
  AML_KYC: 499,
  JAIIB_IEIFS: 1499,
  JAIIB: 1499,
  CAIIB_ABM: 1499,
  CAIIB: 1499,
  CCP: 1499,
  ALL_ACCESS: 2999,
};

export default function AdminAnalyticsPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackageFilter, setSelectedPackageFilter] = useState('ALL');

  const [data, setData] = useState<AnalyticsData>({
    totalViews: 0,
    todayViews: 0,
    dailyTrend: [],
    fullCbtAttempts: 0,
    demoAttempts: 0,
    totalSubscribers: 0,
    estimatedRevenue: 0,
    recentAttempts: [],
    subscribersList: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // 1. Admin Access Gate
      const { data: { user } } = await supabase.auth.getUser();
      const ADMIN_EMAILS = ['cbiswarup74@gmail.com'];

      if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        alert('Unauthorized access: Admin authentication required.');
        router.push('/auth');
        return;
      }

      // 2. Fetch page views
      const { data: allViews } = await supabase
        .from('page_views')
        .select('created_at')
        .order('created_at', { ascending: true });

      const totalViewsCount = allViews ? allViews.length : 0;
      const dateMap: Record<string, number> = {};
      const todayStr = new Date().toISOString().split('T')[0];
      let todayCount = 0;

      if (allViews) {
        allViews.forEach((v) => {
          const d = v.created_at ? v.created_at.split('T')[0] : 'Unknown';
          dateMap[d] = (dateMap[d] || 0) + 1;
          if (d === todayStr) todayCount += 1;
        });
      }

      const dailyTrend: DailyTraffic[] = Object.entries(dateMap).map(([date, count]) => ({
        date,
        count
      }));

      // 3. Fetch exam attempts
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      const fullCbtCount = attempts?.filter((a) => a.total_questions >= 100 || (a.exam_type && a.exam_type.includes('CBT #'))).length || 0;
      const demoCount = attempts?.filter((a) => a.total_questions < 100 && !a.exam_type?.includes('CBT #')).length || 0;

      // 4. Fetch subscriber master profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const subsList: SubscriberRecord[] = profiles || [];
      const payingSubscribers = subsList.filter((p) => p.plan_type === 'pro' || p.plan_type === 'institutional');

      const totalRevenue = payingSubscribers.reduce((acc, curr) => {
        if (curr.paid_amount && curr.paid_amount > 0) {
          return acc + curr.paid_amount;
        }
        const pkg = curr.enrolled_package || '';
        return acc + (PACKAGE_PRICING[pkg] || 399);
      }, 0);

      setData({
        totalViews: totalViewsCount,
        todayViews: todayCount,
        dailyTrend,
        fullCbtAttempts: fullCbtCount,
        demoAttempts: demoCount,
        totalSubscribers: payingSubscribers.length,
        estimatedRevenue: totalRevenue,
        recentAttempts: attempts ? attempts.slice(0, 8) : [],
        subscribersList: subsList
      });
    } catch (err) {
      console.error('Error fetching admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const filteredSubscribers = useMemo(() => {
    return data.subscribersList.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.enrolled_package && s.enrolled_package.toLowerCase().includes(q)) ||
        (s.payment_reference_id && s.payment_reference_id.toLowerCase().includes(q));

      const matchesPackage = 
        selectedPackageFilter === 'ALL' || 
        (s.enrolled_package && s.enrolled_package.toLowerCase().includes(selectedPackageFilter.toLowerCase()));

      return matchesSearch && matchesPackage;
    });
  }, [data.subscribersList, searchTerm, selectedPackageFilter]);

  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Candidate Name',
      'Registered Email',
      'Enrolled Package',
      'Registration Time',
      'Subscription Start Date',
      'Valid Till Date',
      'Plan Tier',
      'Payment Ref ID',
      'Session Status'
    ];

    const rows = filteredSubscribers.map((s) => [
      `"${s.full_name || 'N/A'}"`,
      `"${s.email || 'N/A'}"`,
      `"${s.enrolled_package || 'Free Trial'}"`,
      `"${new Date(s.created_at).toLocaleString('en-IN')}"`,
      `"${s.subscription_start_date ? new Date(s.subscription_start_date).toLocaleDateString('en-IN') : 'N/A'}"`,
      `"${s.subscription_end_date ? new Date(s.subscription_end_date).toLocaleDateString('en-IN') : 'N/A'}"`,
      `"${s.plan_type || 'guest'}"`,
      `"${s.payment_reference_id || 'N/A'}"`,
      `"${s.current_session_token ? 'Single Active' : 'Offline'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BankerViva_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxDailyCount = Math.max(...data.dailyTrend.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none p-6 sm:p-10 space-y-8 relative overflow-x-hidden">
      {/* Soft Sky Blue Gradient Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-gradient-to-b from-sky-100/90 via-blue-50/60 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Return to Platform
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-blue-600" /> BankerViva Master Control Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Live Telemetry • Historical Logs • Candidate Subscriber Database</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export CSV
          </button>

          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Visitors</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{data.todayViews} today
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Paid Subscribers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.totalSubscribers}</div>
          <div className="text-[11px] text-slate-500 font-medium">{data.subscribersList.length} total registered accounts</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹{data.estimatedRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium">From verified candidate enrolments</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Official CBTs Taken</span>
            <Activity className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{data.fullCbtAttempts}</div>
          <div className="text-[11px] text-blue-600 font-bold">+{data.demoAttempts} demo attempts</div>
        </div>
      </div>

      {/* Historical Viewer Trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Historical Viewer Log (Deployment to Date)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Chronological daily distribution of platform traffic</p>
          </div>
          <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
            Active Tracking Days: {data.dailyTrend.length}
          </div>
        </div>

        {data.dailyTrend.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No historical traffic records found yet.</p>
        ) : (
          <div className="space-y-3">
            {data.dailyTrend.map((day) => {
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const pct = ((day.count / maxDailyCount) * 100).toFixed(0);

              return (
                <div key={day.date} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {day.date} {isToday && <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-extrabold">Today</span>}
                    </span>
                    <span className="text-slate-900 font-bold">{day.count} {day.count === 1 ? 'view' : 'views'}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isToday ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Subscriber Master Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Candidate Subscriber Master Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Live subscription validity, registered email identifiers, enrolled tracks, and session locks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, email, package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <select
                value={selectedPackageFilter}
                onChange={(e) => setSelectedPackageFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
              >
                <option value="ALL">All Packages</option>
                <option value="JAIIB">JAIIB Tracks</option>
                <option value="DRA">DRA Track</option>
                <option value="BCBF">BCBF Track</option>
                <option value="CCP">CCP Track</option>
                <option value="CAIIB">CAIIB Tracks</option>
                <option value="Free Trial">Free Trial / Demo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Registered Email</th>
                <th className="p-3.5">Enrolled Package</th>
                <th className="p-3.5">Registration Time</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5">Valid Till</th>
                <th className="p-3.5">Plan Tier</th>
                <th className="p-3.5">Device Session</th>
                <th className="p-3.5 text-center">Invoice / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 font-medium">
                    No matching candidate subscriber records found.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const isPro = sub.plan_type === 'pro' || sub.plan_type === 'institutional';
                  
                  const registeredAt = sub.created_at 
                    ? new Date(sub.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A';

                  const startDate = sub.subscription_start_date 
                    ? new Date(sub.subscription_start_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : new Date(sub.created_at).toLocaleDateString('en-IN');

                  const endDate = sub.subscription_end_date 
                    ? new Date(sub.subscription_end_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        {sub.full_name || 'Registered Candidate'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {sub.email || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3.5 text-blue-600 font-semibold">
                        {sub.enrolled_package || '12-Track Comprehensive'}
                      </td>
                      <td className="p-3.5 text-slate-500">{registeredAt}</td>
                      <td className="p-3.5 text-slate-700 font-medium">{startDate}</td>
                      <td className="p-3.5 font-bold text-emerald-600 flex items-center gap-1 mt-2.5">
                        <Clock className="w-3 h-3 text-emerald-500" /> {endDate}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          isPro 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {sub.plan_type || 'Guest'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                          {sub.current_session_token ? '● Single Active' : 'Offline'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {sub.payment_reference_id ? (
                          <Link
                            href={`/invoice/${sub.payment_reference_id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] shadow-2xs transition"
                            title="Open printable tax invoice receipt"
                          >
                            <Receipt className="w-3 h-3 text-blue-600" />
                            <span>Invoice</span>
                          </Link>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Demo / N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CBT Submissions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" /> Recent CBT Submissions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.recentAttempts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center font-medium">No test submissions logged yet.</p>
          ) : (
            data.recentAttempts.map((att: any) => (
              <div key={att.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{att.exam_type}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Score: {att.score}/{att.total_questions} ({att.percentage}%)</div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  att.is_passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {att.is_passed ? 'QUALIFIED' : 'FAILED'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
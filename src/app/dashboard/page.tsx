'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, CheckCircle, XCircle, Clock, ArrowLeft, LogOut, Play, Smartphone, Laptop, Zap } from 'lucide-react';

interface ExamAttempt {
  id: string;
  exam_type: string;
  difficulty: string;
  total_questions: number;
  score: number;
  percentage: number;
  is_passed: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Load profile info & registered devices & mock credits
      const { data: profData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profData) {
        setProfile(profData);
      }

      // Load score history
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAttempts(data);
      }
      setLoading(false);
    }

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans font-bold">
        Loading Aspirant Profile & Scorecards...
      </div>
    );
  }

  const totalExams = attempts.length;
  const passedExams = attempts.filter((a) => a.is_passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const avgScore =
    totalExams > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + Number(curr.percentage), 0) / totalExams)
      : 0;

  const devices = profile?.registered_devices || [];
  const remainingCredits = profile?.mock_credits_remaining ?? 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-sm font-black text-blue-400 flex items-center gap-1.5 border-l border-slate-700 pl-4">
            <BookOpen className="w-4 h-4" /> BankerViva Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Profile Hero */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 border border-slate-700 p-6 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Aspirant Profile</span>
            <h1 className="text-2xl font-black mt-1">{user?.email?.split('@')[0]}</h1>
            <p className="text-xs text-slate-400 mt-1">Review your mock test performance and track your qualifying readiness.</p>
          </div>
          <Link
            href="/exam"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Take New Mock Exam
          </Link>
        </div>

        {/* Analytics & Quota Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Mock Credits
            </span>
            <div className="text-3xl font-black text-amber-400">{remainingCredits}</div>
          </div>
          <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Mock Tests</span>
            <div className="text-3xl font-black text-white">{totalExams}</div>
          </div>
          <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pass Rate</span>
            <div className="text-3xl font-black text-emerald-400">{passRate}%</div>
          </div>
          <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
            <div className="text-3xl font-black text-blue-400">{avgScore}%</div>
          </div>
        </div>

        {/* Device Registration & Security Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-400" /> Authorized Device Slots ({devices.length} / 2)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">To prevent group password sharing, accounts are locked to 2 personal devices.</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-900/50 border border-blue-700 text-blue-300">
              ANTI-SHARING ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {devices.map((d: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{d.device_name || 'Personal Device'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {d.device_id.slice(0, 16)}...</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Slot {idx + 1}
                </span>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 2 - devices.length) }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 flex items-center justify-center text-xs text-slate-500 font-medium">
                Empty Device Slot {devices.length + i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Attempt History Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Recent Mock Test Attempts
          </h2>

          {attempts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Award className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No mock exam attempts recorded yet.</p>
              <Link href="/exam" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">
                Launch First Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Certification</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 font-medium">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(attempt.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-white uppercase">{attempt.exam_type}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded border text-[10px] font-bold uppercase bg-slate-900 border-slate-700">
                          {attempt.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">{attempt.total_questions}</td>
                      <td className="py-3 px-4 font-bold text-white">{attempt.score}</td>
                      <td className="py-3 px-4">{attempt.percentage}%</td>
                      <td className="py-3 px-4">
                        {attempt.is_passed ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> PASSED
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
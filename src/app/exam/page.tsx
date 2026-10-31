'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Volume2, VolumeX, CheckCircle, XCircle, AlertCircle, Clock, 
  Award, Play, RotateCcw, ArrowLeft, Lock, Sparkles, ShieldCheck, 
  Target, Zap, BookOpen, BarChart2, Printer, Globe2, Layers, Loader2
} from 'lucide-react';
import { Question, Language, OptionKey } from '@/types/exam';
import { stopSpeech } from '@/lib/speech';
import { supabase } from '@/lib/supabaseClient';
import { checkUserSubscription, SubscriptionStatus } from '@/lib/subscription';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ExamHallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Language state: English ('en') vs Hindi ('hi')
  const [lang, setLang] = useState<Language>('hi');

  // Subscription state
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>({
    isLoggedIn: false,
    isSubscriber: false,
    planType: 'guest'
  });
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Configurator state
  const [inExam, setInExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>('JAIIB_IEIFS');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [sessionFormat, setSessionFormat] = useState<'demo' | 'sprint' | 'full'>('demo');
  const [selectedCbtSet, setSelectedCbtSet] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Exam runtime state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [responses, setResponses] = useState<Record<string | number, OptionKey | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string | number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [loading, setLoading] = useState(false);

  // Read URL query parameters from Briefing Room
  useEffect(() => {
    const paperParam = searchParams.get('paper');
    const setParam = searchParams.get('set');
    const modeParam = searchParams.get('mode');

    if (paperParam) setSelectedExam(paperParam);
    if (setParam) setSelectedCbtSet(Number(setParam));
    if (modeParam === 'full' || modeParam === 'demo' || modeParam === 'sprint') {
      setSessionFormat(modeParam);
      setDurationMinutes(modeParam === 'full' ? 120 : modeParam === 'sprint' ? 30 : 60);
    }
  }, [searchParams]);

  // Load User Subscription Status
  useEffect(() => {
    async function verifyAccess() {
      const status = await checkUserSubscription();
      setSubStatus(status);
      if (status.isSubscriber) {
        setSessionFormat('full');
        setDurationMinutes(120);
      } else {
        setSessionFormat('demo');
        setDurationMinutes(60);
      }
    }
    verifyAccess();
  }, []);

  // Load previously completed / locked sets
  useEffect(() => {
    const saved = localStorage.getItem(`bankerviva_completed_${selectedExam}`);
    if (saved) {
      try {
        setCompletedSets(JSON.parse(saved));
      } catch {
        setCompletedSets([]);
      }
    } else {
      setCompletedSets([]);
    }
  }, [selectedExam]);

  const isTieredExam = selectedExam === 'DRA' || selectedExam === 'BCBF' || selectedExam === 'AML_KYC' || selectedExam === 'CCP';

  const getAvailableCbtCount = (track: string) => {
    if (track.startsWith('JAIIB_') || track.startsWith('CAIIB_')) return 10;
    switch (track) {
      case 'DRA': return 30;
      case 'BCBF': return 20;
      case 'AML_KYC': return 20;
      case 'CCP': return 30;
      default: return 10;
    }
  };

  const totalCbtSets = getAvailableCbtCount(selectedExam);

  useEffect(() => {
    if (selectedCbtSet > totalCbtSets) {
      setSelectedCbtSet(1);
    }
  }, [selectedExam, totalCbtSets, selectedCbtSet]);

  // Single Active Session Watchdog (Safe Null Check)
  useEffect(() => {
    const sessionInterval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const localToken = localStorage.getItem('bankerviva_session_token');
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('current_session_token')
          .eq('id', user.id)
          .single();

        if (profile?.current_session_token && localToken && profile.current_session_token !== localToken) {
          clearInterval(sessionInterval);
          stopSpeech();
          alert('Logged out: Active session detected on another device.');
          await supabase.auth.signOut();
          router.push('/auth');
        }
      }
    }, 10000);

    return () => clearInterval(sessionInterval);
  }, [router]);

  // Anti-cheating & copy protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && ['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) || e.key === 'F12') {
        e.preventDefault();
      }
    };
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Fetch Questions with Hindi Translation Columns
  const startCustomExam = async () => {
    if (sessionFormat !== 'demo' && !subStatus.isSubscriber) {
      setShowPaywallModal(true);
      return;
    }

    setLoading(true);

    let query = supabase.from('questions').select('*').eq('exam_type', selectedExam);

    if (selectedDifficulty !== 'ALL') {
      query = query.eq('difficulty', selectedDifficulty.toLowerCase());
    }

    let targetCount = 100;

    if (sessionFormat === 'demo') {
      targetCount = 50;
      query = query.eq('cbt_set_number', 1);
    } else if (sessionFormat === 'full') {
      targetCount = 100;
      query = query.eq('cbt_set_number', selectedCbtSet);
    } else if (sessionFormat === 'sprint') {
      targetCount = 20;
      query = query.eq('cbt_set_number', selectedCbtSet);
    }

    const { data, error } = await query.order('id', { ascending: true }).limit(targetCount);

    if (!error && data && data.length > 0) {
      const mapped: Question[] = data.map((row: any) => ({
        id: row.id,
        exam_type: row.exam_type,
        module: row.module,
        difficulty: row.difficulty,
        cbt_set_number: row.cbt_set_number,
        question_text: row.question_text,
        question_text_hi: row.question_text_hi || undefined,
        audio_script: row.audio_script,
        audio_script_hi: row.audio_script_hi || undefined,
        options: {
          A: row.option_a,
          B: row.option_b,
          C: row.option_c,
          D: row.option_d
        },
        options_hi: row.option_a_hi ? {
          A: row.option_a_hi,
          B: row.option_b_hi,
          C: row.option_c_hi,
          D: row.option_d_hi
        } : undefined,
        correct_answer: row.correct_option,
        explanation: row.explanation,
        explanation_hi: row.explanation_hi || undefined
      }));

      setQuestions(mapped);
      setTimeLeft(durationMinutes * 60);
      setCurrentIndex(0);
      setResponses({});
      setReviewFlags({});
      setIsSubmitted(false);
      setInExam(true);
    } else {
      alert(`No questions found matching your criteria for ${selectedExam}. Try selecting 'ALL' Difficulty.`);
    }
    setLoading(false);
  };

  // Exit Exam Navigation Handler
  const handleExitExam = () => {
    if (window.confirm('Are you sure you want to exit the examination? Your current progress will be lost.')) {
      stopSpeech();
      setInExam(false);
      setIsSubmitted(false);
      setQuestions([]);
    }
  };

  // Clean Audio Scripts: Strips metadata tags
  const cleanScriptText = (text: string) => {
    if (!text) return '';
    return text.replace(/^\[.*?\]\s*/, '').trim();
  };

  // Bilingual Speech Synthesizer
  const triggerBilingualSpeech = (q: Question) => {
    if (!q) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (lang === 'hi') {
      const rawText = q.audio_script_hi || q.question_text_hi || q.question_text || '';
      const text = cleanScriptText(rawText);
      const optA = q.options_hi?.A || q.options.A;
      const optB = q.options_hi?.B || q.options.B;
      const optC = q.options_hi?.C || q.options.C;
      const optD = q.options_hi?.D || q.options.D;

      const utterance = new SpeechSynthesisUtterance(`${text}. विकल्प ए: ${optA}. विकल्प बी: ${optB}. विकल्प सी: ${optC}. विकल्प डी: ${optD}`);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      const rawText = q.audio_script || q.question_text || '';
      const text = cleanScriptText(rawText);
      const utterance = new SpeechSynthesisUtterance(`${text}. Option A: ${q.options.A}. Option B: ${q.options.B}. Option C: ${q.options.C}. Option D: ${q.options.D}`);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-Read Viva Speech
  useEffect(() => {
    if (autoRead && inExam && questions.length > 0 && !isSubmitted) {
      const q = questions[currentIndex];
      if (q) triggerBilingualSpeech(q);
    }
  }, [currentIndex, autoRead, inExam, questions, isSubmitted, lang]);

  // Countdown Timer
  useEffect(() => {
    if (!inExam || timeLeft <= 0 || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [inExam, timeLeft, isSubmitted]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (opt: OptionKey) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setResponses((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleSubmitExam = async () => {
    stopSpeech();
    setIsSubmitted(true);
    let totalScore = 0;
    questions.forEach((q) => {
      const userAns = responses[q.id] ?? responses[String(q.id)];
      if (userAns === q.correct_answer) totalScore += 1;
    });

    const passed = questions.length > 0 && totalScore / questions.length >= 0.5;

    if (passed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (sessionFormat === 'full') {
      const updated = Array.from(new Set([...completedSets, selectedCbtSet]));
      setCompletedSets(updated);
      localStorage.setItem(`bankerviva_completed_${selectedExam}`, JSON.stringify(updated));
    }

    const totalAllowedTime = durationMinutes * 60;
    const secondsSpent = Math.max(0, totalAllowedTime - timeLeft);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('exam_attempts').insert([
          {
            user_id: user.id,
            exam_type: `${selectedExam} ${sessionFormat === 'full' ? `(CBT #${selectedCbtSet})` : sessionFormat === 'sprint' ? `(Sprint #${selectedCbtSet})` : '(Demo)'}`,
            difficulty: selectedDifficulty,
            total_questions: questions.length,
            score: totalScore,
            percentage: Math.round((totalScore / questions.length) * 100),
            is_passed: passed,
            status: 'completed',
            time_spent_seconds: secondsSpent,
            response_sheet: responses,
          },
        ]);
      }
    } catch (err) {
      console.error('Error logging score:', err);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'hard': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const generateAnalytics = () => {
    const moduleStats: Record<string, { total: number; correct: number; hardTotal: number; hardCorrect: number; attempted: number }> = {};
    let hardTotal = 0;
    let hardCorrect = 0;
    let modTotal = 0;
    let modCorrect = 0;
    let easyTotal = 0;
    let easyCorrect = 0;
    let attemptedCount = 0;

    questions.forEach((q) => {
      const userChoice = responses[q.id] ?? responses[String(q.id)];
      const isAttempted = Boolean(userChoice);
      const isCorrect = isAttempted && userChoice === q.correct_answer;
      const mod = q.module || 'Core Banking Curriculum';

      if (isAttempted) attemptedCount += 1;

      if (!moduleStats[mod]) {
        moduleStats[mod] = { total: 0, correct: 0, hardTotal: 0, hardCorrect: 0, attempted: 0 };
      }

      moduleStats[mod].total += 1;
      if (isAttempted) moduleStats[mod].attempted += 1;
      if (isCorrect) moduleStats[mod].correct += 1;

      const diff = q.difficulty?.toLowerCase();
      if (diff === 'hard') {
        hardTotal += 1;
        if (isCorrect) hardCorrect += 1;
        moduleStats[mod].hardTotal += 1;
        if (isCorrect) moduleStats[mod].hardCorrect += 1;
      } else if (diff === 'easy') {
        easyTotal += 1;
        if (isCorrect) easyCorrect += 1;
      } else {
        modTotal += 1;
        if (isCorrect) modCorrect += 1;
      }
    });

    const weakModules = Object.entries(moduleStats)
      .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.5)
      .map(([mod]) => mod);

    return {
      moduleStats,
      hardAccuracy: hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 0,
      modAccuracy: modTotal > 0 ? Math.round((modCorrect / modTotal) * 100) : 0,
      easyAccuracy: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 0,
      weakModules,
      hardTotal,
      hardCorrect,
      modTotal,
      modCorrect,
      easyTotal,
      easyCorrect,
      attemptedCount
    };
  };

  const isCurrentSetLocked = completedSets.includes(selectedCbtSet);

  // Helper getters for active language
  const currentQ = questions[currentIndex];
  const activeQuestionText = currentQ ? (lang === 'hi' && currentQ.question_text_hi ? currentQ.question_text_hi : currentQ.question_text) : '';
  const activeOptions = currentQ ? (lang === 'hi' && currentQ.options_hi ? currentQ.options_hi : currentQ.options) : { A: '', B: '', C: '', D: '' };

  // 1. PRE-TEST CONFIGURATOR VIEW
  if (!inExam) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none">
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link href={`/cbt/briefing?paper=${selectedExam}&set=${selectedCbtSet}`} className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition">
              <Layers className="w-4 h-4" /> Architecture Briefing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${lang === 'hi' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>

            {subStatus.isSubscriber ? (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> PRO Subscriber
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-700 px-3 py-1 rounded-full">
                Free Demo (50 Qs)
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl relative">
            <div>
              <h1 className="text-2xl font-black">Configure Your Exam Session</h1>
              <p className="text-xs text-slate-400 mt-1">Select your paper, CBT set, and practice format.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Certification Paper</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-blue-500 text-white"
              >
                <optgroup label="JAIIB Examination Papers">
                  <option value="JAIIB_IEIFS">JAIIB: Paper 1 - Indian Economy & IFS (10 Sets)</option>
                  <option value="JAIIB_PPB">JAIIB: Paper 2 - Principles & Practices of Banking (10 Sets)</option>
                  <option value="JAIIB_AFM">JAIIB: Paper 3 - Accounting & Financial Management (10 Sets)</option>
                  <option value="JAIIB_RBWM">JAIIB: Paper 4 - Retail Banking & Wealth Mgmt (10 Sets)</option>
                </optgroup>

                <optgroup label="CAIIB Examination Papers">
                  <option value="CAIIB_ABM">CAIIB: Paper 1 - Advanced Bank Management (10 Sets)</option>
                  <option value="CAIIB_BFM">CAIIB: Paper 2 - Bank Financial Management (10 Sets)</option>
                  <option value="CAIIB_ABFM">CAIIB: Paper 3 - Adv Business & Financial Mgmt (10 Sets)</option>
                  <option value="CAIIB_BRBL">CAIIB: Paper 4 - Banking Reg & Business Laws (10 Sets)</option>
                </optgroup>

                <optgroup label="Certificate Courses">
                  <option value="DRA">DRA: Debt Recovery Agent (30 Full CBTs)</option>
                  <option value="CCP">CCP: Certified Credit Professional (30 Full CBTs)</option>
                  <option value="BCBF">BC / BF Financial Inclusion (20 Full CBTs)</option>
                  <option value="AML_KYC">AML / KYC Compliance (20 Full CBTs)</option>
                </optgroup>
              </select>
            </div>

            {/* Difficulty Tier Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-slate-300">Difficulty Tier</label>
                {!isTieredExam && (
                  <span className="text-[10px] text-blue-400 font-medium">Auto-blended (75% Mod / 25% Hard)</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {['ALL', 'EASY', 'MODERATE', 'HARD'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      if (!subStatus.isSubscriber && tier !== 'ALL') {
                        setShowPaywallModal(true);
                      } else {
                        setSelectedDifficulty(tier);
                      }
                    }}
                    className={`py-2.5 rounded-lg border transition flex items-center justify-center gap-1 ${
                      selectedDifficulty === tier
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {!subStatus.isSubscriber && tier !== 'ALL' && <Lock className="w-3 h-3 text-amber-400" />}
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Session Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSessionFormat('demo');
                    setDurationMinutes(60);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    sessionFormat === 'demo'
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-400">Free Demo (50 Qs)</div>
                  <div className="text-[10px] text-slate-400 mt-1">60 Mins • Diagnostic</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!subStatus.isSubscriber) {
                      setShowPaywallModal(true);
                    } else {
                      setSessionFormat('sprint');
                      setDurationMinutes(30);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition relative ${
                    sessionFormat === 'sprint'
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {!subStatus.isSubscriber && <Lock className="w-3 h-3 text-amber-400 absolute top-2 right-2" />}
                  <div className="text-xs font-bold">Sprint (20 Qs)</div>
                  <div className="text-[10px] text-slate-400 mt-1">30 Mins • Speed Drill</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!subStatus.isSubscriber) {
                      setShowPaywallModal(true);
                    } else {
                      setSessionFormat('full');
                      setDurationMinutes(120);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition relative ${
                    sessionFormat === 'full'
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {!subStatus.isSubscriber && <Lock className="w-3 h-3 text-amber-400 absolute top-2 right-2" />}
                  <div className="text-xs font-bold">Full CBT (100 Qs)</div>
                  <div className="text-[10px] text-slate-400 mt-1">120 Mins • Exam Hall</div>
                </button>
              </div>
            </div>

            {/* CBT Mock Test Selector */}
            {(sessionFormat === 'full' || sessionFormat === 'sprint') && (
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-blue-400">Select Mock Test Paper</label>
                  <span className="text-[10px] font-bold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                    {totalCbtSets} Sets Available
                  </span>
                </div>
                <select
                  value={selectedCbtSet}
                  onChange={(e) => setSelectedCbtSet(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-blue-500/50 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-blue-400 text-white"
                >
                  {Array.from({ length: totalCbtSets }, (_, i) => i + 1).map((num) => {
                    const isLocked = completedSets.includes(num);
                    return (
                      <option key={num} value={num}>
                        {selectedExam} CBT #{num} {isLocked ? '(🔒 Attempted / Review Mode)' : '• Available'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Submission Policy Notice */}
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-blue-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Bilingual Mode Active:</strong> You can toggle between English and हिन्दी during the live examination at any moment.
              </span>
            </div>

            <button
              onClick={startCustomExam}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> {loading ? 'Loading Paper...' : sessionFormat === 'demo' ? 'Start Free Diagnostic Demo (50 Qs)' : `Start CBT Set #${selectedCbtSet}`}
            </button>
          </div>
        </main>

        {/* Paywall Modal (Redirects correctly to /#pricing) */}
        {showPaywallModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 border border-amber-500/30 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Full CBTs are PRO Features</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Unlock all Full-Length CBT Mock Test Papers across all 12 certification tracks with bilingual support and AI Speech Viva.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl"
                >
                  Stay on Demo
                </button>
                <Link
                  href="/#pricing"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-current" /> Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const score = questions.reduce((acc, q) => {
    const userAns = responses[q.id] ?? responses[String(q.id)];
    return acc + (userAns === q.correct_answer ? 1 : 0);
  }, 0);
  const isPassed = questions.length > 0 && score / questions.length >= 0.5;

  // 2. SUBMITTED REVIEW SHEET & ANALYTICAL REPORT
  if (isSubmitted) {
    const analytics = generateAnalytics();

    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8 select-none font-sans text-slate-900 relative">
        <style jsx global>{`
          /* Universal Screen and Print Anti-Selection & Copy Shield */
          .secure-shield,
          .secure-shield * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
          }

          @media print {
            body { 
              background: #ffffff !important; 
              color: #000000 !important; 
              -webkit-user-select: none !important;
              user-select: none !important;
            }
            header, .no-print, nav, button { 
              display: none !important; 
            }

            .print-card { 
              border: 1px solid #cbd5e1 !important; 
              background: #ffffff !important; 
              color: #000000 !important; 
              break-inside: avoid; 
              margin-bottom: 12px !important;
              position: relative !important;
            }

            /* 1. Converts regular font text to outline stroke paths in PDF stream */
            .print-card p,
            .print-card div,
            .print-card span {
              -webkit-text-stroke: 0.35px currentColor;
              -webkit-user-select: none !important;
              user-select: none !important;
            }

            /* 2. Top-level transparent shield overlay intercepting Acrobat and AI selection */
            .print-card::before {
              content: "CONFIDENTIAL PRACTICE PAPER • PROTECTED BY BANKERVIVA • UNAUTHORIZED EXTRACTION PROHIBITED • ";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              font-size: 8pt;
              color: transparent !important;
              background: transparent !important;
              z-index: 99999;
              overflow: hidden;
              pointer-events: auto !important;
              -webkit-user-select: text !important;
              user-select: text !important;
            }

            .print-watermark {
              display: block !important;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              opacity: 0.05;
              pointer-events: none;
              z-index: 9999;
              background-image: repeating-linear-gradient(
                -45deg,
                #000000 0px,
                #000000 2px,
                transparent 2px,
                transparent 120px
              );
            }
          }

          @media screen {
            .print-watermark { display: none; }
          }
        `}</style>

        {/* Dynamic Non-Selectable Print Watermark Layer */}
        <div className="print-watermark pointer-events-none select-none" aria-hidden="true" />

        {/* Top Actions */}
        <div className="flex justify-between items-center no-print">
          <button
            onClick={() => setInExam(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Exit to Configurator
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF Scorecard
            </button>
          </div>
        </div>

        {/* Master Performance Banner */}
        <div className={`p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden print-card ${
          isPassed ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 border border-emerald-500/40' : 'bg-gradient-to-br from-rose-700 via-rose-900 to-slate-900 border border-rose-500/40'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Award className="w-8 h-8 text-amber-300" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">Diagnostic Scorecard</span>
                  <h1 className="text-3xl font-black">{isPassed ? 'QUALIFIED / EXAM READY' : 'REVISION REQUIRED'}</h1>
                </div>
              </div>
              <p className="mt-4 text-base font-medium text-white/90">
                Final Score: <strong className="text-white text-2xl font-black">{score} / {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%)
              </p>
              <p className="text-xs text-white/70 mt-0.5">Official Passing Threshold: 50% Aggregate</p>
            </div>

            <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-right space-y-1 min-w-[200px]">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest block">Evaluated Track</span>
              <div className="text-sm font-extrabold text-blue-300">{selectedExam}</div>
              <div className="text-xs text-white/80">
                {sessionFormat === 'full' ? `CBT Paper Set #${selectedCbtSet}` : sessionFormat === 'sprint' ? `Sprint Drill #${selectedCbtSet}` : '50-Q Diagnostic Demo'}
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Rigor Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 print-card">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase text-slate-500">Core Conceptual Tier</h3>
              </div>
              <span className="text-sm font-black text-blue-600">{analytics.modAccuracy}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${analytics.modAccuracy}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct statutory provisions and regulatory limits ({analytics.modCorrect}/{analytics.modTotal} Qs).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 print-card">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase text-slate-500">Analytical & Numerical</h3>
              </div>
              <span className="text-sm font-black text-purple-600">{analytics.hardAccuracy}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${analytics.hardAccuracy}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Calculation-heavy and case dilemma items ({analytics.hardCorrect}/{analytics.hardTotal} Qs).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 print-card">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase text-slate-500">Attempt Coverage</h3>
              </div>
              <span className="text-sm font-black text-emerald-600">
                {Math.round((analytics.attemptedCount / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${Math.round((analytics.attemptedCount / questions.length) * 100)}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Answered {analytics.attemptedCount} of {questions.length} questions.
            </p>
          </div>
        </div>

        {/* Module Competency Heatmap */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 print-card">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Module-Wise Competency Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-medium">Standard Benchmarks: 60%+ Proficient • &lt;45% Critical</span>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.moduleStats).map(([modName, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const isProficient = pct >= 60;
              const isCritical = pct < 45;

              return (
                <div key={modName} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 text-sm">{modName}</span>
                    <div className="flex items-center gap-3">
                      {stats.hardTotal > 0 && (
                        <span className="text-[11px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                          Hard: {stats.hardCorrect}/{stats.hardTotal}
                        </span>
                      )}
                      <span className={`text-sm ${isProficient ? 'text-emerald-600' : isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isProficient ? 'bg-emerald-500' : isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Review Sheet */}
        <div className="space-y-4 pt-4 secure-shield select-none bg-white p-4">
          <h2 className="text-2xl font-bold text-slate-800">Review Answer Sheet & Statutory Rationales</h2>
          {questions.map((q, idx) => {
            // Strictly resolve user choice safely across number vs string keys
            const rawChoice = responses[q.id] !== undefined ? responses[q.id] : responses[String(q.id)];
            const isAttempted = Boolean(rawChoice);
            const userChoice = isAttempted ? rawChoice : null;
            const isCorrect = isAttempted && userChoice === q.correct_answer;
            const qText = lang === 'hi' && q.question_text_hi ? q.question_text_hi : q.question_text;
            const qOpts = lang === 'hi' && q.options_hi ? q.options_hi : q.options;
            const qExpl = lang === 'hi' && q.explanation_hi ? q.explanation_hi : q.explanation;

            return (
              <div key={q.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3 print-card secure-shield select-none">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-bold uppercase">{q.exam_type}</span>
                    <span className={`px-2 py-0.5 rounded border uppercase text-[10px] font-bold ${getDifficultyBadge(q.difficulty)}`}>{q.difficulty}</span>
                    <span className="text-slate-500">Q{idx + 1} • {q.module}</span>
                  </div>
                  {isAttempted ? (
                    isCorrect ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold"><CheckCircle className="w-4 h-4" /> Correct (+1)</span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> Incorrect (0)</span>
                    )
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 font-bold"><Lock className="w-3.5 h-3.5 text-slate-400" /> Unattempted (0)</span>
                  )}
                </div>
                <p className="font-semibold text-slate-900 select-none">{qText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm select-none">
                  {Object.entries(qOpts).map(([k, v]) => {
                    let optStyle = 'border-slate-200 bg-slate-50 text-slate-700';

                    if (isAttempted) {
                      // Reveal correct option and mark wrong selections ONLY for attempted questions
                      if (k === q.correct_answer) optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400';
                      if (k === userChoice && !isCorrect) optStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                    } else {
                      // Strictly keep all options in neutral unselected style if unattempted
                      optStyle = 'border-slate-200 bg-white text-slate-700';
                    }

                    return (
                      <div key={k} className={`p-3 rounded-lg border select-none ${optStyle}`}>
                        <span className="mr-2 font-bold">{k}.</span> {v}
                      </div>
                    );
                  })}
                </div>
                
                {/* Statutory Explanation: Shown ONLY if attempted */}
                {isAttempted ? (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2 select-none">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div><strong>Statutory Explanation:</strong> {qExpl}</div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-start gap-2 select-none">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                    <div><strong>Statutory Explanation:</strong> Correct answer and statutory explanation are locked. You must actively attempt the question during the test to unlock review rationales.</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. LIVE EXAMINATION ARENA WITH BILINGUAL SWITCHER & DUAL NAVIGATION
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitExam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition"
            title="Exit to exam setup"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <Link
            href={`/cbt/briefing?paper=${selectedExam}&set=${selectedCbtSet}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
          >
            <Layers className="w-3.5 h-3.5" /> Briefing
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight">BankerViva • Practice CBT Simulation Hall</h1>
            <p className="text-[11px] text-slate-400">
              {selectedExam} {sessionFormat === 'full' ? `• CBT #${selectedCbtSet}` : sessionFormat === 'sprint' ? `• Sprint #${selectedCbtSet}` : '• Demo'} | {selectedDifficulty} Tier | {questions.length} Questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live In-Exam Language Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${lang === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${lang === 'hi' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={() => {
              if (autoRead) stopSpeech();
              setAutoRead(!autoRead);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              autoRead ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {autoRead ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Auto-Read: {autoRead ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 font-mono text-amber-400 font-bold text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            {formatTimer(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <section className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center pb-4 border-b gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
                  {currentQ?.exam_type}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(currentQ?.difficulty)}`}>
                  {currentQ?.difficulty}
                </span>
              </div>

              <button
                onClick={() => currentQ && triggerBilingualSpeech(currentQ)}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border font-medium text-slate-700"
              >
                <Volume2 className="w-4 h-4 text-blue-600" /> Read Aloud ({lang === 'hi' ? 'हिन्दी' : 'English'})
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium uppercase tracking-wider">{currentQ?.module}</p>
            <p className="text-base font-semibold text-slate-900 mt-2 leading-relaxed">
              {activeQuestionText}
            </p>

            <div className="mt-6 space-y-3">
              {currentQ && Object.entries(activeOptions).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key as OptionKey)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${
                    responses[currentQ.id] === key
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="inline-block w-6 font-bold">{key}.</span> {value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <button
              onClick={() => currentQ && setReviewFlags((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                currentQ && reviewFlags[currentQ.id] ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              {currentQ && reviewFlags[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
            </button>
            <div className="flex gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700"
                >
                  Submit Paper
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Question Palette */}
        <aside className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-4">Question Palette ({questions.length})</h2>
            <div className="grid grid-cols-5 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                let color = 'bg-slate-100 text-slate-700 border-slate-200';
                if (responses[q.id]) color = 'bg-emerald-600 text-white border-emerald-700';
                if (reviewFlags[q.id]) color = 'bg-purple-600 text-white border-purple-700';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-9 text-xs font-bold rounded-lg border flex items-center justify-center ${color} ${
                      currentIndex === idx ? 'ring-2 ring-slate-900' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmitExam}
            className="w-full mt-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Submit Exam
          </button>
        </aside>
      </main>
    </div>
  );
}

export default function ExamHall() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-bold text-slate-400">Entering Examination Hall...</span>
      </div>
    }>
      <ExamHallContent />
    </Suspense>
  );
}
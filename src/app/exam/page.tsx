'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle, XCircle, AlertCircle, Clock, Award, Filter, Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { Question } from '@/types/exam';
import { speakVivaPrompt, stopSpeech } from '@/lib/speech';
import { supabase } from '@/lib/supabaseClient';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExamHall() {
  const router = useRouter();

  // Configurator state
  const [inExam, setInExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  // Exam runtime state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Single Active Session Watchdog (Concurrent Login Prevention)
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

        if (profile && localToken && profile.current_session_token !== localToken) {
          clearInterval(sessionInterval);
          stopSpeech();
          alert('You have been logged out because this account was logged into from another browser or device.');
          await supabase.auth.signOut();
          router.push('/auth');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(sessionInterval);
  }, [router]);

  // Security protections
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

  // Fetch Questions based on custom exam configuration
  const startCustomExam = async () => {
    setLoading(true);
    let query = supabase.from('questions').select('*');

    if (selectedExam !== 'ALL') {
      query = query.ilike('exam_type', `%${selectedExam}%`);
    }

    if (selectedDifficulty !== 'ALL') {
      query = query.eq('difficulty', selectedDifficulty.toLowerCase());
    }

    const { data, error } = await query.limit(questionCount);

    if (!error && data && data.length > 0) {
      const mapped: Question[] = data.map((row: any) => ({
        id: row.id,
        exam_type: row.exam_type,
        module: row.module,
        difficulty: row.difficulty,
        question_text: row.question_text,
        audio_script: row.audio_script,
        options: {
          A: row.option_a,
          B: row.option_b,
          C: row.option_c,
          D: row.option_d
        },
        correct_answer: row.correct_option,
        explanation: row.explanation
      }));

      setQuestions(mapped);
      setTimeLeft(durationMinutes * 60);
      setCurrentIndex(0);
      setResponses({});
      setReviewFlags({});
      setIsSubmitted(false);
      setInExam(true);
    } else {
      alert('No questions found matching your selected criteria. Try adjusting the difficulty or track filter.');
    }
    setLoading(false);
  };

  // Auto-Read Viva Speech
  useEffect(() => {
    if (autoRead && inExam && questions.length > 0 && !isSubmitted) {
      const q = questions[currentIndex];
      if (q) {
        speakVivaPrompt(`${q.audio_script}. Option A: ${q.options.A}. Option B: ${q.options.B}. Option C: ${q.options.C}. Option D: ${q.options.D}`);
      }
    }
  }, [currentIndex, autoRead, inExam, questions, isSubmitted]);

  // Timer
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

  const handleSelect = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setResponses((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleSubmitExam = async () => {
    stopSpeech();
    setIsSubmitted(true);
    let totalScore = 0;
    questions.forEach((q) => {
      if (responses[q.id] === q.correct_answer) totalScore += 1;
    });

    const passed = questions.length > 0 && totalScore / questions.length >= 0.5;

    if (passed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    // Save attempt to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('exam_attempts').insert([
        {
          user_id: user.id,
          exam_type: selectedExam,
          difficulty: selectedDifficulty,
          total_questions: questions.length,
          score: totalScore,
          percentage: Math.round((totalScore / questions.length) * 100),
          is_passed: passed,
        },
      ]);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'hard':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  // 1. PRE-TEST CONFIGURATOR VIEW
  if (!inExam) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none">
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-sm font-black text-blue-400">BankerViva Test Engine</span>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div>
              <h1 className="text-2xl font-black">Configure Your Mock Exam</h1>
              <p className="text-xs text-slate-400 mt-1">Select your syllabus target, session length, and difficulty level.</p>
            </div>

            {/* Exam Track */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Certification Track</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Certifications Combined</option>
                <option value="DRA">DRA (Debt Recovery Agent)</option>
                <option value="JAIIB">JAIIB (All 4 Modules)</option>
                <option value="CAIIB">CAIIB (All 3 Modules)</option>
                <option value="AML_KYC">AML / KYC Compliance</option>
                <option value="BCBF">BC / BF Financial Inclusion</option>
                <option value="CCP">CCP (Credit Professional)</option>
              </select>
            </div>

            {/* Difficulty Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Difficulty Tier</label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {['ALL', 'EASY', 'MODERATE', 'HARD'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedDifficulty(tier)}
                    className={`py-2.5 rounded-lg border transition ${
                      selectedDifficulty === tier
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Duration & Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-300">Session Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Sprint (20 Qs)', count: 20, mins: 30 },
                  { label: 'Sectional (50 Qs)', count: 50, mins: 60 },
                  { label: 'Full CBT (100 Qs)', count: 100, mins: 120 }
                ].map((mode) => (
                  <button
                    key={mode.count}
                    type="button"
                    onClick={() => {
                      setQuestionCount(mode.count);
                      setDurationMinutes(mode.mins);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      questionCount === mode.count
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{mode.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{mode.mins} Minutes</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startCustomExam}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> {loading ? 'Loading Questions...' : 'Start Examination'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const score = questions.reduce((acc, q) => acc + (responses[q.id] === q.correct_answer ? 1 : 0), 0);
  const isPassed = questions.length > 0 && score / questions.length >= 0.5;

  // 2. SUBMITTED REVIEW SHEET
  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 select-none no-copy font-sans">
        <div className={`p-6 rounded-2xl text-white shadow-lg ${isPassed ? 'bg-emerald-700' : 'bg-rose-700'}`}>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8" />
            <h1 className="text-3xl font-black">{isPassed ? 'QUALIFIED / PASSED' : 'NEEDS IMPROVEMENT'}</h1>
          </div>
          <p className="mt-3 text-lg font-medium">Final Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</p>
          <p className="text-sm opacity-80">IIBF Qualifying Criterion: 50% Aggregate</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setInExam(false)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" /> Start New Test
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Review Answer Sheet & Statutory Rationales</h2>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userChoice = responses[q.id];
            const isCorrect = userChoice === q.correct_answer;
            return (
              <div key={q.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-bold uppercase">{q.exam_type}</span>
                    <span className={`px-2 py-0.5 rounded border uppercase text-[10px] font-bold ${getDifficultyBadge(q.difficulty)}`}>{q.difficulty}</span>
                    <span className="text-slate-500">Q{idx + 1} • {q.module}</span>
                  </div>
                  {isCorrect ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Correct (+1)</span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {userChoice ? 'Incorrect (0)' : 'Unattempted (0)'}</span>
                  )}
                </div>
                <p className="font-semibold text-slate-900">{q.question_text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(q.options).map(([k, v]) => {
                    let optStyle = 'border-slate-200 bg-slate-50 text-slate-700';
                    if (k === q.correct_answer) optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    if (k === userChoice && !isCorrect) optStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                    return (
                      <div key={k} className={`p-3 rounded-lg border ${optStyle}`}>
                        <span className="mr-2">{k}.</span> {v}
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div><strong>Statutory Explanation:</strong> {q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. LIVE EXAMINATION ARENA
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none no-copy">
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md">
        <div>
          <h1 className="text-lg font-bold tracking-tight">BankerViva • IIBF CBT Simulation</h1>
          <p className="text-xs text-slate-400">{selectedExam} Track | {selectedDifficulty} Tier | {questions.length} Questions</p>
        </div>

        <div className="flex items-center gap-4">
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
                  {currentQ.exam_type}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(currentQ.difficulty)}`}>
                  {currentQ.difficulty}
                </span>
              </div>

              <button
                onClick={() =>
                  speakVivaPrompt(
                    `${currentQ.audio_script}. Option A: ${currentQ.options.A}. Option B: ${currentQ.options.B}. Option C: ${currentQ.options.C}. Option D: ${currentQ.options.D}`
                  )
                }
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border font-medium text-slate-700"
              >
                <Volume2 className="w-4 h-4 text-blue-600" /> Read Aloud
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium uppercase tracking-wider">{currentQ.module}</p>
            <p className="text-base font-semibold text-slate-900 mt-2 leading-relaxed">
              {currentQ.question_text}
            </p>

            <div className="mt-6 space-y-3">
              {Object.entries(currentQ.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key as 'A' | 'B' | 'C' | 'D')}
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
              onClick={() => setReviewFlags((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                reviewFlags[currentQ.id] ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              {reviewFlags[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
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
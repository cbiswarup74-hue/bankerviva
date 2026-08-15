'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle, XCircle, AlertCircle, Clock, Award, Filter } from 'lucide-react';
import { Question } from '@/types/exam';
import { speakVivaPrompt, stopSpeech } from '@/lib/speech';
import { supabase } from '@/lib/supabaseClient';
import confetti from 'canvas-confetti';

export default function ExamHall() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [loading, setLoading] = useState(true);

  // Anti-Copy & Shortcut Protection
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

  // Fetch Questions dynamically by Exam Filter
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      let query = supabase.from('questions').select('*').limit(200);
      if (selectedExam !== 'ALL') {
        query = query.ilike('exam_type', `%${selectedExam}%`);
      }

      const { data, error } = await query;
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
        setCurrentIndex(0);
        setResponses({});
      }
      setLoading(false);
    }
    loadQuestions();
  }, [selectedExam]);

  // Auto-Read Audio Viva
  useEffect(() => {
    if (autoRead && questions.length > 0 && !isSubmitted) {
      const q = questions[currentIndex];
      if (q) {
        speakVivaPrompt(`${q.audio_script}. Option A: ${q.options.A}. Option B: ${q.options.B}. Option C: ${q.options.C}. Option D: ${q.options.D}`);
      }
    }
  }, [currentIndex, autoRead, questions, isSubmitted]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
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
  }, [timeLeft, isSubmitted]);

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

  const handleSubmitExam = () => {
    stopSpeech();
    setIsSubmitted(true);
    let totalScore = 0;
    questions.forEach((q) => {
      if (responses[q.id] === q.correct_answer) totalScore += 1;
    });

    if (questions.length > 0 && totalScore / questions.length >= 0.5) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans text-slate-700 font-bold">
        Loading Question Bank...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <p className="text-lg font-bold text-slate-800">No questions available for this module.</p>
        <button onClick={() => setSelectedExam('ALL')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">
          View All Questions
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const score = questions.reduce((acc, q) => acc + (responses[q.id] === q.correct_answer ? 1 : 0), 0);
  const isPassed = questions.length > 0 && score / questions.length >= 0.5;

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none no-copy">
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md">
        <div>
          <h1 className="text-lg font-bold tracking-tight">BankerViva • IIBF CBT Simulation</h1>
          <div className="flex items-center gap-2 mt-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-0.5 border border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Certifications ({questions.length} Loaded)</option>
              <option value="DRA">DRA (Debt Recovery Agent)</option>
              <option value="JAIIB">JAIIB Modules</option>
              <option value="CAIIB">CAIIB Modules</option>
              <option value="AML_KYC">AML / KYC</option>
              <option value="BCBF">BC / BF</option>
              <option value="CCP">CCP (Credit Professional)</option>
            </select>
          </div>
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
'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle, XCircle, AlertCircle, Clock, Award } from 'lucide-react';
import { Question } from '@/types/exam';
import { speakVivaPrompt, stopSpeech } from '@/lib/speech';
import { supabase } from '@/lib/supabaseClient';
import confetti from 'canvas-confetti';

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    exam_type: 'DRA',
    module: 'SARFAESI Act & Recovery',
    difficulty: 'moderate',
    question_text: 'Under Section 13(2) of the SARFAESI Act, 2002, what is the statutory notice period granted to a defaulting borrower to clear liabilities in full?',
    audio_script: 'Under Section 13(2) of SARFAESI Act, what is the statutory notice period?',
    options: { A: '30 Days', B: '45 Days', C: '60 Days', D: '90 Days' },
    correct_answer: 'C',
    explanation: 'Section 13(2) provides a 60-day demand window to the borrower before the lender can take physical possession of assets.'
  },
  {
    id: 'q2',
    exam_type: 'JAIIB_PPB',
    module: 'RBI Fair Practices Code',
    difficulty: 'easy',
    question_text: 'As per RBI Fair Practices Code, between what hours is an authorized recovery agent permitted to contact a borrower?',
    audio_script: 'What are the permissible calling hours for debt recovery agents?',
    options: { A: '07:00 to 19:00 hrs', B: '08:00 to 19:00 hrs', C: '09:00 to 20:00 hrs', D: '06:00 to 21:00 hrs' },
    correct_answer: 'B',
    explanation: 'RBI guidelines explicitly mandate that recovery communication occur only between 08:00 hrs and 19:00 hrs.'
  },
  {
    id: 'q3',
    exam_type: 'JAIIB_AFM',
    module: 'Accounting Standards & Ratios',
    difficulty: 'hard',
    question_text: 'What does a Current Ratio of less than 1.0 indicate for a corporate borrower seeking credit facility renewal?',
    audio_script: 'What does a Current Ratio under 1.0 signify for a corporate credit borrower?',
    options: {
      A: 'Negative working capital where current liabilities exceed current assets',
      B: 'High liquidity and strong debt servicing capacity',
      C: 'Zero debt-equity exposure',
      D: 'Optimum buffer for contingent claims'
    },
    correct_answer: 'A',
    explanation: 'A current ratio below 1.0 indicates negative net working capital, signaling short-term liquidity distress.'
  }
];

export default function ExamHall() {
  const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 mins
  const [responses, setResponses] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Anti-Copy, Anti-Right Click & Inspection Key Blocker
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          (e.key === 'c' ||
            e.key === 'C' ||
            e.key === 'u' ||
            e.key === 'U' ||
            e.key === 's' ||
            e.key === 'S' ||
            e.key === 'p' ||
            e.key === 'P')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Fetch questions from Supabase if available, otherwise fallback
  useEffect(() => {
    async function loadQuestions() {
      const { data, error } = await supabase.from('questions').select('*').limit(100);
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
      }
    }
    loadQuestions();
  }, []);

  // 120-minute countdown clock
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

    if (totalScore / questions.length >= 0.5) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentQ = questions[currentIndex];
  const score = questions.reduce((acc, q) => acc + (responses[q.id] === q.correct_answer ? 1 : 0), 0);
  const isPassed = score / questions.length >= 0.5;

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 select-none no-copy">
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
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wide">Q{idx + 1} • {q.module}</span>
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
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-lg font-bold tracking-tight">BankerViva • IIBF CBT Simulation</h1>
          <p className="text-xs text-slate-400">Total: {questions.length} Questions | 120 Mins</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 font-mono text-amber-400 font-bold">
          <Clock className="w-4 h-4 animate-pulse" />
          {formatTimer(timeLeft)}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <section className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-xs font-bold uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Question {currentIndex + 1} of {questions.length}
              </span>
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

            <p className="text-base font-semibold text-slate-900 mt-4 leading-relaxed">
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
            <h2 className="text-sm font-bold text-slate-800 mb-4">Question Palette</h2>
            <div className="grid grid-cols-5 gap-2">
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
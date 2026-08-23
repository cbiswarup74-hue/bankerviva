'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Volume2, VolumeX, Sparkles, 
  BookOpen, HelpCircle, ShieldCheck, Clock, Award, Globe, 
  KeyRound, CreditCard, Headphones, GraduationCap, ChevronDown
} from 'lucide-react';

interface QuickCard {
  id: string;
  title: string;
  desc: string;
  icon: any;
  response: string;
}

const ACTION_CARDS: QuickCard[] = [
  {
    id: 'syllabus_jaiib',
    title: 'JAIIB 4 Papers & Syllabus',
    desc: 'IEIFS, PPB, AFM & RBWM details',
    icon: GraduationCap,
    response: "JAIIB consists of 4 compulsory papers:\n• Paper 1: Indian Economy & Indian Financial System (IEIFS)\n• Paper 2: Principles & Practices of Banking (PPB)\n• Paper 3: Accounting & Financial Management for Bankers (AFM)\n• Paper 4: Retail Banking & Wealth Management (RBWM)\n\nBankerViva offers 10 full-length CBT mock sets (1,000 bilingual questions) for each paper."
  },
  {
    id: 'syllabus_caiib',
    title: 'CAIIB 4 Papers & Syllabus',
    desc: 'ABM, BFM, ABFM & BRBL details',
    icon: GraduationCap,
    response: "CAIIB consists of 4 core papers:\n• Paper 1: Advanced Bank Management (ABM)\n• Paper 2: Bank Financial Management (BFM)\n• Paper 3: Advanced Business & Financial Management (ABFM)\n• Paper 4: Banking Regulations & Business Laws (BRBL)\n\nBankerViva provides 10 full-length mock sets (1,000 bilingual questions) for every CAIIB paper."
  },
  {
    id: 'syllabus_cert',
    title: 'Certifications: DRA, BCBF, CCP',
    desc: '3,000 DRA, 2,000 BCBF, 3,001 CCP',
    icon: BookOpen,
    response: "Specialized Certificate Courses on BankerViva:\n• Debt Recovery Agent (DRA): 30 Sets (3,000 Qs)\n• Business Correspondent (BCBF): 20 Sets (2,000 Qs)\n• Certified Credit Professional (CCP): 30 Sets (3,001 Qs)\n• AML / KYC Compliance: 20 Sets (2,000 Qs)\n\nAll available with statutory rationales in English and Hindi."
  },
  {
    id: 'exam_proc',
    title: 'Exam Procedure',
    desc: 'CBT rules, palette colors & timer',
    icon: Clock,
    response: "The BankerViva CBT simulation strictly mirrors the official IIBF pattern. Each full test consists of 100 questions with a 120-minute countdown timer. The palette tracks Answered (Green), Marked for Review (Purple), and Unvisited (Gray). Responses autosave instantly upon selection."
  },
  {
    id: 'login_proc',
    title: 'Login & Device Security',
    desc: 'Email login & 2-device limit',
    icon: KeyRound,
    response: "You can sign in using your registered email address. Each subscription license is restricted to a maximum of 2 personal devices and enforces a single active session token. If you forget your password, click 'Forgot Password?' on the login screen for an instant reset link."
  },
  {
    id: 'bilingual',
    title: 'Language Switcher',
    desc: 'English / Hindi & Viva Speech',
    icon: Globe,
    response: "You can seamlessly switch between English and statutory Hindi anytime during the exam using the top-right language toggle. The 'Read Aloud' audio button also reads out questions and options in both languages, with internal metadata tags stripped automatically."
  },
  {
    id: 'validity',
    title: 'Subscription & Validity',
    desc: '6-Month & 1-Year plans',
    icon: CreditCard,
    response: "Whenever you log in, BankerViva displays your exact subscription validity date. Individual exam track packages come with a 6-month validity period, whereas the Comprehensive All-Access Package provides a full 1-year validity with unlimited attempts across all 180 CBT mock sets."
  },
  {
    id: 'scorecard',
    title: 'Diagnostic Scorecard',
    desc: 'Competency heatmaps & PDF',
    icon: Award,
    response: "Upon completing any test, you receive an instant Diagnostic Scorecard with module-wise competency percentages, cognitive breakdown, statutory rationales for every option, and a 1-click printable PDF download for revision."
  }
];

function cleanSpeechPhonetics(text: string): string {
  let spoken = text
    .replace(/\bQs\b/gi, 'questions')
    .replace(/\bQ's\b/gi, 'questions')
    .replace(/\b\((\d+)\s*Qs\)/gi, '($1 questions)')
    .replace(/\b(\d+)\s*Qs\b/gi, '$1 questions')
    .replace(/\bQ\b/gi, 'question')
    .replace(/JAIIB/g, 'J. A. I. I. B.')
    .replace(/CAIIB/g, 'C. A. I. I. B.')
    .replace(/DRA/g, 'D. R. A.')
    .replace(/BCBF/g, 'B. C. B. F.')
    .replace(/CCP/g, 'C. C. P.')
    .replace(/AML\/KYC/gi, 'A. M. L. and K. Y. C.')
    .replace(/AML/g, 'A. M. L.')
    .replace(/KYC/g, 'K. Y. C.')
    .replace(/IEIFS/g, 'I. E. I. F. S.')
    .replace(/PPB/g, 'P. P. B.')
    .replace(/AFM/g, 'A. F. M.')
    .replace(/RBWM/g, 'R. B. W. M.')
    .replace(/ABM/g, 'A. B. M.')
    .replace(/BFM/g, 'B. F. M.')
    .replace(/ABFM/g, 'A. B. F. M.')
    .replace(/BRBL/g, 'B. R. B. L.')
    .replace(/CBT/g, 'C. B. T.')
    .replace(/IIBF/g, 'I. I. B. F.')
    .replace(/SARFAESI/g, 'Sar fay zee')
    .replace(/[:;•\-_*#`~|\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return spoken;
}

export default function AITutorChatbot() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    {
      sender: 'bot',
      text: "Hi! I am Vani from Team BankerViva. How may I assist you with your IIBF preparation today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity fade timer (dims out after 4 seconds of idle time)
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isOpen) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 4000);
    }
  };

  useEffect(() => {
    setMounted(true);
    resetIdleTimer();

    const handleUserActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          const list = window.speechSynthesis.getVoices();
          if (list && list.length > 0) setVoices(list);
        } catch (e) {}
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isOpen]);

  const getLivelyFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    const validEnglishVoices = voices.filter(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('en') &&
        !name.includes('bengali') &&
        !name.includes('hindi') &&
        !name.includes('chinese') &&
        !name.includes('mandarin') &&
        !name.includes('david') &&
        !name.includes('mark') &&
        !name.includes('george')
      );
    });

    return (
      validEnglishVoices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Google US English')) ||
      validEnglishVoices.find(v => (v.name.includes('Natural') || v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Sonia') || v.name.includes('Heera')) && !v.name.toLowerCase().includes('male')) ||
      validEnglishVoices.find(v => v.name.includes('Zira')) ||
      validEnglishVoices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
      validEnglishVoices.find(v => v.lang === 'en-US' || v.lang === 'en-GB') ||
      validEnglishVoices[0] ||
      null
    );
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel();
      const cleanText = cleanSpeechPhonetics(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.rate = 0.91;
      utterance.pitch = 1.02;

      const chosenVoice = getLivelyFemaleVoice();
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleCardClick = (card: QuickCard) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: card.title },
      { sender: 'bot', text: card.response }
    ]);
    speakText(card.response);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user' as const, text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      speakText(data.reply);
    } catch {
      const fallback = 'Network connection issue. Please check your internet connection.';
      setMessages((prev) => [...prev, { sender: 'bot', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    resetIdleTimer();
    if (nextState && messages.length === 1) {
      setTimeout(() => {
        speakText(messages[0].text);
      }, 150);
    }
    if (!nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setIsSpeaking(false);
    }
  };

  if (!mounted) return null;

  return (
    <div 
      onMouseEnter={() => resetIdleTimer()}
      className="fixed bottom-5 right-5 z-[9999] pointer-events-auto print:hidden transition-all duration-500 ease-in-out"
    >
      {/* Vani Auto-Docking Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleOpen}
          className={`relative group flex items-center transition-all duration-500 cursor-pointer ${
            isIdle 
              ? 'opacity-30 hover:opacity-100 p-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-md translate-x-2'
              : 'opacity-100 p-2 pr-4 rounded-full bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 border border-cyan-400/50 shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'
          }`}
          title={isIdle ? "Click or hover to open Vani Assistant" : "Ask Vani (Virtual Banking Assistant)"}
        >
          {/* Avatar Icon */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-950 flex items-center justify-center shadow-inner flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="#091428" />
              <path d="M 26 50 C 24 30, 76 30, 74 50 C 76 72, 70 82, 70 82 L 30 82 C 30 82, 24 72, 26 50 Z" fill="#0f172a" />
              <path d="M 44 58 L 56 58 L 58 74 L 42 74 Z" fill="#e8ad86" />
              <path d="M 22 96 C 24 72, 38 72, 50 72 C 62 72, 76 72, 78 96 Z" fill="#1e3a8a" />
              <polygon points="50,72 40,86 50,96 60,86" fill="#ffffff" />
              <polygon points="48,86 50,96 52,86" fill="#0284c7" />
              <ellipse cx="50" cy="48" rx="20" ry="22" fill="#ffdfc4" />
              <path d="M 30 42 C 30 26, 70 26, 70 42 C 65 34, 55 33, 46 36 C 38 38, 33 41, 30 42 Z" fill="#0f172a" />
              <ellipse cx="43" cy="46" rx="2.5" ry="3.5" fill="#0f172a" />
              <ellipse cx="57" cy="46" rx="2.5" ry="3.5" fill="#0f172a" />
              <circle cx="44" cy="45" r="1" fill="#ffffff" />
              <circle cx="58" cy="45" r="1" fill="#ffffff" />
              <path d="M 39 40 Q 43 38 47 40" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 53 40 Q 57 38 61 40" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 45 57 Q 50 62 55 57" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 28 44 C 28 28, 72 28, 72 44" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="25" y="42" width="5" height="12" rx="2.5" fill="#0284c7" />
              <rect x="70" y="42" width="5" height="12" rx="2.5" fill="#0284c7" />
              <path d="M 28 52 Q 32 63 44 63" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="44" cy="63" r="2.5" fill="#38bdf8" />
            </svg>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          {/* Text expands when active, collapses smoothly when idle */}
          <div className={`text-left overflow-hidden transition-all duration-300 ${isIdle ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-2.5'}`}>
            <div className="text-xs font-black text-white flex items-center gap-1">
              Vani <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[9px] text-cyan-200 font-semibold flex items-center gap-1 whitespace-nowrap">
              <Headphones className="w-2.5 h-2.5 text-cyan-400" /> Virtual Assistant
            </div>
          </div>
        </button>
      )}

      {/* Main Interactive Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[560px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 ${isSpeaking ? 'border-cyan-400 ring-4 ring-cyan-500/30' : 'border-cyan-500/60'} bg-slate-900 flex items-center justify-center transition-all shadow-md`}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="48" fill="#091428" />
                  <path d="M 26 50 C 24 30, 76 30, 74 50 C 76 72, 70 82, 70 82 L 30 82 C 30 82, 24 72, 26 50 Z" fill="#0f172a" />
                  <path d="M 44 58 L 56 58 L 58 74 L 42 74 Z" fill="#e8ad86" />
                  <path d="M 22 96 C 24 72, 38 72, 50 72 C 62 72, 76 72, 78 96 Z" fill="#1e3a8a" />
                  <polygon points="50,72 40,86 50,96 60,86" fill="#ffffff" />
                  <polygon points="48,86 50,96 52,86" fill="#0284c7" />
                  <ellipse cx="50" cy="48" rx="20" ry="22" fill="#ffdfc4" />
                  <path d="M 30 42 C 30 26, 70 26, 70 42 C 65 34, 55 33, 46 36 C 38 38, 33 41, 30 42 Z" fill="#0f172a" />
                  <ellipse cx="43" cy="46" rx="2.5" ry="3.5" fill="#0f172a" />
                  <ellipse cx="57" cy="46" rx="2.5" ry="3.5" fill="#0f172a" />
                  <circle cx="44" cy="45" r="1" fill="#ffffff" />
                  <circle cx="58" cy="45" r="1" fill="#ffffff" />
                  <path d="M 39 40 Q 43 38 47 40" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 53 40 Q 57 38 61 40" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 45 57 Q 50 62 55 57" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 28 44 C 28 28, 72 28, 72 44" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <rect x="25" y="42" width="5" height="12" rx="2.5" fill="#0284c7" />
                  <rect x="70" y="42" width="5" height="12" rx="2.5" fill="#0284c7" />
                  <path d="M 28 52 Q 32 63 44 63" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="44" cy="63" r="2.5" fill="#38bdf8" />
                </svg>
              </div>

              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  Vani • BankerViva <Sparkles className="w-3 h-3 text-cyan-400" />
                </h3>
                <p className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                  {isSpeaking ? 'Speaking...' : 'Ready to Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextVoice = !voiceEnabled;
                  setVoiceEnabled(nextVoice);
                  if (!nextVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    try {
                      window.speechSynthesis.cancel();
                    } catch (e) {}
                    setIsSpeaking(false);
                  }
                }}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  voiceEnabled ? 'bg-blue-950/80 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={voiceEnabled ? 'Mute Speech' : 'Enable Speech'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={toggleOpen}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Minimize Vani"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="p-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Quick Exam Topics
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-1">
              {ACTION_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    type="button"
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className="p-1.5 bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg text-left transition flex items-start gap-1.5 group cursor-pointer"
                  >
                    <IconComponent className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:text-cyan-300 transition" />
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-bold text-slate-200 group-hover:text-white truncate">{card.title}</div>
                      <div className="text-[8px] text-slate-400 truncate">{card.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[9px] text-cyan-300 font-bold flex-shrink-0 mt-0.5 shadow-sm">
                    BV
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap shadow-md ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                Vani is analyzing your inquiry...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Query Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask any JAIIB, CAIIB, or course doubt..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg transition shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
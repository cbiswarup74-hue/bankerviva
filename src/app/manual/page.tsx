'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Laptop, 
  Volume2, 
  FileCheck2,
  Play,
  Video
} from 'lucide-react';

const WALKTHROUGH_STEPS = [
  {
    step: 1,
    badge: 'Stage 1: Access & Authentication',
    title: 'Candidate Sign-In & Single-Device Validation',
    action: 'Enter Registered Email & Password',
    desc: 'Each candidate license binds automatically to a maximum of 2 personal devices. Logging in activates a unique session token that safeguards test history and prevents duplicate active sessions.',
    rule: 'If attempting to login on a third device, authentication will be denied until an existing device is cleared.',
    uiPreview: '[ Login Form: Registered Email ID • Secure Password • Single Active Session Watchdog ]'
  },
  {
    step: 2,
    badge: 'Stage 2: Dashboard Navigation',
    title: 'Track Selection & Pre-Exam Briefing',
    action: 'Select Target Certification Track (JAIIB, CAIIB, DRA, BCBF, CCP, AML/KYC)',
    desc: 'Candidates choose from 12 distinct certification streams and select their designated CBT Mock Set (1 to 40). Review the exam matrix covering question weightage, time allowance, and passing thresholds.',
    rule: 'The dashboard displays active subscription validity dates directly upon entrance.',
    uiPreview: '[ Matrix: 100 Questions • 120 Minutes • 50% Qualifying Cutoff • 75:25 IIBF Ratio ]'
  },
  {
    step: 3,
    badge: 'Stage 3: Live CBT Simulation',
    title: 'Interactive Test Interface & Palette Mechanics',
    action: 'Launch 120-Minute Countdown CBT Engine',
    desc: 'The exam engine features cloud-synchronized autosave on every selection. The right-hand question palette dynamically tracks test progress in real time.',
    rule: 'Green = Answered & Saved | Purple = Marked for Review | Gray = Unvisited Question.',
    uiPreview: '[ Live Screen: 120-Min Timer • Question Canvas • 4 Radio Options • Palette 1-100 ]'
  },
  {
    step: 4,
    badge: 'Stage 4: Bilingual Engine & Viva Voice',
    title: 'Instant Language Toggle & Speech Viva Voce',
    action: 'Toggle English/Hindi or Trigger Read-Aloud Voice Drills',
    desc: 'Switch between English and statutory Hindi at any second without losing selected responses. Click "Read Aloud" to hear questions and options read aloud with clear audio prompts.',
    rule: 'Internal question tags and metadata are stripped automatically during voice speech output.',
    uiPreview: '[ Switcher: English ⇄ Statutory Hindi • Audio Icon: Active Viva Narration ]'
  },
  {
    step: 5,
    badge: 'Stage 5: Permanent Lock Enforcement',
    title: 'Final Test Submission & Non-Reopening Lockout',
    action: 'Confirm Final CBT Submission Dialog',
    desc: 'Upon reviewing all 100 questions, the candidate triggers final submission. A confirmation dialog appears reminding the candidate that responses will be finalized.',
    rule: 'CRITICAL: Once submitted, this specific CBT Set is permanently locked and cannot be re-opened or re-attempted under any circumstances.',
    uiPreview: '[ Warning Modal: "Submit Exam? CBT Set #X will be permanently closed and evaluated." ]'
  },
  {
    step: 6,
    badge: 'Stage 6: Post-Exam Analytics',
    title: 'Diagnostic Scorecard & Printable PDF Report',
    action: 'Review Competency Heatmaps & Download Official Scorecard',
    desc: 'Instant diagnostic evaluation generates module-level competency percentages, cognitive ability breakdowns, and statutory explanations for all 100 questions.',
    rule: 'Click "Export PDF Scorecard" to download an official printable summary report.',
    uiPreview: '[ Report: Module A/B/C/D Mastery % • Statutory References • 1-Click PDF Export ]'
  }
];

export default function UserManualPage() {
  const [activeStep, setActiveStep] = useState(1);

  const handlePrint = () => {
    window.print();
  };

  const current = WALKTHROUGH_STEPS.find((s) => s.step === activeStep)!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none relative overflow-x-hidden print:bg-white print:text-black">
      {/* Soft Sky Blue Gradient Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-gradient-to-b from-sky-100/90 via-blue-50/60 to-transparent blur-[140px] pointer-events-none -z-10 print:hidden" />

      {/* Top Header & Print Toolbar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between shadow-xs print:hidden">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Platform
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Download / Print Complete SOP User Guide (PDF)
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-8 print:p-0 print:m-0 print:max-w-full">
        {/* Banner Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                Banker<span className="text-blue-600">Viva</span> User Guide
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
              Candidate Walkthrough Manual • Statutory CBT Procedures • Evaluation & Locking Protocols
            </p>
          </div>

          <div className="text-xs text-slate-700 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 font-medium">
            <div><strong className="text-slate-900 font-bold">Protocol:</strong> IIBF Calibrated SOP</div>
            <div><strong className="text-slate-900 font-bold">Standard:</strong> 100 Qs / 120 Mins</div>
            <div><strong className="text-slate-900 font-bold">Lockout:</strong> Permanent Post-Submit</div>
          </div>
        </div>

        {/* Mandatory Lockout Rule */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 text-rose-950 space-y-2 shadow-xs">
          <div className="flex items-center gap-2.5 text-rose-800 font-black text-sm uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>Mandatory Examination Rule: Permanent CBT Set Locking</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
            Once a candidate confirms and submits a particular CBT Mock Set (e.g., CBT #1, CBT #2), that specific question set is <strong className="text-rose-700 font-black">PERMANENTLY LOCKED AND CLOSED</strong>. Candidates <strong className="text-rose-700 font-black">CANNOT re-open, edit, or re-take that set again</strong>. Your diagnostic scorecard, module heatmaps, and rationales remain permanently available for review in your scorecard archives.
          </p>
        </div>

        {/* Interactive Step-by-Step Tabs (On Screen) */}
        <section className="space-y-5 print:hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Interactive Examination Stages (Step-by-Step)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Select any stage below to inspect</span>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {WALKTHROUGH_STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`p-3.5 rounded-xl text-left border transition cursor-pointer ${
                  activeStep === s.step
                    ? 'bg-blue-50 border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-[10px] font-extrabold uppercase ${activeStep === s.step ? 'text-blue-600' : 'text-slate-500'}`}>
                  Stage 0{s.step}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</div>
              </button>
            ))}
          </div>

          {/* Active Step Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{current.badge}</span>
              <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-slate-800 font-mono font-bold">
                Action: {current.action}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900">{current.title}</h3>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">{current.desc}</p>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold">
              <strong className="text-blue-700 font-bold">System Rule:</strong> {current.rule}
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs font-bold text-emerald-700 text-center">
              {current.uiPreview}
            </div>
          </div>
        </section>

        {/* Complete Standard Operating Procedure (All 6 Stages Rendered for PDF & Print) */}
        <section className="space-y-6 pt-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" /> Complete Standard Operating Procedure (Stages 1 through 6)
          </h2>

          <div className="space-y-4">
            {WALKTHROUGH_STEPS.map((stepItem) => (
              <div key={stepItem.step} className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs print:border-slate-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-600 uppercase tracking-wider">{stepItem.badge}</span>
                  <span className="text-slate-500 font-mono font-bold">Step 0{stepItem.step} / 06</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">{stepItem.title}</h3>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">{stepItem.desc}</p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-semibold">
                  <strong className="text-emerald-700 font-bold">Platform Regulation:</strong> {stepItem.rule}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Video Narration Script Section */}
        <section className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs print:border-slate-300">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Standard Video Demonstration & Narration Script</h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed font-medium">
            <p><strong className="text-slate-900 font-bold">Scene 1 (Login):</strong> "Welcome to BankerViva. Begin by signing in with your registered email and password. Your single-user license protects your test sessions on up to two personal devices."</p>
            <p><strong className="text-slate-900 font-bold">Scene 2 (Selection):</strong> "Select your target exam—such as JAIIB, CAIIB, DRA, BCBF, or CCP. Choose your CBT Mock Set to review the 100-question matrix."</p>
            <p><strong className="text-slate-900 font-bold">Scene 3 (CBT Engine):</strong> "Inside the exam room, your 120-minute timer begins. Answer options autosave immediately. Use the color palette on the right to track answered, review-tagged, and unvisited questions."</p>
            <p><strong className="text-slate-900 font-bold">Scene 4 (Bilingual Viva):</strong> "Toggle between English and statutory Hindi anytime using the top button, or click Read Aloud to hear viva questions spoken clearly."</p>
            <p><strong className="text-slate-900 font-bold">Scene 5 (Permanent Lockout):</strong> "Important notice: Once you click Final Submit, your CBT set is permanently locked and evaluated. It cannot be reopened."</p>
            <p><strong className="text-slate-900 font-bold">Scene 6 (Scorecard):</strong> "Instant diagnostic analysis provides module competency percentages, statutory rationales for all options, and a one-click printable PDF report card."</p>
          </div>
        </section>

        {/* Quick Enterprise Guidelines Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Device Binding</h4>
            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Your login allows up to 2 active devices. For device switches, submit a reset on the Contact Us page.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Bilingual Support</h4>
            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Instant toggling between Hindi and English during mock tests with zero loss of timer or answers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Diagnostic Heatmaps</h4>
            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Module-wise scoring and regulatory law references provided for all attempted papers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 font-medium print:hidden">
        <p>© 2026 BankerViva. All rights reserved. Specialized IIBF Exam Readiness Platform with 18,000+ Bilingual Questions.</p>
      </footer>
    </div>
  );
}
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, Cpu, Target, Award, ArrowRight, BookOpen, 
  ArrowLeft, Lock, CheckCircle2, Clock, Globe2, Layers, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface PaperConfig {
  title: string;
  code: string;
  category: 'JAIIB' | 'CAIIB' | 'Specialist';
  totalQuestions: number;
  duration: number;
  totalSets: number;
  modules: string[];
  weightageBreakdown: {
    factual: string;
    conceptual: string;
    caseStudy: string;
  };
  statutoryContext: string;
  passMarks: number;
}

const ALL_PAPERS: Record<string, PaperConfig> = {
  // JAIIB Tracks
  'JAIIB_IEIFS': {
    title: 'Indian Economy & Indian Financial System',
    code: 'JAIIB Paper 1 (IE & IFS)',
    category: 'JAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Indian Economic Architecture', 'Module B: Economic Concepts & Macro Planning', 'Module C: Indian Financial System Framework', 'Module D: Financial Markets & Intermediaries'],
    weightageBreakdown: { factual: '50 × 0.5M', conceptual: '25 × 1.0M', caseStudy: '25 × 2.0M' },
    statutoryContext: 'RBI Master Directions on Monetary Policy, SEBI Market Frameworks, and 2026 Union Budget Fiscal Metrics.',
    passMarks: 50
  },
  'JAIIB_PPB': {
    title: 'Principles & Practices of Banking',
    code: 'JAIIB Paper 2 (PPB)',
    category: 'JAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: General Banking Operations', 'Module B: Lending Operations & Credit Delivery', 'Module C: Banking Technology & Digital Infrastructure', 'Module D: Ethics & Operational Governance'],
    weightageBreakdown: { factual: '50 × 0.5M', conceptual: '25 × 1.0M', caseStudy: '25 × 2.0M' },
    statutoryContext: 'Banking Regulation Act 1949, Negotiable Instruments Act 1881, and RBI Clean Note & Payment Directives.',
    passMarks: 50
  },
  'JAIIB_AFM': {
    title: 'Accounting & Financial Management for Bankers',
    code: 'JAIIB Paper 3 (AFM)',
    category: 'JAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Accounting Principles & Standards', 'Module B: Financial Mathematics & Capital Budgeting', 'Module C: Final Accounts & Balance Sheet Construction', 'Module D: Core Banking Software & Forensic Auditing'],
    weightageBreakdown: { factual: '40 × 0.5M', conceptual: '30 × 1.0M', caseStudy: '30 × 2.0M' },
    statutoryContext: 'Ind AS / AS Standards, IRR/YTM Bond Valuation Formulas, and Schedule 3 Bank Balance Sheet Regulations.',
    passMarks: 50
  },
  'JAIIB_RBWM': {
    title: 'Retail Banking & Wealth Management',
    code: 'JAIIB Paper 4 (RBWM)',
    category: 'JAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Retail Banking Foundations', 'Module B: Retail Products, Mortgages & Credit Scoring', 'Module C: Wealth Management & Mutual Funds', 'Module D: Real Estate Regulation & Housing Finance'],
    weightageBreakdown: { factual: '50 × 0.5M', conceptual: '25 × 1.0M', caseStudy: '25 × 2.0M' },
    statutoryContext: 'RERA 2016 Guidelines, SEBI Mutual Fund Regulations, and NHB Mortgage Valuation Norms.',
    passMarks: 50
  },

  // CAIIB Tracks
  'CAIIB_ABM': {
    title: 'Advanced Bank Management',
    code: 'CAIIB Paper 1 (ABM)',
    category: 'CAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Statistics & Econometric Forecasting', 'Module B: Human Resources Management in Banks', 'Module C: Macro Banking Economics', 'Module D: Credit Management & Loan Monitoring'],
    weightageBreakdown: { factual: '35 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '30 × 2.0M' },
    statutoryContext: 'Regression & Time Series Estimation, Tandon/Nayak Norms, and RBI Stressed Asset Prudential Guidelines.',
    passMarks: 50
  },
  'CAIIB_BFM': {
    title: 'Bank Financial Management',
    code: 'CAIIB Paper 2 (BFM)',
    category: 'CAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: International Banking & Forex Treasury', 'Module B: Basel III Capital & Risk Management', 'Module C: Treasury Operations & Asset Liability Mgmt', 'Module D: Balance Sheet Risk Governance'],
    weightageBreakdown: { factual: '30 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '35 × 2.0M' },
    statutoryContext: 'FEMA 1999, FEDAI Guidelines, UCPDC 600, and Basel III CRAR/LCR Pillar 1 & 2 Frameworks.',
    passMarks: 50
  },
  'CAIIB_ABFM': {
    title: 'Advanced Business & Financial Management',
    code: 'CAIIB Paper 3 (ABFM)',
    category: 'CAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Enterprise Business Architecture', 'Module B: Advanced Financial Appraisal & WACC', 'Module C: Corporate Valuation & M&A Due Diligence', 'Module D: Green Financing, ESG & Hybrid Instruments'],
    weightageBreakdown: { factual: '30 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '35 × 2.0M' },
    statutoryContext: 'Companies Act 2013 Financial Provisions, SEBI Substantial Acquisition Regulations, and RBI ESG Directives.',
    passMarks: 50
  },
  'CAIIB_BRBL': {
    title: 'Banking Regulations & Business Laws',
    code: 'CAIIB Paper 4 (BRBL)',
    category: 'CAIIB',
    totalQuestions: 100,
    duration: 120,
    totalSets: 10,
    modules: ['Module A: Regulatory Framework of Banking', 'Module B: Legal Aspects of Banking Operations', 'Module C: Banking Related Commercial Laws', 'Module D: Recovery & Insolvency Mechanisms'],
    weightageBreakdown: { factual: '40 × 0.5M', conceptual: '30 × 1.0M', caseStudy: '30 × 2.0M' },
    statutoryContext: 'SARFAESI 2002, IBC 2016, DRT Act 1993, and RBI Integrated Ombudsman Scheme 2021.',
    passMarks: 50
  },

  // Specialist Tracks
  'DRA': {
    title: 'Debt Recovery Agent Certification',
    code: 'DRA Track (3,000 Qs Tri-Tier)',
    category: 'Specialist',
    totalQuestions: 100,
    duration: 120,
    totalSets: 30,
    modules: ['Module 1: Principles of Banking & Lending Norms', 'Module 2: RBI Fair Practices Code for Recovery', 'Module 3: SARFAESI & Legal Recourse Tools', 'Module 4: Soft Skills, Ethics & Grievance Redressal'],
    weightageBreakdown: { factual: '40 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '25 × 2.0M' },
    statutoryContext: 'RBI Master Circular on Recovery Agents, Limitation Act 1963, and Police Notification Verification Protocol.',
    passMarks: 50
  },
  'CCP': {
    title: 'Certified Credit Professional Course',
    code: 'CCP Specialist (Credit Appraisal)',
    category: 'Specialist',
    totalQuestions: 100,
    duration: 120,
    totalSets: 30,
    modules: ['Module A: Corporate Balance Sheet & Ratio Analysis', 'Module B: MPBF Working Capital & Term Loan Appraisal', 'Module C: Large Exposure Framework & Consortium Norms', 'Module D: Non-Fund Facilities (LC, BG) & Restructuring'],
    weightageBreakdown: { factual: '30 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '35 × 2.0M' },
    statutoryContext: 'RBI Master Circular on Wilful Defaulters, LEF Exposure Ceilings, and Prudential Stressed Asset Restructuring.',
    passMarks: 50
  },
  'BCBF': {
    title: 'Business Correspondents & Facilitators',
    code: 'BC/BF Financial Inclusion Track',
    category: 'Specialist',
    totalQuestions: 100,
    duration: 120,
    totalSets: 20,
    modules: ['Module 1: Rural Banking & Financial Inclusion Goals', 'Module 2: Micro-ATM, AePS & POS Interoperability', 'Module 3: Social Security Schemes (PMJDY, PMJJBY, APY)', 'Module 4: Operational Vigilance & Customer Protection'],
    weightageBreakdown: { factual: '50 × 0.5M', conceptual: '30 × 1.0M', caseStudy: '20 × 2.0M' },
    statutoryContext: 'NPCI AePS Operating Standards, PMJDY Overdraft Directives, and UIDAI Biometric Aadhaar Rules.',
    passMarks: 50
  },
  'AML_KYC': {
    title: 'AML & KYC Compliance Specialist',
    code: 'AML/KYC Statutory Specialist',
    category: 'Specialist',
    totalQuestions: 100,
    duration: 120,
    totalSets: 20,
    modules: ['Module 1: Money Laundering Typologies & Threat Vectors', 'Module 2: Customer Due Diligence & Beneficial Ownership', 'Module 3: FIU-IND Reporting Mandates (CTR, STR, CCR)', 'Module 4: UNSC Sanctions & Enhanced Due Diligence'],
    weightageBreakdown: { factual: '40 × 0.5M', conceptual: '35 × 1.0M', caseStudy: '25 × 2.0M' },
    statutoryContext: 'Prevention of Money Laundering Act (PMLA) 2002, FATF 40 Recommendations, and FIU-IND XML Schema 2.0.',
    passMarks: 50
  }
};

function BriefingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPaper = searchParams.get('paper') || 'JAIIB_IEIFS';
  const initialSet = Number(searchParams.get('set')) || 1;

  const [selectedPaperKey, setSelectedPaperKey] = useState<string>(
    ALL_PAPERS[initialPaper] ? initialPaper : 'JAIIB_IEIFS'
  );
  const [selectedSet, setSelectedSet] = useState<number>(initialSet);

  useEffect(() => {
    const p = searchParams.get('paper');
    const s = searchParams.get('set');
    if (p && ALL_PAPERS[p]) setSelectedPaperKey(p);
    if (s) setSelectedSet(Number(s));
  }, [searchParams]);

  const currentPaper = ALL_PAPERS[selectedPaperKey] || ALL_PAPERS['JAIIB_IEIFS'];

  const handleStartExam = () => {
    router.push(`/exam?paper=${selectedPaperKey}&set=${selectedSet}&mode=full`);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 select-none font-sans text-slate-900">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 space-y-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Return to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Globe2 className="w-3.5 h-3.5" /> Bilingual: English + Hindi
            </span>
            <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              Set #{selectedSet.toString().padStart(2, '0')} of {currentPaper.totalSets}
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Selectors */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
            <Layers className="w-4 h-4 text-blue-600" />
            Switch Active Qualification Track & Paper:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paper Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Certification Examination</label>
              <select
                value={selectedPaperKey}
                onChange={(e) => {
                  setSelectedPaperKey(e.target.value);
                  setSelectedSet(1);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <optgroup label="JAIIB Examination Papers">
                  <option value="JAIIB_IEIFS">JAIIB: Paper 1 - Indian Economy & IFS</option>
                  <option value="JAIIB_PPB">JAIIB: Paper 2 - Principles & Practices of Banking</option>
                  <option value="JAIIB_AFM">JAIIB: Paper 3 - Accounting & Financial Management</option>
                  <option value="JAIIB_RBWM">JAIIB: Paper 4 - Retail Banking & Wealth Mgmt</option>
                </optgroup>
                <optgroup label="CAIIB Examination Papers">
                  <option value="CAIIB_ABM">CAIIB: Paper 1 - Advanced Bank Management</option>
                  <option value="CAIIB_BFM">CAIIB: Paper 2 - Bank Financial Management</option>
                  <option value="CAIIB_ABFM">CAIIB: Paper 3 - Adv Business & Financial Mgmt</option>
                  <option value="CAIIB_BRBL">CAIIB: Paper 4 - Banking Reg & Business Laws</option>
                </optgroup>
                <optgroup label="Specialist Diploma & Certifications">
                  <option value="DRA">DRA: Debt Recovery Agent (30 Full CBT Sets)</option>
                  <option value="CCP">CCP: Certified Credit Professional (30 Full CBT Sets)</option>
                  <option value="BCBF">BC/BF: Business Correspondents (20 Full CBT Sets)</option>
                  <option value="AML_KYC">AML/KYC Compliance Specialist (20 Full CBT Sets)</option>
                </optgroup>
              </select>
            </div>

            {/* Set Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Mock Paper Set</label>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {Array.from({ length: currentPaper.totalSets }, (_, i) => i + 1).map((sNum) => (
                  <option key={sNum} value={sNum}>
                    CBT Mock Set #{sNum.toString().padStart(2, '0')} (100 Distinct Qs)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Paper Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            BankerViva CBT Standard Operating Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentPaper.code}: {currentPaper.title}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            This Computer Based Test (CBT Set #{selectedSet.toString().padStart(2, '0')}) has been generated using a deterministic statutory syllabus-matrix engine. It guarantees comprehensive module coverage and authentic psychometric marking.
          </p>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Items</span>
            <p className="text-2xl font-black text-slate-900">{currentPaper.totalQuestions} MCQs</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Marks</span>
            <p className="text-2xl font-black text-slate-900">100 Marks</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Time Window</span>
            <p className="text-2xl font-black text-slate-900">{currentPaper.duration} Mins</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Negative Mark</span>
            <p className="text-2xl font-black text-emerald-600">None (0.0)</p>
          </div>
        </div>

        {/* Dynamic Syllabus Modules Included */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Partitioning in this CBT Set
          </h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {currentPaper.modules.map((mod, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{mod}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Psychometric Calibration & Weightage Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" /> Psychometric Weightage Matrix
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-1">
              <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                Factual Tier
              </div>
              <p className="text-lg font-black text-blue-700">{currentPaper.weightageBreakdown.factual}</p>
              <p className="text-[11px] text-slate-600 leading-tight">Direct definitions & statutory timelines.</p>
            </div>

            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-1">
              <div className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                Conceptual Tier
              </div>
              <p className="text-lg font-black text-indigo-700">{currentPaper.weightageBreakdown.conceptual}</p>
              <p className="text-[11px] text-slate-600 leading-tight">Provisions, legal recourse & procedures.</p>
            </div>

            <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/50 space-y-1">
              <div className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600 flex-shrink-0" />
                Analytical / Numerical
              </div>
              <p className="text-lg font-black text-purple-700">{currentPaper.weightageBreakdown.caseStudy}</p>
              <p className="text-[11px] text-slate-600 leading-tight">Case studies, formulas & multi-step problems.</p>
            </div>
          </div>
        </div>

        {/* Statutory Context Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Statutory Grounding & Authorities:</span>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {currentPaper.statutoryContext}
          </p>
        </div>

        {/* Candidate Instructions & Lock Notice */}
        <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
          <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Examination Rules & Submission Policy
          </h3>
          <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong>Qualifying Cutoff:</strong> Minimum {currentPaper.passMarks}% aggregate in this paper.</li>
            <li><strong>One-Time Locked Attempt:</strong> Once submitted, your answers will lock and generate an official printable PDF diagnostic scorecard.</li>
            <li><strong>Navigation Controls:</strong> You may mark questions for review and jump across the question palette at any time during the {currentPaper.duration} minutes.</li>
          </ul>
        </div>

        {/* Dynamic CTA Launch Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 text-center sm:text-left font-medium">
            Starting: <strong className="text-slate-900">{currentPaper.code} • Set #{selectedSet}</strong>
          </span>
          <button
            onClick={handleStartExam}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
          >
            Enter Live CBT Exam Hall
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ExamBriefingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-bold text-slate-500">Preparing examination briefing room...</span>
      </div>
    }>
      <BriefingContent />
    </Suspense>
  );
}
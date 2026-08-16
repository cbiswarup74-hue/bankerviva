'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  User, 
  Laptop, 
  Clock,
  Sparkles,
  Zap,
  Volume2,
  FileCheck2,
  LockKeyhole
} from 'lucide-react';

export default function LandingPage() {
  const [pricingTab, setPricingTab] = useState<'individual' | 'institutional'>('individual');

  const individualPlans = [
    {
      title: 'BC / BF (Business Correspondent)',
      price: '₹399',
      duration: '6 Months',
      credits: '20 Mock Attempts',
      badge: 'Financial Inclusion',
      features: [
        'PMJDY, PMJJBY, PMSBY & APY Framework',
        'AePS, Micro-ATM & Biometric Tech',
        'SHG & Rural Lending Norms',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in BC/BF Track'
    },
    {
      title: 'DRA (Debt Recovery Agent)',
      price: '₹499',
      duration: '6 Months',
      credits: '25 Mock Attempts',
      badge: 'High Demand',
      features: [
        'Complete RBI Fair Practices Code',
        'SARFAESI 2002 & DRT Framework',
        'Audio-Assisted Viva Simulation',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in DRA Track'
    },
    {
      title: 'AML / KYC Compliance',
      price: '₹699',
      duration: '6 Months',
      credits: '25 Mock Attempts',
      badge: 'Statutory Specialist',
      features: [
        'PMLA 2002 & FIU-IND Reporting Rules',
        'CTR, STR, CCR Thresholds & EDD',
        'Beneficial Ownership Rules',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in AML/KYC Track'
    },
    {
      title: 'JAIIB Comprehensive',
      price: '₹1,299',
      duration: '6 Months',
      credits: '40 Mock Attempts',
      badge: 'Most Popular',
      features: [
        'All 4 Modules (IEFS, PPBI, AFM, RBWM)',
        'Latest Revised Syllabus',
        'Detailed Statutory Explanations',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in JAIIB Track'
    },
    {
      title: 'CAIIB Advanced',
      price: '₹1,299',
      duration: '6 Months',
      credits: '40 Mock Attempts',
      badge: 'Officer Scale',
      features: [
        'All 3 Compulsory Modules + Electives',
        'Forex, Treasury & Risk Case Scenarios',
        'Step-by-step Numerical Solutions',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in CAIIB Track'
    },
    {
      title: 'Certified Credit Professional (CCP)',
      price: '₹1,499',
      duration: '6 Months',
      credits: '35 Mock Attempts',
      badge: 'Credit Appraisal',
      features: [
        'Tandon / Nayak Working Capital Models',
        'TOL/TNW, DSCR & Balance Sheet Analysis',
        'Large Exposure Framework & Consortium',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in CCP Track'
    },
    {
      title: 'All-Access Master Pass',
      price: '₹2,499',
      duration: '12 Months',
      credits: 'Unlimited CBT Attempts',
      badge: 'Best Value',
      features: [
        'Unlocks DRA, JAIIB, CAIIB, BC/BF, AML/KYC & CCP',
        'Single Active Session Protection',
        'Full Audio Viva Engine Access',
        'Max 2 Personal Devices'
      ],
      ctaText: 'Get Master Pass'
    }
  ];

  const institutionalPlans = [
    {
      title: 'BC / BF Rural CSC Bulk Pass',
      price: '₹249',
      unit: '/ candidate',
      minOrder: 'Min 25 Candidate Seats (₹6,225 total)',
      duration: '6 Months',
      badge: 'Financial Inclusion',
      features: [
        'Instant 16-Character Activation Vouchers',
        'AePS, PMJDY & Social Security Test Series',
        'Individual Candidate Device Locking',
        'Official Invoicing for Corporate BCs'
      ],
      ctaText: 'Book BC/BF Batch'
    },
    {
      title: 'DRA Agency Bulk Tier',
      price: '₹299',
      unit: '/ candidate',
      minOrder: 'Min 25 Candidate Seats (₹7,475 total)',
      duration: '6 Months',
      badge: 'Agency Special',
      features: [
        'Instant 16-Character Activation Vouchers',
        'Dedicated Batch Performance Tracking',
        'Individual Candidate Device Locking',
        'Official Invoicing for Agencies'
      ],
      ctaText: 'Book DRA Agency Batch'
    },
    {
      title: 'Specialized (AML/KYC & CCP)',
      price: '₹449',
      unit: '/ candidate',
      minOrder: 'Min 10 Candidate Seats (₹4,490 total)',
      duration: '6 Months',
      badge: 'Compliance Desk',
      features: [
        'FIU-IND PMLA Reporting Standards',
        'Credit Processing & Ratio Appraisals',
        'Batch Activation Codes',
        'Corporate Verification Support'
      ],
      ctaText: 'Order Compliance Tier'
    },
    {
      title: 'JAIIB / CAIIB Bank Batch',
      price: '₹799',
      unit: '/ candidate',
      minOrder: 'Min 10 Candidate Seats (₹7,990 total)',
      duration: '6 Months',
      badge: 'Bank / NBFC',
      features: [
        'Bulk Voucher Activation for Staff',
        'Full 4-Module Question Bank Access',
        'Real-time Staff Attempt Analytics',
        'Centralized Voucher Management'
      ],
      ctaText: 'Order Bank Study Batch'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-black text-slate-900 tracking-tight">Banker<span className="text-blue-600">Viva</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#why-bankerviva" className="hover:text-blue-600 transition">Why BankerViva?</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing & Plans</a>
          <a href="#security" className="hover:text-blue-600 transition">Anti-Sharing Tech</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/auth" 
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 transition shadow-sm"
          >
            Sign In
          </Link>
          <Link 
            href="/auth" 
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        {/* Prominent High-Visibility Badge */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border-2 border-blue-600/30 bg-blue-50 text-blue-800 text-sm sm:text-base font-extrabold shadow-sm">
          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 animate-pulse" />
          <span>India's First Audio-Assisted IIBF Viva & CBT Mock Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-950">
          Master DRA, JAIIB & CAIIB Exams with <span className="text-blue-600">Confidence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed">
          Comprehensive statutory question banks, automated voice viva simulations, and single-license protection built for banking aspirants, bank branches, and recovery agencies.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/exam"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Launch Mock Test <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm rounded-xl shadow-sm transition"
          >
            View Pricing & Bulk Plans
          </a>
        </div>
      </section>

      {/* Why BankerViva? - 3 Hero Pillars Section */}
      <section id="why-bankerviva" className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why BankerViva?</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Engineered for Guaranteed Certification</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Audio-Assisted Viva Simulations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Experience dynamic text-to-speech oral examination drills designed to build rapid recall and mental reflexes under strict time limits.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Statutory Explanations & Rationales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every question includes references to RBI Master Directions, SARFAESI 2002 guidelines, DRT pecuniary limits, and IIBF 2026 syllabus modules.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Protected Single-User Licensing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bound to 2 personal devices with real-time active session validation, giving students and agencies secure, private scorecard progress.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial Pricing Matrix Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16 space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transparent Licensing</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Choose Your Certification Track</h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Select an individual preparation pass or book institutional vouchers for your agency or branch batch.
          </p>

          {/* Pricing Toggle */}
          <div className="flex justify-center pt-4">
            <div className="inline-flex bg-slate-200 p-1 rounded-xl">
              <button
                onClick={() => setPricingTab('individual')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
                  pricingTab === 'individual'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Individual Aspirants
              </button>
              <button
                onClick={() => setPricingTab('institutional')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
                  pricingTab === 'institutional'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Agencies / Institutional Bulk
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {pricingTab === 'individual' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {individualPlans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition relative shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {plan.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{plan.title}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-medium">/ 6 mos</span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> {plan.credits}
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth"
                  className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow text-center block transition"
                >
                  {plan.ctaText}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pt-2">
            {institutionalPlans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition relative shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {plan.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{plan.title}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-amber-600">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-medium">{plan.unit}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-1">
                      {plan.minOrder}
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth"
                  className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow text-center block transition"
                >
                  {plan.ctaText}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security & Anti-Sharing Section */}
      <section id="security" className="max-w-6xl mx-auto px-6 py-16 space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Protection</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Built-in Commercial Safeguards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Hardware Device Binding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every candidate license is automatically bound to a maximum of 2 personal devices (e.g., primary laptop and phone), preventing unauthorized credential sharing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Single Active Session Lock</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time active token watchdogs invalidate and terminate duplicate concurrent logins within 10 seconds across disparate IP addresses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Voucher Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agencies receive tamper-proof 16-character license vouchers with automated seat tracking and aggregate performance analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 BankerViva. All rights reserved. Specialized IIBF Exam Readiness Platform.</p>
      </footer>
    </div>
  );
}
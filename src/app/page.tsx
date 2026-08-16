'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  User, 
  Laptop, 
  Zap, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const [pricingTab, setPricingTab] = useState<'individual' | 'institutional'>('individual');

  const individualPlans = [
    {
      title: 'DRA (Debt Recovery Agent)',
      price: '₹499',
      duration: '6 Months Validity',
      credits: '25 Full Mock Attempts',
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
      title: 'JAIIB Comprehensive',
      price: '₹1,299',
      duration: '6 Months Validity',
      credits: '40 Full Mock Attempts',
      badge: 'Banker Choice',
      features: [
        'All 4 Modules (IEFS, PPBI, AFM, RBWM)',
        'Latest 2026 Revised Syllabus',
        'Detailed Statutory Explanations',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in JAIIB Track'
    },
    {
      title: 'CAIIB Advanced',
      price: '₹1,299',
      duration: '6 Months Validity',
      credits: '40 Full Mock Attempts',
      badge: 'Officer Scale',
      features: [
        'All 3 Compulsory Modules + Electives',
        'Forex, Treasury & Risk Case Scenarios',
        'Step-by-step Mathematical Solutions',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll in CAIIB Track'
    },
    {
      title: 'All-Access Master Pass',
      price: '₹2,499',
      duration: '12 Months Validity',
      credits: 'Unlimited CBT Attempts',
      badge: 'Best Value',
      features: [
        'Unlocks DRA, JAIIB, CAIIB, AML/KYC & CCP',
        'Single Active Session Protection',
        'Priority Technical & Viva Support',
        'Multi-Device Sync (Max 2 Devices)'
      ],
      ctaText: 'Get All-Access Pass'
    }
  ];

  const institutionalPlans = [
    {
      title: 'DRA Agency Bulk Tier',
      price: '₹299',
      unit: '/ candidate',
      minOrder: 'Minimum 25 Candidate Seats (₹7,475 total)',
      duration: '6 Months Validity',
      badge: 'Agency Special',
      features: [
        'Instant 16-Character Activation Vouchers',
        'Dedicated Batch Performance Dashboard',
        'Individual Candidate Device Locking',
        'Official Tax Invoicing for Agencies'
      ],
      ctaText: 'Book DRA Agency Batch'
    },
    {
      title: 'JAIIB / CAIIB Bank Branch Pass',
      price: '₹799',
      unit: '/ candidate',
      minOrder: 'Minimum 10 Candidate Seats (₹7,990 total)',
      duration: '6 Months Validity',
      badge: 'Corporate / NBFC',
      features: [
        'Bulk Voucher Activation for Staff',
        'Full 4-Module Question Bank Access',
        'Real-time Staff Attempt Analytics',
        'Centralized Billing & Voucher Management'
      ],
      ctaText: 'Order Bank Study Batch'
    },
    {
      title: 'Specialized Track (AML/KYC & CCP)',
      price: '₹449',
      unit: '/ candidate',
      minOrder: 'Minimum 10 Candidate Seats (₹4,490 total)',
      duration: '6 Months Validity',
      badge: 'Compliance Desk',
      features: [
        'FIU-IND PMLA Reporting Standards',
        'Credit Processing & Ratio Appraisals',
        'Batch Activation Codes',
        'Corporate Verification Support'
      ],
      ctaText: 'Order Compliance Tier'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-400 font-black text-lg">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span>BankerViva</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#pricing" className="hover:text-blue-400 transition">Pricing & Bulk Plans</a>
            <a href="#security" className="hover:text-blue-400 transition">Anti-Sharing Tech</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/auth" 
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              Sign In
            </Link>
            <Link 
              href="/auth" 
              className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> India's First Audio-Assisted IIBF Viva & CBT Mock Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Master DRA, JAIIB & CAIIB Exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Confidence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
          Comprehensive statutory question banks, automated voice viva simulations, and single-license protection built for banking aspirants and recovery agencies.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/exam"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Launch Free Mock Test <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm rounded-xl transition"
          >
            View Pricing & Bulk Tiers
          </a>
        </div>
      </section>

      {/* Commercial Pricing Matrix Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Transparent Licensing</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, Affordable Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose an individual plan for personal preparation or book institutional vouchers for your agency batch.
          </p>

          {/* Pricing Toggle */}
          <div className="flex justify-center pt-6">
            <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPricingTab('individual')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
                  pricingTab === 'individual'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Individual Aspirants
              </button>
              <button
                onClick={() => setPricingTab('institutional')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
                  pricingTab === 'institutional'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Agencies / Institutional Bulk
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        {pricingTab === 'individual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {individualPlans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition relative group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {plan.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{plan.title}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium">/ full track</span>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-400 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {plan.credits}
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth"
                  className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow text-center block transition"
                >
                  {plan.ctaText}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {institutionalPlans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition relative group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {plan.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{plan.title}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-amber-400">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium">{plan.unit}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-300 mt-1">
                      {plan.minOrder}
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth"
                  className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow text-center block transition"
                >
                  {plan.ctaText}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security & Anti-Sharing Section */}
      <section id="security" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enterprise Protection</span>
          <h2 className="text-3xl font-black text-white">Built-in Commercial Safeguards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hardware Device Binding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every candidate license is automatically bound to a maximum of 2 personal devices (e.g., primary laptop and phone), preventing unauthorized credential dissemination.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Single Active Session Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time active token watchdogs invalidate and terminate duplicate concurrent logins within 10 seconds across disparate IP addresses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Institutional Voucher Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agencies receive tamper-proof 16-character license vouchers with automated seat tracking and aggregate performance analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 BankerViva. All rights reserved. Specialized IIBF Exam Readiness Platform.</p>
      </footer>
    </div>
  );
}
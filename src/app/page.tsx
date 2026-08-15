'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Volume2, Award, BookOpen, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="text-lg font-black tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" /> BankerViva
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-800"
          >
            <User className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link
            href="/exam"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow"
          >
            Launch Exam Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 py-16 text-center space-y-6">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
          India's Premier IIBF CBT Simulation & Viva Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Master Banking Certifications with <span className="text-blue-600">Audio-Powered CBT Simulations</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base text-slate-600 font-medium leading-relaxed">
          Prepare for DRA, JAIIB, CAIIB, AML/KYC, BC/BF, and CCP examinations with voice viva prompts, statutory RBI circular rationales, and strict exam hall restrictions.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/exam"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
          >
            Start Practice Exam <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#pricing"
            className="px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition"
          >
            View Pricing Plans
          </a>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900">Why Banking Aspirants Choose BankerViva</h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Engineered for working banking executives & professional candidates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Commute Audio Viva Mode</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Listen to hands-free text-to-speech audio prompts and option reads during your daily transit or preparation walks.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Strict CBT Simulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Experience real exam conditions with countdown timers, interactive question palettes, and review flagging mechanics.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Statutory RBI Rationales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every answer key cites the precise legal act section, RBI Master Direction circular, or accounting standard.
            </p>
          </div>
        </div>
      </section>

      {/* Exam Tracks Section */}
      <section className="bg-slate-900 text-white py-16 px-6 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black">Supported Certifications & Modules</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Comprehensive question banks across all difficulty tiers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { code: 'DRA', name: 'Debt Recovery Agent', desc: 'SARFAESI, DRT & Code of Conduct' },
              { code: 'JAIIB', name: 'Junior Associate (IIBF)', desc: 'PPB, AFM, IEFS & RBWM' },
              { code: 'CAIIB', name: 'Certified Associate (IIBF)', desc: 'ABM, BFM & BRBL Law' },
              { code: 'AML_KYC', name: 'AML & KYC Compliance', desc: 'PMLA 2002 & STR/CTR Reporting' },
              { code: 'BCBF', name: 'Business Correspondent', desc: 'Financial Inclusion & Microfinance' },
              { code: 'CCP', name: 'Certified Credit Professional', desc: 'CMA Analysis, DSCR & IRAC Norms' },
            ].map((track) => (
              <div key={track.code} className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                <span className="text-[10px] font-bold bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                  {track.code}
                </span>
                <h3 className="font-bold text-sm text-white">{track.name}</h3>
                <p className="text-[11px] text-slate-400">{track.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription & Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900">Simple, Transparent Access Plans</h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Unlock full mock examinations and audio viva libraries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Practice</span>
              <div className="text-3xl font-black text-slate-900 mt-2">Free</div>
              <p className="text-xs text-slate-600 mt-1">Essential preview questions for quick self-assessment.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Access sample database questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> CBT simulation interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Basic statutory explanations
                </li>
              </ul>
            </div>
            <Link
              href="/exam"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center transition"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="p-8 bg-blue-900 text-white rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Recommended
            </div>
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Pro Banker Pass</span>
              <div className="text-3xl font-black text-white mt-2">
                ₹999 <span className="text-sm font-normal text-blue-200">/ exam track</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">Complete mastery package for guaranteed qualifying scores.</p>
              <ul className="mt-6 space-y-3 text-xs text-blue-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Full Verified Question Bank
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Unlimited Audio Viva Mode & Read Aloud
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Easy / Moderate / Hard difficulty filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Performance analytics & weak area report
                </li>
              </ul>
            </div>
            <Link
              href="/exam"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl text-center transition shadow-md"
            >
              Get Pro Access Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer & Contact */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-bold text-white text-sm">BankerViva • IIBF CBT Simulation Engine</p>
            <p className="mt-1">Empowering banking professionals across India with regulatory compliance excellence.</p>
          </div>
          <div className="flex gap-6">
            <a href="mailto:support@bankerviva.vercel.app" className="hover:text-white transition">Support Email</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/exam" className="hover:text-white transition">Exam Arena</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          © 2026 BankerViva. All rights reserved. Designed for IIBF & Banking Certificate Aspirants.
        </div>
      </footer>
    </div>
  );
}
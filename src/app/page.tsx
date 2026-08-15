'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Award, Volume2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const EXAM_TRACKS = [
  {
    id: 'jaiib',
    title: 'JAIIB Certification',
    subtitle: 'Junior Associate of IIBF',
    papers: [
      'Principles & Practices of Banking',
      'Accounting & Financial Management',
      'Indian Economy & Financial System',
      'Retail Banking & Wealth Management'
    ],
    badge: 'High Promotion Value',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'caiib',
    title: 'CAIIB Certification',
    subtitle: 'Certified Associate of IIBF',
    papers: [
      'Advanced Bank Management',
      'Bank Financial Management',
      'Advanced Business & Financial Management',
      'Banking Regulations & Business Laws'
    ],
    badge: 'Scale-II / Scale-III Prep',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'dra',
    title: 'DRA Certification',
    subtitle: 'Debt Recovery Agent (100-Hr Mandatory)',
    papers: [
      'RBI Fair Practices Code',
      'Legal & Regulatory Framework',
      'SARFAESI & DRT Provisions',
      'Recovery Ethics & Communication'
    ],
    badge: 'Mandatory License',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Navigation */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-700" />
            <span className="text-xl font-black tracking-tight text-slate-900">
              Banker<span className="text-blue-600">Viva</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/exam"
              className="text-xs font-bold uppercase tracking-wider bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Launch CBT Mock
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" /> Oral Viva & IIBF CBT Hall Simulation Engine
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Master Your Banking Certifications with <span className="text-blue-600">Voice-Assisted</span> Practice
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          3,000+ Easy, Moderate, and Hard memory-recalled questions with statutory explanations, timed exam hall drills, and hands-free audio viva.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/exam"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-md"
          >
            Start 120-Min Exam Mock <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Exam Track Cards */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Select Your Examination Track</h2>
          <p className="text-sm text-slate-500 mt-1">Structured modules aligned with the latest IIBF syllabus frameworks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXAM_TRACKS.map((track) => (
            <div key={track.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${track.badgeColor}`}>
                  {track.badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4">{track.title}</h3>
                <p className="text-xs text-slate-500 mb-6">{track.subtitle}</p>

                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  {track.papers.map((paper, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{paper}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/exam"
                  className="w-full block text-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold py-2.5 rounded-xl transition"
                >
                  Enter Practice Hub
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3-Tier Progressive Difficulty</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1,000 Easy definitions, 1,000 Moderate procedural calculations, and 1,000 Hard scenario case studies.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Commute Audio Mode</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hands-free viva questioning that reads questions and statutory rationales aloud during your daily commute.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Statutory Rationale</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every correct answer is backed by exact references to RBI Master Directions, SARFAESI 2002, and NI Act 1881.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 BankerViva. Designed for IIBF, JAIIB, CAIIB & DRA Certification Aspirants.</p>
      </footer>
    </div>
  );
}
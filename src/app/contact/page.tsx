'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Clock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    inquiryType: 'Individual Candidate Support',
    examTrack: 'JAIIB (4 Compulsory Papers)',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to send inquiry');
      }

      setSubmitted(true);
    } catch {
      setError('Unable to send your message right now. Please reach out directly to care@bankerviva.com or call our priority helpline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Soft Sky Blue Mesh Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-b from-sky-100/90 via-blue-50/60 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-slate-200/90 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            Banker<span className="text-blue-600">Viva</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Candidate & Institutional Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            We are here to support your <span className="text-blue-600">Banking Certification</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            Have questions regarding CBT test paper access, bulk agency vouchers, billing, or device unlocking? Our academic support desk is available to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Info Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Direct Support Channels
              </h2>

              <div className="space-y-4 text-xs">
                {/* Candidate Support */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Candidate Support Desk</div>
                    <a href="mailto:care@bankerviva.com" className="text-blue-600 hover:text-blue-700 hover:underline block font-semibold text-sm">
                      care@bankerviva.com
                    </a>
                    <div className="text-[11px] text-slate-500 mt-0.5">Response within 2–4 business hours</div>
                  </div>
                </div>

                {/* Institutional Inquiries */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">General & Institutional Desk</div>
                    <a href="mailto:info@bankerviva.com" className="text-indigo-600 hover:text-indigo-700 hover:underline block font-semibold text-sm">
                      info@bankerviva.com
                    </a>
                    <div className="text-[11px] text-slate-500 mt-0.5">For general queries, partnerships & batch enrollments</div>
                  </div>
                </div>

                {/* Priority Phone Support */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Priority Support Helpline</div>
                    <a href="tel:+919831064090" className="text-violet-600 hover:text-violet-700 hover:underline block font-semibold text-sm">
                      +91 98310 64090
                    </a>
                    <div className="text-[11px] text-slate-500 mt-0.5">For urgent queries, escalations & batch admissions</div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Operating Hours</div>
                    <div className="text-slate-700 font-semibold mt-0.5">Monday – Friday: 10:00 AM – 7:00 PM IST</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-0.5">24x7 Automated Vani AI Assistant on platform</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Safeguard Callout */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Device & Reset Support
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                If you have replaced your primary study device or require a session token flush, please include your registered login email for quick re-binding.
              </p>
            </div>
          </div>

          {/* Interactive Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Inquiry Received Successfully</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. A support ticket has been generated for <strong>{formData.email}</strong>. Our academic team will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      inquiryType: 'Individual Candidate Support',
                      examTrack: 'JAIIB (4 Compulsory Papers)',
                      message: ''
                    });
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  Send Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Send an Inquiry</h2>
                <p className="text-xs text-slate-500 mb-3">Fill out the details below and we will route your ticket immediately.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@bank.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition font-medium"
                    >
                      <option>Individual Candidate Support</option>
                      <option>Institutional / Bulk Voucher Purchase</option>
                      <option>Billing & Payment Query</option>
                      <option>Device Re-binding Request</option>
                      <option>Syllabus & Content Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                      Exam Track / Course
                    </label>
                    <select
                      value={formData.examTrack}
                      onChange={(e) => setFormData({ ...formData, examTrack: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition font-medium"
                    >
                      <option>JAIIB (4 Compulsory Papers)</option>
                      <option>CAIIB (4 Core Papers)</option>
                      <option>DRA (Debt Recovery Agent)</option>
                      <option>BC / BF (Business Correspondent)</option>
                      <option>CCP (Certified Credit Professional)</option>
                      <option>AML / KYC Compliance</option>
                      <option>All-Access Master Pass</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Your Message / Requirement *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your query or institutional batch size..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 resize-none transition"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© 2026 BankerViva. All rights reserved. Specialized IIBF Exam Readiness Platform with 18,000+ Bilingual Questions.</p>
      </footer>
    </div>
  );
}
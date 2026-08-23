'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
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
  LockKeyhole, 
  Globe2, 
  FileText,
  Database,
  CreditCard,
  Mail,
  Loader2,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { logPageView } from '@/lib/tracker';

export default function LandingPage() {
  const [pricingTab, setPricingTab] = useState<'individual' | 'institutional'>('individual');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Dynamic Seat State for Institutional Bulk Tiers
  const [institutionalSeats, setInstitutionalSeats] = useState<{ [key: string]: number }>({
    BCBF: 25,
    DRA: 25,
    AML_KYC: 10,
    JAIIB_IEIFS: 10,
  });

  useEffect(() => {
    logPageView('/');
    
    // Check initial user authentication state
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const handleSeatChange = (track: string, val: number, min: number) => {
    const safeVal = Math.max(min, isNaN(val) ? min : val);
    setInstitutionalSeats((prev) => ({ ...prev, [track]: safeVal }));
  };

  const individualPlans = [
    {
      title: 'BC / BF (Business Correspondent)',
      examTrack: 'BCBF',
      price: '₹399',
      duration: '6 Months',
      credits: '20 Full CBT Sets (2,000 Qs)',
      badge: 'Financial Inclusion',
      features: [
        '2,000 Distinct Multi-Module Questions',
        'Bilingual: English + Hindi Test Engine',
        'PMJDY, PMJJBY, PMSBY & APY Framework',
        'AePS, Micro-ATM & Biometric Protocols',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch BC/BF'
    },
    {
      title: 'DRA (Debt Recovery Agent)',
      examTrack: 'DRA',
      price: '₹499',
      duration: '6 Months',
      credits: '30 Full CBT Sets (3,000 Qs)',
      badge: 'High Demand',
      features: [
        '3,000 Distinct Tri-Tier Recovery Questions',
        'Bilingual: English + Hindi Test Engine',
        'SARFAESI 2002, DRT & RBI Fair Practices',
        'Audio-Assisted Viva Voce Drills',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch DRA'
    },
    {
      title: 'AML / KYC Compliance',
      examTrack: 'AML_KYC',
      price: '₹499',
      duration: '6 Months',
      credits: '20 Full CBT Sets (2,000 Qs)',
      badge: 'Statutory Specialist',
      features: [
        '2,000 Distinct Compliance Questions',
        'Bilingual: English + Hindi Test Engine',
        'PMLA 2002 & FIU-IND Reporting Rules',
        'Beneficial Ownership & Sanctions Screening',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch AML/KYC'
    },
    {
      title: 'JAIIB Comprehensive',
      examTrack: 'JAIIB_IEIFS',
      price: '₹1,499',
      duration: '6 Months',
      credits: '40 Full CBT Sets (4,000 Qs)',
      badge: 'Most Popular',
      featured: true,
      features: [
        '4,000 Distinct Questions across 4 Papers',
        'Bilingual: English + Hindi Mode',
        'IEFS, PPB, AFM & RBWM Compulsory Papers',
        '75% Moderate / 25% Hard Syllabus Calibration',
        'Step-by-step Numerical Solutions',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch JAIIB'
    },
    {
      title: 'CAIIB Advanced',
      examTrack: 'CAIIB_ABM',
      price: '₹1,499',
      duration: '6 Months',
      credits: '40 Full CBT Sets (4,000 Qs)',
      badge: 'Officer Scale',
      featured: true,
      features: [
        '4,000 Distinct Questions across 4 Papers',
        'Bilingual: English + Hindi Mode',
        'ABM, BFM, ABFM & BRBL Core Papers',
        'Forex, Treasury, Basel III & Risk Case Models',
        'Complex Multi-Tier Arithmetic Appraisal',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch CAIIB'
    },
    {
      title: 'Certified Credit Professional (CCP)',
      examTrack: 'CCP',
      price: '₹1,499',
      duration: '6 Months',
      credits: '30 Full CBT Sets (3,000 Qs)',
      badge: 'Credit Appraisal',
      features: [
        '3,000 High-Yield Credit Appraisal Qs',
        'Bilingual: English + Hindi Mode',
        'Tandon / Nayak MPBF Working Capital Models',
        'DSCR, TOL/TNW Deficit & Balance Sheet Analysis',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Enroll & Launch CCP'
    },
    {
      title: 'All-Access Master Pass',
      examTrack: 'ALL_ACCESS',
      price: '₹2,999',
      duration: '12 Months',
      credits: 'All 18,000+ Questions',
      badge: 'Ultimate Value',
      highlightBorder: true,
      features: [
        'Unlocks All 180 Full CBT Mock Sets (12 Tracks)',
        'Full Access to JAIIB, CAIIB, DRA, CCP, BCBF, AML',
        '100% Zero Question Repetition Guarantee',
        'Full AI Speech Viva Voce Engine',
        'Diagnostic PDF Analytical Scorecards',
        '2 Personal Devices Bound'
      ],
      ctaText: 'Get All-Access Master Pass'
    }
  ];

  const institutionalPlans = [
    {
      title: 'BC / BF Rural CSC Bulk Pass',
      examTrack: 'BCBF',
      unitPrice: 249,
      minSeats: 25,
      duration: '6 Months',
      badge: 'Financial Inclusion',
      features: [
        'Instant 16-Character Activation Vouchers',
        'Full 2,000 Bilingual Question Bank (20 CBTs)',
        'AePS, PMJDY & Social Security Test Series',
        'Individual Candidate Device Locking',
        'Official Invoicing for Corporate BCs'
      ],
    },
    {
      title: 'DRA Agency Bulk Tier',
      examTrack: 'DRA',
      unitPrice: 299,
      minSeats: 25,
      duration: '6 Months',
      badge: 'Agency Special',
      features: [
        'Instant 16-Character Activation Vouchers',
        'Full 3,000 Bilingual Recovery Qs (30 CBTs)',
        'Dedicated Batch Performance Tracking',
        'Individual Candidate Device Locking',
        'Official Invoicing for Agencies'
      ],
    },
    {
      title: 'Specialized (AML/KYC & CCP)',
      examTrack: 'AML_KYC',
      unitPrice: 449,
      minSeats: 10,
      duration: '6 Months',
      badge: 'Compliance Desk',
      features: [
        'Full 5,000 Question Bank Access (50 CBTs)',
        'FIU-IND PMLA Reporting & Credit Models',
        'Batch Activation Codes for Officers',
        'Corporate Verification Support'
      ],
    },
    {
      title: 'JAIIB / CAIIB Bank & Academy Batch',
      examTrack: 'JAIIB_IEIFS',
      unitPrice: 1199,
      minSeats: 10,
      duration: '6 Months',
      badge: 'Bank / NBFC Tier',
      highlightBorder: true,
      features: [
        'Bulk Voucher Activation for Staff & Students',
        'Full 8,000 Question Bank Access (80 Full CBTs)',
        'Real-time Staff Attempt & Competency Analytics',
        'Centralized Voucher Management'
      ],
    }
  ];

  // Handler for Individual Aspirant Purchases with Strict Authentication Interception
  const handleIndividualPayment = async (plan: any) => {
    try {
      setProcessingPlan(plan.examTrack);

      // 1. Check for Active User Session
      const { data: { user: activeUser } } = await supabase.auth.getUser();

      if (!activeUser) {
        // Enforce account registration/sign-in before payment
        alert('Please create an account or sign in first to bind your test credits and device license.');
        window.location.href = '/auth';
        return;
      }

      const numericPrice = Number(plan.price.replace(/[^\d]/g, ''));

      // 2. Initiate Razorpay Order with Authenticated User Context
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.examTrack,
          amount: numericPrice,
          isInstitutional: false,
          seats: 1,
          customerEmail: activeUser.email,
          customerName: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Aspirant',
          userId: activeUser.id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate order.');
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'BankerViva',
        description: `${plan.title} (${plan.duration})`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              planId: plan.examTrack,
              isInstitutional: false,
              seatCount: 1,
              customerEmail: activeUser.email,
              customerName: activeUser.user_metadata?.full_name || 'Aspirant',
              userId: activeUser.id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            const destinationTrack = plan.examTrack === 'ALL_ACCESS' ? 'JAIIB_IEIFS' : plan.examTrack;
            window.location.href = `/cbt/briefing?paper=${destinationTrack}&set=1`;
          } else {
            alert('Verification unsuccessful: ' + (verifyData.message || 'Error occurred'));
          }
        },
        prefill: {
          name: activeUser.user_metadata?.full_name || '',
          email: activeUser.email,
          contact: activeUser.user_metadata?.phone || '',
        },
        theme: { color: '#2563eb' },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
    } finally {
      setProcessingPlan(null);
    }
  };

  // Handler for Institutional Dynamic Bulk Purchases
  const handleInstitutionalPayment = async (plan: any) => {
    const seats = institutionalSeats[plan.examTrack] || plan.minSeats;
    const totalAmount = seats * plan.unitPrice;

    try {
      setProcessingPlan(plan.examTrack);

      const { data: { user: activeUser } } = await supabase.auth.getUser();
      const billingEmail = activeUser?.email || prompt('Enter Official Coordinator Email for Voucher Delivery:') || 'agency@bankerviva.com';
      const billingName = activeUser?.user_metadata?.full_name || 'Institutional Coordinator';

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.examTrack,
          amount: totalAmount,
          isInstitutional: true,
          seats: seats,
          customerEmail: billingEmail,
          customerName: billingName,
          userId: activeUser?.id || null,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to initiate order.');

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'BankerViva',
        description: `${plan.title} — Batch of ${seats} Candidate Passes`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              planId: plan.examTrack,
              isInstitutional: true,
              seatCount: seats,
              customerEmail: billingEmail,
              customerName: billingName,
              userId: activeUser?.id || null,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Payment Approved! Successfully generated ${verifyData.vouchers?.length || seats} activation vouchers. Check your confirmation email.`);
          } else {
            alert('Verification unsuccessful: ' + (verifyData.message || 'Error occurred'));
          }
        },
        prefill: {
          name: billingName,
          email: billingEmail,
          contact: activeUser?.user_metadata?.phone || '',
        },
        theme: { color: '#2563eb' },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Soft Sky Blue Gradient Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-sky-100/90 via-blue-50/60 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Top Banner */}
      <div className="bg-blue-50/90 border-b border-blue-100 py-2 px-4 text-center text-xs font-semibold text-blue-900 backdrop-blur-md">
        <span className="inline-flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Now Live: All 180 CBT Papers available in full <strong>Bilingual Mode (English + Hindi)</strong></span>
        </span>
      </div>

      {/* Header */}
      <header className="px-3 sm:px-6 py-2.5 border-b border-slate-200/90 flex justify-between items-center bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
            Banker<span className="text-blue-600">Viva</span>
          </span>
        </div>

        {/* Central Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap">
          <a 
            href="#why-bankerviva" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Why BankerViva?</span>
          </a>

          <a 
            href="#metrics" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Database className="w-3 h-3 text-indigo-600" />
            <span>Practice Hub</span>
          </a>

          <a 
            href="#pricing" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <CreditCard className="w-3 h-3 text-amber-600" />
            <span>Pricing & Plans</span>
          </a>

          <a 
            href="#security" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <LockKeyhole className="w-3 h-3 text-emerald-600" />
            <span>Security</span>
          </a>

          <Link 
            href="/manual" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3 h-3 text-blue-600" />
            <span>User Guide</span>
          </Link>

          <Link 
            href="/contact" 
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-900 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Mail className="w-3 h-3 text-blue-600" />
            <span>Contact Us</span>
          </Link>
        </nav>

        {/* Action Keys */}
        <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap text-xs">
          <Link 
            href="/admin/analytics" 
            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Master Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin</span>
          </Link>

          {user ? (
            <button 
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              <Link 
                href="/auth" 
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 hover:text-black hover:bg-slate-200 font-bold transition shadow-2xs"
              >
                Sign In
              </Link>

              <Link 
                href="/auth" 
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-500/20 transition"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-extrabold shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>India&apos;s Premier Banking Exam Practice Platform • 18,000+ Unique Questions</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900">
          Master JAIIB, CAIIB, DRA & Banking Exams with <span className="text-blue-600">Zero Question Repetition</span>
        </h1>

        <p className="max-w-3xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
          Access <strong className="text-slate-900 font-bold">18,000+ authenticated statutory questions in bilingual mode (English + Hindi)</strong> across 180 full-length CBT mock sets. Built with strict 75% Moderate / 25% Hard pattern calibration, AI Speech Viva, and module competency heatmaps.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/cbt/briefing?paper=JAIIB_IEIFS&set=1"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            Launch Free Demo Test <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            View Pricing & Plans
          </a>
        </div>
      </section>

      {/* 18,000-Question Metric Strip */}
      <section id="metrics" className="max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center shadow-sm hover:border-blue-400 transition">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">18,000+</div>
            <div className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">Practice Questions</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">100% Zero Duplication</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center shadow-sm hover:border-indigo-400 transition">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">180</div>
            <div className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">Full CBT Sets</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">100 Qs / 120 Mins Timer</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center shadow-sm hover:border-emerald-400 transition">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">12</div>
            <div className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">Exam Tracks</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">JAIIB, CAIIB, CCP, BCBF, AML</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center shadow-sm hover:border-amber-400 transition">
            <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">75 : 25</div>
            <div className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">Standard Ratio</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Moderate vs Hard Breakdown</div>
          </div>
        </div>
      </section>

      {/* Why BankerViva? */}
      <section id="why-bankerviva" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why BankerViva?</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Engineered for Guaranteed Certification</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Audio-Assisted Viva Simulations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Experience dynamic speech oral examination drills designed to build rapid recall and mental reflexes under strict time pressure.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Statutory Explanations & Rationales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every question includes precise references to RBI Master Directions, SARFAESI 2002, PMLA 2002, DRT limits, and current syllabus guidelines.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:border-amber-300 hover:shadow-md transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Protected Single-User Licensing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bound to 2 personal devices with real-time active session validation, giving students and agencies secure, private scorecard progress.
            </p>
          </div>
        </div>
      </section>

      {/* Commercial Pricing Matrix with Direct Razorpay Integration */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16 space-y-10 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transparent Licensing</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Choose Your Certification Track</h2>
          <p className="text-xs text-slate-600 max-w-xl mx-auto">
            Select an individual preparation pass or book institutional vouchers for your agency or bank branch batch.
          </p>

          <div className="flex justify-center pt-4">
            <div className="inline-flex bg-slate-100 border border-slate-200 p-1.5 rounded-2xl shadow-xs">
              <button
                onClick={() => setPricingTab('individual')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pricingTab === 'individual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Individual Aspirants
              </button>
              <button
                onClick={() => setPricingTab('institutional')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pricingTab === 'institutional'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Training Institutes & Banks
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
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all bg-white ${
                  plan.highlightBorder
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10'
                    : 'border border-slate-200 hover:border-slate-300 shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {plan.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> {plan.duration}
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

                <button
                  type="button"
                  onClick={() => handleIndividualPayment(plan)}
                  disabled={processingPlan === plan.examTrack}
                  className={`mt-6 w-full py-2.5 font-bold text-xs rounded-xl shadow-sm text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                    plan.highlightBorder
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  {processingPlan === plan.examTrack ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Initiating...
                    </>
                  ) : (
                    plan.ctaText
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pt-2">
            {institutionalPlans.map((plan, idx) => {
              const currentSeats = institutionalSeats[plan.examTrack] || plan.minSeats;
              const totalCost = currentSeats * plan.unitPrice;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all bg-white ${
                    plan.highlightBorder
                      ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-500/10'
                      : 'border border-slate-200 hover:border-slate-300 shadow-sm hover:-translate-y-1'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {plan.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> {plan.duration}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{plan.title}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-indigo-600">₹{plan.unitPrice}</span>
                        <span className="text-xs text-slate-500 font-medium">/ candidate</span>
                      </div>
                    </div>

                    {/* Interactive Custom Seat Picker */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>Candidate Seats:</span>
                        <span className="text-[10px] text-slate-400">Min {plan.minSeats}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSeatChange(plan.examTrack, currentSeats - 1, plan.minSeats)}
                          className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min={plan.minSeats}
                          value={currentSeats}
                          onChange={(e) => handleSeatChange(plan.examTrack, parseInt(e.target.value) || plan.minSeats, plan.minSeats)}
                          className="w-full text-center bg-white border border-slate-300 rounded-lg py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />

                        <button
                          type="button"
                          onClick={() => handleSeatChange(plan.examTrack, currentSeats + 1, plan.minSeats)}
                          className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs font-bold">
                        <span className="text-slate-500 text-[11px]">Total Batch Cost:</span>
                        <span className="text-slate-900 font-black">₹{totalCost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInstitutionalPayment(plan)}
                    disabled={processingPlan === plan.examTrack}
                    className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm text-center transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processingPlan === plan.examTrack ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Initiating...
                      </>
                    ) : (
                      `Book Batch (${currentSeats} Seats • ₹${totalCost.toLocaleString('en-IN')})`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Security Safeguards */}
      <section id="security" className="max-w-6xl mx-auto px-6 py-16 space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Protection</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Built-in Commercial Safeguards</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Hardware Device Binding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every candidate license is automatically bound to a maximum of 2 personal devices (e.g., primary laptop and phone), preventing unauthorized credential sharing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Single Active Session Lock</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time active token watchdogs invalidate and terminate duplicate concurrent logins within 10 seconds across disparate IP addresses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Voucher Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agencies receive tamper-proof 16-character license vouchers with automated seat tracking and aggregate performance analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer with Statutory Legal Disclaimer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-3">
        <div className="flex justify-center items-center gap-6 text-slate-600 font-semibold">
          <Link href="/manual" className="hover:text-blue-600 transition">User Guide</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-blue-600 transition flex items-center gap-1">
            <Mail className="w-3 h-3 text-blue-600" /> Contact Support
          </Link>
          <span>•</span>
          <a href="#pricing" className="hover:text-blue-600 transition">Institutional Batches</a>
        </div>
        
        <p className="font-semibold text-slate-700">
          © 2026 BankerViva. All rights reserved. Specialized Banking Certification Practice &amp; CBT Simulation Platform.
        </p>

        {/* Statutory Non-Affiliation Disclaimer */}
        <p className="max-w-4xl mx-auto text-[10px] text-slate-400 leading-relaxed px-4">
          Disclaimer: BankerViva is an independent educational technology and mock test practice platform. &quot;JAIIB&quot;, &quot;CAIIB&quot;, &quot;DRA&quot;, &quot;BCBF&quot;, and &quot;IIBF&quot; are registered marks and acronyms belonging to their respective statutory authorities (including the Indian Institute of Banking &amp; Finance). BankerViva is not affiliated with, endorsed by, or associated with IIBF. All practice questions, simulated CBT environments, and diagnostic evaluations are independently developed educational resources aligned with publicly published examination frameworks.
        </p>
      </footer>
    </div>
  );
}
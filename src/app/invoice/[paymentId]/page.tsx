'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Printer, ArrowLeft, Download, ShieldCheck, 
  CheckCircle2, Building, Mail, Calendar, FileText 
} from 'lucide-react';

export default function InvoiceReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.paymentId as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchInvoiceData() {
      if (!paymentId) return;
      
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('payment_reference_id', paymentId)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchInvoiceData();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
        Generating Official Tax Invoice...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-sm font-bold text-slate-800">Invoice receipt not found for payment ID: {paymentId}</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Platform
        </button>
      </div>
    );
  }

  const invoiceNo = `BV-INV-${profile.payment_reference_id?.replace('pay_', '').toUpperCase().slice(0, 8)}`;
  const invoiceDate = profile.subscription_start_date 
    ? new Date(profile.subscription_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');
  const validUntil = profile.subscription_end_date
    ? new Date(profile.subscription_end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';
  const amount = profile.paid_amount || 399;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 font-sans text-slate-800 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3.5 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Receipt
        </button>
      </div>

      {/* Invoice Card Container */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Header Strip */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                B
              </div>
              <span className="text-xl font-black text-slate-900">
                Banker<span className="text-blue-600">Viva</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Specialized Banking Certification CBT Platform</p>
            <p className="text-[11px] text-slate-400">www.bankerviva.com • contact@bankerviva.com</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Payment Successful
            </span>
            <div className="mt-3 text-xs space-y-0.5">
              <div className="font-bold text-slate-900">Invoice No: <span className="font-mono">{invoiceNo}</span></div>
              <div className="text-slate-500">Date: {invoiceDate}</div>
            </div>
          </div>
        </div>

        {/* Billed To & Payment Metadata */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To (Candidate / Client)</div>
            <div className="font-bold text-slate-900 text-sm">{profile.full_name || 'Registered Candidate'}</div>
            <div className="text-slate-600">{profile.email}</div>
            <div className="text-slate-500">Registered Access: Max 2 Bound Personal Devices</div>
          </div>

          <div className="space-y-1 text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Details</div>
            <div className="font-medium text-slate-700">Payment Gateway: <strong>Razorpay (UPI / NetBanking)</strong></div>
            <div className="font-mono text-[11px] text-slate-500">Ref ID: {profile.payment_reference_id}</div>
            <div className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized & Captured
            </div>
          </div>
        </div>

        {/* Itemized Service Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Description of Service</th>
                <th className="p-3.5 text-center">Validity Period</th>
                <th className="p-3.5 text-center">Access Tier</th>
                <th className="p-3.5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3.5">
                  <div className="font-bold text-slate-900">
                    {profile.enrolled_package || 'Banking Certification Test Series'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Full Computer-Based Test (CBT) Mock Simulation Suite • Bilingual (English + Hindi)
                  </div>
                </td>
                <td className="p-3.5 text-center font-medium">Until {validUntil}</td>
                <td className="p-3.5 text-center font-bold text-blue-600 uppercase text-[10px]">
                  {profile.plan_type || 'PRO'}
                </td>
                <td className="p-3.5 text-right font-black text-slate-900">₹{amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing Summary Breakdown */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform & Service Taxes:</span>
              <span className="font-semibold text-slate-900">₹0.00</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-blue-600">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Statutory Legal & Non-Affiliation Footnote */}
        <div className="border-t border-slate-200 pt-6 space-y-2 text-[10px] text-slate-400 leading-relaxed">
          <p>
            <strong>Statutory Terms:</strong> This is a computer-generated commercial payment acknowledgement receipt (Exempt from GST under Section 22 of the CGST Act, 2017). All digital access keys and test simulator sets are governed by BankerViva licensing terms.
          </p>
          <p>
            © 2026 BankerViva. All rights reserved. Registered examination marks belong to their respective statutory bodies.
          </p>
        </div>
      </div>
    </div>
  );
}
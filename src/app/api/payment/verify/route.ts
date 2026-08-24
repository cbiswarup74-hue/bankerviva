import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';
import { createBatchVouchers } from '@/lib/voucherEngine';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plan Price Map for Accurate DB Telemetry Logging
const PLAN_PRICE_MAP: Record<string, number> = {
  BCBF: 399,
  DRA: 499,
  AML_KYC: 499,
  JAIIB_IEIFS: 1499,
  JAIIB: 1499,
  CAIIB_ABM: 1499,
  CAIIB: 1499,
  CCP: 1499,
  ALL_ACCESS: 2999,
};

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planId, 
      isInstitutional, 
      seatCount, 
      customerEmail,
      customerName,
      userId 
    } = await req.json();

    // 1. Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    let generatedVouchers: any[] = [];

    // Reusable Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_MAIL_USER,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
    });

    // 2. If Institutional, generate batch vouchers and dispatch email
    if (isInstitutional && seatCount > 0) {
      generatedVouchers = await createBatchVouchers(planId, Number(seatCount), customerEmail || 'agency@bank.com');

      try {
        const voucherListHtml = generatedVouchers
          .map((v, i) => `<tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">#${i + 1}</td><td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace;font-weight:bold;color:#2563eb;letter-spacing:1px;">${v.code}</td></tr>`)
          .join('');

        await transporter.sendMail({
          from: `"BankerViva Institutional Desk" <${process.env.ZOHO_MAIL_USER}>`,
          to: customerEmail,
          subject: `[Vouchers Ready] Your ${seatCount} Institutional Access Passes - BankerViva`,
          html: `
            <div style="font-family:system-ui, -apple-system, sans-serif; line-height:1.6; color:#1e293b; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:12px;">
              <h2 style="color:#2563eb; margin-top:0;">Bulk Enrollment Confirmation</h2>
              <p>Dear <strong>${customerName || 'Institutional Partner'}</strong>,</p>
              <p>Your order for <strong>${seatCount} candidate access passes</strong> for <strong>${planId}</strong> has been authorized and captured successfully.</p>
              
              <h3 style="margin-bottom:8px;">Your 16-Character Activation Keys:</h3>
              <table style="width:100%; border-collapse:collapse; margin:15px 0;">
                <thead>
                  <tr style="background:#f8fafc; text-align:left;">
                    <th style="padding:8px; border:1px solid #e2e8f0; text-align:center;">No.</th>
                    <th style="padding:8px; border:1px solid #e2e8f0;">Activation Voucher Code</th>
                  </tr>
                </thead>
                <tbody>${voucherListHtml}</tbody>
              </table>

              <p><strong>Candidate Activation Steps:</strong></p>
              <ol style="padding-left:20px;">
                <li>Distribute 1 unique key per candidate.</li>
                <li>Candidate registers at <a href="https://www.bankerviva.com/auth" style="color:#2563eb;">https://www.bankerviva.com/auth</a>.</li>
                <li>Redeem code under the <em>"Redeem Voucher"</em> section on their dashboard.</li>
              </ol>

              <div style="margin-top:25px; padding-top:15px; border-top:1px solid #e2e8f0;">
                <p style="margin:0 0 10px 0;">Need an official tax receipt?</p>
                <a href="https://www.bankerviva.com/invoice/${razorpay_payment_id}" style="display:inline-block; padding:10px 18px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:13px;">View / Download Official Invoice</a>
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Email dispatch error for vouchers:', mailErr);
      }
    } else {
      // 3. If Individual User Purchase: Resolve User ID
      let targetUserId = userId;
      let targetEmail = customerEmail;
      let targetName = customerName || 'Aspirant';

      if (!targetUserId && customerEmail) {
        const { data: userProfile }: any = await (supabase as any)
          .from('user_profiles')
          .select('id, full_name, email')
          .eq('email', customerEmail)
          .single();

        if (userProfile) {
          targetUserId = userProfile.id;
          targetName = userProfile.full_name || targetName;
          targetEmail = userProfile.email || targetEmail;
        }
      }

      if (targetUserId) {
        // Dynamic duration: 12 Months for ALL_ACCESS, 6 Months (180 days) for individual tracks
        const isMasterPass = planId === 'ALL_ACCESS';
        const validityDays = isMasterPass ? 365 : 180;
        
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(now.getDate() + validityDays);

        const paidAmount = PLAN_PRICE_MAP[planId] || 399;

        // Update 'subscriptions' table
        await (supabase as any)
          .from('subscriptions')
          .upsert({
            user_id: targetUserId,
            plan_type: planId || 'pro',
            status: 'active',
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            expires_at: expiryDate.toISOString(),
            updated_at: now.toISOString()
          }, { onConflict: 'user_id' });

        // Update 'user_profiles' table for complete telemetry tracking
        await (supabase as any)
          .from('user_profiles')
          .update({
            is_subscriber: true,
            plan_type: 'pro',
            enrolled_package: planId || 'BCBF',
            payment_reference_id: razorpay_payment_id,
            paid_amount: paidAmount,
            subscription_start_date: now.toISOString(),
            subscription_end_date: expiryDate.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', targetUserId);

        // Send payment confirmation & invoice receipt email to candidate
        if (targetEmail) {
          try {
            await transporter.sendMail({
              from: `"BankerViva Desk" <${process.env.ZOHO_MAIL_USER}>`,
              to: targetEmail,
              subject: `[Receipt & Access Unlocked] Enrollment Confirmed - BankerViva`,
              html: `
                <div style="font-family:system-ui, -apple-system, sans-serif; line-height:1.6; color:#1e293b; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:12px;">
                  <h2 style="color:#2563eb; margin-top:0;">Payment Receipt & Access Unlocked</h2>
                  <p>Dear <strong>${targetName}</strong>,</p>
                  <p>Your subscription for <strong>${planId}</strong> has been activated successfully!</p>
                  
                  <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin:15px 0;">
                    <div style="font-size:13px; margin-bottom:4px;"><strong>Payment Ref ID:</strong> <span style="font-family:monospace; color:#2563eb;">${razorpay_payment_id}</span></div>
                    <div style="font-size:13px; margin-bottom:4px;"><strong>Amount Paid:</strong> ₹${paidAmount}</div>
                    <div style="font-size:13px; margin-bottom:4px;"><strong>Validity Period:</strong> ${validityDays === 365 ? '12 Months' : '6 Months'} (Valid till ${expiryDate.toLocaleDateString('en-IN')})</div>
                    <div style="font-size:13px;"><strong>Device Licensing:</strong> Bound to max 2 registered personal devices.</div>
                  </div>

                  <p>You can launch your full Computer-Based Tests (CBT) anytime by visiting your <a href="https://www.bankerviva.com/cbt/briefing?paper=${planId}&set=1" style="color:#2563eb; font-weight:bold;">Exam Dashboard</a>.</p>

                  <div style="margin-top:25px; padding-top:15px; border-top:1px solid #e2e8f0;">
                    <p style="margin:0 0 10px 0; font-size:13px; color:#64748b;">View or print your official tax invoice receipt:</p>
                    <a href="https://www.bankerviva.com/invoice/${razorpay_payment_id}" style="display:inline-block; padding:10px 18px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:13px;">Download BankerViva Invoice Receipt</a>
                  </div>
                </div>
              `
            });
          } catch (mailErr) {
            console.error('Email dispatch error for individual receipt:', mailErr);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      vouchers: generatedVouchers.map(v => v.code) 
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
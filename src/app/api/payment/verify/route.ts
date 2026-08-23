import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';
import { createBatchVouchers } from '@/lib/voucherEngine';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // 2. If Institutional, generate batch vouchers and dispatch email
    if (isInstitutional && seatCount > 0) {
      generatedVouchers = await createBatchVouchers(planId, Number(seatCount), customerEmail || 'agency@bank.com');

      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.zoho.in',
          port: 465,
          secure: true,
          auth: {
            user: process.env.ZOHO_MAIL_USER,
            pass: process.env.ZOHO_APP_PASSWORD,
          },
        });

        const voucherListHtml = generatedVouchers
          .map((v, i) => `<tr><td style="padding:6px;border:1px solid #e2e8f0;">#${i + 1}</td><td style="padding:6px;border:1px solid #e2e8f0;font-family:monospace;font-weight:bold;color:#2563eb;">${v.code}</td></tr>`)
          .join('');

        await transporter.sendMail({
          from: `"BankerViva Institutional Desk" <${process.env.ZOHO_MAIL_USER}>`,
          to: customerEmail,
          subject: `[Vouchers Ready] Your ${seatCount} Institutional Access Passes - BankerViva`,
          html: `
            <div style="font-family:sans-serif;line-height:1.6;color:#1e293b;max-width:600px;">
              <h2 style="color:#2563eb;">Thank you for your bulk enrollment, ${customerName || 'Partner'}!</h2>
              <p>Your order of <strong>${seatCount} license passes</strong> for <strong>${planId}</strong> has been confirmed.</p>
              
              <h3>Your 16-Character Activation Keys:</h3>
              <table style="width:100%;border-collapse:collapse;margin:15px 0;">
                <thead>
                  <tr style="background:#f1f5f9;text-align:left;">
                    <th style="padding:6px;border:1px solid #e2e8f0;">No.</th>
                    <th style="padding:6px;border:1px solid #e2e8f0;">Activation Voucher Code</th>
                  </tr>
                </thead>
                <tbody>${voucherListHtml}</tbody>
              </table>

              <p><strong>Candidate Instructions:</strong></p>
              <ol>
                <li>Give 1 distinct code to each candidate.</li>
                <li>Ask candidate to register/sign in at <strong>https://bankerviva.vercel.app/auth</strong>.</li>
                <li>Enter the code in the <em>"Redeem Voucher"</em> box on their dashboard.</li>
              </ol>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Email dispatch error for vouchers:', mailErr);
      }
    } else {
      // 3. If Individual User Purchase: Resolve User ID
      let targetUserId = userId;

      if (!targetUserId && customerEmail) {
        const { data: userProfile }: any = await (supabase as any)
          .from('user_profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (userProfile) {
          targetUserId = userProfile.id;
        }
      }

      if (targetUserId) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        // Insert / Update the 'subscriptions' table so subscription.ts detects active status
        await (supabase as any)
          .from('subscriptions')
          .upsert({
            user_id: targetUserId,
            plan_type: planId || 'pro',
            status: 'active',
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            expires_at: oneYearFromNow.toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        // Update 'user_profiles' table for compatibility
        await (supabase as any)
          .from('user_profiles')
          .update({
            is_subscriber: true,
            plan_type: planId || 'pro',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);
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
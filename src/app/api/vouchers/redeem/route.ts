import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { voucherCode, userEmail } = await req.json();

    if (!voucherCode || !userEmail) {
      return NextResponse.json({ error: 'Voucher code and email are required.' }, { status: 400 });
    }

    const cleanCode = voucherCode.trim().toUpperCase();

    // 1. Check if the code exists
    const { data: voucher, error: fetchErr } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (fetchErr || !voucher) {
      return NextResponse.json({ error: 'Invalid or unrecognized voucher code.' }, { status: 404 });
    }

    // 2. Check if already burned/used
    if (voucher.is_redeemed) {
      return NextResponse.json({ 
        error: `This voucher was already redeemed by ${voucher.redeemed_by_email} on ${new Date(voucher.redeemed_at).toLocaleDateString('en-IN')}.` 
      }, { status: 400 });
    }

    // 3. Mark code as redeemed (Anti-Theft Burn)
    const { error: updateVoucherErr } = await supabase
      .from('vouchers')
      .update({
        is_redeemed: true,
        redeemed_by_email: userEmail,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', voucher.id);

    if (updateVoucherErr) {
      return NextResponse.json({ error: 'Failed to update voucher status.' }, { status: 500 });
    }

    // 4. Calculate dynamic duration based on track (60 days for DRA)
    const isDRA = voucher.exam_track === 'DRA';
    const isMasterPass = voucher.exam_track === 'ALL_ACCESS';
    const validityDays = isDRA ? 60 : isMasterPass ? 365 : 180;

    const now = new Date();
    const expiry = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

    // 5. Update the candidate profile record
    const { error: updateProfileErr } = await supabase
      .from('user_profiles')
      .update({
        enrolled_package: voucher.exam_track,
        subscription_start_date: now.toISOString(),
        subscription_end_date: expiry.toISOString(),
        is_active: true,
      })
      .eq('email', userEmail);

    if (updateProfileErr) {
      console.error('Profile update error:', updateProfileErr);
      return NextResponse.json({ error: 'Voucher burned, but profile update failed: ' + updateProfileErr.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      examTrack: voucher.exam_track, 
      validTill: expiry.toLocaleDateString('en-IN') 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during redemption' }, { status: 500 });
  }
}
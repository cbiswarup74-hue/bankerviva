import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { planId, amount, customerEmail, customerName } = await req.json();

    if (!amount || !planId) {
      return NextResponse.json({ error: 'Missing plan details or amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    // Razorpay requires amount in Paise (e.g. ₹399 = 39900 paise)
    const numericAmountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: numericAmountInPaise,
      currency: 'INR',
      receipt: `rcpt_${planId}_${Date.now().toString().slice(-6)}`,
      notes: {
        planId,
        customerEmail: customerEmail || 'candidate@bankerviva.com',
        customerName: customerName || 'BankerViva Candidate',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
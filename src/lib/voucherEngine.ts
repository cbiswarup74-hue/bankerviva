import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

// Generate formatted 16-character code: BVIV-XXXX-XXXX-XXXX
export function generateVoucherCode(): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BVIV-${segment()}-${segment()}-${segment()}`;
}

export async function createBatchVouchers(examTrack: string, count: number, agencyEmail: string) {
  const vouchers = Array.from({ length: count }, () => ({
    code: generateVoucherCode(),
    exam_track: examTrack,
    agency_email: agencyEmail,
    is_redeemed: false,
  }));

  const { data, error } = await supabase
    .from('vouchers')
    .insert(vouchers)
    .select();

  if (error) {
    console.error('Failed to create vouchers in database:', error);
    throw error;
  }

  return data;
}
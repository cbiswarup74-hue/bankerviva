import { supabase } from '@/lib/supabaseClient';

export async function logPageView(pagePath: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('page_views').insert([
      {
        page_path: pagePath,
        user_id: user ? user.id : null, // Null for anonymous guests, UUID for logged-in users
        referrer: typeof document !== 'undefined' ? document.referrer : null,
      }
    ]);
  } catch (err) {
    // Non-blocking silent fail
  }
}
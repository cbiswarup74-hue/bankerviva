import { supabase } from '@/lib/supabaseClient';

export interface SubscriptionStatus {
  isLoggedIn: boolean;
  isSubscriber: boolean;
  planType: string;
  userId?: string;
}

export async function checkUserSubscription(): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        isLoggedIn: false,
        isSubscriber: false,
        planType: 'guest'
      };
    }

    // 1. Check subscriptions table using .maybeSingle() to prevent 406 errors
    const { data: sub } = await (supabase as any)
      .from('subscriptions')
      .select('plan_type, status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (sub) {
      if (!sub.expires_at || new Date(sub.expires_at) >= new Date()) {
        return {
          isLoggedIn: true,
          isSubscriber: true,
          planType: sub.plan_type || 'pro',
          userId: user.id
        };
      }
    }

    // 2. Check user_profiles table using .maybeSingle()
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('is_subscriber, plan_type')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_subscriber) {
      return {
        isLoggedIn: true,
        isSubscriber: true,
        planType: profile.plan_type || 'pro',
        userId: user.id
      };
    }

    return {
      isLoggedIn: true,
      isSubscriber: false,
      planType: 'free',
      userId: user.id
    };
  } catch (err) {
    console.error('Subscription check error:', err);
    return {
      isLoggedIn: false,
      isSubscriber: false,
      planType: 'guest'
    };
  }
}
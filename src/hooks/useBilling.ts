import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Subscription } from '@/lib/types';

export const subscriptionQueryKey = ['subscription'] as const;
export const PRO_WELCOME_PENDING_KEY = 'oc.pro-welcome-pending';

export interface SubscriptionResponse {
  subscription: Subscription | null;
  billingExempt: boolean;
}

export function useSubscription() {
  return useQuery<SubscriptionResponse>({
    queryKey: subscriptionQueryKey,
    queryFn: api.subscription,
    staleTime: 30_000,
    // Dodo redirects back before its signed webhook necessarily reaches us.
    // Keep checking a pending checkout until the subscription becomes active.
    refetchInterval: (query) => query.state.data?.subscription?.status === 'pending' ? 2_500 : false,
  });
}

export function hasProAccess(data?: SubscriptionResponse | null, now = new Date()) {
  if (data?.billingExempt) return true;
  const subscription = data?.subscription;
  if (!subscription || subscription.status !== 'active') return false;
  return !subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) > now;
}

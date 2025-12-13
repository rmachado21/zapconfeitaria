import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  subscribed: boolean;
  planType: 'monthly' | 'yearly' | null;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    planType: null,
    subscriptionEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription({
        subscribed: false,
        planType: null,
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) throw fnError;

      setSubscription({
        subscribed: data.subscribed ?? false,
        planType: data.plan_type ?? null,
        subscriptionEnd: data.subscription_end ?? null,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Erro ao verificar assinatura');
      setSubscription({
        subscribed: false,
        planType: null,
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const createCheckout = async (planType: 'monthly' | 'yearly') => {
    if (!session) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planType },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
    return data;
  };

  return {
    subscription,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isActive: subscription.subscribed,
  };
}

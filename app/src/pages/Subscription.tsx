import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan, UserSubscription } from '../types';
import { FiCheck, FiStar, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Subscription() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, [profile]);

  const loadPlans = async () => {
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price');

    if (plansData) setPlans(plansData);

    if (profile) {
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (subData) setCurrentSub(subData);
    }

    setLoading(false);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!profile) return;

    if (plan.price === 0) {
      toast.success('You already have free access!');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: profile.id,
      plan_id: plan.id,
      status: 'active',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      toast.error('Failed to subscribe');
      return;
    }

    toast.success(`Subscribed to ${plan.name} plan!`);
    loadPlans();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-5">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          Choose Your Plan
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          Unlock premium courses and accelerate your learning with our subscription plans
        </p>
      </div>

      {currentSub && (
        <div className="content-card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="d-flex align-items-center gap-3">
            <FiZap size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontWeight: 700 }}>
                Current Plan: {(currentSub as any).plan?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Expires: {new Date(currentSub.expires_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 justify-content-center">
        {plans.map((plan, idx) => {
          const isPopular = idx === 2;
          const features = Array.isArray(plan.features) ? plan.features : [];
          const isCurrentPlan = currentSub?.plan_id === plan.id;

          return (
            <div key={plan.id} className="col-12 col-sm-6 col-lg-3">
              <div className={`plan-card ${isPopular ? 'popular' : ''}`}>
                {isPopular && <div className="plan-popular-badge"><FiStar style={{ marginRight: 4 }} /> Most Popular</div>}

                <div className="plan-name">{plan.name}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {plan.description}
                </p>

                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                  {plan.duration_days <= 31 && <span className="period">/month</span>}
                  {plan.duration_days > 31 && plan.duration_days <= 366 && <span className="period">/year</span>}
                </div>

                <ul className="plan-features">
                  {features.map((feature, i) => (
                    <li key={i}>
                      <FiCheck /> {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn ${isCurrentPlan ? 'btn-success' : isPopular ? 'btn-primary' : 'btn-outline-primary'} w-100`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || plan.price === 0}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Free Access' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan, UserSubscription } from '../types';
import { FiCheck, FiStar, FiZap, FiAlertCircle, FiClock, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const daysBetween = (to: string) => Math.ceil((new Date(to).getTime() - Date.now()) / 86400000);

export default function Subscription() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [history, setHistory] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadAll(); }, [profile]);

  const loadAll = async () => {
    const { data: plansData } = await supabase
      .from('subscription_plans').select('*').eq('is_active', true).order('price');
    if (plansData) setPlans(plansData);

    if (profile) {
      const { data: subData } = await supabase
        .from('user_subscriptions').select('*, plan:subscription_plans(*)')
        .eq('user_id', profile.id).eq('status', 'active')
        .order('expires_at', { ascending: false }).limit(1).maybeSingle();
      setCurrentSub(subData ?? null);

      const { data: hist } = await supabase
        .from('user_subscriptions').select('*, plan:subscription_plans(*)')
        .eq('user_id', profile.id).order('created_at', { ascending: false });
      if (hist) setHistory(hist as UserSubscription[]);
    }
    setLoading(false);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!profile || busy) return;
    if (plan.price === 0) { toast.success('You already have free access!'); return; }
    setBusy(true);

    // Switching plans: cancel the existing active subscription first
    if (currentSub && currentSub.plan_id !== plan.id) {
      await supabase.from('user_subscriptions').update({ status: 'cancelled' }).eq('id', currentSub.id);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);
    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: profile.id, plan_id: plan.id, status: 'active',
      starts_at: new Date().toISOString(), expires_at: expiresAt.toISOString(),
    });
    setBusy(false);
    if (error) { toast.error('Failed to subscribe'); return; }
    toast.success(`Subscribed to ${plan.name}!`);
    loadAll();
  };

  const handleCancel = async () => {
    if (!currentSub || busy) return;
    if (!confirm('Cancel your subscription? You will keep access until it expires.')) return;
    setBusy(true);
    const { error } = await supabase.from('user_subscriptions').update({ status: 'cancelled' }).eq('id', currentSub.id);
    setBusy(false);
    if (error) { toast.error('Failed to cancel'); return; }
    toast.success('Subscription cancelled');
    loadAll();
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner" /></div>;
  }

  const daysLeft = currentSub ? daysBetween(currentSub.expires_at) : 0;
  const expiringSoon = currentSub && daysLeft <= 7 && daysLeft >= 0;

  return (
    <div>
      {/* Expiry reminder */}
      {expiringSoon && (
        <div className="sub-banner">
          <FiAlertCircle />
          <span>Your <strong>{(currentSub as any).plan?.name}</strong> plan expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}. Renew to keep premium access.</span>
        </div>
      )}

      {/* Current subscription self-service */}
      {currentSub && (
        <div className="content-card mb-4 sub-current">
          <div className="sub-current-head">
            <div className="d-flex align-items-center gap-3">
              <div className="sub-current-icon"><FiZap /></div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Plan</div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{(currentSub as any).plan?.name}</div>
              </div>
            </div>
            <span className={`status-badge ${currentSub.status}`}>{currentSub.status}</span>
          </div>
          <div className="sub-current-meta">
            <div><FiClock /> <span>{daysLeft >= 0 ? `${daysLeft} days left` : 'Expired'}</span></div>
            <div>Started: {new Date(currentSub.starts_at).toLocaleDateString()}</div>
            <div>Renews/Expires: {new Date(currentSub.expires_at).toLocaleDateString()}</div>
            <div>₹{(currentSub as any).plan?.price}/term</div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" style={{ width: 'auto', marginTop: 14 }} onClick={handleCancel} disabled={busy}>
            <FiXCircle style={{ marginRight: 6 }} /> Cancel subscription
          </button>
        </div>
      )}

      <div className="text-center mb-4">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          {currentSub ? 'Change Your Plan' : 'Choose Your Plan'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          Unlock premium courses and accelerate your learning with our subscription plans
        </p>
      </div>

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
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{plan.description}</p>
                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                  {plan.duration_days <= 31 && <span className="period">/month</span>}
                  {plan.duration_days > 31 && plan.duration_days <= 366 && <span className="period">/year</span>}
                </div>
                <ul className="plan-features">
                  {features.map((feature, i) => <li key={i}><FiCheck /> {feature}</li>)}
                </ul>
                <button
                  className={`btn ${isCurrentPlan ? 'btn-success' : isPopular ? 'btn-primary' : 'btn-outline-primary'} w-100`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || plan.price === 0 || busy}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Free Access' : currentSub ? 'Switch to this' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing history */}
      {history.length > 0 && (
        <div className="content-card mt-5">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Billing History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Plan</th><th>Amount</th><th>Status</th><th>Started</th><th>Expires</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{(h as any).plan?.name ?? '—'}</td>
                    <td>₹{(h as any).plan?.price ?? 0}</td>
                    <td><span className={`status-badge ${h.status}`}>{h.status}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.starts_at).toLocaleDateString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.expires_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

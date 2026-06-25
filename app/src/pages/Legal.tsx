import type { ReactNode } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  const { settings } = useSiteSettings();
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="legal-page">
      <div className="content-card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 18 }}>
          {settings.site_name} · Last updated {updated}
        </p>
        <div className="legal-body">{children}</div>
        {settings.contact_email && (
          <p style={{ marginTop: 18, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Questions? Contact us at <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>.
          </p>
        )}
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms & Conditions">
      <h3>1. Acceptance of terms</h3>
      <p>By creating an account or using the platform you agree to these Terms. If you do not agree, please do not use the service.</p>
      <h3>2. Accounts</h3>
      <p>You are responsible for keeping your login credentials secure and for all activity under your account. One account is intended for a single user.</p>
      <h3>3. Subscriptions &amp; payments</h3>
      <p>Paid plans grant access to premium content for the stated duration. Prices, features, and durations are shown at checkout and may change for future purchases. Access continues until your plan expires or is cancelled.</p>
      <h3>4. Acceptable use</h3>
      <p>You may not share, resell, copy, or redistribute course content, attempt to bypass access controls, or disrupt the service for others.</p>
      <h3>5. Content &amp; intellectual property</h3>
      <p>All courses, lessons, and materials remain the property of the platform or its creators and are provided for your personal learning only.</p>
      <h3>6. Termination</h3>
      <p>We may suspend or terminate accounts that violate these Terms. You may stop using the service at any time.</p>
      <h3>7. Changes</h3>
      <p>We may update these Terms from time to time. Continued use after changes means you accept the updated Terms.</p>
    </LegalLayout>
  );
}

export function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy">
      <h3>Eligibility</h3>
      <p>You may request a refund within <strong>7 days</strong> of a subscription purchase if you have not substantially consumed the premium content during that period.</p>
      <h3>How to request</h3>
      <p>Email us your registered account address and the reason for the request. Approved refunds are processed to the original payment method within 5–10 business days.</p>
      <h3>Non-refundable</h3>
      <p>Requests made after 7 days, renewals, and free plans are not eligible. Promotional or discounted purchases may have different terms noted at checkout.</p>
      <h3>Cancellation</h3>
      <p>You can cancel anytime from your Subscription page. Cancellation stops future renewals; you keep access until the current period ends.</p>
    </LegalLayout>
  );
}

export function Faq() {
  const items = [
    { q: 'How do I access course content?', a: 'Enrol in a course and its lessons unlock for you. Premium courses require an active subscription.' },
    { q: 'Can I switch or upgrade my plan?', a: 'Yes. Go to Subscription and choose a different plan — switching cancels your current active plan and starts the new one.' },
    { q: 'How do I cancel my subscription?', a: 'Open the Subscription page and click “Cancel subscription”. You keep access until the plan expires.' },
    { q: 'Will I get a certificate?', a: 'Eligible courses award a certificate on completion, which appears on your Certificates page.' },
    { q: 'I forgot my password — what do I do?', a: 'Use the password reset on the login page, or change it anytime under Settings → Security.' },
    { q: 'How do I get help?', a: 'Visit the Help page or contact support using the email in the footer.' },
  ];
  return (
    <LegalLayout title="Frequently Asked Questions">
      {items.map((it, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <h3 style={{ marginBottom: 4 }}>{it.q}</h3>
          <p style={{ margin: 0 }}>{it.a}</p>
        </div>
      ))}
    </LegalLayout>
  );
}

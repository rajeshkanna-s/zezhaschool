import { FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi';

export default function Help() {
  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Help & Support</h2>

      <div className="settings-section">
        <h3><FiHelpCircle style={{ marginRight: 8 }} /> Contact Us</h3>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiMail />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Support</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>zezhaschool@zohomail.in</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiPhone />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone Support</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Available during business hours</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>FAQs</h3>
        <div className="d-flex flex-column gap-3">
          {[
            { q: 'How do I subscribe to a plan?', a: 'Go to the Subscription page from the sidebar and choose a plan that suits you.' },
            { q: 'Can I switch plans?', a: 'Yes, you can upgrade or switch your plan anytime from the Subscription page.' },
            { q: 'How do I access course content?', a: 'Enroll in a course and all its content will be unlocked for you.' },
            { q: 'What if I forget my password?', a: 'Contact our support team and we will help you reset your password.' },
          ].map((faq, i) => (
            <div key={i} style={{ paddingBottom: 12, borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{faq.q}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

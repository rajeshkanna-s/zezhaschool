import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = [
  'zezhaschool@zohomail.in',
  'zezhaschool@gmail.com',
  'zezhatalenties@gmail.com',
];

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      toast.error('This email is reserved. Please use a different email.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, mobile);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    toast.success('Account created successfully!');
    navigate('/');
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left visual side */}
      <div className="auth-split-visual">
        <div className="auth-split-overlay" />
        
        {/* Horizontal Navigation Header Bar */}
        <div className="auth-split-top-bar">
          <div className="auth-split-brand">
            <img src="/logo-icon.png" alt="ZEZHASCHOOL" className="auth-split-logo-img" />
            <span className="auth-split-logo-txt">ZEZHASCHOOL</span>
          </div>
          <Link to="/" className="auth-split-back-home">
            <FiArrowLeft /> Back to Landing Page
          </Link>
        </div>

        <div className="auth-split-visual-content">
          <h1 className="auth-split-heading">
            Start Your <span className="text-highlight">Real-World Learning</span> Journey
          </h1>

          {/* Polaroid-framed banner image */}
          <div className="auth-split-image-container">
            <img src="/auth-banner.png" alt="Education Illustration" className="auth-split-vector-img" />
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="auth-split-form">
        {/* Mobile-only back button */}
        <Link to="/" className="auth-mobile-back-home">
          <FiArrowLeft /> Back to Landing Page
        </Link>

        {/* Mobile-only logo/brand */}
        <div className="auth-logo-header-mobile">
          <img src="/logo-icon.png" alt="ZEZHASCHOOL Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>ZEZHASCHOOL</span>
        </div>

        <div className="auth-split-card">
          <div className="auth-card wide" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join ZezhaSchool and start learning today</p>

            <form onSubmit={handleSubmit}>
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
                <label htmlFor="fullName"><FiUser style={{ marginRight: 6 }} />Full Name</label>
              </div>

              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="email"><FiMail style={{ marginRight: 6 }} />Email address</label>
              </div>

              <div className="form-floating">
                <input
                  type="tel"
                  className="form-control"
                  id="mobile"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
                <label htmlFor="mobile"><FiPhone style={{ marginRight: 6 }} />Mobile Number</label>
              </div>

              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <label htmlFor="password"><FiLock style={{ marginRight: 6 }} />Password (min 6 chars)</label>
              </div>

              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <label htmlFor="confirmPassword"><FiLock style={{ marginRight: 6 }} />Confirm Password</label>
              </div>

              <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiTrendingUp, FiActivity, FiHeart, FiSmile,
  FiArrowRight, FiCheckCircle, FiCompass
} from 'react-icons/fi';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to the dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="landing-page">
      <div className="landing-grid-bg" />

      {/* Top Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-logo">
            <img src="/logo-icon.png" alt="ZezhaSchool Logo" />
            <span className="landing-logo-text">ZezhaSchool</span>
          </Link>
          <div className="landing-nav-links">
            <Link to="/login" className="landing-btn landing-btn-text">
              Sign In
            </Link>
            <Link to="/signup" className="landing-btn landing-btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <FiCompass /> The Curated Path to Personal Mastery
        </div>
        <h1>
          Learn the Skills That <span>Define Real-Life Success</span>
        </h1>
        <p className="landing-hero-subtitle">
          Academics only get you through the door. ZezhaSchool gives you the practical life mastery
          to thrive: money control, emotional control, behavioral excellence, and high personal discipline.
        </p>
        <div className="landing-hero-ctas">
          <Link to="/signup" className="landing-btn landing-btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Start Learning Free <FiArrowRight style={{ marginLeft: 8 }} />
          </Link>
          <Link to="/login" className="landing-btn landing-btn-outline" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            View Dashboard
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="landing-stats-grid">
          <div className="landing-stat-box">
            <div className="landing-stat-number">15+</div>
            <div className="landing-stat-label">Life Domains</div>
          </div>
          <div className="landing-stat-box">
            <div className="landing-stat-number">50+</div>
            <div className="landing-stat-label">Practical Skills</div>
          </div>
          <div className="landing-stat-box">
            <div className="landing-stat-number">100%</div>
            <div className="landing-stat-label">Real-World Focus</div>
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="landing-section" style={{ backgroundColor: '#fcfbf8', borderTop: '1px solid rgba(15, 23, 42, 0.04)', borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
        <div className="landing-section-header">
          <h2 className="landing-section-title">Designed for Every Stage of Life</h2>
          <p className="landing-section-subtitle">
            Traditional education misses the most important elements of human success. We fill the gap for everyone.
          </p>
        </div>

        <div className="audience-grid">
          <div className="audience-card">
            <span className="audience-badge students">For Students</span>
            <h3>Build High Confidence</h3>
            <p>Stand out from the crowd, learn structure, conquer social anxiety, and build healthy study and morning habits early.</p>
            <ul className="audience-points">
              <li className="audience-point"><FiCheckCircle /> Morning & Evening Routines</li>
              <li className="audience-point"><FiCheckCircle /> Exam Stress Coping Tools</li>
              <li className="audience-point"><FiCheckCircle /> Basic Budgeting Skills</li>
            </ul>
          </div>

          <div className="audience-card">
            <span className="audience-badge parents">For Parents</span>
            <h3>Empower Your Children</h3>
            <p>Equip your children with critical life logic, emotional regulation tools, and financial wisdom that schools simply don't teach.</p>
            <ul className="audience-points">
              <li className="audience-point"><FiCheckCircle /> High Emotional Quotient (EQ)</li>
              <li className="audience-point"><FiCheckCircle /> Safe Social Media Habits</li>
              <li className="audience-point"><FiCheckCircle /> Value of Money & Compounding</li>
            </ul>
          </div>

          <div className="audience-card">
            <span className="audience-badge professionals">For Professionals</span>
            <h3>Accelerate Your Career</h3>
            <p>Master public speaking, workspace empathy, behavioral presence, and strategic personal asset and finance management.</p>
            <ul className="audience-points">
              <li className="audience-point"><FiCheckCircle /> Corporate Charisma & Presence</li>
              <li className="audience-point"><FiCheckCircle /> Stock Market & Tax Planning</li>
              <li className="audience-point"><FiCheckCircle /> High-Agency Decision Making</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Curriculum Showcase (Alternating Layout with Images) */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Our Core Life Skill Pathways</h2>
          <p className="landing-section-subtitle">
            Explore carefully structured learning pathways containing micro-lessons, missions, and certifications.
          </p>
        </div>

        <div className="feature-rows-container">
          
          {/* Row 1: Discipline */}
          <div className="landing-feature-row">
            <div className="feature-media-col">
              <div className="feature-media-wrapper">
                <img src="/discipline.png" alt="Discipline & Routines Course Illustration" />
              </div>
            </div>
            <div className="feature-text-col">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FiActivity />
              </div>
              <h3>Life Fundamentals & Discipline</h3>
              <p>
                Consistency beats intensity. Learn to design mornings that activate your focus, establish tracking habits, manage screen addictions, and stay highly consistent in your pursuits.
              </p>
              <ul className="feature-bullets" style={{ ['--theme-color' as any]: '#3b82f6' }}>
                <li className="feature-bullet-item"><FiCheckCircle /> Habits of Daily Execution</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Digital Fasting Protocols</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Time Boxing & Energy Management</li>
              </ul>
            </div>
          </div>

          {/* Row 2: Emotional IQ */}
          <div className="landing-feature-row">
            <div className="feature-media-col">
              <div className="feature-media-wrapper">
                <img src="/emotional-iq.png" alt="Emotional Intelligence Course Illustration" />
              </div>
            </div>
            <div className="feature-text-col">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <FiHeart />
              </div>
              <h3>Emotional Intelligence & Empathy</h3>
              <p>
                Your relationship with yourself sets the tone for your relationships with others. Navigate negative thoughts, regulate stress under high pressure, build deep conversational empathy, and build unbreakable bonds.
              </p>
              <ul className="feature-bullets" style={{ ['--theme-color' as any]: '#ec4899' }}>
                <li className="feature-bullet-item"><FiCheckCircle /> Self-Assessment & Reflection</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Stress & Anxiety Regulation</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Empathetic Active Listening</li>
              </ul>
            </div>
          </div>

          {/* Row 3: Money Management */}
          <div className="landing-feature-row">
            <div className="feature-media-col">
              <div className="feature-media-wrapper">
                <img src="/money-mgmt.png" alt="Money Management Course Illustration" />
              </div>
            </div>
            <div className="feature-text-col">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FiTrendingUp />
              </div>
              <h3>Practical Money Management</h3>
              <p>
                Financial freedom is a structural skill. Master the mechanics of personal budgeting, understand assets vs liabilities, learn stock market and index investing, and how compounding creates passive wealth.
              </p>
              <ul className="feature-bullets" style={{ ['--theme-color' as any]: '#10b981' }}>
                <li className="feature-bullet-item"><FiCheckCircle /> Zero-Based Budgeting Systems</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Index Fund & Equity Principles</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Tax-Advantaged Growth Strategies</li>
              </ul>
            </div>
          </div>

          {/* Row 4: Communication & Personality */}
          <div className="landing-feature-row">
            <div className="feature-media-col">
              <div className="feature-media-wrapper">
                <img src="/communication.png" alt="Communication & Personality Course Illustration" />
              </div>
            </div>
            <div className="feature-text-col">
              <div className="feature-icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <FiSmile />
              </div>
              <h3>Behavioral & Personality Skills</h3>
              <p>
                People decide how to treat you in the first 7 seconds. Learn to control your body language, project vocal authority, navigate public speaking situations with confidence, and speak assertively.
              </p>
              <ul className="feature-bullets" style={{ ['--theme-color' as any]: '#f59e0b' }}>
                <li className="feature-bullet-item"><FiCheckCircle /> Confident Vocal Projection</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Assertive boundary setting</li>
                <li className="feature-bullet-item"><FiCheckCircle /> Public Speaking Mastery</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-cta-banner-warm">
          <h2>Unlock the Secrets to High-Agency Living</h2>
          <p>
            No grades, no exams, no academic fluff. Just structured, practical, realistic, and micro-learning modules designed to make you a well-rounded and successful individual.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/signup" className="landing-btn landing-btn-primary" style={{ padding: '12px 26px', fontSize: '0.95rem' }}>
              Start Learning Free
            </Link>
            <Link to="/admin/login" className="landing-btn landing-btn-outline" style={{ padding: '12px 26px', fontSize: '0.95rem', backgroundColor: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Admin Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-warm">
        <div className="landing-footer-warm-text">
          © {new Date().getFullYear()} ZezhaSchool. Learn the fundamentals of practical life success.
        </div>
      </footer>
    </div>
  );
}

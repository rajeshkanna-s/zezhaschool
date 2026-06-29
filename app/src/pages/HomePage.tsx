import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiActivity, FiHeart, FiTrendingUp, FiSmile,
  FiCheckCircle, FiCompass, FiMenu, FiX, FiAward, FiUsers, FiTarget
} from 'react-icons/fi';

const PATHWAYS = [
  {
    icon: <FiActivity />,
    color: '#3b82f6',
    img: '/discipline.png',
    title: 'Discipline & Daily Habits',
    text: 'Design mornings that activate focus, beat screen addiction, and stay consistent. Consistency beats intensity.',
  },
  {
    icon: <FiHeart />,
    color: '#ec4899',
    img: '/emotional-iq.png',
    title: 'Emotional Intelligence',
    text: 'Regulate stress, navigate negative thoughts, and build deep empathy and unbreakable relationships.',
  },
  {
    icon: <FiTrendingUp />,
    color: '#10b981',
    img: '/money-mgmt.png',
    title: 'Money Management',
    text: 'Master budgeting, understand assets vs liabilities, and learn how compounding creates real wealth.',
  },
  {
    icon: <FiSmile />,
    color: '#f59e0b',
    img: '/communication.png',
    title: 'Communication & Presence',
    text: 'Control body language, project vocal authority, and master public speaking with confidence.',
  },
];

const STATS = [
  { value: '15+', label: 'Life Domains' },
  { value: '50+', label: 'Practical Skills' },
  { value: '100%', label: 'Real-World Focus' },
];

const AUDIENCES = [
  { icon: <FiUsers />, title: 'For Students', text: 'Build confidence, beat exam stress, and form healthy habits early.' },
  { icon: <FiHeart />, title: 'For Parents', text: 'Give your children the life logic and financial wisdom schools skip.' },
  { icon: <FiAward />, title: 'For Professionals', text: 'Sharpen presence, communication, and high-agency decision making.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="zs-home">
      <style>{styles}</style>

      {/* ===== Navbar ===== */}
      <header className="zs-nav">
        <div className="zs-container zs-nav-inner">
          <Link to="/" className="zs-brand">
            <img src="/logo-icon.png" alt="ZezhaSchool" />
            <span>ZezhaSchool</span>
          </Link>

          <nav className={`zs-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#pathways" onClick={() => setMenuOpen(false)}>Pathways</a>
            <a href="#audience" onClick={() => setMenuOpen(false)}>Who It's For</a>
            <a href="#start" onClick={() => setMenuOpen(false)}>Get Started</a>
            <Link to="/courses" className="zs-btn zs-btn-primary zs-nav-cta">
              Explore Courses
            </Link>
          </nav>

          <button className="zs-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="zs-hero">
        <div className="zs-hero-glow" />
        <div className="zs-container zs-hero-inner">
          <div className="zs-badge"><FiCompass /> The Curated Path to Personal Mastery</div>
          <h1>
            Learn the Skills That <span>Define Real-Life Success</span>
          </h1>
          <p className="zs-hero-sub">
            Academics get you through the door. ZezhaSchool gives you the practical life
            mastery to thrive — money control, emotional intelligence, discipline, and
            confident communication.
          </p>
          <div className="zs-hero-cta">
            <Link to="/courses" className="zs-btn zs-btn-primary zs-btn-lg">
              Start Learning <FiArrowRight />
            </Link>
            <a href="#pathways" className="zs-btn zs-btn-ghost zs-btn-lg">
              Explore Pathways
            </a>
          </div>

          <div className="zs-stats">
            {STATS.map(s => (
              <div key={s.label} className="zs-stat">
                <div className="zs-stat-num">{s.value}</div>
                <div className="zs-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pathways ===== */}
      <section id="pathways" className="zs-section">
        <div className="zs-container">
          <div className="zs-head">
            <div className="zs-kicker"><FiTarget /> Core Pathways</div>
            <h2>Four Skills That Change Everything</h2>
            <p>Structured micro-lessons, real missions, and certifications — built around how life actually works.</p>
          </div>

          <div className="zs-grid">
            {PATHWAYS.map(p => (
              <article key={p.title} className="zs-card">
                <div className="zs-card-media">
                  <img src={p.img} alt={p.title} loading="lazy" />
                  <span className="zs-card-icon" style={{ background: p.color }}>{p.icon}</span>
                </div>
                <div className="zs-card-body">
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <span className="zs-card-link" style={{ color: p.color }}>
                    Learn more <FiArrowRight />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Audience ===== */}
      <section id="audience" className="zs-section zs-section-alt">
        <div className="zs-container">
          <div className="zs-head">
            <div className="zs-kicker"><FiUsers /> Built For Everyone</div>
            <h2>Designed for Every Stage of Life</h2>
            <p>Traditional education misses what matters most. We fill the gap.</p>
          </div>

          <div className="zs-audience">
            {AUDIENCES.map(a => (
              <div key={a.title} className="zs-audience-card">
                <span className="zs-audience-icon">{a.icon}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>

          <ul className="zs-checks">
            <li><FiCheckCircle /> No grades, no exams</li>
            <li><FiCheckCircle /> Real-world micro-lessons</li>
            <li><FiCheckCircle /> Learn at your own pace</li>
          </ul>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="start" className="zs-section">
        <div className="zs-container">
          <div className="zs-cta">
            <h2>Unlock the Secrets to High-Agency Living</h2>
            <p>Structured, practical, realistic micro-learning designed to make you a well-rounded, successful individual.</p>
            <Link to="/courses" className="zs-btn zs-btn-white zs-btn-lg">
              Start Learning Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="zs-footer">
        <div className="zs-container zs-footer-inner">
          <Link to="/" className="zs-brand zs-brand-foot">
            <img src="/logo-icon.png" alt="ZezhaSchool" />
            <span>ZezhaSchool</span>
          </Link>
          <p>© {new Date().getFullYear()} ZezhaSchool. Learn the fundamentals of practical life success.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = `
.zs-home { --ink:#0f172a; --muted:#64748b; --line:rgba(15,23,42,.08); --cream:#fcfbf8; --accent:#f59e0b; --accent-dk:#d97706;
  font-family: 'Inter', system-ui, -apple-system, sans-serif; color: var(--ink); background:#fff; overflow-x:hidden; }
.zs-home * { box-sizing: border-box; }
.zs-container { width:100%; max-width:1160px; margin:0 auto; padding:0 24px; }
.zs-btn { display:inline-flex; align-items:center; gap:8px; font-weight:600; border-radius:999px;
  text-decoration:none; cursor:pointer; border:1px solid transparent; transition:.2s ease; white-space:nowrap; }
.zs-btn svg { transition:transform .2s ease; }
.zs-btn:hover svg { transform:translateX(3px); }
.zs-btn-primary { background:var(--ink); color:#fff; padding:10px 20px; font-size:.92rem; }
.zs-btn-primary:hover { background:#1e293b; transform:translateY(-2px); }
.zs-btn-ghost { background:#fff; color:var(--ink); border-color:var(--line); padding:10px 20px; }
.zs-btn-ghost:hover { border-color:var(--ink); }
.zs-btn-white { background:#fff; color:var(--ink); padding:13px 28px; }
.zs-btn-white:hover { transform:translateY(-2px); }
.zs-btn-lg { padding:14px 30px; font-size:1rem; }

/* Nav */
.zs-nav { position:sticky; top:0; z-index:50; background:rgba(255,255,255,.85);
  backdrop-filter:saturate(180%) blur(12px); border-bottom:1px solid var(--line); }
.zs-nav-inner { display:flex; align-items:center; justify-content:space-between; height:68px; }
.zs-brand { display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--ink); font-weight:800; font-size:1.15rem; letter-spacing:-.02em; }
.zs-brand img { height:34px; width:auto; }
.zs-nav-links { display:flex; align-items:center; gap:28px; }
.zs-nav-links a { color:var(--muted); text-decoration:none; font-weight:500; font-size:.94rem; transition:color .2s; }
.zs-nav-links a:hover { color:var(--ink); }
.zs-nav-cta { color:#fff !important; }
.zs-burger { display:none; background:none; border:none; font-size:1.5rem; color:var(--ink); cursor:pointer; }

/* Hero */
.zs-hero { position:relative; padding:84px 0 72px; text-align:center; background:
  radial-gradient(900px 400px at 50% -50px, rgba(245,158,11,.10), transparent 70%), var(--cream); }
.zs-hero-glow { position:absolute; inset:0; background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);
  background-size:46px 46px; mask-image:radial-gradient(circle at 50% 0,#000,transparent 75%); opacity:.5; pointer-events:none; }
.zs-hero-inner { position:relative; }
.zs-badge { display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid var(--line);
  color:var(--accent-dk); padding:7px 16px; border-radius:999px; font-size:.85rem; font-weight:600; margin-bottom:26px; box-shadow:0 2px 10px rgba(0,0,0,.03); }
.zs-hero h1 { font-size:clamp(2.2rem,5.5vw,3.7rem); line-height:1.08; letter-spacing:-.03em; font-weight:800; margin:0 auto 22px; max-width:880px; }
.zs-hero h1 span { background:linear-gradient(120deg,var(--accent),var(--accent-dk)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.zs-hero-sub { font-size:clamp(1rem,2vw,1.18rem); color:var(--muted); max-width:640px; margin:0 auto 34px; line-height:1.6; }
.zs-hero-cta { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.zs-stats { display:flex; justify-content:center; gap:48px; margin-top:56px; flex-wrap:wrap; }
.zs-stat-num { font-size:2.2rem; font-weight:800; letter-spacing:-.02em; }
.zs-stat-label { color:var(--muted); font-size:.9rem; font-weight:500; }

/* Sections */
.zs-section { padding:80px 0; }
.zs-section-alt { background:var(--cream); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.zs-head { text-align:center; max-width:620px; margin:0 auto 52px; }
.zs-kicker { display:inline-flex; align-items:center; gap:7px; color:var(--accent-dk); font-weight:700;
  font-size:.82rem; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
.zs-head h2 { font-size:clamp(1.7rem,3.5vw,2.5rem); font-weight:800; letter-spacing:-.025em; margin:0 0 14px; }
.zs-head p { color:var(--muted); font-size:1.05rem; line-height:1.6; margin:0; }

/* Pathway cards */
.zs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
.zs-card { background:#fff; border:1px solid var(--line); border-radius:18px; overflow:hidden;
  display:flex; flex-direction:column; transition:.25s ease; }
.zs-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(15,23,42,.10); border-color:transparent; }
.zs-card-media { position:relative; aspect-ratio:4/3; background:var(--cream); overflow:hidden; }
.zs-card-media img { width:100%; height:100%; object-fit:cover; }
.zs-card-icon { position:absolute; bottom:-18px; left:18px; width:44px; height:44px; border-radius:12px;
  display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem; box-shadow:0 6px 16px rgba(0,0,0,.18); }
.zs-card-body { padding:28px 20px 22px; flex:1; display:flex; flex-direction:column; }
.zs-card-body h3 { font-size:1.12rem; font-weight:700; margin:0 0 10px; letter-spacing:-.01em; }
.zs-card-body p { color:var(--muted); font-size:.92rem; line-height:1.55; margin:0 0 16px; flex:1; }
.zs-card-link { display:inline-flex; align-items:center; gap:6px; font-weight:600; font-size:.9rem; }
.zs-card-link svg { transition:transform .2s; }
.zs-card:hover .zs-card-link svg { transform:translateX(4px); }

/* Audience */
.zs-audience { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.zs-audience-card { background:#fff; border:1px solid var(--line); border-radius:18px; padding:32px 26px; text-align:center; }
.zs-audience-icon { display:inline-flex; align-items:center; justify-content:center; width:54px; height:54px;
  border-radius:14px; background:rgba(245,158,11,.12); color:var(--accent-dk); font-size:1.5rem; margin-bottom:18px; }
.zs-audience-card h3 { font-size:1.2rem; font-weight:700; margin:0 0 10px; }
.zs-audience-card p { color:var(--muted); font-size:.95rem; line-height:1.55; margin:0; }
.zs-checks { list-style:none; display:flex; justify-content:center; gap:32px; flex-wrap:wrap; padding:0; margin:44px 0 0; }
.zs-checks li { display:flex; align-items:center; gap:8px; color:var(--ink); font-weight:600; font-size:.95rem; }
.zs-checks svg { color:#10b981; }

/* CTA band */
.zs-cta { background:linear-gradient(135deg,#1e293b,#0f172a); color:#fff; border-radius:26px;
  padding:64px 40px; text-align:center; position:relative; overflow:hidden; }
.zs-cta::before { content:''; position:absolute; inset:0; background:radial-gradient(600px 300px at 50% 0,rgba(245,158,11,.18),transparent 70%); }
.zs-cta h2 { position:relative; font-size:clamp(1.6rem,3.5vw,2.4rem); font-weight:800; letter-spacing:-.025em; margin:0 0 16px; }
.zs-cta p { position:relative; color:rgba(255,255,255,.72); font-size:1.05rem; max-width:560px; margin:0 auto 30px; line-height:1.6; }
.zs-cta .zs-btn { position:relative; }

/* Footer */
.zs-footer { border-top:1px solid var(--line); padding:36px 0; background:var(--cream); }
.zs-footer-inner { display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; }
.zs-brand-foot { font-size:1rem; }
.zs-footer p { color:var(--muted); font-size:.88rem; margin:0; }

/* Responsive */
@media (max-width:960px){ .zs-grid{grid-template-columns:repeat(2,1fr);} }
@media (max-width:820px){
  .zs-burger{display:block;}
  .zs-nav-links{position:absolute; top:68px; left:0; right:0; flex-direction:column; align-items:flex-start;
    gap:0; background:#fff; border-bottom:1px solid var(--line); padding:8px 24px 16px; display:none; }
  .zs-nav-links.open{display:flex;}
  .zs-nav-links a{padding:12px 0; width:100%; border-bottom:1px solid var(--line); }
  .zs-nav-cta{margin-top:12px; width:100%; justify-content:center; }
  .zs-audience{grid-template-columns:1fr;}
}
@media (max-width:560px){
  .zs-grid{grid-template-columns:1fr;}
  .zs-stats{gap:30px;}
  .zs-cta{padding:48px 24px;}
}
`;

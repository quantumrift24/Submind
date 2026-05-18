import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';

const SECTION_LABELS = [
  '01 / 05 — Overview',
  '02 / 05 — Features',
  '03 / 05 — How It Works',
  '04 / 05 — Platform',
  '05 / 05 — Access'
];
const Z_DEPTHS = [0, -1400, -2800, -4200, -5600];

export default function Landing() {
  const [current, setCurrent] = useState(0);
  const [flash, setFlash] = useState(false);
  const [phoneVal, setPhoneVal] = useState('₹45,24,108');
  const [phoneChange, setPhoneChange] = useState({ text: '↑ +0.00% Today', color: 'var(--lime)' });
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const scrollingRef = useRef(false);

  // Mouse / Parallax
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  // Ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 4524108;
      const delta = (Math.random() - 0.45) * 1000;
      const newVal = base + (Math.sin(Date.now() / 3000) * 16000) + delta;
      
      setPhoneVal('₹' + newVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
      const pct = ((newVal - base) / base * 100);
      setPhoneChange({
        text: (pct >= 0 ? '↑ +' : '↓ ') + Math.abs(pct).toFixed(2) + '% Today',
        color: pct >= 0 ? 'var(--lime)' : '#ff6b6b'
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx) => {
    if (idx < 0 || idx >= 5) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    setCurrent(idx);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollingRef.current) return;
      scrollingRef.current = true;
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
      setTimeout(() => { scrollingRef.current = false; }, 1200);
    };

    let touchY = 0;
    const handleTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;
      if (scrollingRef.current) return;
      scrollingRef.current = true;
      if (dy > 0) goTo(current + 1);
      else goTo(current - 1);
      setTimeout(() => { scrollingRef.current = false; }, 1200);
    };

    const handleKeydown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(current - 1);
    };

    const handleMouseMovement = (e) => {
      setMx(e.clientX);
      setMy(e.clientY);
      if (stageRef.current) {
        const x = (e.clientX / window.innerWidth - 0.5) * 6;
        const y = (e.clientY / window.innerHeight - 0.5) * -4;
        const z = -Z_DEPTHS[current];
        stageRef.current.style.transform = `translateZ(${z}px) rotateY(${x * 0.15}deg) rotateX(${y * 0.15}deg)`;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('mousemove', handleMouseMovement);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('mousemove', handleMouseMovement);
    };
  }, [current]);

  const zPos = -Z_DEPTHS[current];
  const stageStyle = { transform: `translateZ(${zPos}px)` }; // Base transform before mouse parallax

  // Function to create random particles
  const Particles = ({ seed }) => {
    return (
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              animationDuration: `${8 + Math.random() * 14}s`,
              animationDelay: `${Math.random() * 12}s`,
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              opacity: 0
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="landing-root">
      <div className="scanline"></div>
      <div id="overlay" className={flash ? 'flash' : ''}></div>

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">Sub<span>mind</span></div>
          <div className="landing-nav-links">
            <button onClick={() => goTo(0)}>Home</button>
            <button onClick={() => goTo(1)}>Features</button>
            <button onClick={() => goTo(2)}>How It Works</button>
            <button onClick={() => goTo(3)}>Platform</button>
            <button onClick={() => goTo(4)}>Access</button>
          </div>
          <Link to="/signup" className="landing-nav-cta">Get Early Access</Link>
        </div>
      </nav>

      {/* PROGRESS DOTS */}
      <div id="dots">
        {[0, 1, 2, 3, 4].map(idx => (
           <button key={idx} className={`dot ${current === idx ? 'active' : ''}`} onClick={() => goTo(idx)} aria-label={`Go to section ${idx + 1}`}></button>
        ))}
      </div>

      <div className="section-label-wrap">
        <div className="section-label-inner">
          <div id="section-label">{SECTION_LABELS[current]}</div>
        </div>
      </div>

      {/* SCENE */}
      <div id="scene">
        <div id="stage" ref={stageRef} style={stageStyle}>
          
          {/* SECTION 0 */}
          <section className={`landing-section ${current === 0 ? '' : 'inactive'}`} id="s0">
            <div className="grid-bg"></div>
            <Particles seed="0" />
            <div className="orb orb-lime" style={{ width: 600, height: 600, top: -100, left: -100, opacity: 0.35 }}></div>
            <div className="orb orb-blue" style={{ width: 500, height: 500, bottom: -150, right: -50, opacity: 0.25 }}></div>

            <div className="landing-inner">
              <div className="hero-left">
                <div className="hero-tag">AUTONOMOUS FINANCE AI</div>
                <h1 className="hero-h1">Your money,<br/><em>fixing</em> itself.</h1>
                <p className="hero-sub">Submind is your AI finance brain — automatically detecting waste, canceling unused subscriptions, recovering lost money, and optimizing recurring spend while you focus on life.</p>
                <div className="hero-btns">
                  <Link className="btn-primary" to="/signup">Access The Brain</Link>
                  <button className="btn-ghost" onClick={() => goTo(2)}>See How It Works →</button>
                </div>
                <div className="hero-stats">
                  <div>
                    <div className="stat-val">₹12Cr+</div>
                    <div className="stat-lbl">Saved</div>
                  </div>
                  <div>
                    <div className="stat-val">48K+</div>
                    <div className="stat-lbl">Active Users</div>
                  </div>
                  <div>
                    <div className="stat-val">99.9%</div>
                    <div className="stat-lbl">Detection Accuracy</div>
                  </div>
                </div>
              </div>

              <div className="hero-right">
                <div className="phone-wrap">
                  <div className="phone">
                    <div className="phone-screen">
                      <div className="phone-ticker">SUBMIND · DETECTED WASTE</div>
                      <div className="phone-val">{phoneVal}</div>
                      <div className="phone-change" style={{ color: phoneChange.color }}>{phoneChange.text}</div>
                      <div className="phone-chart">
                        <svg viewBox="0 0 196 70" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#b6ff4b" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#b6ff4b" stopOpacity="0"/>
                            </linearGradient>
                            <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <path d="M0,55 C20,50 30,40 50,35 S80,20 100,18 S140,22 160,12 S185,8 196,5 L196,70 L0,70 Z" fill="url(#chartGrad)"/>
                          <path d="M0,55 C20,50 30,40 50,35 S80,20 100,18 S140,22 160,12 S185,8 196,5" fill="none" stroke="#b6ff4b" strokeWidth="1.5"/>
                          <circle cx="196" cy="5" r="3" fill="#b6ff4b" filter="url(#glow)"/>
                        </svg>
                      </div>
                      <div className="phone-assets">
                        <div className="phone-asset">
                          <div><div className="pa-name">WASTE</div><div className="pa-sub">Waste Detected</div></div>
                          <div className="pa-val" style={{ color: '#ff6b6b' }}>21%</div>
                        </div>
                        <div className="phone-asset">
                          <div><div className="pa-name">ALERT</div><div className="pa-sub">Netflix</div></div>
                          <div className="pa-val" style={{ color: 'var(--lime)' }}>in 3 days</div>
                        </div>
                        <div className="phone-asset">
                          <div><div className="pa-name">SAVED</div><div className="pa-sub">Spotify Duo</div></div>
                          <div className="pa-val" style={{ color: 'var(--lime)' }}>₹299/mo</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1 */}
          <section className={`landing-section ${current === 1 ? '' : 'inactive'}`} id="s1">
            <div className="grid-bg"></div>
            <Particles seed="1" />
            <div className="orb orb-lime" style={{ width: 500, height: 500, bottom: -200, right: 100, opacity: 0.2 }}></div>
            <div className="bg-num">02</div>

            <div className="landing-inner">
              <div className="section-eyebrow">Core Intelligence</div>
              <h2 className="section-h2">Built to detect.<br/>Designed to <em>save.</em></h2>

              <div className="features-grid">
                <Link to="/signup" className="feat-card">
                  <div className="feat-num">01 —</div>
                  <div className="feat-icon">🧠</div>
                  <div className="feat-title">Subscription Intelligence</div>
                  <div className="feat-desc">Automatically detects recurring payments, OTT platforms, SaaS tools, and hidden subscriptions across your accounts.</div>
                  <span className="feat-link">Learn More</span>
                </Link>
                <Link to="/signup" className="feat-card featured">
                  <div className="feat-num">02 —</div>
                  <div className="feat-icon">⚡</div>
                  <div className="feat-title">Smart Cancellation Engine</div>
                  <div className="feat-desc">Find unused subscriptions and instantly cancel, pause, or downgrade plans to save money.</div>
                  <span className="feat-link">Learn More</span>
                </Link>
                <Link to="/signup" className="feat-card">
                  <div className="feat-num">03 —</div>
                  <div className="feat-icon">💵</div>
                  <div className="feat-title">Refund Recovery</div>
                  <div className="feat-desc">Submind drafts refund emails, identifies failed charges, and helps recover lost money.</div>
                  <span className="feat-link">Learn More</span>
                </Link>
                <div className="feat-card">
                  <div className="feat-num">04 —</div>
                  <div className="feat-icon">🔮</div>
                  <div className="feat-title">Recurring Spend Forecasting</div>
                  <div className="feat-desc">Predict upcoming bills, future spending, and possible overspending before it happens.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-num">05 —</div>
                  <div className="feat-icon">💬</div>
                  <div className="feat-title">AI Financial Assistant</div>
                  <div className="feat-desc">Ask Submind questions like "What should I cancel?" or "Where am I wasting money?" and get instant answers.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-num">06 —</div>
                  <div className="feat-icon">🔒</div>
                  <div className="feat-title">Secure Financial Automation</div>
                  <div className="feat-desc">Bank-grade encryption, secure API connections, and safe automation for every financial action.</div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section className={`landing-section ${current === 2 ? '' : 'inactive'}`} id="s2">
            <div className="grid-bg"></div>
            <Particles seed="2" />
            <div className="orb orb-blue" style={{ width: 600, height: 600, top: -150, left: 200, opacity: 0.18 }}></div>
            <div className="bg-num">03</div>

            <div className="landing-inner">
              <div className="section-eyebrow">Process</div>
              <h2 className="section-h2">Four steps to a<br/><em>self-optimizing</em> wallet.</h2>

              <div className="timeline">
                <div className="tl-step">
                  <div className="tl-dot">01</div>
                  <div className="tl-title">Connect Accounts</div>
                  <div className="tl-desc">Securely connect banks, cards, Gmail, and subscriptions.</div>
                </div>
                <div className="tl-step">
                  <div className="tl-dot">02</div>
                  <div className="tl-title">Analyze Spending</div>
                  <div className="tl-desc">Submind scans recurring charges, usage, and waste patterns.</div>
                </div>
                <div className="tl-step">
                  <div className="tl-dot">03</div>
                  <div className="tl-title">AI Recommends Actions</div>
                  <div className="tl-desc">Get suggestions to cancel, downgrade, refund, or optimize.</div>
                </div>
                <div className="tl-step">
                  <div className="tl-dot">04</div>
                  <div className="tl-title">Save Automatically</div>
                  <div className="tl-desc">Watch Submind recover money and reduce recurring spend over time.</div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className={`landing-section ${current === 3 ? '' : 'inactive'}`} id="s3">
            <div className="grid-bg"></div>
            <Particles seed="3" />
            <div className="orb orb-lime" style={{ width: 700, height: 700, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.1 }}></div>
            <div className="bg-num">04</div>

            <div className="landing-inner">
              <div className="section-eyebrow">The Platform</div>
              <h2 className="section-h2">Your financial<br/><em>control center.</em></h2>

              <div className="dashboard-wrap">
                <div className="dash-header">
                  <div className="dash-dot dd1"></div>
                  <div className="dash-dot dd2"></div>
                  <div className="dash-dot dd3"></div>
                  <div className="dash-title">SUBMIND · COMMAND CENTER · LIVE</div>
                </div>
                <div className="dash-body">
                  <div className="dash-metric">
                    <div className="dm-lbl">Monthly Recurring Spend</div>
                    <div className="dm-val">₹24,580</div>
                    <div className="dm-chg">↓ Safe</div>
                  </div>
                  <div className="dash-metric">
                    <div className="dm-lbl">Savings Recovered</div>
                    <div className="dm-val">₹8,340</div>
                    <div className="dm-chg" style={{ color: 'var(--lime)' }}>↑ This month</div>
                  </div>
                  <div className="dash-metric">
                    <div className="dm-lbl">Waste Detected</div>
                    <div className="dm-val">21%</div>
                    <div className="dm-chg" style={{ color: '#ff6b6b' }}>Pred. Next Month: ₹19,900</div>
                  </div>

                  <div className="dash-wide">
                    <div className="dash-wide-title">Recurring Spend Trend — Last 30 Days</div>
                    <svg className="dash-chart-svg" viewBox="0 0 900 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#b6ff4b" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#b6ff4b" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,65 L30,60 L60,55 L90,50 L120,52 L150,45 L180,40 L210,38 L240,42 L270,35 L300,30 L330,32 L360,25 L390,20 L420,22 L450,18 L480,15 L510,17 L540,12 L570,10 L600,13 L630,8 L660,6 L690,9 L720,5 L750,7 L780,4 L810,6 L840,3 L870,4 L900,2 L900,80 L0,80 Z" fill="url(#dashGrad)"/>
                      <path d="M0,65 L30,60 L60,55 L90,50 L120,52 L150,45 L180,40 L210,38 L240,42 L270,35 L300,30 L330,32 L360,25 L390,20 L420,22 L450,18 L480,15 L510,17 L540,12 L570,10 L600,13 L630,8 L660,6 L690,9 L720,5 L750,7 L780,4 L810,6 L840,3 L870,4 L900,2" fill="none" stroke="#b6ff4b" strokeWidth="2"/>
                    </svg>
                  </div>

                  <div className="ai-actions">
                    <div className="ai-action">
                      <div className="aa-status"></div>
                      <div className="aa-text">Submind — Canceled Canva Pro and saved ₹499/month</div>
                      <div className="aa-time">2m ago</div>
                    </div>
                    <div className="ai-action">
                      <div className="aa-status" style={{ background: '#4bf8ff', boxShadow: '0 0 6px #4bf8ff' }}></div>
                      <div className="aa-text">Submind — Detected duplicate Spotify + YouTube Music subscriptions</div>
                      <div className="aa-time">14m ago</div>
                    </div>
                    <div className="ai-action">
                      <div className="aa-status" style={{ animationDelay: '0.7s' }}></div>
                      <div className="aa-text">Submind — Refund request generated for failed ₹1,999 annual charge</div>
                      <div className="aa-time">1h ago</div>
                    </div>
                    <div className="ai-action">
                      <div className="aa-status" style={{ background: '#ffbc2e', boxShadow: '0 0 6px #ffbc2e' }}></div>
                      <div className="aa-text">Submind — Predicted overspending risk next month: +₹3,200</div>
                      <div className="aa-time">2h ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className={`landing-section ${current === 4 ? '' : 'inactive'}`} id="s4">
            <div className="grid-bg"></div>
            <Particles seed="4" />
            <div className="orb orb-lime" style={{ width: 800, height: 800, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.2, filter: 'blur(120px)' }}></div>

            <div className="landing-inner">
              <div className="cta-pre">// Limited Early Access</div>
              <h2 className="cta-h2">Stop managing<br/>money <em>manually.</em></h2>
              <p className="cta-sub">Join thousands using Submind to detect waste, automate savings, and take control of recurring spend.</p>
              <div className="cta-input-wrap">
                <input type="email" placeholder="Enter your email"/>
                <button onClick={() => navigate('/signup')} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 24px', fontSize: '0.8rem' }}>Request Early Access</button>
              </div>
              <div className="cta-badges">
                <div className="badge">No credit card required</div>
                <div className="badge">256-bit encryption</div>
                <div className="badge">Secure API Connections</div>
                <div className="badge">Cancel anytime</div>
              </div>
            </div>
          </section>

        </div>{/* /stage */}
      </div>{/* /scene */}

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-copy">© 2026 Submind Technologies Inc. — All rights reserved.</div>
          <div id="section-label-foot" className="scroll-hint" style={{ opacity: current === 4 ? 0 : 1 }}>
            Scroll to navigate
            <div className="scroll-arrow"><span></span><span></span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

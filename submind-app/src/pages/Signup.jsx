import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const { signup, loginWithGoogle, error, clearError, isDemoMode, forceDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); setLocalError('');
    if (password !== confirm) { setLocalError('Passwords do not match.'); return; }
    setSubmitting(true);
    try {
      await signup(email, password, name);
      navigate('/onboarding');
    } catch (err) {
      // Silent fallback to bypass mode if Supabase fails (perfect for demo presentations)
      await forceDemoMode({ email, name, displayName: name });
      navigate('/onboarding');
    } finally { setSubmitting(false); }
  };

  const handleGoogle = async () => {
    clearError();
    try { await loginWithGoogle(); navigate('/app'); } catch {}
  };

  const handleBypass = async () => {
    clearError();
    const customData = {};
    if (email) customData.email = email;
    if (name) {
      customData.name = name;
      customData.displayName = name;
    }
    await forceDemoMode(customData);
    navigate('/onboarding');
  };

  const displayError = localError || error;

  return (
    <div className="auth-layout">
      <AnimatedBackground />
      <motion.div className="auth-brand" initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <Link to="/" style={{ textDecoration: 'none' }}><motion.div className="auth-brand-logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}><span>Sub</span>mind</motion.div></Link>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
          Start saving<br /><em>automatically.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          Join 48,000+ users who've stopped wasting money on unused subscriptions. Let your AI finance brain take over.
        </motion.p>
        <motion.div className="auth-brand-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <div className="auth-brand-stat"><strong>₹12Cr+</strong><span>Saved</span></div>
          <div className="auth-brand-stat"><strong>2 min</strong><span>Setup</span></div>
          <div className="auth-brand-stat"><strong>Free</strong><span>To Start</span></div>
        </motion.div>
        <motion.div
          style={{ position: 'absolute', bottom: '15%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,75,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}
          animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="auth-form-side">
        <motion.div className="auth-form-container" initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.7, delay: 0.3 }}>
          <h2>Create account</h2>
          <p className="auth-subtitle">
            Set up your autonomous finance brain in 2 minutes.
          </p>

          {displayError && <motion.div className="auth-error" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}><span>⚠</span> {displayError}</motion.div>}

          <motion.button className="btn btn-google" type="button" onClick={handleGoogle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.button className="btn btn-google" type="button" onClick={handleBypass} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: 12, background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ⚡ Bypass (Continue as Guest)
          </motion.button>

          <div className="divider">or</div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group"><label>Full name</label><input type="text" className="form-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="new-password" /></div>
            <div className="form-group"><label>Email address</label><input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="new-password" /></div>
            <div className="form-group"><label>Password</label><input type="password" className="form-input" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
            <div className="form-group"><label>Confirm password</label><input type="password" className="form-input" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
            <motion.button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }} whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(182,255,75,0.2)' }} whileTap={{ scale: 0.98 }}>
              {submitting ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>Creating account...</motion.span> : 'Create Account'}
            </motion.button>
          </form>
          <p className="auth-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  );
}

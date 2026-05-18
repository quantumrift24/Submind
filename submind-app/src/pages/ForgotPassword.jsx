import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <motion.div className="auth-brand" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="auth-brand-logo"><span>Sub</span>mind</div>
        <h1>Don't worry,<br /><em>we've got you.</em></h1>
        <p>Enter your email and we'll send a link to reset your password securely.</p>
      </motion.div>

      <div className="auth-form-side">
        <motion.div className="auth-form-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
              <h2>Check your email</h2>
              <p className="auth-subtitle" style={{ marginBottom: 32 }}>
                We've sent a password reset link to <strong style={{ color: 'var(--lime)' }}>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h2>Reset password</h2>
              <p className="auth-subtitle">Enter the email linked to your account.</p>

              {error && <div className="auth-error"><span>⚠</span> {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }}>
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="auth-footer-text">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

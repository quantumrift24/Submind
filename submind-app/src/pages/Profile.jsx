import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, logout, updateUser, isDemoMode } = useAuth();
  const [name, setName] = useState(user?.name || user?.displayName || '');
  const [goal, setGoal] = useState(user?.savingsGoal || 20000);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (user?.uid) {
        if (!isDemoMode) {
          await supabase.from('users').update({
            name,
            savingsGoal: Number(goal)
          }).eq('id', user.uid);
        }
        updateUser({
          name,
          savingsGoal: Number(goal)
        });
        setMessage('Profile updated successfully.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'S';

  return (
    <div style={{ maxWidth: 640 }}>
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--lime-glow)', border: '2px solid var(--lime)', color: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{name}</h2>
            <div style={{ color: 'var(--grey)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Monthly Spend Goal (₹)</label>
            <input type="number" className="form-input" value={goal} onChange={e => setGoal(e.target.value)} required min="0" />
            <p style={{ fontSize: '0.75rem', color: 'var(--grey2)', marginTop: 6 }}>Submind will alert you if predictions exceed this amount.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <span style={{ fontSize: '0.85rem', color: message.includes('Failed') ? 'var(--red)' : 'var(--lime)' }}>{message}</span>}
          </div>
        </form>
      </motion.div>

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Connected Services</div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--grey)', marginBottom: 20 }}>
          Link your email or bank to allow Submind to automatically detect subscriptions and bills.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>📧</span>
              <div>
                <div style={{ fontWeight: 500 }}>Gmail Integration</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Detects receipts and invoices</div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ width: 'auto' }}>Connect</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>🏦</span>
              <div>
                <div style={{ fontWeight: 500 }}>Plaid API</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Reads credit card statements securely</div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ width: 'auto' }}>Connect</button>
          </div>
        </div>
      </motion.div>

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="card-header">
          <div className="card-title">Account Actions</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--red-dim)', border: '1px solid rgba(255, 77, 79, 0.2)', borderRadius: 8, marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--red)' }}>Sign Out</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>End your current session across all tabs.</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={logout} style={{ width: 'auto' }}>Sign Out</button>
        </div>
      </motion.div>
    </div>
  );
}

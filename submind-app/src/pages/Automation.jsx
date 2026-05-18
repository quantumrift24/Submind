import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Automation() {
  const { user } = useAuth();
  const { automationLogs, logAutomation } = useData();
  const [preferences, setPreferences] = useState({
    autoCancel: false,
    refundAssistance: false,
    budgetAlerts: true,
    weeklyReports: false,
    aiNegotiation: false
  });
  const [saving, setSaving] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        ...preferences,
        ...user.preferences
      });
    }
  }, [user]);

  const handleToggle = async (key) => {
    const newVal = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newVal }));
    setSaving(true);

    try {
      if (user?.uid) {
        await supabase.from('users').update({
          [`preferences.${key}`]: newVal
        }).eq('id', user.uid);
        await logAutomation(`Toggled ${key} ${newVal ? 'on' : 'off'}`, 'success');
      }
    } catch (err) {
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !newVal }));
      await logAutomation(`Failed to toggle ${key}`, 'failed');
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const simulateAction = async (actionName) => {
    await logAutomation(actionName, 'pending');
    setTimeout(async () => {
      await logAutomation(actionName, 'success');
    }, 2000);
  };

  const TOGGLES = [
    { key: 'autoCancel', label: 'Auto-Cancel Unused Services', desc: 'Submind will automatically cancel services you haven\'t used in 45 days.', icon: '🚫' },
    { key: 'refundAssistance', label: 'AI Refund Assistant', desc: 'Automatically draft and send refund requests for accidental renewals.', icon: '💸' },
    { key: 'aiNegotiation', label: 'Bill Negotiation', desc: 'Let Submind contact providers to negotiate lower rates on your behalf.', icon: '🤝' },
    { key: 'budgetAlerts', label: 'Smart Budget Alerts', desc: 'Get notified immediately if you are projected to overspend this month.', icon: '⚠️' },
    { key: 'weeklyReports', label: 'Weekly Summary Reports', desc: 'Receive a digest of your spending, waste analysis, and savings.', icon: '📊' }
  ];

  return (
    <div>
      <div className="automation-grid">
        
        {/* Left Column - Switches */}
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">⚙️ Automation Scripts</div>
              {saving && <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Saving...</span>}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {TOGGLES.map(t => (
                <div key={t.key} style={{ display: 'flex', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.5rem', background: 'var(--surface)', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--grey)' }}>{t.desc}</div>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={preferences[t.key]} 
                      onChange={() => handleToggle(t.key)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">📝 Draft Actions</div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--grey)', marginBottom: 20 }}>
              Submind can draft cancellation or refund emails for you. Before sending, you always get to review them if Auto-Cancel is off.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setShowDraft(!showDraft)}>
                View Sample Cancellation Draft
              </button>
              <button className="btn btn-primary" onClick={() => simulateAction('Generated Batch Report')}>
                Run Diagnostic
              </button>
            </div>
            
            <AnimatePresence>
              {showDraft && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginTop: 16 }}
                >
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--grey2)' }}>
                    <div style={{ color: 'var(--white)', marginBottom: 8 }}>To: support@example.com</div>
                    <div style={{ color: 'var(--white)', marginBottom: 16 }}>Subject: Immediate Account Cancellation Request</div>
                    <div>
                      Hello,<br/><br/>
                      I am writing to formally request the cancellation of my subscription associated with this email address, effective immediately.<br/><br/>
                      Please confirm once the cancellation is processed and ensure my payment method is removed from your system.<br/><br/>
                      Best,<br/>
                      {user?.displayName || 'Submind User'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Logs */}
        <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 100 }}>
          <div className="card-header">
            <div className="card-title">📋 Execution Log</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto', paddingRight: 8 }}>
            {automationLogs.length > 0 ? automationLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ 
                  marginTop: 2,
                  color: log.status === 'success' ? 'var(--lime)' : log.status === 'failed' ? 'var(--red)' : 'var(--faad14)' 
                }}>
                  {log.status === 'success' ? '✓' : log.status === 'failed' ? '✕' : '⏳'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>{log.action}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--grey2)', fontFamily: 'var(--mono)' }}>
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('en-IN') : 'Just now'} · {log.status.toUpperCase()}
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p>No automation logs yet.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

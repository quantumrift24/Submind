import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { getScoreColor, totalMonthlySpend, totalYearlySpend } from '../engines/scoringEngine';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '../components/CountUp';

const CATEGORIES = ['All', 'Entertainment', 'Productivity', 'Cloud/SaaS', 'Health', 'Education', 'Finance', 'Other'];
const SORT_OPTIONS = [
  { value: 'cost-desc', label: 'Cost (High → Low)' },
  { value: 'cost-asc', label: 'Cost (Low → High)' },
  { value: 'waste-desc', label: 'Waste (Highest)' },
  { value: 'usage-asc', label: 'Usage (Lowest)' },
  { value: 'date', label: 'Next Billing' },
];

const PRESET_SERVICES = [
  { name: 'Netflix', icon: '🎬', category: 'Entertainment', cost: 649 },
  { name: 'Spotify', icon: '🎵', category: 'Entertainment', cost: 119 },
  { name: 'Canva', icon: '🎨', category: 'Productivity', cost: 499 },
  { name: 'Adobe Creative Cloud', icon: '📐', category: 'Productivity', cost: 1675 },
  { name: 'Notion', icon: '📝', category: 'Productivity', cost: 640 },
  { name: 'ChatGPT Plus', icon: '🤖', category: 'Cloud/SaaS', cost: 1650 },
  { name: 'YouTube Premium', icon: '📺', category: 'Entertainment', cost: 149 },
  { name: 'Amazon Prime', icon: '📦', category: 'Entertainment', cost: 299 },
  { name: 'Gym Membership', icon: '💪', category: 'Health', cost: 1500 },
  { name: 'iCloud+', icon: '☁️', category: 'Cloud/SaaS', cost: 75 },
  { name: 'Google One', icon: '🔵', category: 'Cloud/SaaS', cost: 130 },
  { name: 'LinkedIn Premium', icon: '💼', category: 'Productivity', cost: 1500 },
];

export default function Subscriptions() {
  const { subscriptions, addSubscription, deleteSubscription, updateSubscription, logAutomation, addSavingsRecord } = useData();
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('cost-desc');
  const [search, setSearch] = useState('');

  // Add subscription form state
  const [formData, setFormData] = useState({
    serviceName: '', monthlyCost: '', category: 'Entertainment',
    billingCycle: 'monthly', nextBillingDate: '', paymentMethod: 'UPI',
    loginFrequency: 50, recentActivity: 50, featureUsage: 50,
  });

  const monthly = useMemo(() => totalMonthlySpend(subscriptions), [subscriptions]);
  const yearly = useMemo(() => totalYearlySpend(subscriptions), [subscriptions]);

  const filtered = useMemo(() => {
    let list = [...subscriptions];
    if (filter !== 'All') list = list.filter((s) => s.category === filter);
    if (search) list = list.filter((s) => s.serviceName.toLowerCase().includes(search.toLowerCase()));

    switch (sort) {
      case 'cost-desc': list.sort((a, b) => b.monthlyCost - a.monthlyCost); break;
      case 'cost-asc': list.sort((a, b) => a.monthlyCost - b.monthlyCost); break;
      case 'waste-desc': list.sort((a, b) => b.wasteScore - a.wasteScore); break;
      case 'usage-asc': list.sort((a, b) => a.usageScore - b.usageScore); break;
      default: break;
    }
    return list;
  }, [subscriptions, filter, sort, search]);

  const handleAddPreset = (preset) => {
    setFormData({
      ...formData,
      serviceName: preset.name,
      monthlyCost: String(preset.cost),
      category: preset.category,
    });
  };

  const handleAiAction = async (sub, actionType) => {
    setProcessingId(sub.id);
    
    // Simulate AI connection and processing
    await new Promise(r => setTimeout(r, 1200));

    if (actionType === 'cancel') {
      await logAutomation(`AI Auto-Cancelled ${sub.serviceName}`, 'success');
      await deleteSubscription(sub.id);
    } else if (actionType === 'downgrade') {
      const saved = Math.round(sub.monthlyCost * 0.4);
      await logAutomation(`AI Downgraded ${sub.serviceName} plan`, 'success');
      await addSavingsRecord(saved, `Downgraded ${sub.serviceName} to lower tier`);
      await updateSubscription(sub.id, { 
        monthlyCost: sub.monthlyCost - saved,
        usageScore: 85, // Assuming downgrade improves utilization percentage
      });
    }

    setProcessingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSubscription({
      serviceName: formData.serviceName,
      monthlyCost: Number(formData.monthlyCost),
      category: formData.category,
      billingCycle: formData.billingCycle,
      nextBillingDate: formData.nextBillingDate,
      paymentMethod: formData.paymentMethod,
      loginFrequency: Number(formData.loginFrequency),
      recentActivity: Number(formData.recentActivity),
      featureUsage: Number(formData.featureUsage),
    });
    setShowModal(false);
    setFormData({
      serviceName: '', monthlyCost: '', category: 'Entertainment',
      billingCycle: 'monthly', nextBillingDate: '', paymentMethod: 'UPI',
      loginFrequency: 50, recentActivity: 50, featureUsage: 50,
    });
  };

  return (
    <div>
      {/* Summary cards */}
      <div className="stats-grid cols-3">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Monthly Recurring</div>
          <div className="card-value">₹<CountUp end={monthly || 0} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Yearly Estimate</div>
          <div className="card-value">₹<CountUp end={yearly || 0} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Active Subscriptions</div>
          <div className="card-value"><CountUp end={subscriptions.filter((s) => s.status === 'active').length} /></div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280, padding: '10px 16px', borderRadius: 100 }}
          />
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ maxWidth: 200 }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ width: 'auto' }}>
          + Add Subscription
        </button>
      </div>

      {/* Filter chips */}
      <div className="filter-bar">
        {CATEGORIES.map((c) => (
          <button key={c} className={`filter-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Subscriptions table */}
      {filtered.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Cost</th>
                <th>Usage</th>
                <th>Waste</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((sub) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <td>
                      <div className="service-cell">
                        <div className="service-icon" style={{ background: 'var(--surface2)' }}>
                          {PRESET_SERVICES.find((p) => p.name === sub.serviceName)?.icon || '📄'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{sub.serviceName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--grey2)', fontFamily: 'var(--mono)' }}>{sub.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{sub.monthlyCost}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--grey2)' }}>/month</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-bar" style={{ width: 60 }}>
                          <div className="score-bar-fill" style={{ width: `${sub.usageScore}%`, background: getScoreColor(sub.usageScore) }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: getScoreColor(sub.usageScore), fontFamily: 'var(--mono)' }}>
                          {sub.usageScore}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-bar" style={{ width: 60 }}>
                          <div className="score-bar-fill" style={{ width: `${sub.wasteScore}%`, background: getScoreColor(sub.wasteScore, true) }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: getScoreColor(sub.wasteScore, true), fontFamily: 'var(--mono)' }}>
                          {sub.wasteScore}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${sub.recommendation?.action === 'cancel' ? 'tag-red' : sub.recommendation?.action === 'downgrade' ? 'tag-yellow' : 'tag-lime'}`}>
                        {sub.recommendation?.icon} {sub.recommendation?.label}
                      </span>
                    </td>
                    <td>
                      {processingId === sub.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--lime)' }}>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                          >
                            ⚙️
                          </motion.div>
                          AI Working...
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          {sub.recommendation?.action === 'cancel' && (
                            <button className="btn btn-sm btn-outline" style={{ width: 'auto', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleAiAction(sub, 'cancel')}>
                              Auto-Cancel
                            </button>
                          )}
                          {sub.recommendation?.action === 'downgrade' && (
                            <button className="btn btn-sm btn-outline" style={{ width: 'auto', borderColor: 'var(--yellow)', color: 'var(--yellow)' }} onClick={() => handleAiAction(sub, 'downgrade')}>
                              Downgrade
                            </button>
                          )}
                          {sub.recommendation?.action === 'keep' && (
                            <button className="btn btn-sm btn-outline" style={{ width: 'auto' }} onClick={() => deleteSubscription(sub.id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'var(--surface2)', position: 'relative', marginBottom: 24 }}>
            <motion.div
              style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(182,255,75,0.15) 0%, transparent 70%)', borderRadius: '50%' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span style={{ fontSize: '2.5rem', position: 'relative', zIndex: 1 }}>💳</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 12 }}>No subscriptions detected yet.</h3>
          <p style={{ color: 'var(--grey)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto 32px' }}>
            Connect accounts to start scanning recurring payments, or add them manually to begin tracking waste and savings.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto', margin: '0 auto', padding: '12px 24px' }}>
            + Add First Subscription
          </button>
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="modal-header">
                <div className="modal-title">Add Subscription</div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                {/* Quick presets */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--mono)', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Quick Add
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PRESET_SERVICES.slice(0, 8).map((p) => (
                      <button
                        key={p.name}
                        className={`filter-chip ${formData.serviceName === p.name ? 'active' : ''}`}
                        onClick={() => handleAddPreset(p)}
                        style={{ textTransform: 'none' }}
                      >
                        {p.icon} {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Service Name</label>
                    <input className="form-input" required value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} placeholder="e.g. Netflix" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Monthly Cost (₹)</label>
                      <input className="form-input" type="number" required min="0" value={formData.monthlyCost} onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })} placeholder="499" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Billing Cycle</label>
                      <select className="form-select" value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Next Billing Date</label>
                      <input className="form-input" type="date" value={formData.nextBillingDate} onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })} />
                    </div>
                  </div>

                  {/* Usage sliders */}
                  <div style={{ marginTop: 8, marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--mono)', color: 'var(--grey)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Usage Estimation</label>
                    {[
                      { key: 'loginFrequency', label: 'Login Frequency' },
                      { key: 'recentActivity', label: 'Recent Activity' },
                      { key: 'featureUsage', label: 'Feature Usage' },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--grey)', width: 120, flexShrink: 0 }}>{label}</span>
                        <input
                          type="range" min="0" max="100"
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          style={{ flex: 1, accentColor: 'var(--lime)' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--mono)', color: 'var(--lime)', width: 36, textAlign: 'right' }}>{formData[key]}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer" style={{ padding: '16px 0 0' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)} style={{ width: 'auto' }}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>Add Subscription</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

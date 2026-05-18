import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { totalMonthlySpend, totalYearlySpend, calculatePotentialSavings, getScoreColor } from '../engines/scoringEngine';
import { predictNextMonthSpend, getSpendTrend } from '../engines/predictionEngine';
import { motion } from 'framer-motion';
import CountUp from '../components/CountUp';
import { useNavigate } from 'react-router-dom';

const DEMO_HISTORY = [19500, 19200, 18800, 18500, 17900, 17200];

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { subscriptions, savingsHistory, notifications, automationLogs, loading } = useData();
  const navigate = useNavigate();

  const monthly = useMemo(() => totalMonthlySpend(subscriptions), [subscriptions]);
  const yearly = useMemo(() => totalYearlySpend(subscriptions), [subscriptions]);
  const savings = useMemo(() => calculatePotentialSavings(subscriptions), [subscriptions]);
  const predicted = useMemo(() => predictNextMonthSpend(DEMO_HISTORY), []);
  const trend = useMemo(() => getSpendTrend(DEMO_HISTORY), []);
  const totalSaved = useMemo(() => savingsHistory.reduce((s, h) => s + (h.amountSaved || 0), 0), [savingsHistory]);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const wasteCount = subscriptions.filter((s) => s.wasteScore > 60).length;
  const recentLogs = automationLogs.slice(0, 5);

  if (loading) {
    return (
      <motion.div variants={stagger} initial="initial" animate="animate">
        <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
          <div className="skeleton skeleton-text medium" style={{ height: 28, marginBottom: 8 }} />
          <div className="skeleton skeleton-text short" />
        </motion.div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} variants={fadeUp} className="card skeleton skeleton-card" style={{ height: 160 }} />
          ))}
        </div>
        <div className="section-grid cols-2">
          <motion.div variants={fadeUp} className="card skeleton skeleton-card" style={{ height: 240 }} />
          <motion.div variants={fadeUp} className="card skeleton skeleton-card" style={{ height: 240 }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Greeting */}
      <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Welcome back, <span style={{ color: 'var(--lime)' }}>{user?.displayName || user?.name || 'User'}</span>
        </h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.9rem', fontWeight: 300 }}>
          Here's your financial overview. Submind is actively monitoring your spend.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { title: 'Monthly Spend', value: monthly || 0, icon: '💳', iconBg: 'var(--lime-dim)', change: `${trend.direction === 'up' ? '↑' : '↓'} ${Math.abs(trend.pct)}% vs last month`, changeType: trend.direction === 'up' ? 'negative' : 'positive' },
          { title: 'Potential Savings', value: savings.monthly || 0, icon: '💰', iconBg: 'var(--lime-dim)', change: `${savings.cancelCount} to cancel · ${savings.downgradeCount} to downgrade`, changeType: 'positive', valueColor: 'var(--lime)' },
          { title: 'Active Subs', value: activeCount || 0, icon: '📋', iconBg: 'var(--blue-dim)', change: `${wasteCount} flagged as waste`, changeType: 'negative', prefix: '', noInr: true },
          { title: 'Total Saved', value: totalSaved || 0, icon: '🏆', iconBg: 'rgba(182,255,75,0.1)', change: 'Lifetime savings recovered', changeType: 'positive', valueColor: 'var(--lime)' },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            className="card"
            variants={fadeUp}
            whileHover={{
              y: -4,
              borderColor: 'rgba(182,255,75,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(182,255,75,0.08)',
              transition: { duration: 0.2 },
            }}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          >
            {/* Glow effect on hover */}
            <motion.div
              style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,75,0.06), transparent)', pointerEvents: 'none' }}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />

            <div className="card-header">
              <div className="card-title">{card.title}</div>
              <motion.div
                className="card-icon"
                style={{ background: card.iconBg }}
                animate={{ rotate: [0, 0, 0] }}
                whileHover={{ scale: 1.15, rotate: 10 }}
              >
                {card.icon}
              </motion.div>
            </div>
            <div className="card-value" style={{ color: card.valueColor }}>
              {card.noInr ? '' : '₹'}<CountUp end={card.value} />
            </div>
            <div className={`card-change ${card.changeType}`}>{card.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="section-grid cols-2">
        {/* Waste Alert */}
        <motion.div
          className="card"
          variants={fadeUp}
          whileHover={{ borderColor: 'rgba(255,77,79,0.15)' }}
        >
          <div className="card-header">
            <div className="card-title">⚠️ Waste Alerts</div>
            <motion.button
              className="btn btn-sm btn-outline"
              style={{ width: 'auto', fontSize: '0.68rem' }}
              onClick={() => navigate('/app/subscriptions')}
              whileHover={{ borderColor: 'var(--lime)', color: 'var(--lime)' }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>
          {subscriptions.filter((s) => s.wasteScore > 50).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {subscriptions
                .filter((s) => s.wasteScore > 50)
                .sort((a, b) => b.wasteScore - a.wasteScore)
                .slice(0, 4)
                .map((sub, idx) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}
                    whileHover={{ background: 'var(--surface)', marginLeft: -12, marginRight: -12, paddingLeft: 12, paddingRight: 12, borderRadius: 8 }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: 2 }}>{sub.serviceName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>₹{sub.monthlyCost}/mo · {sub.usageScore}% usage</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="score-bar" style={{ width: 50 }}>
                        <motion.div
                          className="score-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${sub.wasteScore}%` }}
                          transition={{ delay: 0.8 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                          style={{ background: getScoreColor(sub.wasteScore, true) }}
                        />
                      </div>
                      <span className={`tag ${sub.recommendation?.action === 'cancel' ? 'tag-red' : 'tag-yellow'}`}>
                        {sub.recommendation?.label}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: 12 }}>🛡️</div>
              <p style={{ margin: 0, fontWeight: 500 }}>No waste detected.</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Add subscriptions to get AI-powered waste alerts.</p>
            </div>
          )}
        </motion.div>

        {/* Activity Feed */}
        <motion.div className="card" variants={fadeUp}>
          <div className="card-header">
            <div className="card-title">🤖 AI Activity</div>
            <motion.div
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)' }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          {recentLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <motion.span
                    style={{ fontSize: '0.85rem' }}
                    animate={log.status === 'pending' ? { rotate: [0, 360] } : {}}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    {log.status === 'success' ? '✅' : log.status === 'pending' ? '⏳' : '❌'}
                  </motion.span>
                  <div>
                    <div style={{ fontSize: '0.85rem' }}>{log.action}</div>
                    <div style={{ fontSize: '0.68rem', fontFamily: 'var(--mono)', color: 'var(--grey2)' }}>
                      {log.timestamp instanceof Date ? log.timestamp.toLocaleString('en-IN') : log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('en-IN') : 'Just now'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 10px' }}><p style={{ margin: 0 }}>No AI activity yet.</p></div>
          )}
        </motion.div>
      </div>

      {/* Predicted spend */}
      <motion.div
        className="card"
        variants={fadeUp}
        style={{ marginTop: 0, overflow: 'hidden', position: 'relative' }}
        whileHover={{ borderColor: 'rgba(182,255,75,0.12)' }}
      >
        {/* Animated background shimmer */}
        <motion.div
          style={{ position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(182,255,75,0.02), transparent)', pointerEvents: 'none' }}
          animate={{ x: ['0%', '100%'] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        />

        <div className="card-header" style={{ position: 'relative', zIndex: 1 }}>
          <div className="card-title">📈 Next Month Forecast</div>
          <motion.span
            className={`tag ${predicted > (monthly || 0) ? 'tag-red' : 'tag-lime'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 500 }}
          >
            {predicted > (monthly || 0) ? 'Overspend Risk' : 'On Track'}
          </motion.span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, position: 'relative', zIndex: 1 }}>
          <div className="card-value">₹<CountUp end={predicted || 0} /></div>
          <span style={{ fontSize: '0.82rem', color: 'var(--grey)' }}>predicted spend</span>
        </div>
        <div className="score-bar" style={{ marginTop: 16, height: 8, position: 'relative', zIndex: 1 }}>
          <motion.div
            className="score-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ((predicted || 0) / 30000) * 100)}%` }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ background: predicted > (monthly || 0) ? 'var(--red)' : 'var(--lime)' }}
          />
        </div>
      </motion.div>

      {/* Quick actions FAB */}
      <motion.div
        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.button
          className="btn btn-primary"
          style={{ width: 56, height: 56, borderRadius: '50%', padding: 0, fontSize: '1.3rem', boxShadow: '0 8px 32px rgba(182,255,75,0.2)' }}
          whileHover={{ scale: 1.1, boxShadow: '0 12px 48px rgba(182,255,75,0.35)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/app/chat')}
          title="Ask Submind AI"
          animate={{ boxShadow: ['0 8px 32px rgba(182,255,75,0.15)', '0 8px 32px rgba(182,255,75,0.35)', '0 8px 32px rgba(182,255,75,0.15)'] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🤖
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

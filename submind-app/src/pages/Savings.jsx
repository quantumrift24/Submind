import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { calculatePotentialSavings, totalMonthlySpend } from '../engines/scoringEngine';
import { motion } from 'framer-motion';
import CountUp from '../components/CountUp';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['#b6ff4b', '#faad14', '#ff4d4f', '#4dabf7', '#a78bfa', '#f472b6'];

export default function Savings() {
  const { subscriptions, savingsHistory } = useData();

  const monthly = useMemo(() => totalMonthlySpend(subscriptions), [subscriptions]);
  const savings = useMemo(() => calculatePotentialSavings(subscriptions), [subscriptions]);
  const totalSaved = useMemo(() => savingsHistory.reduce((s, h) => s + (h.amountSaved || 0), 0), [savingsHistory]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats = {};
    subscriptions.filter((s) => s.status === 'active').forEach((s) => {
      cats[s.category] = (cats[s.category] || 0) + s.monthlyCost;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Before vs After comparison
  const comparisonData = useMemo(() => {
    const before = monthly;
    const after = before - savings.monthly;
    return [
      { name: 'Current Spend', value: before, fill: '#ff4d4f' },
      { name: 'After Optimization', value: Math.max(0, after), fill: '#b6ff4b' },
    ];
  }, [monthly, savings]);

  const savingsPercent = monthly > 0 ? Math.round((savings.monthly / monthly) * 100) : 0;

  const cardAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div>
      {/* Summary stats */}
      <div className="stats-grid">
        <motion.div className="card" {...cardAnim} transition={{ delay: 0.1 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Potential Monthly Savings</div>
          <div className="card-value" style={{ color: 'var(--lime)' }}>₹<CountUp end={savings.monthly || 0} /></div>
          <div className="card-change positive">{savingsPercent}% of your spend</div>
        </motion.div>

        <motion.div className="card" {...cardAnim} transition={{ delay: 0.2 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Potential Yearly Savings</div>
          <div className="card-value" style={{ color: 'var(--lime)' }}>₹<CountUp end={savings.yearly || 0} /></div>
          <div className="card-change positive">If optimized now</div>
        </motion.div>

        <motion.div className="card" {...cardAnim} transition={{ delay: 0.3 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Total Recovered</div>
          <div className="card-value">₹<CountUp end={totalSaved || 0} /></div>
          <div className="card-change positive">Lifetime savings</div>
        </motion.div>

        <motion.div className="card" {...cardAnim} transition={{ delay: 0.4 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Optimization Impact</div>
          <div className="card-value" style={{ color: 'var(--lime)' }}><CountUp end={savingsPercent} />%</div>
          <div className="card-change positive">{savings.cancelCount} cancel · {savings.downgradeCount} downgrade</div>
        </motion.div>
      </div>

      <div className="section-grid cols-2">
        {/* Circular savings meter */}
        <motion.div className="card" {...cardAnim} transition={{ delay: 0.5 }}>
          <div className="card-header">
            <div className="card-title">Savings Potential</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <div className="circular-progress" style={{ width: 160, height: 160 }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--surface2)" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke="var(--lime)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - savingsPercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div className="circular-progress-value" style={{ fontSize: '1.8rem' }}>
                {savingsPercent}%
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--grey)', fontSize: '0.85rem' }}>
            You could save ₹{savings.monthly.toLocaleString('en-IN')}/mo by optimizing
          </div>
        </motion.div>

        {/* Before vs After bar chart */}
        <motion.div className="card" {...cardAnim} transition={{ delay: 0.6 }}>
          <div className="card-header">
            <div className="card-title">Before vs After Optimization</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0a0', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'IBM Plex Sans' }}
                labelStyle={{ color: '#f0f0f0' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category breakdown */}
      <motion.div className="card" {...cardAnim} transition={{ delay: 0.7 }}>
        <div className="card-header">
          <div className="card-title">Spend by Category</div>
        </div>
        {categoryData.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Spend']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {categoryData.map((cat, i) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: '0.88rem' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontFamily: 'var(--mono)', color: 'var(--lime)' }}>₹{cat.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>Add subscriptions to see category breakdown.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

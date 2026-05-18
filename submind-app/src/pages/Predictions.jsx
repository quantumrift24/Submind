import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { totalMonthlySpend } from '../engines/scoringEngine';
import { predictNextMonthSpend, getSpendTrend, generateForecastData, getUpcomingBills } from '../engines/predictionEngine';
import { motion } from 'framer-motion';
import CountUp from '../components/CountUp';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

const DEMO_HISTORY = [19500, 19200, 18800, 18500, 17900, 17200];

export default function Predictions() {
  const { subscriptions } = useData();
  const monthly = useMemo(() => totalMonthlySpend(subscriptions), [subscriptions]);
  const predicted = useMemo(() => predictNextMonthSpend(DEMO_HISTORY), []);
  const trend = useMemo(() => getSpendTrend(DEMO_HISTORY), []);
  const forecastData = useMemo(() => generateForecastData(DEMO_HISTORY, 3), []);
  const upcomingBills = useMemo(() => getUpcomingBills(subscriptions, 30), [subscriptions]);

  const goal = 20000; // User goal placeholder
  const isOverspending = predicted > goal;

  const cardAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div>
      {/* Summary */}
      <div className="stats-grid cols-3">
        <motion.div className="card" {...cardAnim} transition={{ delay: 0.1 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>30-Day Prediction</div>
          <div className="card-value" style={{ color: isOverspending ? 'var(--red)' : 'var(--lime)' }}>
            ₹<CountUp end={predicted} />
          </div>
          <div className={`card-change ${isOverspending ? 'negative' : 'positive'}`}>
            {isOverspending ? '⚠ Above goal' : '✓ Within goal'}
          </div>
        </motion.div>

        <motion.div className="card" {...cardAnim} transition={{ delay: 0.2 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>3-Month Trend</div>
          <div className="card-value">
            {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'} {Math.abs(trend.pct)}%
          </div>
          <div className={`card-change ${trend.direction === 'up' ? 'negative' : 'positive'}`}>
            Spending is {trend.direction === 'up' ? 'increasing' : trend.direction === 'down' ? 'decreasing' : 'stable'}
          </div>
        </motion.div>

        <motion.div className="card" {...cardAnim} transition={{ delay: 0.3 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>Spending Goal</div>
          <div className="card-value">₹<CountUp end={goal} /></div>
          <div className={`card-change ${isOverspending ? 'negative' : 'positive'}`}>
            {isOverspending ? `₹${(predicted - goal).toLocaleString('en-IN')} over` : `₹${(goal - predicted).toLocaleString('en-IN')} under`}
          </div>
        </motion.div>
      </div>

      {/* Forecast Chart */}
      <motion.div className="card" {...cardAnim} transition={{ delay: 0.4 }} style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">📊 Spend Forecast</div>
          <span className={`tag ${isOverspending ? 'tag-red' : 'tag-lime'}`}>
            {isOverspending ? 'Overspend Alert' : 'On Track'}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b6ff4b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#b6ff4b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#faad14" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#faad14" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#a0a0a0', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'IBM Plex Sans' }}
              labelStyle={{ color: '#f0f0f0' }}
              formatter={(v) => v ? [`₹${v.toLocaleString('en-IN')}`, ''] : ['-', '']}
            />
            <ReferenceLine y={goal} stroke="var(--red)" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#ff4d4f', fontSize: 11 }} />
            <Area type="monotone" dataKey="spend" stroke="#b6ff4b" fill="url(#spendGrad)" strokeWidth={2} dot={{ r: 4, fill: '#b6ff4b' }} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="#faad14" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: '#faad14' }} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#b6ff4b', borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Actual Spend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#faad14', borderRadius: 2, borderTop: '1px dashed #faad14' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Predicted</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, background: '#ff4d4f', borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--grey)' }}>Goal Limit</span>
          </div>
        </div>
      </motion.div>

      {/* Upcoming bills */}
      <motion.div className="card" {...cardAnim} transition={{ delay: 0.5 }}>
        <div className="card-header">
          <div className="card-title">📅 Upcoming Bills (Next 30 Days)</div>
        </div>
        {upcomingBills.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingBills.map((bill) => {
              const bDate = bill.nextBillingDate?.toDate ? bill.nextBillingDate.toDate() : new Date(bill.nextBillingDate);
              const daysLeft = Math.ceil((bDate - new Date()) / 86400000);
              return (
                <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{bill.serviceName}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--mono)', color: 'var(--grey2)' }}>
                      {bDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>₹{bill.monthlyCost}</div>
                    <span className={`tag ${daysLeft <= 3 ? 'tag-red' : daysLeft <= 7 ? 'tag-yellow' : 'tag-blue'}`} style={{ fontSize: '0.6rem' }}>
                      {daysLeft <= 0 ? 'Today' : `in ${daysLeft}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>No upcoming bills in the next 30 days. Add billing dates to your subscriptions.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

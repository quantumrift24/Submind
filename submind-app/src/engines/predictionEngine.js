/**
 * Submind Predictive Spending Engine
 * Forecasts future spend based on historical data.
 */

/**
 * Predict next month spend
 * PredictedSpend = average(last3Months) + trendAdjustment
 */
export function predictNextMonthSpend(monthlyHistory) {
  if (!monthlyHistory || monthlyHistory.length === 0) return 0;
  const last3 = monthlyHistory.slice(-3);
  const avg = last3.reduce((s, v) => s + v, 0) / last3.length;
  // Trend: difference between last two months
  const trend = last3.length >= 2 ? last3[last3.length - 1] - last3[last3.length - 2] : 0;
  const trendAdj = trend * 0.3;
  return Math.round(avg + trendAdj);
}

/**
 * Get 3-month trend info
 */
export function getSpendTrend(monthlyHistory) {
  if (!monthlyHistory || monthlyHistory.length < 2) return { direction: 'stable', pct: 0 };
  const prev = monthlyHistory[monthlyHistory.length - 2];
  const curr = monthlyHistory[monthlyHistory.length - 1];
  if (prev === 0) return { direction: 'stable', pct: 0 };
  const pct = ((curr - prev) / prev) * 100;
  return {
    direction: pct > 2 ? 'up' : pct < -2 ? 'down' : 'stable',
    pct: Math.round(pct * 10) / 10,
  };
}

/**
 * Detect overspending based on goal
 */
export function isOverspending(predicted, goal) {
  return predicted > goal;
}

/**
 * Get upcoming bills in next N days
 */
export function getUpcomingBills(subscriptions, daysAhead = 30) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  return subscriptions
    .filter(s => {
      if (s.status !== 'active' || !s.nextBillingDate) return false;
      const bDate = s.nextBillingDate.toDate ? s.nextBillingDate.toDate() : new Date(s.nextBillingDate);
      return bDate >= now && bDate <= cutoff;
    })
    .sort((a, b) => {
      const ad = a.nextBillingDate.toDate ? a.nextBillingDate.toDate() : new Date(a.nextBillingDate);
      const bd = b.nextBillingDate.toDate ? b.nextBillingDate.toDate() : new Date(b.nextBillingDate);
      return ad - bd;
    });
}

/**
 * Detect seasonal spikes
 */
export function detectSeasonalSpikes(monthlyHistory) {
  if (!monthlyHistory || monthlyHistory.length < 6) return [];
  const avg = monthlyHistory.reduce((s, v) => s + v, 0) / monthlyHistory.length;
  const spikes = [];
  monthlyHistory.forEach((val, idx) => {
    if (val > avg * 1.3) {
      spikes.push({ month: idx, amount: val, pctAbove: Math.round(((val - avg) / avg) * 100) });
    }
  });
  return spikes;
}

/**
 * Generate forecast data for charting
 */
export function generateForecastData(monthlyHistory, monthsAhead = 3) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const currentMonth = now.getMonth();

  const data = monthlyHistory.map((val, idx) => ({
    month: months[(currentMonth - monthlyHistory.length + idx + 1 + 12) % 12],
    spend: val,
    predicted: null,
  }));

  let forecasted = [...monthlyHistory];
  for (let i = 0; i < monthsAhead; i++) {
    const predicted = predictNextMonthSpend(forecasted);
    forecasted.push(predicted);
    data.push({
      month: months[(currentMonth + i + 1) % 12],
      spend: null,
      predicted,
    });
  }

  return data;
}

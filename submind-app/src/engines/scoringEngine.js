/**
 * Submind Scoring Engine
 * Calculates usage scores, waste scores, and generates recommendations.
 */

/**
 * Calculate Usage Score (0-100)
 * UsageScore = (loginFrequency * 0.4) + (recentActivity * 0.3) + (featureUsage * 0.3)
 */
export function calculateUsageScore(subscription) {
  const { loginFrequency = 50, recentActivity = 50, featureUsage = 50 } = subscription;
  const score = (loginFrequency * 0.4) + (recentActivity * 0.3) + (featureUsage * 0.3);
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate Waste Score (0-100)
 * WasteScore = (monthlyCost / (UsageScore + 1)) * inactivityFactor
 * Higher = more wasteful
 */
export function calculateWasteScore(subscription) {
  const usageScore = subscription.usageScore || calculateUsageScore(subscription);
  const monthlyCost = subscription.monthlyCost || 0;
  const inactivityFactor = usageScore < 20 ? 3 : usageScore < 40 ? 2 : usageScore < 60 ? 1.5 : 1;
  const raw = (monthlyCost / (usageScore + 1)) * inactivityFactor;
  // Normalize to 0-100
  const normalized = Math.min(100, Math.round((raw / 10) * 100));
  return Math.max(0, normalized);
}

/**
 * Get recommendation based on usage score
 */
export function getRecommendation(usageScore) {
  if (usageScore < 30) return { action: 'cancel', label: 'Cancel', color: '#ff4d4f', icon: '🚫' };
  if (usageScore < 60) return { action: 'downgrade', label: 'Downgrade', color: '#faad14', icon: '⚠️' };
  return { action: 'keep', label: 'Keep', color: '#b6ff4b', icon: '✓' };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score, isWaste = false) {
  if (isWaste) {
    if (score >= 70) return '#ff4d4f';
    if (score >= 40) return '#faad14';
    return '#b6ff4b';
  }
  if (score >= 70) return '#b6ff4b';
  if (score >= 40) return '#faad14';
  return '#ff4d4f';
}

/**
 * Calculate total monthly recurring spend
 */
export function totalMonthlySpend(subscriptions) {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthlyCost || 0), 0);
}

/**
 * Calculate total yearly spend
 */
export function totalYearlySpend(subscriptions) {
  return totalMonthlySpend(subscriptions) * 12;
}

/**
 * Calculate potential savings
 */
export function calculatePotentialSavings(subscriptions) {
  const cancelSavings = subscriptions
    .filter(s => s.status === 'active' && s.recommendation?.action === 'cancel')
    .reduce((sum, s) => sum + (s.monthlyCost || 0), 0);

  const downgradeSavings = subscriptions
    .filter(s => s.status === 'active' && s.recommendation?.action === 'downgrade')
    .reduce((sum, s) => sum + (s.monthlyCost || 0) * 0.4, 0);

  return {
    monthly: Math.round(cancelSavings + downgradeSavings),
    yearly: Math.round((cancelSavings + downgradeSavings) * 12),
    cancelCount: subscriptions.filter(s => s.recommendation?.action === 'cancel').length,
    downgradeCount: subscriptions.filter(s => s.recommendation?.action === 'downgrade').length,
  };
}

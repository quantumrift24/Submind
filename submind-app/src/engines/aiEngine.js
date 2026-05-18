/**
 * Submind AI API Placeholder
 * Provides mock AI responses for all AI features until real API is connected.
 */

const AI_API_URL = import.meta.env.VITE_AI_API_URL;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

/**
 * Generate a financial insight (placeholder)
 */
export async function generateInsight(subscriptionData) {
  // If API is configured, use real API
  if (AI_API_KEY && AI_API_KEY !== 'your-openai-key-here') {
    return callRealAPI('Generate a concise financial insight based on this subscription data: ' + JSON.stringify(subscriptionData));
  }
  // Placeholder responses
  const insights = [
    `You haven't used ${subscriptionData.serviceName} in ${Math.floor(Math.random() * 30 + 15)} days. Canceling it could save ₹${subscriptionData.monthlyCost}/month.`,
    `Your ${subscriptionData.serviceName} subscription costs ₹${subscriptionData.monthlyCost}/mo but you only use ${Math.floor(Math.random() * 30 + 5)}% of its features. Consider downgrading.`,
    `Alert: ${subscriptionData.serviceName} billing is in ${Math.floor(Math.random() * 5 + 1)} days. Usage has dropped ${Math.floor(Math.random() * 40 + 20)}% this month.`,
    `Smart move detected: Your ${subscriptionData.serviceName} usage increased. This subscription delivers strong value.`,
  ];
  await simulateDelay();
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Explain a waste score (placeholder)
 */
export async function explainWasteScore(subscription) {
  await simulateDelay();
  const { serviceName, wasteScore, usageScore, monthlyCost } = subscription;
  if (wasteScore > 70) {
    return `${serviceName} has a waste score of ${wasteScore}/100. You're paying ₹${monthlyCost}/mo but only actively using it ${usageScore}% of the time. This is a high-waste subscription — consider canceling to save ₹${monthlyCost * 12}/year.`;
  }
  if (wasteScore > 40) {
    return `${serviceName} scores ${wasteScore}/100 on waste. At ₹${monthlyCost}/mo with ${usageScore}% usage, there may be a cheaper plan that fits your actual needs. A downgrade could save ~₹${Math.round(monthlyCost * 0.4)}/mo.`;
  }
  return `${serviceName} has a low waste score of ${wasteScore}/100. You're getting good value from this subscription at ₹${monthlyCost}/mo with ${usageScore}% usage rate. Keep it.`;
}

/**
 * Get cancellation recommendation (placeholder)
 */
export async function suggestCancellations(subscriptions) {
  await simulateDelay();
  const toCancel = subscriptions.filter(s => s.usageScore < 30 && s.status === 'active');
  if (toCancel.length === 0) return "All your subscriptions show healthy usage. No cancellations recommended right now.";
  const totalSave = toCancel.reduce((s, sub) => s + sub.monthlyCost, 0);
  const names = toCancel.map(s => s.serviceName).join(', ');
  return `I recommend canceling: ${names}. Combined, these unused subscriptions cost you ₹${totalSave}/month (₹${totalSave * 12}/year). None of them have been actively used in the past 30 days.`;
}

/**
 * Draft a cancellation email (placeholder)
 */
export async function draftCancellationEmail(subscription) {
  await simulateDelay();
  return `Subject: Cancellation Request — ${subscription.serviceName} Subscription

Dear ${subscription.serviceName} Support Team,

I am writing to request the cancellation of my subscription effective immediately.

Account Email: [Your Email]
Subscription Plan: ${subscription.category || 'Standard'}
Monthly Cost: ₹${subscription.monthlyCost}

Please confirm the cancellation and ensure no further charges are applied to my account. If there is a remaining balance or refund due, please process it accordingly.

Thank you for your assistance.

Best regards,
[Your Name]`;
}

/**
 * Draft a refund request email (placeholder)
 */
export async function draftRefundEmail(subscription) {
  await simulateDelay();
  return `Subject: Refund Request — ${subscription.serviceName}

Dear ${subscription.serviceName} Billing Team,

I would like to request a refund for my recent charge of ₹${subscription.monthlyCost} on my ${subscription.serviceName} subscription.

Reason: I have not actively used the service during the most recent billing period, and I believe this charge was made in error / the service did not meet expectations.

Account Email: [Your Email]
Charge Amount: ₹${subscription.monthlyCost}
Billing Date: ${subscription.nextBillingDate || 'Recent'}

I would appreciate a prompt refund to my original payment method.

Thank you,
[Your Name]`;
}

/**
 * Chat assistant response (placeholder)
 */
export async function getChatResponse(message, context = {}) {
  // If real API configured, use it
  if (AI_API_KEY && AI_API_KEY !== 'your-openai-key-here') {
    return callRealAPI(message, context);
  }

  await simulateDelay(800);
  const lower = message.toLowerCase();
  const { subscriptions = [], totalSpend = 0, potentialSavings = 0 } = context;

  if (lower.includes('cancel')) {
    const toCancel = subscriptions.filter(s => s.usageScore < 30);
    if (toCancel.length > 0) {
      return `Based on your usage data, I'd recommend canceling: ${toCancel.map(s => `**${s.serviceName}** (₹${s.monthlyCost}/mo, ${s.usageScore}% usage)`).join(', ')}. This would save you **₹${toCancel.reduce((s, sub) => s + sub.monthlyCost, 0)}/month**.`;
    }
    return "All your subscriptions show healthy usage patterns right now. No cancellations recommended. I'll alert you if anything changes.";
  }

  if (lower.includes('waste') || lower.includes('wasting')) {
    const wasteful = subscriptions.filter(s => s.wasteScore > 60).sort((a, b) => b.wasteScore - a.wasteScore);
    if (wasteful.length > 0) {
      return `Your highest waste subscriptions are:\n${wasteful.slice(0, 3).map((s, i) => `${i + 1}. **${s.serviceName}** — Waste Score: ${s.wasteScore}/100, costing ₹${s.monthlyCost}/mo`).join('\n')}\n\nConsider canceling or downgrading these to optimize your spend.`;
    }
    return "Great news! None of your current subscriptions show significant waste. You're managing your money well.";
  }

  if (lower.includes('save') || lower.includes('savings')) {
    return `Based on your current subscriptions, you could potentially save **₹${potentialSavings}/month** by canceling unused services and downgrading underutilized ones. That's **₹${potentialSavings * 12}/year** back in your pocket.`;
  }

  if (lower.includes('bill') || lower.includes('upcoming') || lower.includes('next month')) {
    return `Your total monthly recurring spend is **₹${totalSpend}**. You have ${subscriptions.filter(s => s.status === 'active').length} active subscriptions. I'll notify you 3 days before each billing date so you can review.`;
  }

  if (lower.includes('highest') || lower.includes('most expensive')) {
    const sorted = [...subscriptions].sort((a, b) => b.monthlyCost - a.monthlyCost);
    if (sorted.length > 0) {
      return `Your most expensive subscriptions:\n${sorted.slice(0, 3).map((s, i) => `${i + 1}. **${s.serviceName}** — ₹${s.monthlyCost}/mo (Usage: ${s.usageScore}%)`).join('\n')}`;
    }
    return "You don't have any subscriptions added yet. Add some to get started!";
  }

  // Default
  const defaults = [
    `I'm analyzing your financial data. You currently spend **₹${totalSpend}/month** across ${subscriptions.length} subscriptions, with potential savings of **₹${potentialSavings}/month**.`,
    "I can help you with:\n• What should I cancel?\n• Where am I wasting money?\n• How much can I save?\n• What bills are coming next month?\n• What's my highest waste subscription?",
    `Your financial health is looking good. Keep an eye on subscriptions with usage below 30% — those are prime candidates for optimization.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/**
 * Real API call (when key is configured)
 */
async function callRealAPI(prompt, context = {}) {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are Submind, an autonomous AI finance assistant. You help users optimize their recurring spend, detect waste, and save money. Be concise, data-driven, and actionable. Use ₹ for currency.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm processing your request. Please try again.";
  } catch {
    return "AI API is currently unavailable. Using local intelligence instead.";
  }
}

function simulateDelay(ms = 600) {
  return new Promise(r => setTimeout(r, ms + Math.random() * 400));
}

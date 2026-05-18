import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { calculateUsageScore, calculateWasteScore, getRecommendation } from '../engines/scoringEngine';
import { supabase } from '../supabase';

const DataContext = createContext(null);

// ── DEMO SEED DATA ──
const DEMO_SUBSCRIPTIONS = [
  { id: 's1', serviceName: 'Netflix', category: 'Entertainment', monthlyCost: 649, billingCycle: 'monthly', status: 'active', loginFrequency: 85, recentActivity: 90, featureUsage: 80, nextBillingDate: futureDate(3), createdAt: new Date() },
  { id: 's2', serviceName: 'Spotify', category: 'Entertainment', monthlyCost: 119, billingCycle: 'monthly', status: 'active', loginFrequency: 95, recentActivity: 95, featureUsage: 90, nextBillingDate: futureDate(12), createdAt: new Date() },
  { id: 's3', serviceName: 'ChatGPT Plus', category: 'Cloud/SaaS', monthlyCost: 1650, billingCycle: 'monthly', status: 'active', loginFrequency: 60, recentActivity: 40, featureUsage: 50, nextBillingDate: futureDate(8), createdAt: new Date() },
  { id: 's4', serviceName: 'Canva', category: 'Productivity', monthlyCost: 499, billingCycle: 'monthly', status: 'active', loginFrequency: 10, recentActivity: 5, featureUsage: 8, nextBillingDate: futureDate(15), createdAt: new Date() },
  { id: 's5', serviceName: 'Adobe Creative Cloud', category: 'Productivity', monthlyCost: 4230, billingCycle: 'monthly', status: 'active', loginFrequency: 15, recentActivity: 12, featureUsage: 10, nextBillingDate: futureDate(5), createdAt: new Date() },
  { id: 's6', serviceName: 'Notion', category: 'Productivity', monthlyCost: 820, billingCycle: 'monthly', status: 'active', loginFrequency: 55, recentActivity: 40, featureUsage: 35, nextBillingDate: futureDate(20), createdAt: new Date() },
  { id: 's7', serviceName: 'YouTube Premium', category: 'Entertainment', monthlyCost: 129, billingCycle: 'monthly', status: 'active', loginFrequency: 85, recentActivity: 90, featureUsage: 70, nextBillingDate: futureDate(9), createdAt: new Date() },
  { id: 's8', serviceName: 'Gym Membership', category: 'Health', monthlyCost: 2500, billingCycle: 'monthly', status: 'active', loginFrequency: 20, recentActivity: 15, featureUsage: 18, nextBillingDate: futureDate(1), createdAt: new Date() },
  { id: 's9', serviceName: 'Figma', category: 'Productivity', monthlyCost: 1200, billingCycle: 'monthly', status: 'active', loginFrequency: 25, recentActivity: 18, featureUsage: 12, nextBillingDate: futureDate(22), createdAt: new Date() },
  { id: 's10', serviceName: 'Amazon Prime', category: 'Entertainment', monthlyCost: 299, billingCycle: 'monthly', status: 'active', loginFrequency: 70, recentActivity: 65, featureUsage: 80, nextBillingDate: futureDate(18), createdAt: new Date() },
].map(s => {
  s.usageScore = calculateUsageScore(s);
  s.wasteScore = calculateWasteScore(s);
  s.recommendation = getRecommendation(s.usageScore);
  return s;
});

const DEMO_NOTIFICATIONS = [
  { id: 'n1', message: 'You haven\'t used Canva in 42 days.', read: false, type: 'warning', createdAt: new Date(Date.now() - 30 * 60000) },
  { id: 'n2', message: 'Duplicate music subscriptions detected (Spotify & Apple Music).', read: false, type: 'danger', createdAt: new Date(Date.now() - 2 * 3600000) },
  { id: 'n3', message: 'Switching Spotify Family could save ₹240/month.', read: false, type: 'info', createdAt: new Date(Date.now() - 5 * 3600000) },
  { id: 'n4', message: 'Netflix billing due in 3 days.', read: true, type: 'warning', createdAt: new Date(Date.now() - 24 * 3600000) },
  { id: 'n5', message: 'Submind recovered ₹1,499 from a failed charge.', read: true, type: 'success', createdAt: new Date(Date.now() - 48 * 3600000) },
];

const DEMO_SAVINGS_HISTORY = [
  { id: 'h1', amountSaved: 1499, actionTaken: 'Recovered failed charge from Adobe', date: new Date(Date.now() - 2 * 86400000) },
  { id: 'h2', amountSaved: 499, actionTaken: 'Auto-cancelled unused Canva plan', date: new Date(Date.now() - 12 * 86400000) },
  { id: 'h3', amountSaved: 2282, actionTaken: 'Downgraded Dropbox to Basic', date: new Date(Date.now() - 15 * 86400000) },
];

const DEMO_AUTOMATION_LOGS = [
  { id: 'a1', action: 'Scanned 10 subscriptions for waste', status: 'success', timestamp: new Date(Date.now() - 15 * 60000) },
  { id: 'a2', action: 'Generated savings report — ₹4,280 potential', status: 'success', timestamp: new Date(Date.now() - 3600000) },
  { id: 'a3', action: 'Drafted refund request for Adobe CC', status: 'pending', timestamp: new Date(Date.now() - 24 * 3600000) },
];

function futureDate(days) { return new Date(Date.now() + days * 86400000); }

const initialState = {
  subscriptions: [],
  insights: [],
  savingsHistory: [],
  notifications: [],
  automationLogs: [],
  accounts: [],
  loading: true,
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_SUBSCRIPTIONS': return { ...state, subscriptions: action.payload };
    case 'SET_INSIGHTS': return { ...state, insights: action.payload };
    case 'SET_SAVINGS_HISTORY': return { ...state, savingsHistory: action.payload };
    case 'SET_NOTIFICATIONS': return { ...state, notifications: action.payload };
    case 'SET_AUTOMATION_LOGS': return { ...state, automationLogs: action.payload };
    case 'SET_ACCOUNTS': return { ...state, accounts: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, isDemoMode } = useAuth();
  const idCounter = useRef(100);

  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    if (isDemoMode) {
      // Load demo data
      const storedSubs = localStorage.getItem('submind_subs');
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: storedSubs ? JSON.parse(storedSubs) : DEMO_SUBSCRIPTIONS });
      
      const storedNotifs = localStorage.getItem('submind_notifs');
      dispatch({ type: 'SET_NOTIFICATIONS', payload: storedNotifs ? JSON.parse(storedNotifs) : DEMO_NOTIFICATIONS });
      
      const storedHistory = localStorage.getItem('submind_history');
      dispatch({ type: 'SET_SAVINGS_HISTORY', payload: storedHistory ? JSON.parse(storedHistory) : DEMO_SAVINGS_HISTORY });
      
      const storedLogs = localStorage.getItem('submind_logs');
      dispatch({ type: 'SET_AUTOMATION_LOGS', payload: storedLogs ? JSON.parse(storedLogs) : DEMO_AUTOMATION_LOGS });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Real Supabase fetch
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const { data: subsData } = await supabase.from('subscriptions').select('*').eq('userId', user.uid);
        if (subsData && isSubscribed) {
          const subs = subsData.map(s => {
            // Need to parse string dates back to Date objects for our logic
            if (s.createdAt) s.createdAt = new Date(s.createdAt);
            if (s.nextBillingDate) s.nextBillingDate = new Date(s.nextBillingDate);
            
            s.usageScore = calculateUsageScore(s);
            s.wasteScore = calculateWasteScore(s);
            s.recommendation = getRecommendation(s.usageScore);
            return s;
          });
          dispatch({ type: 'SET_SUBSCRIPTIONS', payload: subs });
        }

        const { data: notifsData } = await supabase.from('notifications').select('*').eq('userId', user.uid).order('createdAt', { ascending: false });
        if (notifsData && isSubscribed) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: notifsData.map(n => ({...n, createdAt: new Date(n.createdAt)})) });
        }

        const { data: historyData } = await supabase.from('savingsHistory').select('*').eq('userId', user.uid).order('date', { ascending: false });
        if (historyData && isSubscribed) {
          dispatch({ type: 'SET_SAVINGS_HISTORY', payload: historyData.map(h => ({...h, date: new Date(h.date)})) });
        }

        const { data: logsData } = await supabase.from('automationLogs').select('*').eq('userId', user.uid).order('timestamp', { ascending: false });
        if (logsData && isSubscribed) {
          dispatch({ type: 'SET_AUTOMATION_LOGS', payload: logsData.map(l => ({...l, timestamp: new Date(l.timestamp)})) });
        }
        
        if (isSubscribed) dispatch({ type: 'SET_LOADING', payload: false });
      } catch (e) {
        console.error("Supabase fetch error:", e);
        if (isSubscribed) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [user?.uid, isDemoMode]);

  // ── CRUD Operations (demo-compatible) ──

  const addSubscription = useCallback(async (data) => {
    const newId = `s${Date.now()}`;
    const newSub = { ...data, status: 'active', createdAt: new Date() };

    newSub.id = newId;
    newSub.usageScore = calculateUsageScore(newSub);
    newSub.wasteScore = calculateWasteScore(newSub);
    newSub.recommendation = getRecommendation(newSub.usageScore);
    
    const updated = [newSub, ...state.subscriptions];
    dispatch({ type: 'SET_SUBSCRIPTIONS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_subs', JSON.stringify(updated));
    } else {
      await supabase.from('subscriptions').insert([{ 
        id: newId, userId: user.uid, ...data, status: 'active', 
        createdAt: new Date().toISOString() 
      }]);
    }

    // Auto-notification
    const notif = { id: `n${Date.now()}`, message: `Added ${data.serviceName} — ₹${data.monthlyCost}/mo`, read: false, type: 'info', createdAt: new Date() };
    const updatedNotifs = [notif, ...state.notifications];
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifs });
    
    if (isDemoMode) {
      localStorage.setItem('submind_notifs', JSON.stringify(updatedNotifs));
    } else {
      await supabase.from('notifications').insert([{ 
        ...notif, userId: user.uid, createdAt: notif.createdAt.toISOString() 
      }]);
    }
  }, [user?.uid, state.subscriptions, state.notifications, isDemoMode]);

  const updateSubscription = useCallback(async (id, data) => {
    const updated = state.subscriptions.map(s => {
      if (s.id !== id) return s;
      const merged = { ...s, ...data };
      merged.usageScore = calculateUsageScore(merged);
      merged.wasteScore = calculateWasteScore(merged);
      merged.recommendation = getRecommendation(merged.usageScore);
      return merged;
    });
    dispatch({ type: 'SET_SUBSCRIPTIONS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_subs', JSON.stringify(updated));
    } else {
      await supabase.from('subscriptions').update(data).eq('id', id);
    }
  }, [state.subscriptions, user?.uid, isDemoMode]);

  const deleteSubscription = useCallback(async (id) => {
    const sub = state.subscriptions.find(s => s.id === id);
    const updated = state.subscriptions.filter(s => s.id !== id);
    dispatch({ type: 'SET_SUBSCRIPTIONS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_subs', JSON.stringify(updated));
    } else {
      await supabase.from('subscriptions').delete().eq('id', id);
    }

    if (sub) {
      const notif = { id: `n${Date.now()}`, message: `Removed ${sub.serviceName} — saving ₹${sub.monthlyCost}/mo`, read: false, type: 'success', createdAt: new Date() };
      const saving = { id: `h${Date.now()}`, amountSaved: sub.monthlyCost, actionTaken: `Cancelled ${sub.serviceName}`, date: new Date() };
      
      const updatedNotifs = [notif, ...state.notifications];
      const updatedHistory = [saving, ...state.savingsHistory];
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifs });
      dispatch({ type: 'SET_SAVINGS_HISTORY', payload: updatedHistory });
      
      if (isDemoMode) {
        localStorage.setItem('submind_notifs', JSON.stringify(updatedNotifs));
        localStorage.setItem('submind_history', JSON.stringify(updatedHistory));
      } else {
        await supabase.from('notifications').insert([{ ...notif, userId: user.uid, createdAt: notif.createdAt.toISOString() }]);
        await supabase.from('savingsHistory').insert([{ ...saving, userId: user.uid, date: saving.date.toISOString() }]);
      }
    }
  }, [state.subscriptions, state.notifications, state.savingsHistory, user?.uid, isDemoMode]);

  const markNotificationRead = useCallback(async (id) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_notifs', JSON.stringify(updated));
    } else {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  }, [state.notifications, user?.uid, isDemoMode]);

  const dismissNotification = useCallback(async (id) => {
    const updated = state.notifications.filter(n => n.id !== id);
    dispatch({ type: 'SET_NOTIFICATIONS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_notifs', JSON.stringify(updated));
    } else {
      await supabase.from('notifications').delete().eq('id', id);
    }
  }, [state.notifications, user?.uid, isDemoMode]);

  const clearAllNotifications = useCallback(async () => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });

    if (isDemoMode) {
      localStorage.setItem('submind_notifs', JSON.stringify([]));
    } else {
      await supabase.from('notifications').delete().eq('userId', user.uid);
    }
  }, [state.notifications, user?.uid, isDemoMode]);

  const logAutomation = useCallback(async (action, status) => {
    const log = { id: `a${Date.now()}`, action, status, timestamp: new Date() };
    const updated = [log, ...state.automationLogs];
    dispatch({ type: 'SET_AUTOMATION_LOGS', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_logs', JSON.stringify(updated));
    } else {
      await supabase.from('automationLogs').insert([{ ...log, userId: user.uid, timestamp: log.timestamp.toISOString() }]);
    }
  }, [state.automationLogs, user?.uid, isDemoMode]);

  const addSavingsRecord = useCallback(async (amount, actionTaken) => {
    const record = { id: `h${Date.now()}`, amountSaved: amount, actionTaken, date: new Date() };
    const updated = [record, ...state.savingsHistory];
    dispatch({ type: 'SET_SAVINGS_HISTORY', payload: updated });

    if (isDemoMode) {
      localStorage.setItem('submind_history', JSON.stringify(updated));
    } else {
      await supabase.from('savingsHistory').insert([{ ...record, userId: user.uid, date: record.date.toISOString() }]);
    }
  }, [state.savingsHistory, user?.uid, isDemoMode]);

  const value = {
    ...state,
    addSubscription, updateSubscription, deleteSubscription,
    markNotificationRead, dismissNotification, clearAllNotifications,
    logAutomation, addSavingsRecord,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

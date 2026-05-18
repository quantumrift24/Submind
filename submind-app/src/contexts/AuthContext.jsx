import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

// ── Check if Supabase is properly configured ──
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && key.length > 10;
};

const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@submind.ai',
  displayName: 'Demo User',
  photoURL: null,
  name: 'Demo User',
  savingsGoal: 20000,
  automationEnabled: true,
  onboardingComplete: true,
  spendingRange: '15k-50k',
  goal: 'automate',
  primaryServices: ['netflix', 'spotify', 'chatgpt', 'canva', 'notion'],
  preferences: {
    notifications: true,
    autoCancel: false,
    refundAssistance: true,
    aiSensitivity: 'balanced',
    budgetAlerts: true,
    weeklyReports: false,
    aiNegotiation: false,
  },
  createdAt: new Date(),
};

const initialState = {
  user: null,
  loading: true,
  error: null,
  onboardingComplete: false,
  isDemoMode: localStorage.getItem('submind_force_demo') === 'true' || !isSupabaseConfigured(),
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ONBOARDING':
      return { ...state, onboardingComplete: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'FORCE_DEMO_WITH_USER':
      // Atomic: set isDemoMode + user + loading:false all at once — no race condition
      return {
        ...state,
        isDemoMode: true,
        user: action.payload.user,
        onboardingComplete: action.payload.onboardingComplete,
        loading: false,
        error: null,
      };
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Track whether forceDemoMode set the user already so the effect doesn't overwrite it
  const bypassActiveRef = useRef(false);

  useEffect(() => {
    // If bypass just set everything atomically, skip this effect run
    if (bypassActiveRef.current) {
      bypassActiveRef.current = false;
      return;
    }

    if (state.isDemoMode) {
      const stored = localStorage.getItem('submind_demo_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_ONBOARDING', payload: !!user.onboardingComplete });
        } catch {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      return;
    }

    // Real Supabase mode
    let isSubscribed = true;

    const fetchUserDoc = async (sessionUser) => {
      try {
        const { data: userData, error } = await supabase.from('users').select('*').eq('id', sessionUser.id).single();
        if (!isSubscribed) return;
        if (error) {
           console.error("Error fetching user doc:", error);
           dispatch({
             type: 'SET_USER',
             payload: { uid: sessionUser.id, email: sessionUser.email, displayName: sessionUser.user_metadata?.name || sessionUser.email.split('@')[0], photoURL: null },
           });
           dispatch({ type: 'SET_ONBOARDING', payload: false });
        } else {
           dispatch({
             type: 'SET_USER',
             payload: { uid: sessionUser.id, email: sessionUser.email, displayName: userData.name || sessionUser.user_metadata?.name, photoURL: null, ...userData },
           });
           dispatch({ type: 'SET_ONBOARDING', payload: userData?.onboardingComplete || false });
        }
      } catch (err) {
        if (!isSubscribed) return;
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session error:", error);
        if (isSubscribed) {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        return;
      }
      
      const session = data?.session;
      if (session?.user && isSubscribed) {
        fetchUserDoc(session.user);
      } else if (isSubscribed) {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }).catch(err => {
      console.error("GetSession catch error:", err);
      if (isSubscribed) {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isSubscribed) return;
      if (session?.user) {
        fetchUserDoc(session.user);
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [state.isDemoMode]);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    if (state.isDemoMode) {
      await fakePause();
      const user = { ...DEMO_USER };
      localStorage.setItem('submind_demo_user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ONBOARDING', payload: true });
      return user;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
    return data.user;
  }, [state.isDemoMode]);

  const signup = useCallback(async (email, password, displayName) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    if (state.isDemoMode) {
      await fakePause();
      const user = { ...DEMO_USER, onboardingComplete: false };
      localStorage.setItem('submind_demo_user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ONBOARDING', payload: false });
      return user;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name: displayName } }
    });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
    
    if (!data.session && data.user) {
      // Supabase requires email confirmation
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: "Please check your email for a confirmation link." });
      throw new Error("Email confirmation required");
    }
    
    if (data?.user) {
       await supabase.from('users').insert([{
         id: data.user.id,
         name: displayName, email, savingsGoal: 0, automationEnabled: false,
         onboardingComplete: false,
         preferences: { notifications: true, autoCancel: false, refundAssistance: false, aiSensitivity: 'balanced' },
       }]);
    }
    return data.user;
  }, [state.isDemoMode]);

  const loginWithGoogle = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    if (state.isDemoMode) {
      await fakePause();
      const user = { ...DEMO_USER };
      localStorage.setItem('submind_demo_user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ONBOARDING', payload: true });
      return user;
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
    return data.user;
  }, [state.isDemoMode]);

  const logout = useCallback(async () => {
    if (state.isDemoMode) {
      localStorage.removeItem('submind_demo_user');
      localStorage.removeItem('submind_force_demo');
      dispatch({ type: 'SET_DEMO_MODE', payload: !isSupabaseConfigured() });
      dispatch({ type: 'SET_USER', payload: null });
      return;
    }
    await supabase.auth.signOut();
    dispatch({ type: 'SET_USER', payload: null });
  }, [state.isDemoMode]);

  const resetPassword = useCallback(async (email) => {
    if (state.isDemoMode) {
      await fakePause();
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state.isDemoMode]);

  const updateUser = useCallback((updates) => {
    if (state.user) {
      const updated = { ...state.user, ...updates };
      if (state.isDemoMode) {
        localStorage.setItem('submind_demo_user', JSON.stringify(updated));
      }
      dispatch({ type: 'SET_USER', payload: updated });
    }
  }, [state.isDemoMode, state.user]);

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  // forceDemoMode uses an ATOMIC dispatch to avoid the race condition
  // where changing isDemoMode re-triggers the useEffect and overwrites the user
  const forceDemoMode = useCallback(async (customData = {}) => {
    const user = { ...DEMO_USER, onboardingComplete: false, ...customData };
    localStorage.setItem('submind_demo_user', JSON.stringify(user));
    localStorage.setItem('submind_force_demo', 'true');
    // Mark bypass as active so the useEffect skips its next run
    bypassActiveRef.current = true;
    // Single atomic dispatch — sets isDemoMode + user + loading:false all at once
    dispatch({
      type: 'FORCE_DEMO_WITH_USER',
      payload: { user, onboardingComplete: false },
    });
    return user;
  }, []);

  const value = { ...state, login, signup, loginWithGoogle, logout, resetPassword, clearError, updateUser, forceDemoMode, dispatch };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function fakePause(ms = 600) { return new Promise(r => setTimeout(r, ms + Math.random() * 300)); }

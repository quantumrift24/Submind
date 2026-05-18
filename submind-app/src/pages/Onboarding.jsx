import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: "What's your name?",
    subtitle: 'Let us personalize your experience.',
    type: 'text',
    field: 'name',
    placeholder: 'Your full name',
  },
  {
    title: 'What is your total monthly budget?',
    subtitle: 'Type the exact amount you plan to spend per month.',
    type: 'number',
    field: 'budgetAmount',
    placeholder: 'e.g. 50000',
  },
  {
    title: 'Monthly spending range?',
    subtitle: 'This helps us calibrate your savings targets.',
    type: 'options',
    field: 'spendingRange',
    options: [
      { icon: '💰', label: 'Under ₹5K', value: 'under-5k' },
      { icon: '💳', label: '₹5K – ₹15K', value: '5k-15k' },
      { icon: '🏦', label: '₹15K – ₹50K', value: '15k-50k' },
      { icon: '🚀', label: '₹50K+', value: '50k-plus' },
    ],
  },
  {
    title: 'What is your main goal?',
    subtitle: 'We optimize for what matters to you.',
    type: 'options',
    field: 'goal',
    options: [
      { icon: '🎯', label: 'Cut waste', value: 'cut-waste' },
      { icon: '📊', label: 'Track spending', value: 'track' },
      { icon: '🤖', label: 'Automate savings', value: 'automate' },
      { icon: '🔍', label: 'Find refunds', value: 'refunds' },
    ],
  },
  {
    title: 'Enable automation?',
    subtitle: 'Let Submind act on your behalf — cancel, downgrade, and recover.',
    type: 'options',
    field: 'automationEnabled',
    options: [
      { icon: '⚡', label: 'Yes, fully automate', value: true },
      { icon: '🛡️', label: 'No, recommend only', value: false },
    ],
  },
  {
    title: 'Services you use most?',
    subtitle: 'Select all that apply. This helps us detect your subscriptions.',
    type: 'multi',
    field: 'primaryServices',
    options: [
      { icon: '🎬', label: 'Netflix', value: 'netflix' },
      { icon: '🎵', label: 'Spotify', value: 'spotify' },
      { icon: '🎨', label: 'Canva', value: 'canva' },
      { icon: '📐', label: 'Adobe', value: 'adobe' },
      { icon: '📝', label: 'Notion', value: 'notion' },
      { icon: '🤖', label: 'ChatGPT', value: 'chatgpt' },
      { icon: '💪', label: 'Gym', value: 'gym' },
      { icon: '☁️', label: 'Cloud/SaaS', value: 'cloud' },
    ],
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    budgetAmount: '',
    spendingRange: '',
    goal: '',
    automationEnabled: false,
    primaryServices: [],
  });
  const { user, dispatch, updateUser, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const current = STEPS[step];

  const handleSelect = (value) => {
    if (current.type === 'multi') {
      setData((prev) => ({
        ...prev,
        [current.field]: prev[current.field].includes(value)
          ? prev[current.field].filter((v) => v !== value)
          : [...prev[current.field], value],
      }));
    } else {
      setData((prev) => ({ ...prev, [current.field]: value }));
    }
  };

  const canProceed = () => {
    const val = data[current.field];
    if (current.type === 'text') return val.trim().length > 0;
    if (current.type === 'multi') return val.length > 0;
    return val !== '' && val !== null && val !== undefined;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      if (isDemoMode) {
        updateUser({
          name: data.name,
          spendingRange: data.spendingRange,
          goal: data.goal,
          automationEnabled: data.automationEnabled,
          primaryServices: data.primaryServices,
          onboardingComplete: true
        });
        dispatch({ type: 'SET_ONBOARDING', payload: true });
        navigate('/app');
        return;
      }
      
      // Save to Firestore
      try {
        await supabase.from('users').update({
          name: data.name,
          monthlyBudget: Number(data.budgetAmount) || 0,
          spendingRange: data.spendingRange,
          goal: data.goal,
          automationEnabled: data.automationEnabled,
          primaryServices: data.primaryServices,
          onboardingComplete: true,
        }).eq('id', user.uid);
        updateUser({
          name: data.name,
          monthlyBudget: Number(data.budgetAmount) || 0,
          spendingRange: data.spendingRange,
          goal: data.goal,
          automationEnabled: data.automationEnabled,
          primaryServices: data.primaryServices,
          onboardingComplete: true
        });
        dispatch({ type: 'SET_ONBOARDING', payload: true });
        navigate('/app');
      } catch (err) {
        console.error('Onboarding save error:', err);
        // Fallback to navigate anyway if it fails
        updateUser({
          name: data.name,
          onboardingComplete: true
        });
        dispatch({ type: 'SET_ONBOARDING', payload: true });
        navigate('/app');
      }
    }
  };

  return (
    <div className="onboarding-layout">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress */}
        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-step"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h2>{current.title}</h2>
            <p>{current.subtitle}</p>

            {(current.type === 'text' || current.type === 'number') && (
              <div className="form-group">
                <input
                  type={current.type}
                  className="form-input"
                  placeholder={current.placeholder}
                  value={data[current.field]}
                  onChange={(e) => setData({ ...data, [current.field]: e.target.value })}
                  autoFocus
                />
              </div>
            )}

            {(current.type === 'options' || current.type === 'multi') && (
              <div className="onboarding-options">
                {current.options.map((opt) => {
                  const isSelected = current.type === 'multi'
                    ? data[current.field].includes(opt.value)
                    : data[current.field] === opt.value;
                  return (
                    <div
                      key={String(opt.value)}
                      className={`onboarding-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <span className="onboarding-option-icon">{opt.icon}</span>
                      {opt.label}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="onboarding-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                style={{ width: 'auto' }}
              >
                Back
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleNext}
                disabled={!canProceed()}
                style={{ width: 'auto', padding: '10px 32px' }}
              >
                {step === STEPS.length - 1 ? 'Launch Submind →' : 'Continue →'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

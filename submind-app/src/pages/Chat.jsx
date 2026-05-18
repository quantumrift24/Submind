import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { totalMonthlySpend, calculatePotentialSavings } from '../engines/scoringEngine';
import { getChatResponse } from '../engines/aiEngine';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "What should I cancel?",
  "Where am I wasting money?",
  "How much can I save?",
  "What's my highest waste subscription?",
  "What bills are coming next month?"
];

export default function Chat() {
  const { user } = useAuth();
  const { subscriptions } = useData();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: `Hi ${user?.displayName?.split(' ')[0] || 'there'}. I'm Submind, your autonomous finance brain. How can I help you optimize your money today?`, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const context = useMemo(() => ({
    subscriptions,
    totalSpend: totalMonthlySpend(subscriptions),
    potentialSavings: calculatePotentialSavings(subscriptions).monthly
  }), [subscriptions]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getChatResponse(text, context);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: response, time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'error', role: 'ai', text: "Sorry, I'm having trouble processing that right now.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatText = (text) => {
    // Basic markdown bold parsing for **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--white)' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-icon">🤖</div>
        <div>
          <div style={{ fontWeight: 600 }}>Submind Assistant</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--lime)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)' }} /> Online
          </div>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className={`chat-msg ${msg.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="chat-msg-bubble">
                {msg.role === 'ai' ? formatText(msg.text) : msg.text}
              </div>
              <div className="chat-msg-time">
                {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div className="chat-msg ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="chat-suggestions">
        {SUGGESTIONS.map(sug => (
          <button key={sug} className="chat-suggestion-chip" onClick={() => handleSend(sug)} disabled={loading}>
            {sug}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask Submind anything about your money..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}

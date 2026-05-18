import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import NotificationPanel from '../components/NotificationPanel';
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/app', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/app/subscriptions', icon: '💳', label: 'Subscriptions' },
  { to: '/app/savings', icon: '💰', label: 'Savings' },
  { to: '/app/predictions', icon: '📈', label: 'Predictions' },
  { to: '/app/chat', icon: '🤖', label: 'AI Assistant' },
  { to: '/app/automation', icon: '⚡', label: 'Automation' },
  { to: '/app/profile', icon: '👤', label: 'Profile' },
];

const PAGE_TITLES = {
  '/app': 'Dashboard',
  '/app/subscriptions': 'Subscriptions',
  '/app/savings': 'Savings',
  '/app/predictions': 'Predictions',
  '/app/chat': 'AI Assistant',
  '/app/automation': 'Automation',
  '/app/profile': 'Profile & Settings',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[location.pathname] || 'Submind';

  const initials = user?.name || user?.displayName
    ? (user.name || user.displayName).split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'S';

  return (
    <div className="app-layout">
      <AnimatedBackground />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Link to="/app" className="sidebar-logo" style={{ textDecoration: 'none', display: 'block' }}>
          <span>Sub</span>mind
          <div style={{ fontSize: '0.55rem', fontFamily: 'var(--mono)', color: 'var(--grey2)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
            Autonomous Finance
          </div>
        </Link>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map((item, idx) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <motion.span
                className="sidebar-link-icon"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {item.icon}
              </motion.span>
              {item.label}
              {item.label === 'AI Assistant' && (
                <span className="tag tag-lime" style={{ marginLeft: 'auto', fontSize: '0.55rem', padding: '2px 7px' }}>AI</span>
              )}
              {item.label === 'Subscriptions' && unreadCount > 0 && (
                <span className="sidebar-link-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 16 }}>System</div>
          <div className="sidebar-link" style={{ color: 'var(--grey2)', fontSize: '0.78rem', cursor: 'default' }}>
            <span className="sidebar-link-icon" style={{ fontSize: '0.8rem' }}>🟢</span>
            System Active
          </div>
        </nav>

        <div className="sidebar-footer">
          <motion.div
            className="sidebar-user"
            onClick={logout}
            title="Click to sign out"
            whileHover={{ background: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || user?.displayName || 'User'}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--grey2)' }}>⏻</span>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <motion.div
              className="topbar-title"
              key={pageTitle}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {pageTitle}
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </motion.div>
          </div>
          <div className="topbar-actions">
            <motion.button
              className="topbar-btn"
              onClick={() => setNotifOpen(true)}
              title="Notifications"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={unreadCount > 0 ? { boxShadow: ['0 0 0px rgba(182,255,75,0)', '0 0 12px rgba(182,255,75,0.3)', '0 0 0px rgba(182,255,75,0)'] } : {}}
              transition={unreadCount > 0 ? { repeat: Infinity, duration: 2 } : {}}
            >
              🔔
              {unreadCount > 0 && (
                <motion.span
                  className="topbar-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </header>

        <div className="page-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>

      {/* Notification panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

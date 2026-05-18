import { useData } from '../contexts/DataContext';

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, markNotificationRead, dismissNotification, clearAllNotifications } = useData();

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case 'warning': return 'var(--yellow)';
      case 'danger': return 'var(--red)';
      case 'success': return 'var(--lime)';
      default: return 'var(--blue)';
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay open" onClick={onClose} />}
      <div className={`notif-panel ${isOpen ? 'open' : ''}`}>
        <div className="notif-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {notifications.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={clearAllNotifications} style={{ width: 'auto', fontSize: '0.65rem' }}>
                Clear All
              </button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">🔔</div>
              <h3>All clear</h3>
              <p>No notifications yet. We'll alert you when Submind detects something.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''}`}
                style={{ borderLeftColor: !n.read ? getPriorityColor(n.type) : 'transparent' }}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="notif-item-msg">{n.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="notif-item-time">{formatTime(n.createdAt)}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                    style={{ fontSize: '0.7rem', color: 'var(--grey2)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Menu, Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const pageTitles = {
  '/': 'Dashboard',
  '/shoots': 'Shoots',
  '/albums': 'Albums',
  '/clients': 'Clients',
  '/payments': 'Payments',
  '/settings': 'Settings',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const title = pageTitles[location.pathname] || 'Wedding Diary Manager';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onMenuToggle} id="menu-toggle-btn">
        <Menu size={22} />
      </button>

      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            id="notification-btn"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
                    <CheckCheck size={16} />
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div
                    key={n.id}
                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className={`notification-dot ${n.read ? 'read' : ''}`} />
                    <div className="notification-text">
                      <h4>{n.title}</h4>
                      <p>{n.message}</p>
                      <time>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</time>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

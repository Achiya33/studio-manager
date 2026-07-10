import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Camera, LayoutDashboard, CalendarDays, BookImage,
  Users, CreditCard, Settings, LogOut, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout, isAdmin } = useAuth();

  // Staff can only see Dashboard, Shoots (preview), and Albums
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/shoots', icon: CalendarDays, label: 'Shoots' },
    { to: '/albums', icon: BookImage, label: 'Albums' },
  ];

  // Admin-only menu items
  const adminNavItems = [
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ];

  const adminItems = [
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Camera size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h2 style={{ textTransform: 'capitalize' }}>{user?.studioName || 'Studio Name'}</h2>
          <span>Manager</span>
        </div>
        {isMobile && (
          <button className="btn-icon btn-ghost" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main Menu</span>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: 'var(--space-4)' }}>Management</span>
            {adminNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <span className="sidebar-section-label" style={{ marginTop: 'var(--space-4)' }}>Administration</span>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar avatar-md sidebar-user-avatar">
          {user?.displayName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
          <div className="sidebar-user-role">{user?.role || 'staff'}</div>
        </div>
        <button className="btn-icon btn-ghost" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Camera, LayoutDashboard, CalendarDays, BookImage,
  Users, CreditCard, Settings, LogOut, X, Edit3, Video
} from 'lucide-react';
import StudioProfileModal from '../modals/StudioProfileModal';

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout, isAdmin, isStaff, activeStudio } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Staff can only see Dashboard, Shoots (preview), and Albums
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/shoots', icon: CalendarDays, label: 'Shoots' },
    { to: '/albums', icon: activeStudio?.studioType === 'videographer' ? Video : BookImage, label: activeStudio?.studioType === 'videographer' ? 'Videos' : 'Albums' },
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
      <div 
        className="sidebar-brand" 
        onClick={() => isAdmin && setShowProfileModal(true)}
        style={{ cursor: isAdmin ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
        title={isAdmin ? "Edit Studio Profile" : ""}
      >
        <div className="sidebar-brand-icon" style={activeStudio?.logoUrl && !activeStudio.logoUrl.startsWith('blob:') ? { background: 'transparent', padding: 0 } : {}}>
          {activeStudio?.logoUrl && !activeStudio.logoUrl.startsWith('blob:') ? (
            <img src={activeStudio.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', objectFit: 'cover' }} />
          ) : (
            <Camera size={22} />
          )}
        </div>
        <div className="sidebar-brand-text">
          <h2 style={{ textTransform: 'capitalize' }}>{activeStudio?.name || 'Studio'}</h2>
          <span>Manager</span>
        </div>
        {isAdmin && (
          <div style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', opacity: 0.5 }}>
            <Edit3 size={14} />
          </div>
        )}
        {isMobile && (
          <button className="btn-icon btn-ghost" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ marginLeft: 'auto' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {showProfileModal && (
        <StudioProfileModal onClose={() => setShowProfileModal(false)} />
      )}

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
        <div className="avatar avatar-md sidebar-user-avatar" style={{ padding: user?.photoURL ? 0 : '', overflow: 'hidden' }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.displayName?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
          <div className="sidebar-user-role">{isAdmin ? 'admin' : (isStaff ? 'staff' : '')}</div>
        </div>
        <button className="btn-icon btn-ghost" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

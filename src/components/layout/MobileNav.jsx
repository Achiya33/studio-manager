import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, CalendarDays, BookImage, Users, CreditCard } from 'lucide-react';

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', staffVisible: true },
  { to: '/shoots', icon: CalendarDays, label: 'Shoots', staffVisible: true },
  { to: '/albums', icon: BookImage, label: 'Albums', staffVisible: true },
  { to: '/clients', icon: Users, label: 'Clients', staffVisible: false },
  { to: '/payments', icon: CreditCard, label: 'Payments', staffVisible: false },
];

export default function MobileNav() {
  const { isAdmin } = useAuth();
  const navItems = isAdmin ? allNavItems : allNavItems.filter(item => item.staffVisible);

  return (
    <nav className="mobile-nav">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import StatsCards from '../components/dashboard/StatsCards';
import UpcomingShoots from '../components/dashboard/UpcomingShoots';
import PendingAlbums from '../components/dashboard/PendingAlbums';
import RecentBookings from '../components/dashboard/RecentBookings';
import RevenueChart from '../components/dashboard/RevenueChart';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, isAdmin, activeStudio } = useAuth();

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, <span className="gradient-text">{capitalizedFirstName}</span>!</h1>
          <p className="page-subtitle">Here's what's happening with your studio today.</p>
        </div>
      </div>

      {isAdmin && <StatsCards />}

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Upcoming Shoots</h2>
            <Link to="/shoots" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <UpcomingShoots />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Calendar</h2>
          </div>
          <CalendarWidget />
        </div>

        {isAdmin && (
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Revenue Overview</h2>
            </div>
            <RevenueChart />
          </div>
        )}

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>{activeStudio?.studioType === 'videographer' ? 'Pending Videos' : 'Pending Albums'}</h2>
            <Link to="/albums" className="btn btn-ghost btn-sm">
              View Board <ArrowRight size={16} />
            </Link>
          </div>
          <PendingAlbums />
        </div>

        {isAdmin && (
          <div className="dashboard-section dashboard-full-width">
            <div className="dashboard-section-header">
              <h2>Recent Bookings</h2>
              <Link to="/shoots" className="btn btn-ghost btn-sm">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <RecentBookings />
          </div>
        )}
      </div>
    </div>
  );
}


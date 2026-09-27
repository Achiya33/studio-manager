import { useMemo } from 'react';
import { demoStore } from '../../lib/demoStore';
import { CalendarDays, BookImage, Users, TrendingUp } from 'lucide-react';
import './Dashboard.css';

export default function StatsCards() {
  const stats = useMemo(() => {
    const shoots = demoStore.getAll('shoots');
    const albums = demoStore.getAll('albums');
    const payments = demoStore.getAll('payments');
    const clients = demoStore.getAll('clients');

    const upcomingShoots = shoots.filter(s => s.status === 'upcoming').length;
    const pendingAlbums = albums.filter(a => a.stage !== 'delivered').length;
    const totalClients = clients.length;
    const monthlyRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);

    return [
      {
        label: 'Upcoming Shoots',
        value: upcomingShoots,
        icon: CalendarDays,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.12)',
        change: '+2 this week',
      },
      {
        label: 'Pending Albums',
        value: pendingAlbums,
        icon: BookImage,
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.12)',
        change: '3 need attention',
      },
      {
        label: 'Total Clients',
        value: totalClients,
        icon: Users,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.12)',
        change: '+1 this month',
      },
      {
        label: 'Total Revenue',
        value: `Rs. ${(monthlyRevenue / 1000).toFixed(0)}K`,
        icon: TrendingUp,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        change: 'All time',
      },
    ];
  }, []);

  return (
    <div className="stats-grid stagger-children">
      {stats.map((stat, i) => (
        <div key={i} className="stat-card animate-fade-in-up">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <span className="stat-change">{stat.change}</span>
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

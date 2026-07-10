import { useMemo } from 'react';
import { demoStore } from '../../lib/demoStore';
import { getShootTypeConfig } from '../../lib/constants';
import { format } from 'date-fns';

export default function RecentBookings() {
  const bookings = useMemo(() => {
    return demoStore.getAll('shoots')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, []);

  if (bookings.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--space-4)' }}>No bookings yet</p>;
  }

  return (
    <div className="recent-bookings-list">
      {bookings.map(booking => {
        const typeConfig = getShootTypeConfig(booking.type);
        return (
          <div key={booking.id} className="booking-item">
            <div className="avatar avatar-md booking-avatar">
              {booking.clientName?.[0]?.toUpperCase()}
            </div>
            <div className="booking-info">
              <h4>{booking.clientName}</h4>
              <p>{typeConfig.label} • {format(new Date(booking.date), 'MMM d, yyyy')}</p>
            </div>
            <span className="booking-amount">
              Rs. {booking.packageAmount?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

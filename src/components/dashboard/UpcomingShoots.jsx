import { useMemo } from 'react';
import { demoStore } from '../../lib/demoStore';
import { getShootTypeConfig } from '../../lib/constants';
import { format, isAfter } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

export default function UpcomingShoots() {
  const shoots = useMemo(() => {
    return demoStore.getAll('shoots')
      .filter(s => s.status === 'upcoming' && isAfter(new Date(s.date), new Date()))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, []);

  if (shoots.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--space-4)' }}>No upcoming shoots</p>;
  }

  return (
    <div className="upcoming-shoots">
      {shoots.map(shoot => {
        const typeConfig = getShootTypeConfig(shoot.type);
        const shootDate = new Date(shoot.date);
        return (
          <div key={shoot.id} className="shoot-timeline-item">
            <div
              className="shoot-date-badge"
              style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
            >
              <span className="day">{format(shootDate, 'd')}</span>
              <span className="month">{format(shootDate, 'MMM')}</span>
            </div>
            <div className="shoot-timeline-info">
              <h4>{shoot.clientName}</h4>
              <div className="shoot-timeline-meta">
                <span><MapPin size={12} />{shoot.location}</span>
                <span><Clock size={12} />{shoot.time}</span>
              </div>
            </div>
            <span
              className="shoot-type-badge"
              style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

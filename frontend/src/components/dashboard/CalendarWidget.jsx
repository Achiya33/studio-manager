import { useState, useMemo } from 'react';
import { demoStore } from '../../lib/demoStore';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay,
  addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const shootDates = useMemo(() => {
    const shoots = demoStore.getAll('shoots');
    return shoots.map(s => new Date(s.date));
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="calendar-nav">
          <button className="btn-icon btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={18} />
          </button>
          <button className="btn-icon btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {dayHeaders.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          const hasShoot = shootDates.some(sd => isSameDay(sd, day));
          const sameMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          return (
            <div
              key={i}
              className={`calendar-day ${today ? 'today' : ''} ${!sameMonth ? 'other-month' : ''} ${hasShoot ? 'has-shoot' : ''}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}

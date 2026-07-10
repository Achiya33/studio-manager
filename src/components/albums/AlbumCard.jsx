import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getShootTypeConfig } from '../../lib/constants';
import { demoStore } from '../../lib/demoStore';
import { differenceInDays, format } from 'date-fns';
import {
  GripVertical, Clock, AlertTriangle, MapPin, Calendar,
  Package, CreditCard, User, FileText, RefreshCw
} from 'lucide-react';

export default function AlbumCard({ album, isDragging, onClick, onProgressClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const typeConfig = getShootTypeConfig(album.shootType);
  const lastMove = album.stageHistory?.[album.stageHistory.length - 1]?.movedAt;
  const daysInStage = lastMove ? differenceInDays(new Date(), new Date(lastMove)) : 0;
  const isUrgent = daysInStage > 7 && album.stage !== 'delivered';

  // Get related shoot & payment data for richer details
  const shoot = album.shootId ? demoStore.getById('shoots', album.shootId) : null;
  const payments = album.clientId ? demoStore.getByField('payments', 'clientId', album.clientId) : [];
  const payment = payments.find(p => p.shootId === album.shootId) || payments[0] || null;

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (onProgressClick) onProgressClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`album-card ${isDragging ? 'album-card-dragging' : ''} ${isUrgent ? 'album-card-urgent' : ''}`}
      onClick={onClick}
    >
      <div className="album-card-drag" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className="album-card-content">
        {/* Row 1: Type badge + Priority + Progress btn */}
        <div className="album-card-top">
          <span className="album-card-type" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
            {typeConfig.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {(album.priority === 'high' || album.priority === 'urgent') && (
              <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
            )}
            {onProgressClick && (
              <button
                className="album-progress-btn"
                onClick={handleProgressClick}
                title="Update Progress"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Client Name */}
        <h4 className="album-card-name">
          <User size={13} className="album-detail-icon" />
          {album.clientName}
        </h4>

        {/* Row 3: Shoot Date */}
        {album.shootDate && (
          <div className="album-card-detail-row">
            <Calendar size={12} />
            <span>Shoot: {format(new Date(album.shootDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {/* Row 4: Location */}
        {shoot?.location && (
          <div className="album-card-detail-row">
            <MapPin size={12} />
            <span>{shoot.location}</span>
          </div>
        )}

        {/* Row 5: Package */}
        {shoot?.package && (
          <div className="album-card-detail-row">
            <Package size={12} />
            <span>{shoot.package}</span>
          </div>
        )}

        {/* Row 6: Payment status */}
        {payment && (
          <div className="album-card-detail-row album-card-payment">
            <CreditCard size={12} />
            <span>
              Rs. {payment.paidAmount?.toLocaleString()}
              <span className="album-card-payment-sep">/</span>
              <span className="album-card-payment-total">Rs. {payment.totalAmount?.toLocaleString()}</span>
            </span>
            {payment.balance > 0 ? (
              <span className="album-card-balance-badge badge-warning">Due: Rs. {payment.balance.toLocaleString()}</span>
            ) : (
              <span className="album-card-balance-badge badge-success">Paid</span>
            )}
          </div>
        )}

        {/* Row 7: Days in stage */}
        <div className="album-card-detail-row album-card-stage-info">
          <Clock size={12} />
          <span>{daysInStage}d in stage</span>
          <span className="album-card-stage-date">
            {lastMove && format(new Date(lastMove), 'MMM d')}
          </span>
        </div>

        {/* Row 8: Notes */}
        {album.notes && (
          <div className="album-card-detail-row album-card-notes-row">
            <FileText size={12} />
            <span>{album.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { getAlbumStageConfig, getShootTypeConfig } from '../../lib/constants';
import { format } from 'date-fns';
import { X, Calendar, User, FileText, History } from 'lucide-react';

export default function AlbumDetail({ album, onClose }) {
  const stageConfig = getAlbumStageConfig(album.stage);
  const typeConfig = getShootTypeConfig(album.shootType);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Album Details</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span className="badge" style={{ background: `${stageConfig.color}20`, color: stageConfig.color }}>
              {stageConfig.label}
            </span>
            <span className="badge" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
              {typeConfig.label}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="album-detail-row">
              <User size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <span className="album-detail-label">Client</span>
                <span className="album-detail-value">{album.clientName}</span>
              </div>
            </div>

            <div className="album-detail-row">
              <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <span className="album-detail-label">Shoot Date</span>
                <span className="album-detail-value">{album.shootDate ? format(new Date(album.shootDate), 'MMMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>

            {album.notes && (
              <div className="album-detail-row">
                <FileText size={16} style={{ color: 'var(--text-tertiary)' }} />
                <div>
                  <span className="album-detail-label">Notes</span>
                  <span className="album-detail-value">{album.notes}</span>
                </div>
              </div>
            )}

            <div className="album-detail-history">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <History size={16} style={{ color: 'var(--text-tertiary)' }} />
                <span className="album-detail-label" style={{ margin: 0 }}>Stage History</span>
              </div>
              <div className="stage-timeline">
                {album.stageHistory?.map((entry, i) => {
                  const sc = getAlbumStageConfig(entry.stage);
                  return (
                    <div key={i} className="stage-timeline-item">
                      <div className="stage-timeline-dot" style={{ background: sc.color }} />
                      <div className="stage-timeline-content">
                        <span style={{ color: sc.color, fontWeight: 600, fontSize: 'var(--font-sm)' }}>{sc.label}</span>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
                          {format(new Date(entry.movedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

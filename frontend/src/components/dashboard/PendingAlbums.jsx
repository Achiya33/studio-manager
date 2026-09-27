import { useState, useEffect } from 'react';
import { getAlbumStageConfig, getVideoStageConfig } from '../../lib/constants';
import { differenceInDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function PendingAlbums() {
  const { activeStudio } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const isVideo = activeStudio?.studioType === 'videographer';
  const itemNamePlural = isVideo ? 'videos' : 'albums';

  useEffect(() => {
    if (activeStudio) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/albums/studio/${activeStudio._id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const pending = data
              .filter(a => a.stage !== 'delivered' && a.stage !== 'done')
              .sort((a, b) => {
                const aLast = a.stageHistory?.[a.stageHistory.length - 1]?.movedAt;
                const bLast = b.stageHistory?.[b.stageHistory.length - 1]?.movedAt;
                return new Date(aLast || a.createdAt) - new Date(bLast || b.createdAt);
              })
              .slice(0, 5);
            setAlbums(pending.map(a => ({ ...a, id: a._id })));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeStudio]);

  if (loading) {
    return <div style={{ padding: 'var(--space-4)' }}><div className="loading-spinner" /></div>;
  }

  if (albums.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--space-4)' }}>All {itemNamePlural} delivered! 🎉</p>;
  }

  return (
    <div className="pending-albums-list">
      {albums.map(album => {
        const stageConfig = isVideo ? getVideoStageConfig(album.stage) : getAlbumStageConfig(album.stage);
        const lastMove = album.stageHistory?.[album.stageHistory.length - 1]?.movedAt;
        const daysInStage = lastMove ? differenceInDays(new Date(), new Date(lastMove)) : 0;

        return (
          <div key={album.id} className="pending-album-item">
            <div className="album-stage-indicator" style={{ background: stageConfig.color }} />
            <div className="pending-album-info">
              <h4>{album.clientName}</h4>
              <p style={{ color: stageConfig.color }}>{stageConfig.label}</p>
            </div>
            <span className="pending-album-days">
              {daysInStage}d in stage
            </span>
          </div>
        );
      })}
    </div>
  );
}

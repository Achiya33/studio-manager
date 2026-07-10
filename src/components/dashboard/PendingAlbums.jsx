import { useMemo } from 'react';
import { demoStore } from '../../lib/demoStore';
import { getAlbumStageConfig } from '../../lib/constants';
import { differenceInDays } from 'date-fns';

export default function PendingAlbums() {
  const albums = useMemo(() => {
    return demoStore.getAll('albums')
      .filter(a => a.stage !== 'delivered')
      .sort((a, b) => {
        const aLast = a.stageHistory?.[a.stageHistory.length - 1]?.movedAt;
        const bLast = b.stageHistory?.[b.stageHistory.length - 1]?.movedAt;
        return new Date(aLast) - new Date(bLast);
      })
      .slice(0, 5);
  }, []);

  if (albums.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)', padding: 'var(--space-4)' }}>All albums delivered! 🎉</p>;
  }

  return (
    <div className="pending-albums-list">
      {albums.map(album => {
        const stageConfig = getAlbumStageConfig(album.stage);
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

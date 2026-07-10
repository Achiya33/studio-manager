import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AlbumCard from './AlbumCard';

export default function KanbanColumn({ stage, albums, onAlbumClick, onProgressClick, showProgressBtn }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}>
      <div className="kanban-column-header" style={{ borderColor: stage.color }}>
        <div className="kanban-column-title">
          <span className="kanban-column-dot" style={{ background: stage.color }} />
          <h3>{stage.label}</h3>
        </div>
        <span className="kanban-column-count" style={{ background: `${stage.color}20`, color: stage.color }}>
          {albums.length}
        </span>
      </div>

      <div className="kanban-column-body" ref={setNodeRef}>
        <SortableContext items={albums.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {albums.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onAlbumClick(album)}
              onProgressClick={onProgressClick && showProgressBtn ? () => onProgressClick(album) : undefined}
            />
          ))}
        </SortableContext>

        {albums.length === 0 && (
          <div className="kanban-column-empty">
            <p>No albums</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { demoStore, generateId } from '../lib/demoStore';
import { ALBUM_STAGES, VIDEO_STAGES, VIDEO_TYPES, STAFF_ALLOWED_STAGES, getAlbumStageConfig, getVideoStageConfig } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import AlbumCard from '../components/albums/AlbumCard';
import AlbumDetail from '../components/albums/AlbumDetail';
import { Plus, X, ArrowRight, RefreshCw, ChevronLeft, Palette, Brush, Send, RotateCcw, CheckCircle, UploadCloud, Clock, Play, Eye, CheckCircle2, Video } from 'lucide-react';
import { format } from 'date-fns';
import './Albums.css';

// Map icon names to components
const iconMap = {
  Palette, Brush, Send, RotateCcw, CheckCircle, UploadCloud,
  Clock, Play, Eye, CheckCircle2, Video
};

export default function AlbumsPage() {
  const { user, activeStudio, isAdmin, isStaff } = useAuth();
  const { showToast } = useNotifications();
  const [albums, setAlbums] = useState([]);
  const [shoots, setShoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(null);
  
  const isVideo = activeStudio?.studioType === 'videographer';
  const STAGES = isVideo ? VIDEO_STAGES : ALBUM_STAGES;
  const ITEM_NAME = isVideo ? 'Video' : 'Album';
  const ITEM_NAME_PLURAL = isVideo ? 'Videos' : 'Albums';
  
  // Which stage is currently being viewed (null = showing the grid of stages)
  const [viewingStage, setViewingStage] = useState(null);

  useEffect(() => {
    if (activeStudio) {
      fetchAlbumsAndShoots();
    }
  }, [activeStudio]);

  const fetchAlbumsAndShoots = async () => {
    setLoading(true);
    try {
      const [albumsRes, shootsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/albums/studio/${activeStudio._id}`),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shoots/studio/${activeStudio._id}`)
      ]);
      
      if (albumsRes.ok) {
        const albumsData = await albumsRes.json();
        if (Array.isArray(albumsData)) {
          setAlbums(albumsData.map(a => ({ ...a, id: a._id })));
        }
      }
      if (shootsRes.ok) {
        const shootsData = await shootsRes.json();
        if (Array.isArray(shootsData)) {
          setShoots(shootsData.map(s => ({ ...s, id: s._id })));
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAlbumsByStage = (stageId) => {
    return albums.filter(a => a.stage === stageId);
  };

  const handleAddAlbum = async (albumData) => {
    try {
      const payload = {
        ...albumData,
        studioId: activeStudio._id,
        createdBy: user?.uid
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create album');
      
      await fetchAlbumsAndShoots();
      setShowAddModal(false);
      showToast('New album added successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error adding album', 'error');
    }
  };

  const handleUpdateProgress = async (albumId, updates) => {
    const album = albums.find(a => a.id === albumId);
    if (!album) return;

    if (updates.stage && updates.stage !== album.stage) {
      if (isStaff && !STAFF_ALLOWED_STAGES.includes(updates.stage)) {
        showToast('You are not allowed to move albums to this stage', 'warning');
        return;
      }
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/albums/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedBy: user?.uid })
      });
      if (!res.ok) throw new Error('Update failed');

      await fetchAlbumsAndShoots();
      setShowProgressModal(null);
      showToast('Album progress updated!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error updating album', 'error');
    }
  };

  // If viewing a specific stage, show the list of albums in that stage
  if (viewingStage) {
    const stageConfig = STAGES.find(s => s.id === viewingStage);
    const stageAlbums = getAlbumsByStage(viewingStage);
    const StageIcon = iconMap[stageConfig.icon] || Palette;

    return (
      <div className="page albums-page">
        <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button className="btn-icon btn-ghost" onClick={() => setViewingStage(null)}>
              <ChevronLeft size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <StageIcon size={24} style={{ color: stageConfig.color }} />
              <h1 className="page-title">{stageConfig.label}</h1>
            </div>
          </div>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
            {stageAlbums.length} {ITEM_NAME_PLURAL.toLowerCase()}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '800px', margin: '0 auto' }}>
          {stageAlbums.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p>No {ITEM_NAME_PLURAL.toLowerCase()} in this stage yet.</p>
            </div>
          ) : (
            stageAlbums.map(album => (
              <div key={album.id} onClick={() => setSelectedAlbum(album)}>
                <AlbumCard 
                  album={album} 
                  isVideo={isVideo}
                  onProgressClick={() => {
                    setSelectedAlbum(null);
                    setShowProgressModal(album);
                  }}
                  showProgressBtn={true} 
                />
              </div>
            ))
          )}
        </div>

        {selectedAlbum && (
          <AlbumDetail
            album={selectedAlbum}
            isVideo={isVideo}
            itemName={ITEM_NAME}
            onClose={() => setSelectedAlbum(null)}
          />
        )}
        
        {showProgressModal && (
          <UpdateProgressModal
            album={showProgressModal}
            isVideo={isVideo}
            itemName={ITEM_NAME}
            onSave={handleUpdateProgress}
            onClose={() => setShowProgressModal(null)}
            isStaff={isStaff}
          />
        )}
      </div>
    );
  }

  return (
    <div className="page albums-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{ITEM_NAME_PLURAL}</h1>
          <p className="page-subtitle">Track and manage {ITEM_NAME.toLowerCase()} design workflows</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> New {ITEM_NAME}
          </button>
        )}
      </div>

      <div className="albums-grid">
        {STAGES.map(stage => {
          const Icon = iconMap[stage.icon] || Palette;
          const count = getAlbumsByStage(stage.id).length;
          
          return (
            <div 
              key={stage.id} 
              className="album-stage-card"
              onClick={() => setViewingStage(stage.id)}
            >
              <div className="album-stage-icon" style={{ background: stage.color }}>
                <Icon size={24} />
              </div>
              <h3>{stage.label}</h3>
              <span className="album-stage-count">{count} {count === 1 ? ITEM_NAME : ITEM_NAME_PLURAL}</span>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <AddAlbumModal
          shoots={shoots}
          albums={albums}
          isVideo={isVideo}
          itemName={ITEM_NAME}
          onSave={handleAddAlbum}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ——— Add Album Modal ———
function AddAlbumModal({ shoots = [], albums = [], isVideo, itemName = 'Album', onSave, onClose }) {
  const existingAlbumShootIds = useMemo(() => {
    return albums.map(a => (a.shootId?._id || a.shootId));
  }, [albums]);

  const availableShoots = useMemo(() => {
    return [...shoots].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [shoots]);

  const [selectedShootId, setSelectedShootId] = useState('');
  const [videoType, setVideoType] = useState('full-video');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');

  const selectedShoot = shoots.find(s => s.id === selectedShootId);
  const alreadyHasAlbum = existingAlbumShootIds.includes(selectedShootId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedShoot) return;

    onSave({
      shootId: selectedShoot.id,
      clientId: selectedShoot.clientId,
      clientName: selectedShoot.clientName,
      shootType: isVideo ? videoType : selectedShoot.type,
      shootDate: selectedShoot.date,
      stage: isVideo ? 'upcoming' : 'to-design',
      notes,
      priority,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2><Plus size={20} /> Add New {itemName}</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Shoot</label>
              <select
                value={selectedShootId}
                onChange={(e) => setSelectedShootId(e.target.value)}
                required
              >
                <option value="">-- Select a shoot --</option>
                {availableShoots.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.clientName} — {s.type} ({format(new Date(s.date), 'MMM d, yyyy')})
                    {existingAlbumShootIds.includes(s.id) ? ' ✓ Has Album' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedShoot && (
              <div className="add-album-preview">
                <div className="add-album-preview-row">
                  <span className="add-album-preview-label">Client</span>
                  <span className="add-album-preview-value">{selectedShoot.clientName}</span>
                </div>
                {!isVideo && (
                  <div className="add-album-preview-row">
                    <span className="add-album-preview-label">Shoot Type</span>
                    <span className="add-album-preview-value" style={{ textTransform: 'capitalize' }}>{selectedShoot.type}</span>
                  </div>
                )}
                <div className="add-album-preview-row">
                  <span className="add-album-preview-label">Date</span>
                  <span className="add-album-preview-value">{format(new Date(selectedShoot.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="add-album-preview-row">
                  <span className="add-album-preview-label">Location</span>
                  <span className="add-album-preview-value">{selectedShoot.location}</span>
                </div>
                {alreadyHasAlbum && (
                  <div className="add-album-warning">
                    ⚠️ This shoot already has an album. Adding another will create a duplicate.
                  </div>
                )}
              </div>
            )}

            {isVideo && selectedShoot && (
              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Video Category</label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  required
                >
                  {VIDEO_TYPES.map(vt => (
                    <option key={vt.id} value={vt.id}>{vt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Designer name, special instructions, album type..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!selectedShoot}>
              <Plus size={16} /> Add Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ——— Update Progress Modal ———
function UpdateProgressModal({ album, isVideo, itemName = 'Album', onSave, onClose, isStaff }) {
  const [stage, setStage] = useState(album.stage);
  const [notes, setNotes] = useState(album.notes || '');

  const STAGES = isVideo ? VIDEO_STAGES : ALBUM_STAGES;

  // Get available stages: admin can pick any, staff only allowed stages
  const availableStages = isStaff
    ? STAGES.filter(s => s.id === album.stage || STAFF_ALLOWED_STAGES.includes(s.id))
    : STAGES;

  const currentStageConfig = STAGES.find(s => s.id === album.stage);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(album.id, { stage, notes });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2><RefreshCw size={20} /> Update Progress</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Album info preview */}
            <div className="progress-album-info">
              <h3>{album.clientName}</h3>
              <div className="progress-current-stage">
                <span>Current Stage:</span>
                <span className="badge" style={{ background: `${currentStageConfig?.color}20`, color: currentStageConfig?.color }}>
                  {currentStageConfig?.label}
                </span>
              </div>
            </div>

            {/* Stage selector */}
            <div className="form-group">
              <label className="form-label">Move to Stage</label>
              <div className="progress-stage-options">
                {availableStages.map(s => (
                  <label
                    key={s.id}
                    className={`progress-stage-option ${stage === s.id ? 'selected' : ''} ${s.id === album.stage ? 'current' : ''}`}
                    style={{ '--stage-color': s.color }}
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={s.id}
                      checked={stage === s.id}
                      onChange={() => setStage(s.id)}
                    />
                    <span className="progress-stage-dot" style={{ background: s.color }} />
                    <span className="progress-stage-label">{s.label}</span>
                    {s.id === album.stage && <span className="progress-stage-current-badge">Current</span>}
                    {stage === s.id && s.id !== album.stage && (
                      <ArrowRight size={14} style={{ color: s.color, marginLeft: 'auto' }} />
                    )}
                  </label>
                ))}
              </div>
              {isStaff && (
                <p className="form-help-text" style={{ color: 'var(--warning)', marginTop: 'var(--space-2)' }}>
                  Staff can only move {itemName.toLowerCase()}s to allowed stages.
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Update notes, progress details..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <RefreshCw size={16} /> Update Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

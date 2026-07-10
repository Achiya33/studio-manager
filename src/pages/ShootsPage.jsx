import { useState, useMemo } from 'react';
import { demoStore, generateId } from '../lib/demoStore';
import { SHOOT_TYPES, DEFAULT_PACKAGES, getShootTypeConfig } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import {
  Plus, Search, MapPin, Clock, Calendar, Filter,
  Edit2, Trash2, X, Camera, FileText
} from 'lucide-react';
import InvoiceModal from '../components/invoice/InvoiceModal';
import './Shoots.css';

export default function ShootsPage() {
  const { isAdmin, isStaff } = useAuth();
  const { showToast } = useNotifications();
  const [shoots, setShoots] = useState(() => demoStore.getAll('shoots'));
  const [showForm, setShowForm] = useState(false);
  const [editingShoot, setEditingShoot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [invoiceShootId, setInvoiceShootId] = useState(null);

  const clients = useMemo(() => demoStore.getAll('clients'), []);

  const filteredShoots = useMemo(() => {
    return shoots
      .filter(s => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!s.clientName.toLowerCase().includes(q) && !s.location.toLowerCase().includes(q)) return false;
        }
        if (filterType !== 'all' && s.type !== filterType) return false;
        if (filterStatus !== 'all' && s.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [shoots, searchQuery, filterType, filterStatus]);

  const handleSave = (shootData) => {
    if (editingShoot) {
      demoStore.update('shoots', editingShoot.id, shootData);
      showToast('Shoot updated successfully', 'success');
    } else {
      const newShoot = demoStore.add('shoots', { ...shootData, id: generateId(), status: 'upcoming' });
      // Auto-create payment record
      demoStore.add('payments', {
        shootId: newShoot.id,
        clientId: shootData.clientId,
        clientName: shootData.clientName,
        totalAmount: shootData.packageAmount || 0,
        paidAmount: 0,
        balance: shootData.packageAmount || 0,
        status: 'pending',
        transactions: [],
      });
      showToast('New shoot added successfully!', 'success');
    }
    setShoots(demoStore.getAll('shoots'));
    setShowForm(false);
    setEditingShoot(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this shoot?')) {
      demoStore.remove('shoots', id);
      setShoots(demoStore.getAll('shoots'));
      showToast('Shoot deleted', 'info');
    }
  };

  const handleEdit = (shoot) => {
    setEditingShoot(shoot);
    setShowForm(true);
  };

  const getStatusBadge = (shoot) => {
    const date = new Date(shoot.date);
    if (shoot.status === 'cancelled') return <span className="badge badge-danger">Cancelled</span>;
    if (shoot.status === 'completed') return <span className="badge badge-success">Completed</span>;
    if (isToday(date)) return <span className="badge badge-warning">Today</span>;
    if (isAfter(date, new Date())) return <span className="badge badge-info">Upcoming</span>;
    return <span className="badge badge-neutral">Past</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shoots</h1>
          <p className="page-subtitle">Manage all your photography sessions</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingShoot(null); setShowForm(true); }}>
            <Plus size={20} /> New Shoot
          </button>
        )}
      </div>

      <div className="shoots-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by client or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {SHOOT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredShoots.length === 0 ? (
        <div className="empty-state">
          <Camera size={64} />
          <h3>No shoots found</h3>
          <p>Add your first shoot to get started</p>
        </div>
      ) : (
        <div className="shoots-grid">
          {filteredShoots.map(shoot => {
            const typeConfig = getShootTypeConfig(shoot.type);
            return (
              <div key={shoot.id} className="shoot-card">
                <div className="shoot-card-header" style={{ borderColor: typeConfig.color }}>
                  <div className="shoot-card-type" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
                    {typeConfig.label}
                  </div>
                  {getStatusBadge(shoot)}
                </div>
                <div className="shoot-card-body">
                  <h3>{shoot.clientName}</h3>
                  <div className="shoot-card-details">
                    <span><Calendar size={14} /> {format(new Date(shoot.date), 'MMM d, yyyy')}</span>
                    <span><Clock size={14} /> {shoot.time}</span>
                    <span><MapPin size={14} /> {shoot.location}</span>
                  </div>
                  <div className="shoot-card-package">
                    <span className="package-name">{shoot.package}</span>
                    {isAdmin && <span className="package-price">Rs. {shoot.packageAmount?.toLocaleString()}</span>}
                  </div>
                  {shoot.notes && <p className="shoot-card-notes">{shoot.notes}</p>}
                </div>
                <div className="shoot-card-actions">
                  {isAdmin && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setInvoiceShootId(shoot.id)} style={{ color: 'var(--accent)' }}>
                      <FileText size={14} /> Receipt
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(shoot)}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(shoot.id)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                  {isStaff && (
                    <span className="badge badge-neutral" style={{ fontSize: '11px', opacity: 0.7 }}>
                      👁 Preview Only
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ShootFormModal
          shoot={editingShoot}
          clients={clients}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingShoot(null); }}
        />
      )}

      {invoiceShootId && (
        <InvoiceModal
          shootId={invoiceShootId}
          onClose={() => setInvoiceShootId(null)}
        />
      )}
    </div>
  );
}

function ShootFormModal({ shoot, clients, onSave, onClose }) {
  const [formData, setFormData] = useState({
    clientId: shoot?.clientId || '',
    clientName: shoot?.clientName || '',
    type: shoot?.type || 'wedding',
    date: shoot?.date ? format(new Date(shoot.date), 'yyyy-MM-dd') : '',
    time: shoot?.time || '',
    location: shoot?.location || '',
    package: shoot?.package || DEFAULT_PACKAGES[0].name,
    packageAmount: shoot?.packageAmount || DEFAULT_PACKAGES[0].price,
    notes: shoot?.notes || '',
  });

  const [clientSearch, setClientSearch] = useState(shoot?.clientName || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const suggestionsRef = useState(null);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  const handleClientInput = (e) => {
    const val = e.target.value;
    setClientSearch(val);
    setShowSuggestions(true);
    setHighlightIdx(-1);
    // If typed text exactly matches a client, auto-select
    const exactMatch = clients.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (exactMatch) {
      setFormData(prev => ({ ...prev, clientId: exactMatch.id, clientName: exactMatch.name }));
    } else {
      // Allow new client name (clientId will be empty — new client)
      setFormData(prev => ({ ...prev, clientId: '', clientName: val }));
    }
  };

  const handleSelectClient = (client) => {
    setClientSearch(client.name);
    setFormData(prev => ({ ...prev, clientId: client.id, clientName: client.name }));
    setShowSuggestions(false);
    setHighlightIdx(-1);
  };

  const handleClientKeyDown = (e) => {
    if (!showSuggestions || filteredClients.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => (prev < filteredClients.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => (prev > 0 ? prev - 1 : filteredClients.length - 1));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelectClient(filteredClients[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handlePackageChange = (e) => {
    const pkg = DEFAULT_PACKAGES.find(p => p.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      package: e.target.value,
      packageAmount: pkg?.price || prev.packageAmount,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) return;

    // If clientId is empty, auto-create the client
    let finalClientId = formData.clientId;
    let finalClientName = formData.clientName.trim();
    if (!finalClientId) {
      const newClient = demoStore.add('clients', { name: finalClientName });
      finalClientId = newClient.id;
    }

    onSave({
      ...formData,
      clientId: finalClientId,
      clientName: finalClientName,
      date: new Date(formData.date).toISOString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{shoot ? 'Edit Shoot' : 'New Shoot'}</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Client Name</label>
              <input
                type="text"
                value={clientSearch}
                onChange={handleClientInput}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleClientKeyDown}
                placeholder="Type client name..."
                required
                autoComplete="off"
                autoFocus
              />
              {formData.clientId && (
                <span className="client-matched-badge">✓ Existing client</span>
              )}
              {!formData.clientId && clientSearch.trim().length > 0 && (
                <span className="client-new-badge">+ New client</span>
              )}
              {showSuggestions && clientSearch.trim().length > 0 && filteredClients.length > 0 && (
                <div className="client-suggestions">
                  {filteredClients.slice(0, 8).map((c, i) => (
                    <div
                      key={c.id}
                      className={`client-suggestion-item ${i === highlightIdx ? 'highlighted' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectClient(c); }}
                      onMouseEnter={() => setHighlightIdx(i)}
                    >
                      <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)', color: '#000', fontSize: '11px' }}>
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="client-suggestion-info">
                        <span className="client-suggestion-name">{c.name}</span>
                        {c.phone && <span className="client-suggestion-phone">{c.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Shoot Type</label>
              <select value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}>
                {SHOOT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="e.g., Cinnamon Grand, Colombo" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Package</label>
                <select value={formData.package} onChange={handlePackageChange}>
                  {DEFAULT_PACKAGES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (Rs.)</label>
                <input type="number" value={formData.packageAmount} onChange={(e) => setFormData(prev => ({ ...prev, packageAmount: Number(e.target.value) }))} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Special requests, notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{shoot ? 'Update Shoot' : 'Add Shoot'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

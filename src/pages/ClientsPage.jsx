import { useState, useMemo } from 'react';
import { demoStore, generateId } from '../lib/demoStore';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import {
  Plus, Search, Phone, Mail, MapPin, X, Edit2, Trash2,
  Users, Eye, Calendar, CreditCard
} from 'lucide-react';
import './Clients.css';

export default function ClientsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [clients, setClients] = useState(() => demoStore.getAll('clients'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  const handleSave = (data) => {
    if (editingClient) {
      demoStore.update('clients', editingClient.id, data);
      showToast('Client updated successfully', 'success');
    } else {
      demoStore.add('clients', { ...data, id: generateId() });
      showToast('New client added!', 'success');
    }
    setClients(demoStore.getAll('clients'));
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      demoStore.remove('clients', id);
      setClients(demoStore.getAll('clients'));
      showToast('Client deleted', 'info');
    }
  };

  const getClientStats = (clientId) => {
    const shoots = demoStore.getByField('shoots', 'clientId', clientId);
    const payments = demoStore.getByField('payments', 'clientId', clientId);
    const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
    const totalBalance = payments.reduce((s, p) => s + p.balance, 0);
    return { shootCount: shoots.length, totalPaid, totalBalance };
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client directory</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingClient(null); setShowForm(true); }}>
            <Plus size={20} /> Add Client
          </button>
        )}
      </div>

      <div className="shoots-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>No clients found</h3>
          <p>Add your first client to get started</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map(client => {
            const stats = getClientStats(client.id);
            return (
              <div key={client.id} className="client-card">
                <div className="client-card-header">
                  <div className="avatar avatar-lg" style={{ background: 'var(--accent-gradient)', color: '#000' }}>
                    {client.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="client-card-info">
                    <h3>{client.name}</h3>
                    <span className="client-since">Client since {format(new Date(client.createdAt), 'MMM yyyy')}</span>
                  </div>
                </div>

                <div className="client-card-contacts">
                  {client.phone && (
                    <span><Phone size={14} /> {client.phone}</span>
                  )}
                  {client.email && (
                    <span><Mail size={14} /> {client.email}</span>
                  )}
                  {client.address && (
                    <span><MapPin size={14} /> {client.address}</span>
                  )}
                </div>

                <div className="client-card-stats">
                  <div className="client-stat">
                    <Calendar size={14} />
                    <span>{stats.shootCount} shoots</span>
                  </div>
                  <div className="client-stat">
                    <CreditCard size={14} />
                    <span>Rs. {stats.totalPaid.toLocaleString()} paid</span>
                  </div>
                  {stats.totalBalance > 0 && (
                    <div className="client-stat" style={{ color: 'var(--warning)' }}>
                      <span>Rs. {stats.totalBalance.toLocaleString()} due</span>
                    </div>
                  )}
                </div>

                <div className="client-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedClient(client)}>
                    <Eye size={14} /> View
                  </button>
                  {isAdmin && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingClient(client); setShowForm(true); }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(client.id)} style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ClientFormModal
          client={editingClient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
        />
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}

function ClientFormModal({ client, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    notes: client?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Edit Client' : 'Add Client'}</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter full name" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+94 77 123 4567" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="client@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Full address" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Any notes about this client..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{client ? 'Update' : 'Add Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientDetailModal({ client, onClose }) {
  const shoots = useMemo(() => demoStore.getByField('shoots', 'clientId', client.id), [client.id]);
  const payments = useMemo(() => demoStore.getByField('payments', 'clientId', client.id), [client.id]);
  const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalDue = payments.reduce((s, p) => s + p.balance, 0);
  const totalAmount = payments.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Client Profile</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="client-profile-header">
            <div className="avatar avatar-xl" style={{ background: 'var(--accent-gradient)', color: '#000' }}>
              {client.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{client.name}</h3>
              {client.phone && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{client.phone}</p>}
              {client.email && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{client.email}</p>}
            </div>
          </div>

          {client.address && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              <MapPin size={16} /> {client.address}
            </div>
          )}

          <div className="client-payment-summary">
            <div className="payment-summary-item">
              <span className="payment-summary-label">Total</span>
              <span className="payment-summary-value">Rs. {totalAmount.toLocaleString()}</span>
            </div>
            <div className="payment-summary-item" style={{ color: 'var(--success)' }}>
              <span className="payment-summary-label">Paid</span>
              <span className="payment-summary-value">Rs. {totalPaid.toLocaleString()}</span>
            </div>
            <div className="payment-summary-item" style={{ color: totalDue > 0 ? 'var(--warning)' : 'var(--success)' }}>
              <span className="payment-summary-label">Balance</span>
              <span className="payment-summary-value">Rs. {totalDue.toLocaleString()}</span>
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="payment-progress">
              <div className="payment-progress-bar" style={{ width: `${(totalPaid / totalAmount) * 100}%` }} />
            </div>
          )}

          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 600, marginTop: 'var(--space-2)' }}>Shoot History</h4>
          {shoots.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>No shoots yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {shoots.map(s => (
                <div key={s.id} className="client-shoot-item">
                  <span className="badge" style={{ background: `${s.type === 'wedding' ? '#f59e0b' : s.type === 'pre-shoot' ? '#6366f1' : '#10b981'}20`, color: s.type === 'wedding' ? '#f59e0b' : s.type === 'pre-shoot' ? '#6366f1' : '#10b981', fontSize: '10px' }}>
                    {s.type}
                  </span>
                  <span style={{ flex: 1, fontSize: 'var(--font-sm)' }}>{s.location}</span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{format(new Date(s.date), 'MMM d, yyyy')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { db, isFirebaseAvailable, firebaseConfig } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { demoStore } from '../lib/demoStore';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Navigate } from 'react-router-dom';
import {
  Package, Plus, Edit2, Trash2, X, Save,
  RefreshCw, Users, Shield, Mail, MessageCircle, Settings,
  Building, Phone, MapPin, Camera, Image as ImageIcon
} from 'lucide-react';
import './Settings.css';

export default function SettingsPage() {
  const { isAdmin, user } = useAuth();
  const { showToast } = useNotifications();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your studio configuration</p>
        </div>
      </div>

      <div className="settings-grid">
        <PackageManager showToast={showToast} />
        <StaffManager showToast={showToast} />
        <SystemPreferences showToast={showToast} />
        <DataManager showToast={showToast} />
      </div>
    </div>
  );
}

function SystemPreferences({ showToast }) {
  const [theme, setTheme] = useState('dark');
  const [currency, setCurrency] = useState('LKR');
  const [taxRate, setTaxRate] = useState(0);

  const handleSave = () => {
    showToast('Preferences saved successfully', 'success');
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
          <Settings size={20} />
        </div>
        <div>
          <h2>System Preferences</h2>
          <p>Customize your workspace experience</p>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode (Coming Soon)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
            <option value="LKR">Sri Lankan Rupee (LKR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Default Tax Rate (%)</label>
          <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100" />
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 'var(--space-2)' }}>
          <Save size={16} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

function PackageManager({ showToast }) {
  const { activeStudio } = useAuth();
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeStudio) fetchPackages();
  }, [activeStudio]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/packages/studio/${activeStudio._id}`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data.map(p => ({ ...p, id: p._id })));
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pkg) => {
    try {
      if (editing) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/packages/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pkg)
        });
        if (!res.ok) throw new Error('Update failed');
        showToast('Package updated', 'success');
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...pkg, studioId: activeStudio._id })
        });
        if (!res.ok) throw new Error('Create failed');
        showToast('Package added', 'success');
      }
      fetchPackages();
      setEditing(null);
      setShowAdd(false);
    } catch (error) {
      console.error(error);
      showToast('Error saving package', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this package?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/packages/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        showToast('Package deleted', 'info');
        fetchPackages();
      } catch (error) {
        console.error(error);
        showToast('Error deleting package', 'error');
      }
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
          <Package size={20} />
        </div>
        <div>
          <h2>Photography Packages</h2>
          <p>Manage your service packages</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="settings-list">
        {packages.map(pkg => (
          <div key={pkg.id} className="settings-list-item">
            <div>
              <h4>{pkg.name}</h4>
              <p>{pkg.description || 'No description'}</p>
              <span className="package-price-tag">Rs. {pkg.price?.toLocaleString()}</span>
            </div>
            <div className="settings-list-actions">
              <button className="btn-icon btn-ghost" onClick={() => { setEditing(pkg); setShowAdd(true); }}>
                <Edit2 size={16} />
              </button>
              <button className="btn-icon btn-ghost" onClick={() => handleDelete(pkg.id)} style={{ color: 'var(--danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <PackageForm
          pkg={editing}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function PackageForm({ pkg, onSave, onClose }) {
  const [name, setName] = useState(pkg?.name || '');
  const [price, setPrice] = useState(pkg?.price || '');
  const [description, setDescription] = useState(pkg?.description || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2>{pkg ? 'Edit Package' : 'Add Package'}</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ name, price: Number(price), description }); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Package Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Diamond Package" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (Rs.)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What's included..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StaffManager({ showToast }) {
  const { user, activeStudio } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  useEffect(() => {
    if (activeStudio) {
      fetchStaff();
    }
  }, [activeStudio]);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/studios/${activeStudio._id}/members`);
      if (res.ok) {
        const data = await res.json();
        // Exclude the current admin from the 'staff' view if desired, or keep everyone to show the team
        // We'll keep everyone but mark roles.
        setStaff(data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword || !staffName || !isFirebaseAvailable) return;
    
    setLoading(true);
    try {
      // 1. Create a secondary Firebase app to register the user without logging out the current admin
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryAuthApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffEmail, staffPassword);
      await updateProfile(userCredential.user, { displayName: staffName });
      
      const newStaffUid = userCredential.user.uid;
      
      // 2. Sync User to MongoDB
      const syncRes = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: newStaffUid,
          email: staffEmail.toLowerCase(),
          displayName: staffName,
          photoURL: ''
        })
      });

      if (!syncRes.ok) throw new Error('Failed to sync user to database');

      // 3. Add User to Studio Members
      const addRes = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/studios/${activeStudio._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: newStaffUid,
          role: 'staff'
        })
      });

      if (!addRes.ok) throw new Error('Failed to add user to studio');
      
      // 4. Send automated email via EmailJS
      if (import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            staff_name: staffName,
            studio_name: activeStudio.name,
            staff_email: staffEmail.toLowerCase(),
            staff_password: staffPassword,
            app_link: window.location.origin
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      }
      
      // Update UI
      fetchStaff();
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setShowAdd(false);
      showToast('Staff account created and email sent successfully!', 'success');
      
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create staff account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (staffUid) => {
    if (staffUid === user.uid) {
      showToast('You cannot remove yourself', 'warning');
      return;
    }
    if (!window.confirm('Remove this staff member? They will lose access to your studio.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/studios/${activeStudio._id}/members/${staffUid}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to remove staff');
      fetchStaff();
      showToast('Staff member removed', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove staff', 'error');
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
          <Users size={20} />
        </div>
        <div>
          <h2>Staff Accounts</h2>
          <p>Manage user access levels</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)} style={{ marginLeft: 'auto' }}>
          {showAdd ? <X size={16} /> : <><Plus size={16} /> Add</>}
        </button>
      </div>

      {showAdd && (
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h4 style={{ color: 'var(--text-secondary)' }}>Create New Staff Account</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Staff Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kamal Perera" 
                  value={staffName} 
                  onChange={e => setStaffName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="staff@example.com" 
                  value={staffEmail} 
                  onChange={e => setStaffEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Temporary Password</label>
              <input 
                type="text" 
                placeholder="e.g. securePass123" 
                value={staffPassword} 
                onChange={e => setStaffPassword(e.target.value)} 
                required 
                minLength={6}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !staffEmail || !staffName || !staffPassword}>
              {loading ? 'Creating Account & Sending Email...' : 'Create Account & Email Invite'}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>This will instantly create an account and email the login details to the staff member.</p>
          </form>
        </div>
      )}

      <div className="settings-list">
        {staff.length === 0 && (
          <p style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-tertiary)' }}>No staff members added yet.</p>
        )}

        {/* Active Staff */}
        {staff.map(u => (
          <div key={u.id} className="settings-list-item" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 200px', minWidth: 0 }}>
              <div className="avatar avatar-md" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                {u.displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.displayName}</h4>
                <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="badge badge-info"><Shield size={12} /> {u.role}</span>
              <button className="btn-icon btn-ghost" onClick={() => handleRemoveStaff(u.id)} style={{ color: 'var(--danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

function DataManager({ showToast }) {
  const handleReset = () => {
    if (window.confirm('This will reset ALL data to demo defaults. Are you sure?')) {
      demoStore.resetData();
      showToast('All data has been reset to defaults', 'warning');
      window.location.reload();
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
          <RefreshCw size={20} />
        </div>
        <div>
          <h2>Data Management</h2>
          <p>Reset and manage application data</p>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)' }}>
        <button className="btn btn-danger" onClick={handleReset}>
          <RefreshCw size={16} /> Reset All Data to Defaults
        </button>
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
          This will erase all changes and restore demo data. This action cannot be undone.
        </p>
      </div>
    </div>
  );
}

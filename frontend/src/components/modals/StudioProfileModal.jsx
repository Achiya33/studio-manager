import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Phone, MapPin, Camera, Save, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function StudioProfileModal({ onClose }) {
  const { activeStudio, setUserStudios, userStudios, setActiveStudio } = useAuth();
  const { showToast } = useNotifications();
  const [formData, setFormData] = useState({
    name: activeStudio?.name || '',
    type: activeStudio?.type || 'photographer',
    phone: activeStudio?.phone || '',
    address: activeStudio?.address || '',
  });
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeStudio) {
      setFormData({
        name: activeStudio.name || '',
        type: activeStudio.type || 'photographer',
        phone: activeStudio.phone || '',
        address: activeStudio.address || '',
      });
    }
  }, [activeStudio]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let base64Logo = activeStudio?.logoUrl;
      if (base64Logo && base64Logo.startsWith('blob:')) {
        base64Logo = '';
      }

      if (logo) {
        base64Logo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(logo);
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/studios/${activeStudio._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl: base64Logo })
      });

      if (!response.ok) throw new Error('Failed to update studio profile');
      const updatedStudio = await response.json();
      showToast('Studio profile updated successfully', 'success');
      
      setUserStudios(userStudios.map(s => s._id === updatedStudio._id ? updatedStudio : s));
      setActiveStudio(updatedStudio);
      
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Studio Profile</h2>
          <button className="btn-icon btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{
                width: '100px', height: '100px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-hover)', border: '2px dashed var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative'
              }}
              onClick={() => document.getElementById('modal-settings-logo').click()}
            >
              {logo ? (
                <img src={URL.createObjectURL(logo)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : activeStudio?.logoUrl && !activeStudio.logoUrl.startsWith('blob:') ? (
                <img src={activeStudio.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="var(--text-tertiary)" />
              )}
              <input 
                id="modal-settings-logo" type="file" accept="image/*" 
                onChange={(e) => setLogo(e.target.files[0])} style={{ display: 'none' }} 
              />
            </div>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: '8px' }}>Click to change logo</span>
          </div>

          <div className="form-group">
            <label className="form-label">Studio Name</label>
            <div className="input-with-icon">
              <Building size={18} className="input-icon" />
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

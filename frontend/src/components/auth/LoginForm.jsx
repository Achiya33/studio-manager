import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Mail, Lock, AlertCircle, Eye, EyeOff, Building, Phone, MapPin, Key, User } from 'lucide-react';
import './LoginForm.css';

export default function LoginForm() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  
  // General auth states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Setup states (for Registration)
  const [studioName, setStudioName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [studioType, setStudioType] = useState('photographer');
  const [logo, setLogo] = useState(null);

  // Status states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, register, resetPassword, loginWithGoogle, createStudio, activeStudio } = useAuth();
  const navigate = useNavigate();

  // Redirect if logged in and fully setup
  useEffect(() => {
    if (user && activeStudio) {
      navigate('/', { replace: true });
    }
  }, [user, activeStudio, navigate]);

  const handleAuthSuccess = async (userData) => {
    // If they have studios, AuthContext fetchStudios will set activeStudio and trigger the useEffect above.
    // If this is a manual register with studioName, we just create it.
    if (mode === 'register' && studioName) {
      try {
        let base64Logo = '';
        if (logo) {
          base64Logo = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(logo);
          });
        }
        await createStudio({ studioName, phoneNumber, address, logoUrl: base64Logo, studioType }, userData.uid);
        navigate('/', { replace: true });
      } catch (err) {
        setError('Account created, but failed to save studio details: ' + err.message);
      }
    } else {
      // For login (Google or Manual), AuthContext will fetch studios.
      // We will set a timeout to check if they have no studios after a bit, or rely on activeStudio.
      // Actually, if we just wait 1 second, and no activeStudio is set, we show setup.
      setTimeout(() => {
        if (!localStorage.getItem('active_studio_id')) {
          setMode('setup');
        }
      }, 1500);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      await handleAuthSuccess(userData);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // 1. Create User in Firebase
      const userData = await register(fullName, email, password);
      // AuthContext onAuthStateChanged will pick this up and sync with backend.
      // The delay in syncing means we should manually call setup or rely on handleAuthSuccess.
      await handleAuthSuccess(userData);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const userData = await loginWithGoogle();
      await handleAuthSuccess(userData);
    } catch (err) {
      setError(err.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let base64Logo = '';
      if (logo) {
        base64Logo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(logo);
        });
      }
      await createStudio({ studioName, phoneNumber, address, logoUrl: base64Logo, studioType });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save studio details.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------
  const renderGoogleButton = () => (
    <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>OR CONTINUE WITH</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
      </div>
      <button 
        type="button" 
        className="btn btn-secondary btn-lg login-btn" 
        onClick={handleGoogleLogin} 
        disabled={loading}
        style={{ background: '#fff', color: '#000', border: 'none' }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style={{ width: 18, height: 18, marginRight: 8 }} />
        Sign in with Google
      </button>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Camera size={32} />
            </div>
            <h1>Studio Manager Pro</h1>
            
            {/* Tabs for Sign In / Register (Hidden in setup mode) */}
            {mode !== 'setup' && (
              <div className="auth-tabs" style={{ display: 'flex', marginTop: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '4px' }}>
                <button 
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: mode === 'signin' ? 'var(--primary)' : 'transparent', color: mode === 'signin' ? 'var(--bg-card)' : 'var(--text-secondary)', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: mode === 'register' ? 'var(--primary)' : 'transparent', color: mode === 'register' ? 'var(--bg-card)' : 'var(--text-secondary)', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  Register
                </button>
              </div>
            )}
            {mode === 'setup' && <p>Complete your studio profile</p>}
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="login-error" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
              <AlertCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          {/* ----------------- SIGN IN MODE ----------------- */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer' }}>
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon" style={{ marginTop: 'var(--space-2)' }}>
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                {loading ? <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
              </button>
              
              {renderGoogleButton()}
            </form>
          )}

          {/* ----------------- REGISTER MODE ----------------- */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required minLength="6" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '16px 0' }}></div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Studio Details</p>

              <div className="form-group">
                <label className="form-label">Studio Type</label>
                <div className="input-with-icon">
                  <select 
                    value={studioType}
                    onChange={(e) => setStudioType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--glass-border)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'auto'
                    }}
                  >
                    <option value="photographer" style={{ background: 'var(--bg-card)' }}>Photographer</option>
                    <option value="videographer" style={{ background: 'var(--bg-card)' }}>Videographer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-studio-name">Studio Name</label>
                <div className="input-with-icon">
                  <Building size={18} className="input-icon" />
                  <input id="reg-studio-name" type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} placeholder="e.g. Wedding Diary" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input id="reg-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 071 234 5678" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-address">Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input id="reg-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Colombo, Sri Lanka" required />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
                <label className="form-label" htmlFor="reg-logo" style={{ alignSelf: 'flex-start' }}>Studio Logo</label>
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '2px dashed var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  onClick={() => document.getElementById('reg-logo').click()}
                >
                  {logo ? (
                    <img src={URL.createObjectURL(logo)} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={24} color="var(--text-tertiary)" />
                  )}
                  <input 
                    id="reg-logo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setLogo(e.target.files[0])} 
                    style={{ display: 'none' }} 
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                  {logo ? 'Click to change logo' : 'Upload your studio logo'}
                </p>
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                {loading ? <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
              </button>

              {renderGoogleButton()}
            </form>
          )}

          {/* ----------------- SETUP MODE (Fallback for Google Login without details) ----------------- */}
          {mode === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Studio Type</label>
                <div className="input-with-icon">
                  <select 
                    value={studioType}
                    onChange={(e) => setStudioType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--glass-border)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'auto'
                    }}
                  >
                    <option value="photographer" style={{ background: 'var(--bg-card)' }}>Photographer</option>
                    <option value="videographer" style={{ background: 'var(--bg-card)' }}>Videographer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setup-studio-name">Studio Name</label>
                <div className="input-with-icon">
                  <Building size={18} className="input-icon" />
                  <input id="setup-studio-name" type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} placeholder="e.g. Wedding Diary" required autoFocus />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setup-phone">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input id="setup-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 071 234 5678" required />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="setup-address">Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input id="setup-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Colombo, Sri Lanka" required />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
                <label className="form-label" htmlFor="setup-logo" style={{ alignSelf: 'flex-start' }}>Studio Logo</label>
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '2px dashed var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  onClick={() => document.getElementById('setup-logo').click()}
                >
                  {logo ? (
                    <img src={URL.createObjectURL(logo)} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={24} color="var(--text-tertiary)" />
                  )}
                  <input 
                    id="setup-logo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setLogo(e.target.files[0])} 
                    style={{ display: 'none' }} 
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                  {logo ? 'Click to change logo' : 'Upload your studio logo'}
                </p>
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                {loading ? <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Complete Setup'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

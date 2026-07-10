import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Mail, Lock, AlertCircle, Eye, EyeOff, Building, Phone, MapPin } from 'lucide-react';
import './LoginForm.css';

export default function LoginForm() {
  const [step, setStep] = useState('login'); // 'login' | 'setup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Setup form states
  const [studioName, setStudioName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const { user, login, loginWithGoogle, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.studioName || user.studioName === '') {
        setStep('setup');
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLoginSuccess = (userData) => {
    if (!userData.studioName || userData.studioName === '') {
      setStep('setup');
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      handleLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const userData = await loginWithGoogle();
      handleLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Google Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateUserProfile({ studioName, phoneNumber, address, role: 'admin' });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save studio details.');
    } finally {
      setLoading(false);
    }
  };

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
            <p>{step === 'login' ? 'Sign in to manage your studio' : 'Set up your studio profile'}</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {step === 'login' ? (
            <>
              <form onSubmit={handleEmailSubmit} className="login-form">
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
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                  {loading ? (
                    <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

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

              <div className="login-demo-info" style={{ marginTop: 'var(--space-6)' }}>
                <p className="demo-label">Demo Credentials</p>
                <div className="demo-credentials">
                  <div className="demo-cred" onClick={() => { setEmail('admin@studio.com'); setPassword('admin123'); }}>
                    <span className="demo-role">Admin</span>
                    <span>admin@studio.com / admin123</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSetupSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="studio-name">Studio Name</label>
                <div className="input-with-icon">
                  <Building size={18} className="input-icon" />
                  <input
                    id="studio-name"
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="e.g. Wedding Diary"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="studio-phone">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="studio-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 071 234 5678"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="studio-address">Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    id="studio-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Colombo, Sri Lanka"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Home, Camera } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="loading-page" style={{ gap: 'var(--space-6)' }}>
      <div style={{ width: 80, height: 80, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
        <Camera size={40} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Page not found</p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

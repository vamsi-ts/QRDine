import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { homeForRole } from '../utils/roles';

export function AdminLoginPage() {
  const { login, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const userRole = await login(email, password);
      toast.success(`Welcome back! Logged in as ${userRole}.`);
      navigate(homeForRole(userRole));
    } catch {
      setError('Invalid email/password or inactive staff account.');
      toast.error('Login failed. Please check your credentials.');
    }
  }

  if (role) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-badge" style={{ width: '56px', height: '56px', borderRadius: '16px', marginBottom: '1rem' }}>
            <UtensilsCrossed size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Staff Portal</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Sign in to access restaurant management</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ padding: '0.65rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Sign In <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.78rem', color: '#64748b' }}>
            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>Demo Accounts:</strong>
            • Admin: admin@restaurant.com / admin123<br />
            • Waiter: waiter@restaurant.com / waiter123<br />
            • Kitchen: kitchen@restaurant.com / kitchen123
          </div>
        </form>
      </div>
    </div>
  );
}
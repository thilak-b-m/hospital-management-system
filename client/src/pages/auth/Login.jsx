import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IcoCross, IcoEye, IcoEyeOff } from '../../components/ui/Icons';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    navigate('/patient/dashboard');
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 700 }}>
          <IcoCross />
          LifeCare
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, opacity: 0.9 }}>
          Hospital Management System
        </div>
        <div style={{ fontSize: 14, opacity: 0.7, textAlign: 'center', marginTop: 6 }}>
          Compassionate Care,<br />Better Health
        </div>

        {/* Building illustration (SVG art) */}
        <div className="hospital-art">
          <svg viewBox="0 0 260 160" width="240" height="150">
            {/* Sky */}
            <rect width="260" height="160" fill="rgba(255,255,255,0.05)" rx="12"/>
            {/* Building body */}
            <rect x="55" y="40" width="150" height="100" fill="rgba(255,255,255,0.15)" rx="4"/>
            {/* Roof */}
            <rect x="45" y="32" width="170" height="14" fill="rgba(255,255,255,0.2)" rx="3"/>
            {/* Cross sign */}
            <rect x="117" y="48" width="26" height="8" fill="#60a5fa" rx="2"/>
            <rect x="127" y="42" width="6" height="20" fill="#60a5fa" rx="2"/>
            {/* Windows row 1 */}
            {[70,100,130,160].map(x => (
              <rect key={x} x={x} y="62" width="20" height="16" fill="rgba(255,255,255,0.3)" rx="2"/>
            ))}
            {/* Windows row 2 */}
            {[70,100,160].map(x => (
              <rect key={x} x={x} y="88" width="20" height="16" fill="rgba(255,255,255,0.25)" rx="2"/>
            ))}
            {/* Door */}
            <rect x="118" y="110" width="24" height="30" fill="rgba(255,255,255,0.3)" rx="2"/>
            {/* Ambulance */}
            <rect x="10" y="122" width="55" height="28" fill="rgba(255,255,255,0.2)" rx="4"/>
            <rect x="10" y="128" width="28" height="16" fill="#60a5fa" rx="2" opacity="0.5"/>
            <circle cx="22" cy="150" r="6" fill="rgba(255,255,255,0.4)"/>
            <circle cx="22" cy="150" r="3" fill="rgba(255,255,255,0.7)"/>
            <circle cx="52" cy="150" r="6" fill="rgba(255,255,255,0.4)"/>
            <circle cx="52" cy="150" r="3" fill="rgba(255,255,255,0.7)"/>
            {/* Trees */}
            <ellipse cx="225" cy="128" rx="16" ry="20" fill="rgba(255,255,255,0.1)"/>
            <rect x="223" y="140" width="4" height="10" fill="rgba(255,255,255,0.15)"/>
            <ellipse cx="245" cy="132" rx="12" ry="16" fill="rgba(255,255,255,0.08)"/>
            <rect x="243" y="142" width="4" height="8" fill="rgba(255,255,255,0.12)"/>
            {/* Ground */}
            <rect x="0" y="148" width="260" height="12" fill="rgba(255,255,255,0.08)" rx="0 0 12 12"/>
          </svg>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Please login to your account</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email" name="email"
                placeholder="Enter your email"
                value={form.email} onChange={handle} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'} name="password"
                  placeholder="Enter your password"
                  value={form.password} onChange={handle} required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPwd ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Login
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

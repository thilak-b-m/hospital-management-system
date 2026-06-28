import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IcoCross, IcoEye, IcoEyeOff } from '../../components/ui/Icons';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 700 }}>
          <IcoCross /> HMS
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, opacity: 0.9 }}>Hospital Management System</div>
        <div style={{ fontSize: 14, opacity: 0.7, textAlign: 'center', marginTop: 6 }}>
          Compassionate Care,<br />Better Health
        </div>
        <div className="hospital-art" style={{ marginTop: 32 }}>
          <svg viewBox="0 0 200 120" width="180" height="110">
            <rect width="200" height="120" fill="rgba(255,255,255,0.05)" rx="10"/>
            <rect x="50" y="20" width="100" height="80" fill="rgba(255,255,255,0.15)" rx="4"/>
            <rect x="85" y="28" width="30" height="8" fill="#60a5fa" rx="2"/>
            <rect x="95" y="22" width="10" height="20" fill="#60a5fa" rx="2"/>
            {[60,90,120].map(x => <rect key={x} x={x} y="40" width="16" height="12" fill="rgba(255,255,255,0.3)" rx="2"/>)}
            <rect x="87" y="72" width="26" height="28" fill="rgba(255,255,255,0.3)" rx="2"/>
          </svg>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create Account</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Register as a patient</p>

          <form onSubmit={e => { e.preventDefault(); navigate('/patient/dashboard'); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Enter your full name" value={form.name} onChange={handle} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handle} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phone" placeholder="Enter your phone number" value={form.phone} onChange={handle} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? 'text' : 'password'} name="password"
                  placeholder="Create a password" value={form.password} onChange={handle} required style={{ paddingRight: 40 }}/>
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPwd ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirm" placeholder="Confirm your password" value={form.confirm} onChange={handle} required/>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}>
              Register
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

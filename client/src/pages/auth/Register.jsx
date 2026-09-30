import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IcoEye, IcoEyeOff } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (result.success) {
      navigate('/patient/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:26, fontWeight:700 }}>
          <svg viewBox="0 0 32 32" width="36" height="36" fill="none">
            <circle cx="16" cy="16" r="16" fill="#60a5fa"/>
            <rect x="14" y="7" width="4" height="18" fill="white" rx="1"/>
            <rect x="7" y="14" width="18" height="4" fill="white" rx="1"/>
          </svg>
          CityCare Hospital
        </div>
        <div style={{ fontSize:14, opacity:0.7, textAlign:'center', marginTop:8 }}>
          Compassionate Care, Better Health
        </div>
        <div className="hospital-art" style={{ marginTop:32 }}>
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
          <h2 style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>Create Account</h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Register as a patient</p>

          {error && (
            <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, border:'1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
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
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPwd ? 'text' : 'password'} name="password"
                  placeholder="Min. 8 characters" value={form.password} onChange={handle} required minLength={8} maxLength={72} style={{ paddingRight:40 }}/>
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                  {showPwd ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirm" placeholder="Confirm your password" value={form.confirm} onChange={handle} required/>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', marginTop:4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p style={{ marginTop:20, textAlign:'center', fontSize:14, color:'#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

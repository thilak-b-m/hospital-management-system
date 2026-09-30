import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IcoEye, IcoEyeOff, IcoUser, IcoStethoscope, IcoSettings } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { key: 'patient', label: 'Patient',  Icon: IcoUser,        redirect: '/patient/dashboard' },
  { key: 'doctor',  label: 'Doctor',   Icon: IcoStethoscope, redirect: '/doctor/dashboard'  },
  { key: 'admin',   label: 'Admin',    Icon: IcoSettings,    redirect: '/admin/dashboard'   },
];

const HospitalSVG = () => (
  <svg viewBox="0 0 260 160" width="240" height="150">
    <rect width="260" height="160" fill="rgba(255,255,255,0.05)" rx="12"/>
    <rect x="55" y="40" width="150" height="100" fill="rgba(255,255,255,0.15)" rx="4"/>
    <rect x="45" y="32" width="170" height="14" fill="rgba(255,255,255,0.2)" rx="3"/>
    <rect x="117" y="48" width="26" height="8" fill="#60a5fa" rx="2"/>
    <rect x="127" y="42" width="6" height="20" fill="#60a5fa" rx="2"/>
    {[70,100,130,160].map(x=><rect key={x} x={x} y="62" width="20" height="16" fill="rgba(255,255,255,0.3)" rx="2"/>)}
    {[70,100,160].map(x=><rect key={x} x={x} y="88" width="20" height="16" fill="rgba(255,255,255,0.25)" rx="2"/>)}
    <rect x="118" y="110" width="24" height="30" fill="rgba(255,255,255,0.3)" rx="2"/>
    <rect x="10" y="122" width="55" height="28" fill="rgba(255,255,255,0.2)" rx="4"/>
    <rect x="10" y="128" width="28" height="16" fill="#60a5fa" rx="2" opacity="0.5"/>
    <circle cx="22" cy="150" r="6" fill="rgba(255,255,255,0.4)"/>
    <circle cx="22" cy="150" r="3" fill="rgba(255,255,255,0.7)"/>
    <circle cx="52" cy="150" r="6" fill="rgba(255,255,255,0.4)"/>
    <circle cx="52" cy="150" r="3" fill="rgba(255,255,255,0.7)"/>
    <rect x="0" y="148" width="260" height="12" fill="rgba(255,255,255,0.08)"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password, role);
    if (result.success) {
      navigate(ROLES.find(r => r.key === role).redirect);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:26, fontWeight:700 }}>
          <img src="/shield-plus.svg" alt="" width="36" height="36" />
          CityCare Hospital
        </div>
        <div style={{ fontSize:14, opacity:0.7, textAlign:'center', marginTop:8 }}>
          Compassionate Care, Better Health
        </div>
        <div className="hospital-art"><HospitalSVG /></div>
        <div style={{ marginTop:16, textAlign:'center', opacity:0.6, fontSize:13, lineHeight:1.8 }}>
          Trusted by 10,000+ patients<br/>across 50+ departments
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 style={{ fontSize:26, fontWeight:700, marginBottom:4 }}>Welcome Back</h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Please login to your account</p>

          <div style={{ display:'flex', gap:8, marginBottom:28, background:'#f1f5f9', borderRadius:10, padding:4 }}>
            {ROLES.map(({ key, label, Icon }) => (
              <button key={key} type="button" onClick={() => { setRole(key); setError(''); }}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'8px 4px', borderRadius:8, border:'none', cursor:'pointer',
                  fontSize:13, fontWeight:600, transition:'all 0.2s',
                  background: role === key ? 'white' : 'transparent',
                  color: role === key ? 'var(--primary)' : '#64748b',
                  boxShadow: role === key ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                }}>
                <span style={{ width:16, height:16, display:'flex' }}><Icon /></span>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, border:'1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email"
                placeholder={`Enter ${role} email`}
                value={form.email} onChange={handle} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="form-input"
                  type={showPwd ? 'text' : 'password'} name="password"
                  placeholder="Enter your password"
                  value={form.password} onChange={handle} required
                  style={{ paddingRight:40 }}/>
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                  {showPwd ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Logging in...' : `Login as ${ROLES.find(r=>r.key===role).label}`}
            </button>
          </form>

          {role === 'patient' && (
            <p style={{ marginTop:20, textAlign:'center', fontSize:14, color:'#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

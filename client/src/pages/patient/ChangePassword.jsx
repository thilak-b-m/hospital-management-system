import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoEye, IcoEyeOff } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [show, setShow] = useState({ current:false, new:false, confirm:false });
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggle = key => setShow(p => ({ ...p, [key]: !p[key] }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (form.newPassword !== form.confirmPassword) {
      setStatus('error'); setMessage('New passwords do not match'); return;
    }
    if (form.newPassword.length < 8) {
      setStatus('error'); setMessage('New password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus('success');
      setMessage('Password changed successfully!');
      setForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, showKey }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position:'relative' }}>
        <input className="form-input" type={show[showKey] ? 'text' : 'password'}
          name={name} value={form[name]} onChange={handle} required style={{ paddingRight:42 }}/>
        <button type="button" onClick={() => toggle(showKey)}
          style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
          {show[showKey] ? <IcoEyeOff /> : <IcoEye />}
        </button>
      </div>
    </div>
  );

  return (
    <PatientLayout>
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <div className="card">
          <div className="section-title">Change Password</div>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>
            Update your password to keep your account secure.
          </p>

          {status && (
            <div style={{
              background: status==='success' ? '#dcfce7' : '#fee2e2',
              color: status==='success' ? '#15803d' : '#dc2626',
              borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13,
              border: `1px solid ${status==='success' ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {message}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Field label="Current Password"  name="currentPassword"  showKey="current" />
            <Field label="New Password"      name="newPassword"      showKey="new" />
            <Field label="Confirm New Password" name="confirmPassword" showKey="confirm" />
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </PatientLayout>
  );
}

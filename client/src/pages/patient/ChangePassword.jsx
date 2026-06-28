import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoEye, IcoEyeOff, IcoLock } from '../../components/ui/Icons';

export default function ChangePassword() {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [msg, setMsg] = useState('');

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggle = k => setShow(p => ({ ...p, [k]: !p[k] }));

  const submit = e => {
    e.preventDefault();
    if (form.newPwd !== form.confirm) { setMsg('error'); return; }
    setMsg('success');
    setForm({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setMsg(''), 3000);
  };

  const FIELDS = [
    { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
    { key: 'newPwd', label: 'New Password', placeholder: 'Enter new password' },
    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password' },
  ];

  return (
    <PatientLayout>
      <div style={{ maxWidth: 500 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dbeafe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcoLock />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Change Password</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Update your account password</div>
            </div>
          </div>

          {msg === 'success' && (
            <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
              ✓ Password changed successfully!
            </div>
          )}
          {msg === 'error' && (
            <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
              ✗ New passwords do not match.
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={show[key] ? 'text' : 'password'}
                    name={key}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={handle}
                    required
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => toggle(key)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {show[key] ? <IcoEyeOff /> : <IcoEye />}
                  </button>
                </div>
              </div>
            ))}

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#64748b', border: '1px solid #e2e8f0' }}>
              Password requirements: min. 8 characters, one uppercase letter, one number.
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </PatientLayout>
  );
}

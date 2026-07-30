import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import {
  IcoUser, IcoMail, IcoPhone, IcoCalendar, IcoGender, IcoHome,
  IcoCheck, IcoCircle, IcoLock, IcoEye, IcoEyeOff
} from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function CompletionRing({ pct }) {
  const r = 34, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-wrap">
      <svg width="80" height="80">
        <circle cx="40" cy="40" r={r} stroke="#e2e8f0" strokeWidth="7" fill="none"/>
        <circle cx="40" cy="40" r={r} stroke="var(--primary)" strokeWidth="7" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.6s' }}/>
      </svg>
      <div className="ring-center">{pct}%</div>
    </div>
  );
}

export default function MyProfile() {
  const { user, updateUser } = useAuth();

  // Profile state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    gender: user?.gender || '', address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwd = e => setPwdForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggleShow = key => setShow(p => ({ ...p, [key]: !p[key] }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      setEditing(false);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' }); return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg(null), 3000);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwdLoading(false);
    }
  };

  const completion = [
    { label: 'Basic Information',  done: !!(form.name && form.email) },
    { label: 'Contact Information', done: !!form.phone },
    { label: 'Address',            done: !!form.address },
    { label: 'Emergency Contact',  done: !!form.emergencyContact },
  ];
  const pct = Math.round(completion.filter(c => c.done).length / completion.length * 100);

  const INFO = [
    { label: 'Full Name',     value: form.name,   Icon: IcoUser     },
    { label: 'Email',         value: form.email,  Icon: IcoMail     },
    { label: 'Phone',         value: form.phone,  Icon: IcoPhone    },
    { label: 'Date of Birth', value: form.dob ? new Date(form.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '', Icon: IcoCalendar },
    { label: 'Gender',        value: form.gender, Icon: IcoGender   },
    { label: 'Address',       value: form.address, Icon: IcoHome    },
  ];

  const Alert = ({ msg }) => msg ? (
    <div style={{
      background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
      color: msg.type === 'success' ? '#15803d' : '#dc2626',
      borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13,
      border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
    }}>{msg.text}</div>
  ) : null;

  const PwdField = ({ label, name, showKey }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input className="form-input" type={show[showKey] ? 'text' : 'password'}
          name={name} value={pwdForm[name]} onChange={handlePwd} required style={{ paddingRight: 42 }}/>
        <button type="button" onClick={() => toggleShow(showKey)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
          {show[showKey] ? <IcoEyeOff /> : <IcoEye />}
        </button>
      </div>
    </div>
  );

  return (
    <PatientLayout>
      <div className="grid-2" style={{ alignItems: 'start' }}>

        {/* Left column: Profile + Change Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Personal Information */}
          <div className="card">
            <div className="section-title">Personal Information</div>
            <Alert msg={profileMsg} />

            {!editing ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {INFO.map(({ label, value, Icon }) => (
                    <div key={label} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #f1f5f9', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 130, color: '#64748b', fontSize: 14 }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                        <span style={{ color: '#94a3b8' }}><Icon /></span>
                        {value || <span style={{ color: '#94a3b8' }}>Not provided</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '11px' }}
                  onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" name="name" value={form.name} onChange={handle}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" name="email" type="email" value={form.email} onChange={handle}/>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handle}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-input" type="date" name="dob" value={form.dob} onChange={handle}/>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={form.gender} onChange={handle}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input className="form-input" name="emergencyContact" value={form.emergencyContact} onChange={handle} placeholder="+91 00000 00000"/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" name="address" value={form.address} onChange={handle} style={{ minHeight: 60 }}/>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn-primary" disabled={profileLoading}
                    style={{ flex: 1, justifyContent: 'center', padding: '11px', opacity: profileLoading ? 0.7 : 1 }}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-outline" style={{ flex: 1, padding: '11px' }}
                    onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: 'var(--primary)' }}><IcoLock /></span>
              <div className="section-title" style={{ marginBottom: 0 }}>Change Password</div>
            </div>
            <Alert msg={pwdMsg} />
            <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PwdField label="Current Password"      name="currentPassword"  showKey="current" />
              <PwdField label="New Password"          name="newPassword"      showKey="new" />
              <PwdField label="Confirm New Password"  name="confirmPassword"  showKey="confirm" />
              <button type="submit" className="btn-primary" disabled={pwdLoading}
                style={{ width: '100%', justifyContent: 'center', padding: '11px', opacity: pwdLoading ? 0.7 : 1 }}>
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Completion + Patient ID */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="section-title">Profile Completion</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <CompletionRing pct={pct} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Complete your profile</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Add remaining details</div>
            </div>
          </div>
          {completion.map(({ label, done }) => (
            <div key={label} className="check-item">
              <span className={done ? 'check-done' : 'check-todo'}>
                {done ? <IcoCheck size={16} /> : <IcoCircle size={16} />}
              </span>
              <span style={{ fontSize: 14, color: done ? '#1e293b' : '#94a3b8' }}>{label}</span>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
            <div style={{ color: '#64748b' }}>Patient ID</div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16, marginTop: 2 }}>{user?.patientId || '—'}</div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

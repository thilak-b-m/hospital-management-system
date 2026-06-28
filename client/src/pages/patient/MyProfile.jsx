import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import {
  IcoUser, IcoMail, IcoPhone, IcoCalendar, IcoGender, IcoHome,
  IcoCheck, IcoCircle
} from '../../components/ui/Icons';

const INIT = {
  name: 'John Doe', email: 'john.doe@email.com', phone: '+1 234 567 8900',
  dob: '1995-03-15', gender: 'Male', address: '123 Main Street, New York, USA',
  emergency: '',
};

const COMPLETION = [
  { label: 'Basic Information', done: true },
  { label: 'Contact Information', done: true },
  { label: 'Address', done: true },
  { label: 'Emergency Contact', done: false },
];

function CompletionRing({ pct }) {
  const r = 34, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-wrap">
      <svg width="80" height="80">
        <circle cx="40" cy="40" r={r} stroke="#e2e8f0" strokeWidth="7" fill="none"/>
        <circle cx="40" cy="40" r={r} stroke="var(--primary)" strokeWidth="7" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.6s' }}
        />
      </svg>
      <div className="ring-center">{pct}%</div>
    </div>
  );
}

export default function MyProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(INIT);
  const [saved, setSaved] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = e => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const pct = COMPLETION.filter(c => c.done).length / COMPLETION.length * 100;

  const INFO = [
    { label: 'Full Name', value: form.name, Icon: IcoUser },
    { label: 'Email', value: form.email, Icon: IcoMail },
    { label: 'Phone Number', value: form.phone, Icon: IcoPhone },
    { label: 'Date of Birth', value: form.dob ? new Date(form.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '', Icon: IcoCalendar },
    { label: 'Gender', value: form.gender, Icon: IcoGender },
    { label: 'Address', value: form.address, Icon: IcoHome },
  ];

  return (
    <PatientLayout>
      {saved && (
        <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: 10, padding: '12px 20px', marginBottom: 20, fontWeight: 500, border: '1px solid #bbf7d0' }}>
          ✓ Profile updated successfully!
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Personal info */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Personal Information</div>
          </div>

          {!editing ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {INFO.map(({ label, value, Icon }) => (
                  <div key={label} style={{ display: 'flex', padding: '13px 0', borderBottom: '1px solid #f1f5f9', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 120, color: '#64748b', fontSize: 14 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                      <span style={{ color: '#94a3b8' }}><Icon /></span>
                      {value || <span style={{ color: '#94a3b8' }}>Not provided</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input className="form-input" name="emergency" value={form.emergency} onChange={handle} placeholder="+1 000 000 0000"/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" name="address" value={form.address} onChange={handle} style={{ minHeight: 60 }}/>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Save Changes</button>
                <button type="button" className="btn-outline" style={{ flex: 1, padding: '11px' }} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Profile completion */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="section-title">Profile Completion</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <CompletionRing pct={Math.round(pct)} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Complete your profile</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Add remaining details to complete your profile</div>
            </div>
          </div>
          {COMPLETION.map(({ label, done }) => (
            <div key={label} className="check-item">
              <span className={done ? 'check-done' : 'check-todo'}>
                {done ? <IcoCheck size={16} /> : <IcoCircle size={16} />}
              </span>
              <span style={{ fontSize: 14, color: done ? '#1e293b' : '#94a3b8' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
}

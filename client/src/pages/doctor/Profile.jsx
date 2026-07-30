import { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoCamera } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name||'', email: user?.email||'', phone: user?.phone||'',
    department: user?.department||'', qualification: user?.qualification||'',
    experience: user?.experience||'', about: user?.about||'',
    consultationFee: user?.consultationFee||500,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = form.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'DR';

  return (
    <DoctorLayout>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Profile</div>
      <div style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>Manage your profile information</div>

      {saved && (
        <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:10, padding:'12px 18px', marginBottom:16 }}>
          {error}
        </div>
      )}

      <div className="grid-2" style={{ alignItems:'start' }}>
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          <div style={{ position:'relative', marginBottom:16 }}>
            <div style={{ width:110, height:110, borderRadius:'50%', background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:700, color:'#1d4ed8' }}>
              {initials}
            </div>
            <button style={{ position:'absolute', bottom:4, right:4, width:30, height:30, borderRadius:'50%', background:'var(--primary)', border:'2px solid white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
              <IcoCamera />
            </button>
          </div>
          <div style={{ fontWeight:700, fontSize:18 }}>{form.name}</div>
          <div style={{ color:'#64748b', fontSize:14, marginTop:2 }}>{form.department}</div>
          <div style={{ marginTop:8, padding:'4px 14px', background:'#dbeafe', color:'#1d4ed8', borderRadius:20, fontSize:13, fontWeight:600 }}>
            {form.experience ? `${form.experience} yrs exp` : 'Doctor'}
          </div>
          <div style={{ marginTop:12, fontSize:13, color:'#64748b' }}>Consultation Fee</div>
          <div style={{ fontWeight:700, fontSize:20, color:'#15803d' }}>₹{form.consultationFee}</div>
        </div>

        <div className="card">
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                {editing ? <input className="form-input" name="name" value={form.name} onChange={handle}/> :
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                {editing ? <input className="form-input" type="email" name="email" value={form.email} onChange={handle}/> :
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.email}</div>}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                {editing ? <input className="form-input" name="phone" value={form.phone} onChange={handle}/> :
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                {editing ? (
                  <select className="form-select" name="department" value={form.department} onChange={handle}>
                    {['Cardiology','Neurology','Orthopedics','Dermatology','General Medicine','Pediatrics','Gynecology'].map(d=><option key={d}>{d}</option>)}
                  </select>
                ) : <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.department}</div>}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Qualification</label>
                {editing ? <input className="form-input" name="qualification" value={form.qualification} onChange={handle}/> :
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.qualification||'—'}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                {editing ? <input className="form-input" type="number" name="experience" value={form.experience} onChange={handle}/> :
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>{form.experience}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              {editing ? <input className="form-input" type="number" name="consultationFee" value={form.consultationFee} onChange={handle}/> :
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>₹{form.consultationFee}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">About Me</label>
              {editing ? <textarea className="form-textarea" name="about" value={form.about} onChange={handle} style={{ minHeight:72 }}/> :
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0', lineHeight:1.6 }}>{form.about||'—'}</div>}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {editing ? (
                <>
                  <button type="submit" className="btn-primary" disabled={loading} style={{ flex:1, justifyContent:'center', opacity: loading?0.7:1 }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-outline" style={{ flex:1 }} onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button type="button" className="btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DoctorLayout>
  );
}

import { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoCamera } from '../../components/ui/Icons';

const INIT = {
  name:'Dr. Arjun Patel', email:'arjun.patel@citycare.com',
  phone:'9876543210', department:'Cardiology',
  qualification:'MBBS, MD (Cardiology)', experience:'10 Years',
  about:'I am a cardiologist with 10+ years of experience in diagnosing and treating heart diseases.',
};

export default function DoctorProfile() {
  const [form, setForm] = useState(INIT);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = e => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DoctorLayout>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Profile</div>
      <div style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>Manage your profile information</div>

      {saved && (
        <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
          ✓ Profile updated successfully!
        </div>
      )}

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Photo + basic */}
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
          <div style={{ position:'relative', marginBottom:16 }}>
            <div style={{ width:110, height:110, borderRadius:'50%', background:'#dbeafe', overflow:'hidden' }}>
              <svg viewBox="0 0 110 110" width="110" height="110">
                <circle cx="55" cy="55" r="55" fill="#dbeafe"/>
                <circle cx="55" cy="38" r="22" fill="#93c5fd"/>
                <rect x="24" y="74" width="62" height="36" fill="#bfdbfe" rx="14"/>
                <rect x="42" y="58" width="26" height="18" fill="#93c5fd"/>
              </svg>
            </div>
            <button style={{ position:'absolute', bottom:4, right:4, width:30, height:30, borderRadius:'50%', background:'var(--primary)', border:'2px solid white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
              <IcoCamera />
            </button>
          </div>
          <div style={{ fontWeight:700, fontSize:18 }}>{form.name}</div>
          <div style={{ color:'#64748b', fontSize:14, marginTop:2 }}>{form.department}</div>
          <button className="btn-outline btn-sm" style={{ marginTop:12 }} onClick={() => {}}>
            Change Photo
          </button>
        </div>

        {/* Edit form */}
        <div className="card">
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { key:'name',          label:'Full Name',     type:'text' },
              { key:'email',         label:'Email',         type:'email' },
              { key:'phone',         label:'Phone',         type:'text' },
            ].map(({ key, label, type }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                {editing ? (
                  <input className="form-input" type={type} name={key} value={form[key]} onChange={handle}/>
                ) : (
                  <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>
                    {form[key]}
                  </div>
                )}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Department</label>
              {editing ? (
                <select className="form-select" name="department" value={form.department} onChange={handle}>
                  {['Cardiology','Neurology','Orthopedic','Dermatology','General Medicine'].map(d => <option key={d}>{d}</option>)}
                </select>
              ) : (
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>
                  {form.department}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              {editing ? (
                <input className="form-input" name="qualification" value={form.qualification} onChange={handle}/>
              ) : (
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>
                  {form.qualification}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              {editing ? (
                <input className="form-input" name="experience" value={form.experience} onChange={handle}/>
              ) : (
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0' }}>
                  {form.experience}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">About Me</label>
              {editing ? (
                <textarea className="form-textarea" name="about" value={form.about} onChange={handle} style={{ minHeight:72 }}/>
              ) : (
                <div style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:8, fontSize:14, border:'1px solid #e2e8f0', lineHeight:1.6 }}>
                  {form.about}
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              {editing ? (
                <>
                  <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Save Changes</button>
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

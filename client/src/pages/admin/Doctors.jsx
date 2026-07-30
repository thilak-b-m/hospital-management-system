import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoSearch, IcoEdit, IcoTrash, IcoEye, IcoEyeOff } from '../../components/ui/Icons';
import api from '../../api/axios';

const DEPTS = ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Gynecology','General Medicine','Radiology'];

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [deptF, setDeptF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name:'', department:'Cardiology', experience:'', email:'', phone:'', password:'', status:'Active', qualification:'', consultationFee:500 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/doctors').then(res => setDoctors(res.data.doctors||[]))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditDoc(null);
    setForm({ name:'', department:'Cardiology', experience:'', email:'', phone:'', password:'', status:'Active', qualification:'', consultationFee:500 });
    setError(''); setShowPwd(false); setShowModal(true);
  };

  const openEdit = (d) => {
    setEditDoc(d);
    setForm({
      name: d.user?.name||'', department: d.department||'Cardiology',
      experience: d.experience||'', email: d.user?.email||'',
      phone: d.user?.phone||'', password:'', status: d.user?.status||'Active',
      qualification: d.qualification||'', consultationFee: d.consultationFee||500,
    });
    setError(''); setShowPwd(false); setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editDoc) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/doctors/${editDoc._id}`, payload);
      } else {
        await api.post('/admin/doctors', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Delete this doctor? All their appointments and prescriptions will also be deleted.')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = doctors.filter(d => {
    const name = d.user?.name||'';
    const email = d.user?.email||'';
    const s = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    const dept = deptF==='All' || d.department===deptF;
    const st = statusF==='All' || d.user?.status===statusF;
    return s && dept && st;
  });

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Doctors</div>
          <div className="page-header-sub">Manage doctors and their information.</div>
        </div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus size={14}/> Add Doctor</button>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctors..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={deptF} onChange={e=>setDeptF(e.target.value)}>
            <option value="All">All Departments</option>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="All">All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading doctors...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Doctor</th><th>Department</th><th>Experience</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const initials = d.user?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'DR';
                  return (
                    <tr key={d._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="doc-avatar" style={{ background:'#ede9fe', color:'#7c3aed' }}>{initials}</div>
                          <span style={{ fontWeight:500 }}>{d.user?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13 }}>{d.department}</td>
                      <td style={{ fontSize:13, color:'#64748b' }}>{d.experience} yrs</td>
                      <td style={{ fontSize:13, color:'#64748b' }}>{d.user?.email}</td>
                      <td style={{ fontSize:13 }}>{d.user?.phone||'—'}</td>
                      <td><span className={`badge ${d.user?.status==='Active'?'badge-active':'badge-inactive'}`}>{d.user?.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => openEdit(d)} style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                          <button onClick={() => deleteDoc(d._id)} style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}><IcoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No doctors found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:12, fontSize:13, color:'#64748b' }}>Showing {filtered.length} of {doctors.length} doctors</div>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div className="card" style={{ width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:18 }}>{editDoc ? 'Edit Doctor' : 'Add New Doctor'}</div>
                <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>Fill in the details to {editDoc?'update':'create'} a doctor account.</div>
              </div>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', width:32, height:32, fontSize:18, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13 }}>{error}</div>}

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#94a3b8', letterSpacing:'0.8px', textTransform:'uppercase' }}>Personal Information</div>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color:'#ef4444' }}>*</span></label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Dr. Full Name" required/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department <span style={{ color:'#ef4444' }}>*</span></label>
                  <select className="form-select" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}>
                    {DEPTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years) <span style={{ color:'#ef4444' }}>*</span></label>
                  <input className="form-input" type="number" min="0" value={form.experience} onChange={e=>setForm(p=>({...p,experience:e.target.value}))} placeholder="e.g. 5" required/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input className="form-input" value={form.qualification} onChange={e=>setForm(p=>({...p,qualification:e.target.value}))} placeholder="MBBS, MD..."/>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input className="form-input" type="number" min="0" value={form.consultationFee} onChange={e=>setForm(p=>({...p,consultationFee:e.target.value}))}/>
                </div>
              </div>

              <div style={{ height:1, background:'#f1f5f9' }}/>
              <div style={{ fontSize:11, fontWeight:600, color:'#94a3b8', letterSpacing:'0.8px', textTransform:'uppercase' }}>Contact &amp; Login Credentials</div>

              <div className="form-group">
                <label className="form-label">Email Address <span style={{ color:'#ef4444' }}>*</span></label>
                <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="doctor@citycare.com" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span style={{ color:'#ef4444' }}>*</span></label>
                <input className="form-input" type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="9876543210" required={!editDoc}/>
              </div>
              <div className="form-group">
                <label className="form-label">Password {!editDoc && <span style={{ color:'#ef4444' }}>*</span>}</label>
                <div style={{ position:'relative' }}>
                  <input className="form-input" type={showPwd?'text':'password'} value={form.password}
                    onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                    placeholder={editDoc ? 'Leave blank to keep current' : 'Min. 8 characters'}
                    required={!editDoc} minLength={editDoc?0:8} style={{ paddingRight:42 }}/>
                  <button type="button" onClick={()=>setShowPwd(p=>!p)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
                    {showPwd ? <IcoEyeOff /> : <IcoEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['Active','Inactive'].map(s=>(
                    <label key={s} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
                      <input type="radio" name="status" value={s} checked={form.status===s} onChange={()=>setForm(p=>({...p,status:s}))} style={{ accentColor:'var(--primary)', width:15, height:15 }}/>
                      <span style={{ color:s==='Active'?'#15803d':'#dc2626', fontWeight:500 }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ height:1, background:'#f1f5f9' }}/>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex:1, justifyContent:'center', padding:'11px', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : editDoc ? 'Update Doctor' : 'Add Doctor'}
                </button>
                <button type="button" className="btn-outline" style={{ flex:1, padding:'11px' }} onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

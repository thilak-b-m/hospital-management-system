import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoSearch, IcoEdit, IcoTrash } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [genderF, setGenderF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editPat, setEditPat] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', gender:'Male', dob:'', address:'', status:'Active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/patients').then(res => setPatients(res.data.patients||[]))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditPat(null);
    setForm({ name:'', email:'', phone:'', password:'', gender:'Male', dob:'', address:'', status:'Active' });
    setError(''); setModal(true);
  };

  const openEdit = (p) => {
    setEditPat(p);
    setForm({ name:p.name||'', email:p.email||'', phone:p.phone||'', password:'', gender:p.gender||'Male', dob:p.dob?p.dob.split('T')[0]:'', address:p.address||'', status:p.status||'Active' });
    setError(''); setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editPat) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/patients/${editPat._id}`, payload);
      } else {
        await api.post('/admin/patients', form);
      }
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  };

  const deletePat = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/admin/patients/${id}`);
      setPatients(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = patients.filter(p => {
    const s = p.name?.toLowerCase().includes(search.toLowerCase()) || p.patientId?.includes(search) || p.phone?.includes(search);
    const g = genderF==='All' || p.gender===genderF;
    const st = statusF==='All' || p.status===statusF;
    return s && g && st;
  });

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Patients</div>
          <div className="page-header-sub">Manage and view all patients.</div>
        </div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus size={14}/> Add Patient</button>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}><IcoSearch size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID or phone..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
          <select className="form-select" style={{ width:'auto', height:38 }} value={genderF} onChange={e=>setGenderF(e.target.value)}>
            <option value="All">All Gender</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="All">All Status</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading patients...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>ID</th><th>Gender</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const initials = p.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="doc-avatar">{initials}</div>
                          <span style={{ fontWeight:500 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#64748b', fontSize:12 }}>{p.patientId||'—'}</td>
                      <td style={{ color:'#64748b' }}>{p.gender||'—'}</td>
                      <td style={{ fontSize:13 }}>{p.phone}</td>
                      <td style={{ fontSize:13, color:'#64748b' }}>{p.email}</td>
                      <td><span className={`badge ${p.status==='Active'?'badge-active':'badge-inactive'}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => openEdit(p)} style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                          <button onClick={() => deletePat(p._id)} style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}><IcoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No patients found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:12, fontSize:13, color:'#64748b' }}>Showing {filtered.length} of {patients.length} patients</div>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div className="card" style={{ width:480, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:17 }}>{editPat ? 'Edit Patient' : 'Add New Patient'}</div>
              <button onClick={() => setModal(false)} style={{ background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', width:32, height:32, fontSize:18, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13 }}>{error}</div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/>
                </div>
                <div className="form-group"><label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} required/>
                </div>
              </div>
              {!editPat && (
                <div className="form-group"><label className="form-label">Password *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required minLength={8}/>
                </div>
              )}
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dob} onChange={e=>setForm(p=>({...p,dob:e.target.value}))}/>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['Active','Inactive'].map(s=>(
                    <label key={s} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
                      <input type="radio" name="pstatus" value={s} checked={form.status===s} onChange={()=>setForm(p=>({...p,status:s}))} style={{ accentColor:'var(--primary)' }}/>
                      <span style={{ color:s==='Active'?'#15803d':'#dc2626', fontWeight:500 }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : editPat ? 'Update Patient' : 'Add Patient'}
                </button>
                <button type="button" className="btn-outline" style={{ flex:1 }} onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

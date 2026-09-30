import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoEdit, IcoTrash } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const departments = [...new Set(services.map(service => service.department).filter(Boolean))].sort();
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form, setForm] = useState({ name:'', department:'', fee:'', duration:'', status:'Active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/services').then(res => setServices(res.data.services||[]))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    api.get('/admin/services').then(res => {
      if (active) setServices(res.data.services || []);
    }).catch(console.error).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const openAdd = () => {
    setEditSvc(null);
    setForm({ name:'', department:'', fee:'', duration:'', status:'Active' });
    setError(''); setModal(true);
  };

  const openEdit = (s) => {
    setEditSvc(s);
    setForm({ name:s.name, department:s.department, fee:s.fee, duration:s.duration, status:s.status });
    setError(''); setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editSvc) {
        await api.put(`/admin/services/${editSvc._id}`, form);
      } else {
        await api.post('/admin/services', form);
      }
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const deleteSvc = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div><div className="page-header-title">Services</div><div className="page-header-sub">Manage hospital services.</div></div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus size={14}/> Add Service</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading services...</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Service Name</th><th>Department</th><th>Fee</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight:500 }}>{s.name}</td>
                  <td style={{ color:'#64748b' }}>{s.department}</td>
                  <td style={{ fontWeight:600, color:'#15803d' }}>₹{s.fee}</td>
                  <td style={{ color:'#64748b' }}>{s.duration}</td>
                  <td><span className={`badge ${s.status==='Active'?'badge-active':'badge-inactive'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(s)} style={{ background:'#fef9c3', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#92400e' }}><IcoEdit /></button>
                      <button onClick={() => deleteSvc(s._id)} style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}><IcoTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No services found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
          <div className="card" style={{ width:420, maxWidth:'95vw' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:17 }}>{editSvc ? 'Edit Service' : 'Add Service'}</div>
              <button onClick={() => setModal(false)} style={{ background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', width:32, height:32, fontSize:18, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            {error && <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13 }}>{error}</div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label className="form-label">Service Name *</label>
                <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/>
              </div>
              <div className="form-group"><label className="form-label">Department *</label>
                <input className="form-input" list="service-departments" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} required />
                <datalist id="service-departments">{departments.map(department=><option key={department} value={department}/>)}</datalist>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Fee (₹) *</label>
                  <input className="form-input" type="number" min="0" value={form.fee} onChange={e=>setForm(p=>({...p,fee:e.target.value}))} required/>
                </div>
                <div className="form-group"><label className="form-label">Duration *</label>
                  <input className="form-input" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="e.g. 30 min" required/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['Active','Inactive'].map(s=>(
                    <label key={s} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
                      <input type="radio" name="svcstatus" value={s} checked={form.status===s} onChange={()=>setForm(p=>({...p,status:s}))} style={{ accentColor:'var(--primary)' }}/>
                      <span style={{ color:s==='Active'?'#15803d':'#dc2626', fontWeight:500 }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : editSvc ? 'Update' : 'Add Service'}
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

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoTrash } from '../../components/ui/Icons';
import api from '../../api/axios';

const STATUS_CLS = { Completed:'badge-completed', Confirmed:'badge-scheduled', Pending:'badge-upcoming', Cancelled:'badge-cancelled' };

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState('All');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/admin/appointments').then(res => {
      if (active) setAppointments(res.data.appointments || []);
    }).catch(console.error).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await api.patch(`/admin/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id===id ? data.appointment : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const deleteAppt = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = appointments.filter(a => {
    const matchStatus = statusF==='All' || a.status===statusF;
    const matchSearch = !search ||
      a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Appointments</div>
          <div className="page-header-sub">Manage all appointments in the system.</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient or doctor..."
            style={{ flex:1, minWidth:200, height:38, padding:'0 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e=>setStatusF(e.target.value)}>
            <option value="All">All Status</option>
            <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading appointments...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date &amp; Time</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const pInit = a.patient?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
                  return (
                    <tr key={a._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{pInit}</div>
                          <div>
                            <div style={{ fontWeight:500, fontSize:13 }}>{a.patient?.name||'Patient'}</div>
                            <div style={{ fontSize:11, color:'#94a3b8' }}>{a.patient?.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:13 }}>{a.doctor?.user?.name||'Doctor'}</td>
                      <td style={{ fontSize:13, color:'#64748b' }}>{a.doctor?.department||'—'}</td>
                      <td style={{ fontSize:12, color:'#64748b' }}>
                        {new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} {a.appointmentTime}
                      </td>
                      <td><span className={`badge ${STATUS_CLS[a.status]||'badge-pending'}`}>{a.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <select value={a.status} disabled={updating===a._id}
                            onChange={e => updateStatus(a._id, e.target.value)}
                            style={{ height:30, padding:'0 8px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:12, cursor:'pointer', outline:'none' }}>
                            <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                          </select>
                          <button onClick={() => deleteAppt(a._id)}
                            style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 7px', color:'#dc2626' }}>
                            <IcoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No appointments found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop:12, fontSize:13, color:'#64748b' }}>Showing {filtered.length} of {appointments.length} appointments</div>
      </div>
    </AdminLayout>
  );
}

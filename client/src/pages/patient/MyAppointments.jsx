import { useEffect, useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import api from '../../api/axios';

const STATUS_CLASS = { Pending:'badge-upcoming', Confirmed:'badge-scheduled', Completed:'badge-completed', Cancelled:'badge-cancelled' };

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/appointments').then(res => setAppointments(res.data.appointments || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    setCancelling(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'Cancelled' });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status:'Cancelled' } : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <PatientLayout>
      <div className="card">
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {['All','Pending','Confirmed','Completed','Cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'7px 16px', borderRadius:20, border:'1.5px solid',
                borderColor: filter===f ? 'var(--primary)' : '#e2e8f0',
                background: filter===f ? 'var(--primary)' : 'white',
                color: filter===f ? 'white' : '#64748b',
                fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
              }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading appointments...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Doctor</th><th>Department</th><th>Date &amp; Time</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => {
                  const initials = a.doctor?.user?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'DR';
                  return (
                    <tr key={a._id}>
                      <td style={{ color:'#64748b' }}>{idx+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="doc-avatar">{initials}</div>
                          <span style={{ fontWeight:500 }}>{a.doctor?.user?.name||'Doctor'}</span>
                        </div>
                      </td>
                      <td style={{ color:'#64748b' }}>{a.doctor?.department||'—'}</td>
                      <td>
                        <div style={{ fontWeight:500 }}>{new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                        <div style={{ color:'#64748b', fontSize:12 }}>{a.appointmentTime}</div>
                      </td>
                      <td><span className={`badge ${STATUS_CLASS[a.status]||'badge-pending'}`}>{a.status}</span></td>
                      <td>
                        {(a.status === 'Pending' || a.status === 'Confirmed') && (
                          <button className="btn-outline btn-sm"
                            style={{ color:'#dc2626', borderColor:'#dc2626' }}
                            disabled={cancelling === a._id}
                            onClick={() => cancel(a._id)}>
                            {cancelling === a._id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

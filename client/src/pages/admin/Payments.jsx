import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

export default function AdminPayments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('All');

  useEffect(() => {
    api.get('/admin/appointments').then(res => setAppointments(res.data.appointments || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const completed = appointments.filter(a => a.status === 'Completed');
  const totalRevenue = completed.reduce((sum, a) => sum + (a.doctor?.consultationFee || 0), 0);
  const pending = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');

  const filtered = appointments.filter(a => {
    const matchStatus = statusF === 'All' || a.status === statusF;
    const matchSearch = !search ||
      a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = [
    { label:'Total Revenue',      value:`₹${totalRevenue.toLocaleString('en-IN')}`, color:'#dcfce7', ic:'#15803d' },
    { label:'Completed Payments', value: completed.length,   color:'#dbeafe', ic:'#1d4ed8' },
    { label:'Pending Payments',   value: pending.length,     color:'#fef9c3', ic:'#b45309' },
    { label:'Total Appointments', value: appointments.length, color:'#ede9fe', ic:'#7c3aed' },
  ];

  const STATUS_CLS = { Completed:'badge-completed', Confirmed:'badge-scheduled', Pending:'badge-upcoming', Cancelled:'badge-cancelled' };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Payments</div>
          <div className="page-header-sub">Track appointment payments and revenue.</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {stats.map(({ label, value, color, ic }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:ic }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{label}</div>
              <div className="stat-number" style={{ fontSize:22, color:ic }}>{loading ? '...' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or doctor..."
            style={{ flex:1, minWidth:200, height:38, padding:'0 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          <select className="form-select" style={{ width:'auto', height:38 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="All">All Status</option>
            <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Fee</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const pInit = a.patient?.name?.split(' ').slice(0,2).map(w => w[0]).join('') || 'PT';
                  return (
                    <tr key={a._id}>
                      <td style={{ color:'#94a3b8', fontSize:13 }}>{i+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{pInit}</div>
                          <span style={{ fontWeight:500, fontSize:13 }}>{a.patient?.name || 'Patient'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13 }}>{a.doctor?.user?.name || 'Doctor'}</td>
                      <td style={{ fontSize:13, color:'#64748b' }}>{a.doctor?.department || '—'}</td>
                      <td style={{ fontSize:12, color:'#64748b' }}>
                        {new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td style={{ fontWeight:600, color:'#15803d' }}>
                        ₹{a.doctor?.consultationFee || 0}
                      </td>
                      <td><span className={`badge ${STATUS_CLS[a.status] || 'badge-pending'}`}>{a.status}</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

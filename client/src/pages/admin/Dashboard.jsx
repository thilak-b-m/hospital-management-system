import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoUsers, IcoUser, IcoCalendar, IcoReport } from '../../components/ui/Icons';
import api from '../../api/axios';

const STATUS_CLS = { Completed:'badge-completed', Confirmed:'badge-scheduled', Pending:'badge-upcoming', Cancelled:'badge-cancelled' };

function Donut({ data }) {
  const total = data.reduce((s,d) => s+d.val, 0)||1;
  const colors = ['#4f46e5','#06b6d4','#f59e0b','#ef4444'];
  const R=52, CX=70, CY=70;
  const arcs = data.map((d,i)=>{
    const start = data.slice(0, i).reduce((sum, item) => sum + item.val, 0) / total * 360;
    const end = start + (d.val/total)*360;
    const a1=((start-90)*Math.PI)/180, a2=((end-90)*Math.PI)/180;
    const x1=CX+R*Math.cos(a1), y1=CY+R*Math.sin(a1);
    const x2=CX+R*Math.cos(a2), y2=CY+R*Math.sin(a2);
    const large=end-start>180?1:0;
    return { ...d, color:colors[i%colors.length], d:`M${CX} ${CY} L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <div style={{ display:'flex', alignItems:'center', gap:24 }}>
      <svg viewBox="0 0 140 140" width="140" height="140">
        <circle cx={CX} cy={CY} r={R} fill="white"/>
        {arcs.map((a,i)=><path key={i} d={a.d} fill={a.color} opacity="0.9"/>)}
        <circle cx={CX} cy={CY} r={32} fill="white"/>
        <text x={CX} y={CY-6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={CX} y={CY+12} textAnchor="middle" fontSize="9" fill="#94a3b8">Total</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {arcs.map(d=>(
          <div key={d.label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
            <span style={{ color:'#475569', minWidth:72 }}>{d.label}</span>
            <span style={{ fontWeight:600 }}>{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setLoadError('Dashboard data is unavailable. Check that the API and database are running.');
      }).finally(() => setLoading(false));
  }, [retry]);

  const stats = [
    { label:'Total Patients',     value: data?.stats?.patients ?? '—',          Icon:IcoUsers,    color:'#dbeafe', ic:'#1d4ed8' },
    { label:'Total Doctors',      value: data?.stats?.doctors ?? '—',           Icon:IcoUser,     color:'#dcfce7', ic:'#15803d' },
    { label:'Appointments Today', value: data?.stats?.appointmentsToday ?? '—', Icon:IcoCalendar, color:'#fce7f3', ic:'#be185d' },
    { label:'Active Services',    value: data?.stats?.services ?? '—',          Icon:IcoReport,   color:'#d1fae5', ic:'#065f46' },
  ];

  const donutData = data ? (() => {
    const appts = data.recentAppointments || [];
    const counts = { Completed:0, Confirmed:0, Pending:0, Cancelled:0 };
    appts.forEach(a => { if (counts[a.status]!==undefined) counts[a.status]++; });
    return Object.entries(counts).map(([label,val]) => ({ label, val }));
  })() : [];

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700 }}>Welcome back, Admin!</div>
          <div style={{ color:'#64748b', fontSize:13, marginTop:2 }}>Here's what's happening in your hospital today.</div>
        </div>
        <div style={{ fontSize:13, color:'#64748b', display:'flex', alignItems:'center', gap:6 }}>
          <IcoCalendar />
          <span>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
        </div>
      </div>

      {loadError && (
        <div role="alert" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', background:'#fff7ed', color:'#9a3412', border:'1px solid #fed7aa', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13 }}>
          <span>{loadError}</span>
          <button className="btn-outline btn-sm" onClick={() => { setLoading(true); setRetry(value => value + 1); }}>Retry</button>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom:24 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="stat-card" style={{ opacity:0.4 }}><div style={{ height:60 }}/></div>)
        ) : stats.map(({ label, value, Icon, color, ic }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:ic }}><Icon /></div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{label}</div>
              <div className="stat-number" style={{ fontSize:24, color:ic }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12 }}>Department Overview</div>
          {data?.departmentStats?.length ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {data.departmentStats.slice(0,5).map(d => (
                <div key={d._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:500, marginBottom:5 }}>
                    <span>{d._id}</span><span style={{ color:'#64748b' }}>{d.doctors} doctors</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${Math.min((d.doctors/10)*100,100)}%`, background:'#4f46e5' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color:'#94a3b8', fontSize:14 }}>No department data yet.</div>}
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>Recent Appointment Status</div>
          {donutData.some(d=>d.val>0) ? <Donut data={donutData}/> : <div style={{ color:'#94a3b8', fontSize:14 }}>No appointment data yet.</div>}
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontWeight:600 }}>Recent Appointments</div>
          <button className="btn-outline btn-sm" onClick={() => navigate('/admin/appointments')}>View All</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date &amp; Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            {(data?.recentAppointments||[]).map((r,i) => {
              const pInit = r.patient?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{pInit}</div>
                      <span style={{ fontWeight:500, fontSize:13 }}>{r.patient?.name||'Patient'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{r.doctor?.user?.name||'Doctor'}</td>
                  <td style={{ fontSize:13, color:'#64748b' }}>{r.doctor?.department||'—'}</td>
                  <td style={{ fontSize:12, color:'#64748b' }}>
                    {new Date(r.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} {r.appointmentTime}
                  </td>
                  <td><span className={`badge ${STATUS_CLS[r.status]||'badge-pending'}`}>{r.status}</span></td>
                </tr>
              );
            })}
            {(!data?.recentAppointments?.length) && (
              <tr><td colSpan={5} style={{ textAlign:'center', color:'#94a3b8', padding:24 }}>No appointments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

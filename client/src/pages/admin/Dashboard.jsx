import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoUsers, IcoUser, IcoCalendar, IcoReport } from '../../components/ui/Icons';

const STATS = [
  { label:'Total Patients',      value:'2,543', growth:'+12.5% from last month', up:true,  Icon:IcoUsers,    color:'#dbeafe', ic:'#1d4ed8' },
  { label:'Total Doctors',       value:'156',   growth:'+8.3% from last month',  up:true,  Icon:IcoUser,     color:'#dcfce7', ic:'#15803d' },
  { label:'Appointments Today',  value:'89',    growth:'-5.2% from yesterday',   up:false, Icon:IcoCalendar, color:'#fce7f3', ic:'#be185d' },
  { label:'Total Revenue',       value:'₹12,45,300', growth:'+15.7% from last month', up:true, Icon:IcoReport, color:'#d1fae5', ic:'#065f46' },
];

const RECENT = [
  { patient:'Ramesh Sharma', initials:'RS', doctor:'Dr. Arjun Patel', dept:'Cardiology',  dt:'May 22, 2025 09:00 AM', status:'Completed' },
  { patient:'Priya Mehta',   initials:'PM', doctor:'Dr. Neha Verma',  dept:'Dermatology', dt:'May 22, 2025 10:30 AM', status:'Scheduled' },
  { patient:'Amit Verma',    initials:'AV', doctor:'Dr. Rohit Kumar', dept:'Orthopedics', dt:'May 22, 2025 11:30 AM', status:'Scheduled' },
  { patient:'Sneha Iyer',    initials:'SI', doctor:'Dr. Anjali Singh',dept:'Neurology',   dt:'May 22, 2025 01:00 PM', status:'Cancelled' },
];

const DEPTS = [
  { name:'Cardiology',  pct:88, color:'#4f46e5' },
  { name:'Orthopedics', pct:72, color:'#0891b2' },
  { name:'Dermatology', pct:61, color:'#f59e0b' },
  { name:'Neurology',   pct:48, color:'#10b981' },
];

const STATUS_CLS = { Completed:'badge-completed', Scheduled:'badge-scheduled', Cancelled:'badge-cancelled', Pending:'badge-pending' };

/* Simple SVG line chart */
function LineChart() {
  const patients =  [30,45,38,55,42,60,50,72,65,80,70,85];
  const appts    =  [20,30,28,40,35,48,40,58,52,65,58,72];
  const W=440, H=130, PAD=10;
  const toX = (i) => PAD + (i/(patients.length-1))*(W-2*PAD);
  const toY = (v) => H - PAD - ((v-15)/(90-15))*(H-2*PAD);
  const path = (arr) => arr.map((v,i) => `${i===0?'M':'L'}${toX(i)},${toY(v)}`).join(' ');
  const labels = ['16 May','17 May','18 May','19 May','20 May','21 May','22 May'];
  return (
    <svg viewBox={`0 0 ${W} ${H+24}`} width="100%" style={{ overflow:'visible' }}>
      {[20,40,60,80].map(v=>(
        <line key={v} x1={PAD} y1={toY(v)} x2={W-PAD} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1"/>
      ))}
      {[20,40,60,80].map(v=>(
        <text key={v} x={PAD-4} y={toY(v)+4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
      ))}
      <path d={path(patients)} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d={path(appts)}    fill="none" stroke="#06b6d4"  strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="0"/>
      {patients.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="#4f46e5"/>)}
      {appts.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="#06b6d4"/>)}
      {labels.map((l,i)=>(
        <text key={l} x={toX(Math.round(i*(patients.length-1)/6))} y={H+18} fontSize="9" fill="#94a3b8" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

/* SVG donut */
function Donut() {
  const data = [
    { label:'Completed', val:45, pct:50.6, color:'#4f46e5' },
    { label:'Scheduled', val:30, pct:33.7, color:'#06b6d4' },
    { label:'Cancelled', val:10, pct:11.2, color:'#f59e0b' },
    { label:'No Show',   val:4,  pct:4.5,  color:'#ef4444' },
  ];
  const R=52, CX=70, CY=70, total=89;
  let cum=0;
  const arcs = data.map(d=>{
    const start=cum, end=cum+(d.val/total)*360;
    cum=end;
    const a1=((start-90)*Math.PI)/180, a2=((end-90)*Math.PI)/180;
    const x1=CX+R*Math.cos(a1), y1=CY+R*Math.sin(a1);
    const x2=CX+R*Math.cos(a2), y2=CY+R*Math.sin(a2);
    const large=end-start>180?1:0;
    return { ...d, d:`M${CX} ${CY} L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` };
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
        {data.map(d=>(
          <div key={d.label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
            <span style={{ color:'#475569', minWidth:72 }}>{d.label}</span>
            <span style={{ fontWeight:600 }}>{d.val} <span style={{ color:'#94a3b8', fontWeight:400 }}>({d.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700 }}>Welcome back, Admin!</div>
          <div style={{ color:'#64748b', fontSize:13, marginTop:2 }}>Here's what's happening in your hospital today.</div>
        </div>
        <div style={{ fontSize:13, color:'#64748b', display:'flex', alignItems:'center', gap:6 }}>
          <IcoCalendar />
          <span>May 22, 2025</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {STATS.map(({ label, value, growth, up, Icon, color, ic }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:ic }}><Icon /></div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{label}</div>
              <div className="stat-number" style={{ fontSize:24, color:ic }}>{value}</div>
              <div className={up ? 'growth-up' : 'growth-down'}>
                {up ? '▲' : '▼'} {growth}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12, display:'flex', justifyContent:'space-between' }}>
            Overview
            <div style={{ display:'flex', gap:16, fontSize:12 }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10, height:10, borderRadius:'50%', background:'#4f46e5', display:'inline-block' }}/> Patients</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:10, height:10, borderRadius:'50%', background:'#06b6d4', display:'inline-block' }}/> Appointments</span>
            </div>
          </div>
          <LineChart />
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>Appointment Status</div>
          <Donut />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        {/* Recent Appointments */}
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
              {RECENT.map((r,i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{r.initials}</div>
                      <span style={{ fontWeight:500, fontSize:13 }}>{r.patient}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{r.doctor}</td>
                  <td style={{ fontSize:13, color:'#64748b' }}>{r.dept}</td>
                  <td style={{ fontSize:12, color:'#64748b' }}>{r.dt}</td>
                  <td><span className={`badge ${STATUS_CLS[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Departments */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontWeight:600 }}>Top Departments</div>
            <button className="btn-outline btn-sm" onClick={() => navigate('/admin/departments')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {DEPTS.map(({ name, pct, color }) => (
              <div key={name}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:500, marginBottom:6 }}>
                  <span>{name}</span><span style={{ color:'#64748b' }}>{pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width:`${pct}%`, background:color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

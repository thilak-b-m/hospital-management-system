import AdminLayout from '../../components/layout/AdminLayout';
import { IcoUsers, IcoCalendar, IcoReport, IcoDownload } from '../../components/ui/Icons';

const KPIS = [
  { label:'Total Patients',     value:'2,543', growth:'+13.5%', up:true,  Icon:IcoUsers,    color:'#dbeafe', ic:'#1d4ed8' },
  { label:'Total Appointments', value:'1,890', growth:'+20.2%', up:true,  Icon:IcoCalendar, color:'#dcfce7', ic:'#15803d' },
  { label:'Total Revenue',      value:'₹12,45,300', growth:'+15.7%', up:true, Icon:IcoReport, color:'#fef9c3', ic:'#92400e' },
  { label:'Total Services',     value:'568',  growth:'+8.3%',  up:true,  Icon:IcoReport,   color:'#ede9fe', ic:'#7c3aed' },
];

const DEPT_PERF = [
  { dept:'Cardiology',  patients:320, appts:280, rev:'₹3,45,000', growth:'+15.2%', up:true  },
  { dept:'Orthopedics', patients:280, appts:250, rev:'₹2,10,000', growth:'+12.5%', up:true  },
  { dept:'Dermatology', patients:210, appts:190, rev:'₹1,45,000', growth:'+10.3%', up:true  },
  { dept:'Neurology',   patients:180, appts:160, rev:'₹1,20,000', growth:'+8.7%',  up:true  },
];

function ApptChart() {
  const data = [40,55,45,65,52,72,58,80,70,88,75,90];
  const W=320,H=100,PAD=8;
  const toX=(i)=>PAD+(i/(data.length-1))*(W-2*PAD);
  const toY=(v)=>H-PAD-((v-35)/(95-35))*(H-2*PAD);
  const pts=data.map((v,i)=>`${toX(i)},${toY(v)}`).join(' ');
  const fill=`M${toX(0)},${H} ${data.map((v,i)=>`L${toX(i)},${toY(v)}`).join(' ')} L${toX(data.length-1)},${H} Z`;
  const labels=['May 01','May 05','May 10','May 13','May 19','May 22'];
  return (
    <svg viewBox={`0 0 ${W} ${H+20}`} width="100%">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3"/><stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/></linearGradient></defs>
      {[45,60,75,90].map(v=><line key={v} x1={PAD} y1={toY(v)} x2={W-PAD} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1"/>)}
      <path d={fill} fill="url(#ag)"/>
      <polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round"/>
      {data.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill="#4f46e5"/>)}
      {labels.map((l,i)=>(
        <text key={l} x={toX(Math.round(i*(data.length-1)/5))} y={H+16} fontSize="8" fill="#94a3b8" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

function GrowthChart() {
  const data=[800,1200,900,1600,1100,2000,1500,2500,2000,3000,2600,3400];
  const W=320,H=100,PAD=8;
  const toX=(i)=>PAD+(i/(data.length-1))*(W-2*PAD);
  const toY=(v)=>H-PAD-((v-700)/(3500-700))*(H-2*PAD);
  const fill=`M${toX(0)},${H} ${data.map((v,i)=>`L${toX(i)},${toY(v)}`).join(' ')} L${toX(data.length-1)},${H} Z`;
  const labels=['May 01','May 07','May 13','May 19','May 22'];
  return (
    <svg viewBox={`0 0 ${W} ${H+20}`} width="100%">
      <defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
      <path d={fill} fill="url(#gg)"/>
      <polyline points={data.map((v,i)=>`${toX(i)},${toY(v)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round"/>
      {labels.map((l,i)=>(
        <text key={l} x={toX(Math.round(i*(data.length-1)/4))} y={H+16} fontSize="8" fill="#94a3b8" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

export default function AdminReports() {
  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-header-title">Reports &amp; Analytics</div>
          <div className="page-header-sub">View and analyze hospital data.</div>
        </div>
        <div style={{ fontSize:13, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 14px' }}>
          May 01, 2025 – May 22, 2025
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {KPIS.map(({ label, value, growth, up, Icon, color, ic }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:ic }}><Icon /></div>
            <div>
              <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
              <div className="stat-number" style={{ fontSize:22, color:ic }}>{value}</div>
              <div className={up?'growth-up':'growth-down'}>{up?'▲':'▼'} {growth}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12 }}>Appointments Overview</div>
          <ApptChart />
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:12 }}>Patient Growth</div>
          <GrowthChart />
        </div>
      </div>

      {/* Department performance */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontWeight:600 }}>Department Performance</div>
          <button className="btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <IcoDownload /> Download Report
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Department</th><th>Total Patients</th><th>Appointments</th><th>Revenue</th><th>Growth</th></tr>
          </thead>
          <tbody>
            {DEPT_PERF.map((d,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:500 }}>{d.dept}</td>
                <td>{d.patients}</td>
                <td>{d.appts}</td>
                <td style={{ fontWeight:600 }}>{d.rev}</td>
                <td><span className={d.up?'growth-up':'growth-down'}>{d.up?'▲':'▼'} {d.growth}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

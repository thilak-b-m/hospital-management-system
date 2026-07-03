import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoPlus, IcoChevronLeft, IcoChevronRight } from '../../components/ui/Icons';

const APPTS = [
  { time:'09:00 AM', name:'Ramesh Sharma', initials:'RS', doctor:'Dr. Arjun Patel',  color:'#dbeafe', border:'#1d4ed8',  day:19 },
  { time:'10:30 AM', name:'Priya Mehta',   initials:'PM', doctor:'Dr. Neha Verma',   color:'#dcfce7', border:'#15803d',  day:20 },
  { time:'11:30 AM', name:'Amit Verma',    initials:'AV', doctor:'Dr. Rohit Kumar',  color:'#ede9fe', border:'#7c3aed',  day:22 },
  { time:'01:00 PM', name:'Sneha Iyer',    initials:'SI', doctor:'Dr. Anjali Singh', color:'#dcfce7', border:'#15803d',  day:22 },
  { time:'02:00 PM', name:'Vikram Singh',  initials:'VS', doctor:'Dr. Vivek Mishra', color:'#fce7f3', border:'#be185d',  day:23 },
];

const LIST_DATA = [
  { patient:'Ramesh Sharma', initials:'RS', doctor:'Dr. Arjun Patel',  dept:'Cardiology',  date:'May 22, 2025 09:00 AM', status:'Completed' },
  { patient:'Priya Mehta',   initials:'PM', doctor:'Dr. Neha Verma',   dept:'Dermatology', date:'May 22, 2025 10:30 AM', status:'Scheduled' },
  { patient:'Amit Verma',    initials:'AV', doctor:'Dr. Rohit Kumar',  dept:'Orthopedics', date:'May 22, 2025 11:30 AM', status:'Scheduled' },
  { patient:'Sneha Iyer',    initials:'SI', doctor:'Dr. Anjali Singh', dept:'Neurology',   date:'May 22, 2025 01:00 PM', status:'Cancelled' },
  { patient:'Vikram Singh',  initials:'VS', doctor:'Dr. Vivek Mishra', dept:'Pediatrics',  date:'May 23, 2025 02:00 PM', status:'Scheduled' },
];

const ST = { Completed:'badge-completed', Scheduled:'badge-scheduled', Cancelled:'badge-cancelled' };

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const HOURS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];
const DATES = [18,19,20,21,22,23,24];

/* Mini monthly calendar */
function MiniCal({ selectedDay, onSelect }) {
  const weeks = [[null,null,null,1,2,3,4],[5,6,7,8,9,10,11],[12,13,14,15,16,17,18],[19,20,21,22,23,24,25],[26,27,28,29,30,31,null]];
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}><IcoChevronLeft /></button>
        <span style={{ fontWeight:600, fontSize:14 }}>May 2025</span>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}><IcoChevronRight /></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center' }}>
        {DAYS.map(d=><div key={d} style={{ fontSize:11, color:'#94a3b8', fontWeight:600, padding:'4px 0' }}>{d}</div>)}
        {weeks.flat().map((d,i)=>(
          <div key={i} onClick={()=>d&&onSelect(d)}
            style={{ padding:'5px 0', fontSize:13, borderRadius:6, cursor:d?'pointer':'default',
              background: d===selectedDay?'var(--primary)':d===22?'#eff6ff':'transparent',
              color: d===selectedDay?'white':d===22?'var(--primary)':'#374151',
              fontWeight: d===selectedDay||d===22?700:400 }}>
            {d||''}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAppointments() {
  const [view, setView]   = useState('Calendar View');
  const [selDay, setSelDay] = useState(22);
  const [doctorF, setDoctorF] = useState('All Doctors');
  const [deptF, setDeptF]     = useState('All Departments');
  const [statusF, setStatusF] = useState('All Status');

  const dayAppts = APPTS.filter(a => a.day === selDay);

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Appointments</div>
          <div className="page-header-sub">Manage all appointments in the system.</div>
        </div>
      </div>

      {/* View toggle + controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:8, padding:3 }}>
          {['Calendar View','List View'].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{ padding:'7px 16px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
                background: view===v?'white':'transparent', color: view===v?'var(--primary)':'#64748b',
                boxShadow: view===v?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>
              {v}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'6px 8px', color:'#64748b' }}>Today</button>
          <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'6px 8px', color:'#64748b' }}><IcoChevronLeft /></button>
          <span style={{ fontSize:14, fontWeight:600 }}>May 18 – May 24, 2025</span>
          <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'6px 8px', color:'#64748b' }}><IcoChevronRight /></button>
          <button className="btn-primary btn-sm"><IcoPlus size={13}/> Add Appointment</button>
        </div>
      </div>

      {view === 'Calendar View' ? (
        <div className="grid-2" style={{ alignItems:'start' }}>
          {/* Mini cal + filters */}
          <div className="card">
            <MiniCal selectedDay={selDay} onSelect={setSelDay} />
            <div style={{ marginTop:20 }}>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Filters</div>
              {[['All Doctors', setDoctorF, ['All Doctors','Dr. Arjun Patel','Dr. Neha Verma','Dr. Rohit Kumar']],
                ['All Departments', setDeptF, ['All Departments','Cardiology','Neurology','Orthopedics']],
                ['All Status', setStatusF, ['All Status','Completed','Scheduled','Cancelled']]
              ].map(([val, setter, opts])=>(
                <div key={val} style={{ marginBottom:10 }}>
                  <select className="form-select" style={{ height:36, fontSize:13 }}
                    onChange={e=>setter(e.target.value)}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Day schedule */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {/* Day header */}
            <div style={{ display:'grid', gridTemplateColumns:'60px repeat(7,1fr)', borderBottom:'1px solid #e2e8f0' }}>
              <div/>
              {DATES.map((d,i)=>(
                <div key={d} style={{ padding:'8px 4px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</div>
                  <div style={{ fontSize:16, fontWeight:700, marginTop:2,
                    background: d===selDay?'var(--primary)':'transparent',
                    color: d===selDay?'white':'#1e293b',
                    width:28, height:28, borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center', margin:'2px auto 0' }}>
                    {d}
                  </div>
                </div>
              ))}
            </div>
            {/* Time slots */}
            {HOURS.map((h,hi)=>(
              <div key={h} style={{ display:'grid', gridTemplateColumns:'60px repeat(7,1fr)', borderBottom:'1px solid #f8fafc', minHeight:56 }}>
                <div style={{ fontSize:11, color:'#94a3b8', padding:'8px 8px 0', borderRight:'1px solid #f1f5f9', textAlign:'right' }}>{h}</div>
                {DATES.map((d,di)=>(
                  <div key={di} style={{ borderRight:'1px solid #f8fafc', position:'relative', minHeight:56 }}>
                    {APPTS.filter(a=>a.day===d && HOURS.indexOf(h)===HOURS.findIndex(x=>x.includes(a.time.split(':')[0]))).map((a,ai)=>(
                      <div key={ai} style={{ position:'absolute', top:3, left:2, right:2, background:a.color, borderLeft:`3px solid ${a.border}`, borderRadius:5, padding:'3px 5px', fontSize:11, cursor:'pointer' }}>
                        <div style={{ fontWeight:600 }}>{a.name}</div>
                        <div style={{ color:'#64748b' }}>{a.doctor}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date &amp; Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {LIST_DATA.map((r,i)=>(
                <tr key={i}>
                  <td><div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{r.initials}</div><span style={{ fontWeight:500 }}>{r.patient}</span></div></td>
                  <td style={{ fontSize:13 }}>{r.doctor}</td>
                  <td style={{ fontSize:13, color:'#64748b' }}>{r.dept}</td>
                  <td style={{ fontSize:12, color:'#64748b' }}>{r.date}</td>
                  <td><span className={`badge ${ST[r.status]}`}>{r.status}</span></td>
                  <td><button className="btn-outline btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

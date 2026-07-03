import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoCalendar, IcoUsers, IcoReport, IcoActivity, IcoCheck, IcoClock } from '../../components/ui/Icons';

const stats = [
  { label: "Today's Appointments", value: 24, Icon: IcoCalendar, color: '#dbeafe', iconColor: '#1d4ed8' },
  { label: 'Total Patients',        value: 320, Icon: IcoUsers,    color: '#dcfce7', iconColor: '#15803d' },
  { label: 'New Patients',          value: 12,  Icon: IcoActivity, color: '#ede9fe', iconColor: '#7c3aed' },
  { label: 'Pending Reports',       value: 8,   Icon: IcoReport,   color: '#fef9c3', iconColor: '#b45309' },
];

const todayAppts = [
  { time: '09:00 AM', name: 'Ramesh Sharma',  reason: 'Follow-up',   status: 'Confirmed', initials: 'RS' },
  { time: '10:30 AM', name: 'Priya Mehta',    reason: 'Consultation',status: 'Confirmed', initials: 'PM' },
  { time: '11:30 AM', name: 'Amit Verma',     reason: 'Chest Pain',  status: 'Pending',   initials: 'AV' },
  { time: '01:00 PM', name: 'Sneha Iyer',     reason: 'ECG',         status: 'Confirmed', initials: 'SI' },
];

const upcomingSchedule = [
  { title: 'Cardiology Conference', date: 'May 26, 2025', time: '09:00 – 10:00 PM', color: '#dbeafe' },
  { title: 'Department Meeting',    date: 'May 27, 2025', time: '11:00 – 11:00 AM', color: '#dcfce7' },
  { title: 'Training Session',      date: 'May 27, 2025', time: '03:00 – 05:00 PM', color: '#ede9fe' },
];

const patientStats = [
  { name: 'Vikram Singh',  date: 'May 27, 2025', initials: 'VS' },
  { name: 'Neha Kapoor',   date: 'May 21, 2025', initials: 'NK' },
  { name: 'Rajesh Kumar',  date: 'May 20, 2025', initials: 'RK' },
  { name: 'Anita Desai',   date: 'May 20, 2025', initials: 'AD' },
];

const STATUS = { Confirmed: 'badge-completed', Pending: 'badge-upcoming', Cancelled: 'badge-cancelled' };

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <DoctorLayout searchBar>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>Good Morning, Dr. Arjun!</div>
        <div style={{ color:'#64748b', fontSize:14, marginTop:2 }}>Here's what's happening in your clinic today.</div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {stats.map(({ label, value, Icon, color, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:iconColor }}><Icon /></div>
            <div>
              <div className="stat-label" style={{ fontSize:12, color:'#64748b' }}>{label}</div>
              <div className="stat-number" style={{ color:iconColor, fontSize:26 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Today's Appointments */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Today's Appointments</div>
            <button className="btn-outline btn-sm" onClick={() => navigate('/doctor/appointments')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {todayAppts.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f8fafc', borderRadius:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--primary)', width:60, flexShrink:0 }}>{a.time}</div>
                <div className="doc-avatar" style={{ width:36, height:36, fontSize:12 }}>{a.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{a.name}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{a.reason}</div>
                </div>
                <span className={`badge ${STATUS[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:14, padding:'10px' }}
            onClick={() => navigate('/doctor/appointments')}>
            View All Appointments
          </button>
        </div>

        {/* Upcoming Schedule */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Upcoming Schedule</div>
            <button className="btn-outline btn-sm" onClick={() => navigate('/doctor/schedule')}>View Calendar</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {upcomingSchedule.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'10px 12px', background:s.color, borderRadius:10, alignItems:'center' }}>
                <IcoCalendar />
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:'#475569' }}>{s.date} · {s.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>Patient Statistics</div>
            <span style={{ fontSize:12, color:'var(--primary)', cursor:'pointer' }}>This Month</span>
          </div>
          {patientStats.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < patientStats.length-1 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="doc-avatar" style={{ width:32, height:32, fontSize:12 }}>{p.initials}</div>
              <div style={{ flex:1, fontSize:13, fontWeight:500 }}>{p.name}</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>{p.date}</div>
            </div>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
}

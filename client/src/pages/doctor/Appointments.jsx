import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoChevronLeft, IcoChevronRight, IcoCheck, IcoRefresh, IcoBan, IcoPhone } from '../../components/ui/Icons';

const APPTS = {
  Upcoming: [
    { time:'09:00 AM', name:'Ramesh Sharma',  age:'58 Years, Male', phone:'9876543210', type:'Follow-up',    status:'Confirmed', initials:'RS' },
    { time:'10:30 AM', name:'Priya Mehta',    age:'32 Years, Female',phone:'8123456780',type:'Consultation', status:'Confirmed', initials:'PM' },
    { time:'11:30 AM', name:'Amit Verma',     age:'45 Years, Male', phone:'8887765855', type:'Chest Pain',   status:'Pending',   initials:'AV' },
    { time:'01:00 PM', name:'Sneha Iyer',     age:'29 Years, Female',phone:'8031122344',type:'ECG',          status:'Confirmed', initials:'SI' },
    { time:'02:30 PM', name:'Vikram Singh',   age:'60 Years, Male', phone:'9876071333', type:'Consultation', status:'Confirmed', initials:'VS' },
  ],
  Completed: [
    { time:'09:00 AM', name:'Neha Kapoor',   age:'38 Years, Female',phone:'8888000988', type:'Routine',     status:'Completed', initials:'NK' },
    { time:'10:00 AM', name:'Rajesh Kumar',  age:'55 Years, Male',  phone:'9009886776', type:'Follow-up',   status:'Completed', initials:'RK' },
  ],
  Cancelled: [
    { time:'11:00 AM', name:'Anita Desai',   age:'42 Years, Female',phone:'8123450000', type:'Consultation',status:'Cancelled', initials:'AD' },
  ],
};

const STATUS_CLS = { Confirmed:'badge-completed', Pending:'badge-upcoming', Completed:'badge-completed', Cancelled:'badge-cancelled' };

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Upcoming');
  const list = APPTS[tab] || [];

  return (
    <DoctorLayout searchBar>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, marginBottom:2 }}>Appointments</div>
        <div style={{ color:'#64748b', fontSize:13 }}>Manage your appointments</div>
      </div>

      <div className="card">
        {/* Tabs + date nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4 }}>
            {['Upcoming','Completed','Cancelled'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding:'7px 18px', borderRadius:8, border:'none', cursor:'pointer',
                  fontSize:13, fontWeight:600, transition:'all 0.2s',
                  background: tab===t ? 'white' : 'transparent',
                  color: tab===t ? 'var(--primary)' : '#64748b',
                  boxShadow: tab===t ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#64748b' }}>
              <IcoChevronLeft />
            </button>
            <span style={{ fontSize:14, fontWeight:600 }}>May 30, 2025</span>
            <button style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#64748b' }}>
              <IcoChevronRight />
            </button>
          </div>
        </div>

        {/* Appointment rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {list.map((a, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', border:'1px solid #e2e8f0', borderRadius:12, transition:'box-shadow 0.2s', cursor:'default' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.07)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--primary)', width:70, flexShrink:0 }}>{a.time}</div>
              <div className="doc-avatar" style={{ width:44, height:44 }}>{a.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{a.name}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{a.age}</div>
              </div>
              <div style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                <IcoPhone />{a.phone}
              </div>
              <span className={`badge ${STATUS_CLS[a.status]}`}>{a.status}</span>
              {tab === 'Upcoming' && (
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn-sm" onClick={() => {}}
                    style={{ background:'#dcfce7', color:'#15803d', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                    <IcoCheck size={12} /> Accept
                  </button>
                  <button className="btn-sm" onClick={() => {}}
                    style={{ background:'#dbeafe', color:'var(--primary)', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                    <IcoRefresh /> Reschedule
                  </button>
                  <button className="btn-sm" onClick={() => {}}
                    style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                    <IcoBan /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>No {tab.toLowerCase()} appointments.</div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}

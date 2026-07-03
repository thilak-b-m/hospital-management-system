import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoCalendar, IcoUsers, IcoReport, IcoUser, IcoBell } from '../../components/ui/Icons';

const INIT = [
  { id:1, type:'appointment', title:'New appointment booked', body:'Ramesh Sharma booked an appointment with Dr. Arjun Patel for May 25, 2025.', time:'2 min ago',  read:false, Icon:IcoCalendar, color:'#dbeafe', ic:'#1d4ed8'  },
  { id:2, type:'patient',     title:'New patient registered', body:'Priya Mehta has registered as a new patient in the system.',                  time:'15 min ago', read:false, Icon:IcoUsers,    color:'#dcfce7', ic:'#15803d'  },
  { id:3, type:'report',      title:'Lab report uploaded',    body:'Blood test report for Amit Verma has been uploaded and is ready for review.',  time:'1 hr ago',   read:false, Icon:IcoReport,   color:'#fef9c3', ic:'#92400e'  },
  { id:4, type:'doctor',      title:'Doctor schedule updated',body:'Dr. Neha Verma updated her availability for next week.',                       time:'2 hr ago',   read:false, Icon:IcoUser,     color:'#ede9fe', ic:'#7c3aed'  },
  { id:6, type:'appointment', title:'Appointment cancelled',  body:'Sneha Iyer cancelled her appointment scheduled for May 22, 2025.',            time:'5 hr ago',   read:true,  Icon:IcoCalendar, color:'#fee2e2', ic:'#dc2626'  },
  { id:7, type:'system',      title:'System backup completed',body:'Automatic system backup was completed successfully.',                          time:'1 day ago',  read:true,  Icon:IcoBell,     color:'#f1f5f9', ic:'#64748b'  },
];

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState(INIT);
  const [filter, setFilter] = useState('All');

  const unread = notifs.filter(n=>!n.read).length;
  const markRead  = (id) => setNotifs(n=>n.map(x=>x.id===id?{...x,read:true}:x));
  const markAll   = () => setNotifs(n=>n.map(x=>({...x,read:true})));
  const deleteN   = (id) => setNotifs(n=>n.filter(x=>x.id!==id));

  const filtered = filter==='All' ? notifs : filter==='Unread' ? notifs.filter(n=>!n.read) : notifs.filter(n=>n.read);

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-header-title">Notifications</div>
          <div className="page-header-sub">{unread} unread notification{unread!==1?'s':''}</div>
        </div>
        <button className="btn-outline btn-sm" onClick={markAll} disabled={unread===0}>
          Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'#f1f5f9', borderRadius:10, padding:4, width:'fit-content' }}>
        {['All','Unread','Read'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:'7px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.2s',
              background: filter===f?'white':'transparent', color: filter===f?'var(--primary)':'#64748b',
              boxShadow: filter===f?'0 1px 6px rgba(0,0,0,0.08)':'none' }}>
            {f} {f==='Unread'&&unread>0&&<span style={{ background:'#ef4444', color:'white', borderRadius:10, padding:'0 6px', fontSize:10, fontWeight:700, marginLeft:4 }}>{unread}</span>}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(n=>(
          <div key={n.id} className="card"
            style={{ padding:'14px 18px', cursor:'pointer', borderLeft:`4px solid ${n.read?'#e2e8f0':n.ic}`, opacity: n.read?0.75:1 }}
            onClick={()=>markRead(n.id)}>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:42, height:42, borderRadius:10, background:n.color, color:n.ic, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <n.Icon />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontWeight: n.read?500:700, fontSize:14 }}>{n.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:12, color:'#94a3b8' }}>{n.time}</span>
                    {!n.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }}/>}
                    <button onClick={e=>{e.stopPropagation();deleteN(n.id);}}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:16 }}>×</button>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'#64748b', marginTop:4, lineHeight:1.6 }}>{n.body}</div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div className="card" style={{ textAlign:'center', color:'#94a3b8', padding:48 }}>No {filter.toLowerCase()} notifications.</div>
        )}
      </div>
    </AdminLayout>
  );
}

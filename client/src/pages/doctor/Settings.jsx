import { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle}
      style={{ width:44, height:24, borderRadius:12, background: on ? 'var(--primary)' : '#cbd5e1',
        cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left: on ? 23 : 3, width:18, height:18, borderRadius:'50%',
        background:'white', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

const NOTIF_ITEMS = [
  { key:'apptReminder', label:'Appointment Reminders', desc:'Get notified 30 minutes before appointments' },
  { key:'newPatient',   label:'New Patient Registered', desc:'Notify when a new patient books with you' },
  { key:'messages',     label:'New Messages',           desc:'Get notified for new patient messages' },
  { key:'reports',      label:'Report Uploads',         desc:'Notify when patient reports are uploaded' },
];

const AVAIL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function Settings() {
  const [notif, setNotif] = useState({ apptReminder:true, newPatient:true, messages:true, reports:false });
  const [avail, setAvail] = useState({ Monday:true, Tuesday:true, Wednesday:true, Thursday:true, Friday:true, Saturday:true, Sunday:false });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <DoctorLayout>
      <div style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>Manage your account settings</div>

      {saved && (
        <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Notifications */}
        <div className="card">
          <div className="section-title">Notification Preferences</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {NOTIF_ITEMS.map(({ key, label, desc }) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:14 }}>{label}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{desc}</div>
                </div>
                <Toggle on={notif[key]} onToggle={() => setNotif(p => ({ ...p, [key]: !p[key] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="card">
          <div className="section-title">Weekly Availability</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {AVAIL_DAYS.map(d => (
              <div key={d} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:500, color: avail[d] ? '#1e293b' : '#94a3b8' }}>{d}</span>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {avail[d] && (
                    <span style={{ fontSize:13, color:'#64748b' }}>10:00 AM – 05:00 PM</span>
                  )}
                  {!avail[d] && (
                    <span style={{ fontSize:13, color:'#ef4444' }}>Unavailable</span>
                  )}
                  <Toggle on={avail[d]} onToggle={() => setAvail(p => ({ ...p, [d]: !p[d] }))} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:20 }} onClick={save}>
            Save Settings
          </button>
        </div>
      </div>
    </DoctorLayout>
  );
}

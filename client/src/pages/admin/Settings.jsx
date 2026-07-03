import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { IcoSettings, IcoMail, IcoPhone, IcoHome } from '../../components/ui/Icons';

const CATS = ['General Settings','System Settings','Email Settings','SMS Settings','Payment Settings','Backup & Restore','Security Settings'];

function Toggle({ on, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="adm-toggle"
      style={{ background: on ? 'var(--primary)' : '#cbd5e1' }}>
      <div className="adm-toggle-knob" style={{ left: on ? 21 : 3 }}/>
    </button>
  );
}

export default function AdminSettings() {
  const [cat, setCat]   = useState('General Settings');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    hospitalName:'CityCare Hospital',
    email:'info@citycare.com',
    phone:'9876543210',
    address:'123, Health Street, Medical District, City – 560001',
    timezone:'(GMT +05:30) Asia/Kolkata',
    dateFormat:'DD-MM-YYYY',
    timeFormat:'12 Hour',
  });
  const [toggles, setToggles] = useState({
    emailNotif:true, smsNotif:true, autoBackup:true, twoFactor:false, maintenanceMode:false,
  });

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <AdminLayout>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>Settings</div>
      <div style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>Manage system settings and preferences.</div>

      {saved && (
        <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="grid-2" style={{ alignItems:'start', gridTemplateColumns:'200px 1fr' }}>
        {/* Category sidebar */}
        <div className="card" style={{ padding:10 }}>
          {CATS.map(c=>(
            <div key={c} className={`settings-cat${cat===c?' active':''}`} onClick={()=>setCat(c)}>
              {c}
            </div>
          ))}
        </div>

        {/* Settings panel */}
        <div className="card">
          <div style={{ fontWeight:700, fontSize:16, marginBottom:20 }}>{cat}</div>

          {cat==='General Settings' && (
            <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="grid-2" style={{ alignItems:'start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {[['hospitalName','Hospital Name'],['email','Hospital Email'],['phone','Hospital Phone'],['address','Address']].map(([k,l])=>(
                    <div key={k} className="form-group">
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={k} value={form[k]} onChange={handle}/>
                    </div>
                  ))}
                  {[['timezone','Timezone'],['dateFormat','Date Format'],['timeFormat','Time Format']].map(([k,l])=>(
                    <div key={k} className="form-group">
                      <label className="form-label">{l}</label>
                      <select className="form-select" name={k} value={form[k]} onChange={handle}>
                        {k==='timezone' && ['(GMT +05:30) Asia/Kolkata','(GMT +00:00) UTC','(GMT -05:00) Eastern'].map(o=><option key={o}>{o}</option>)}
                        {k==='dateFormat' && ['DD-MM-YYYY','MM-DD-YYYY','YYYY-MM-DD'].map(o=><option key={o}>{o}</option>)}
                        {k==='timeFormat' && ['12 Hour','24 Hour'].map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Logo card */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'#374151' }}>Hospital Logo</div>
                  <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:20, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                    <svg viewBox="0 0 120 80" width="120" height="80">
                      <rect width="120" height="80" fill="#1e2d5a" rx="10"/>
                      <circle cx="30" cy="40" r="18" fill="#4f46e5"/>
                      <rect x="27" y="29" width="6" height="22" fill="white" rx="1"/>
                      <rect x="19" y="37" width="22" height="6" fill="white" rx="1"/>
                      <text x="58" y="36" fontSize="12" fontWeight="800" fill="white">CityCare</text>
                      <text x="58" y="52" fontSize="9" fill="rgba(255,255,255,0.6)">HOSPITAL</text>
                    </svg>
                    <button type="button" className="btn-outline btn-sm">Change Logo</button>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
                <button type="submit" className="btn-primary" style={{ padding:'10px 28px' }}>Save Changes</button>
              </div>
            </form>
          )}

          {cat==='Email Settings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['SMTP Host','smtp.gmail.com'],['SMTP Port','587'],['From Email','noreply@citycare.com'],['From Name','CityCare Hospital']].map(([l,v])=>(
                <div key={l} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" defaultValue={v}/>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop:'1px solid #f1f5f9' }}>
                <div><div style={{ fontWeight:500 }}>Email Notifications</div><div style={{ fontSize:12, color:'#64748b' }}>Send system emails to users</div></div>
                <Toggle on={toggles.emailNotif} onToggle={()=>setToggles(p=>({...p,emailNotif:!p.emailNotif}))}/>
              </div>
              <button className="btn-primary" style={{ alignSelf:'flex-end', padding:'10px 28px' }} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}}>Save Changes</button>
            </div>
          )}

          {cat==='SMS Settings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['SMS Provider','Twilio'],['Account SID','AC...'],['Auth Token','••••••••']].map(([l,v])=>(
                <div key={l} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" defaultValue={v}/>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop:'1px solid #f1f5f9' }}>
                <div><div style={{ fontWeight:500 }}>SMS Notifications</div><div style={{ fontSize:12, color:'#64748b' }}>Send SMS alerts to patients</div></div>
                <Toggle on={toggles.smsNotif} onToggle={()=>setToggles(p=>({...p,smsNotif:!p.smsNotif}))}/>
              </div>
              <button className="btn-primary" style={{ alignSelf:'flex-end', padding:'10px 28px' }} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}}>Save Changes</button>
            </div>
          )}

          {cat==='Security Settings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['Two-Factor Authentication','Enable 2FA for all admin users',toggles.twoFactor,'twoFactor'],
                ['Maintenance Mode','Put the system in maintenance mode',toggles.maintenanceMode,'maintenanceMode']].map(([l,d,v,k])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div><div style={{ fontWeight:500 }}>{l}</div><div style={{ fontSize:12, color:'#64748b' }}>{d}</div></div>
                  <Toggle on={v} onToggle={()=>setToggles(p=>({...p,[k]:!p[k]}))}/>
                </div>
              ))}
              <button className="btn-primary" style={{ alignSelf:'flex-end', padding:'10px 28px' }} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}}>Save Changes</button>
            </div>
          )}

          {!['General Settings','Email Settings','SMS Settings','Security Settings'].includes(cat) && (
            <div style={{ color:'#94a3b8', padding:40, textAlign:'center' }}>{cat} panel coming soon.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

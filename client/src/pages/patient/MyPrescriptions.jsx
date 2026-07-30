import { useEffect, useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoCalendar } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions').then(res => {
      const list = res.data.prescriptions || [];
      setPrescriptions(list);
      if (list.length) setActive(list[0]._id);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const rx = prescriptions.find(p => p._id === active);

  return (
    <PatientLayout>
      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No prescriptions found.</div>
      ) : (
        <div className="grid-2" style={{ alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {prescriptions.map(p => {
              const initials = p.doctor?.user?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'DR';
              return (
                <div key={p._id} className="card" onClick={() => setActive(p._id)}
                  style={{ cursor:'pointer', border: active===p._id ? '2px solid var(--primary)' : '1px solid #e2e8f0', transition:'all 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div className="doc-avatar" style={{ width:44, height:44, fontSize:15 }}>{initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600 }}>{p.doctor?.user?.name||'Doctor'}</div>
                      <div style={{ fontSize:13, color:'#64748b' }}>{p.doctor?.department||''}</div>
                    </div>
                    <div style={{ fontSize:12, color:'#94a3b8', display:'flex', alignItems:'center', gap:4 }}>
                      <IcoCalendar />{new Date(p.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                  </div>
                  <div style={{ marginTop:10, fontSize:13 }}>
                    <span style={{ background:'#f1f5f9', borderRadius:6, padding:'2px 10px', color:'#374151', fontWeight:500 }}>
                      {p.diagnosis}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {rx && (
            <div className="card" style={{ position:'sticky', top:80 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:16 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>Prescription Details</div>
                  <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>
                    {rx.doctor?.user?.name} · {new Date(rx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </div>
                </div>
                <span style={{ background:'#ede9fe', color:'#7c3aed', borderRadius:6, padding:'4px 12px', fontSize:13, fontWeight:600 }}>
                  {rx.diagnosis}
                </span>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:10, color:'#374151' }}>Medications</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {rx.medications?.map((m, i) => (
                    <div key={i} className="appt-detail-card">
                      <div style={{ fontWeight:600, fontSize:14 }}>{m.medicine}</div>
                      <div style={{ display:'flex', gap:16, marginTop:6, fontSize:13, color:'#64748b', flexWrap:'wrap' }}>
                        <span>Dose: <strong style={{ color:'#374151' }}>{m.dosage}</strong></span>
                        <span>Freq: <strong style={{ color:'#374151' }}>{m.frequency}</strong></span>
                        <span>Duration: <strong style={{ color:'#374151' }}>{m.duration}</strong></span>
                      </div>
                      {m.instructions && <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{m.instructions}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:6, color:'#374151' }}>Doctor's Notes</div>
                  <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'12px 14px', fontSize:13, color:'#92400e' }}>
                    {rx.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PatientLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoEdit, IcoPhone, IcoMail, IcoMapPin, IcoActivity, IcoHeart, IcoThermometer, IcoWind } from '../../components/ui/Icons';

const TABS = ['Overview','Medical History','Prescriptions','Reports','Appointments'];

const vitals = [
  { label:'Blood Pressure', value:'140/90 mmHg', Icon: IcoHeart,       color:'#fee2e2', iconColor:'#dc2626' },
  { label:'Heart Rate',     value:'78 bpm',      Icon: IcoActivity,    color:'#dbeafe', iconColor:'#1d4ed8' },
  { label:'Temperature',    value:'98.6 °F',     Icon: IcoThermometer, color:'#fef9c3', iconColor:'#b45309' },
  { label:'Respiratory Rate',value:'18/min',     Icon: IcoWind,        color:'#dcfce7', iconColor:'#15803d' },
];

export default function PatientDetail() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');

  return (
    <DoctorLayout>
      {/* Back + actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={() => navigate('/doctor/patients')}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
          ← Back to Patients
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline btn-sm">By Teams</button>
          <button className="btn-outline btn-sm">↓</button>
        </div>
      </div>

      {/* Patient header */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <div style={{ width:90, height:90, borderRadius:'50%', background:'#e2e8f0', flexShrink:0, overflow:'hidden' }}>
            <svg viewBox="0 0 90 90" width="90" height="90">
              <circle cx="45" cy="45" r="45" fill="#cbd5e1"/>
              <circle cx="45" cy="33" r="18" fill="#94a3b8"/>
              <rect x="20" y="62" width="50" height="28" fill="#94a3b8" rx="10"/>
              <rect x="34" y="48" width="22" height="14" fill="#94a3b8"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:22 }}>Ramesh Sharma</div>
                <div style={{ color:'#64748b', fontSize:13, marginTop:2 }}>ID PT0001</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16, marginTop:10 }}>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    58 Years, Male
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoPhone />9876543210
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoMail />ramesh.sharma@email.com
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoMapPin />124, Green Park, New Delhi
                  </span>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={() => {}}>
                <IcoEdit /> Edit Patient
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginTop:20, borderBottom:'2px solid #e2e8f0' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding:'10px 20px', border:'none', background:'none', cursor:'pointer',
                fontSize:14, fontWeight:500, transition:'all 0.2s',
                color: tab===t ? 'var(--primary)' : '#64748b',
                borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom:'-2px',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Overview' && (
        <div className="grid-3">
          {/* Health Summary */}
          <div className="card">
            <div style={{ fontWeight:600, marginBottom:14 }}>Health Summary</div>
            {[['Blood Group','B+'],['Height','170 cm'],['Weight','72 kg'],['Allergies','Penicillin'],['Chronic Conditions','Hypertension']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                <span style={{ color:'#64748b' }}>{k}</span>
                <span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Latest Diagnosis */}
          <div className="card">
            <div style={{ fontWeight:600, marginBottom:14 }}>Latest Diagnosis</div>
            <div style={{ fontWeight:700, fontSize:16, color:'#dc2626', marginBottom:6 }}>Hypertension</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>Diagnosed on May 22, 2025</div>
            <div style={{ fontWeight:500, fontSize:13, marginBottom:6 }}>Notes</div>
            <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>
              Patient's blood pressure is slightly high. Recommended regular medication and low sodium diet.
            </div>
            <div style={{ marginTop:12, fontSize:13 }}>
              <div style={{ color:'#64748b', marginBottom:4 }}>Next Visit</div>
              <div style={{ fontWeight:600 }}>May 30, 2025</div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="card">
            <div style={{ fontWeight:600, marginBottom:14 }}>Vital Signs (Latest)</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {vitals.map(({ label, value, Icon, color, iconColor }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:color, borderRadius:10 }}>
                  <span style={{ color:iconColor }}><Icon /></span>
                  <div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Medical History' && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>Medical History</div>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Diagnosis</th><th>Treatment</th><th>Doctor</th></tr></thead>
            <tbody>
              {[
                ['Jan 2024','Hypertension','Amlodipine 5mg','Dr. Arjun Patel'],
                ['Mar 2023','Chest Pain','ECG, Aspirin','Dr. Arjun Patel'],
                ['Aug 2022','Flu','Rest, Paracetamol','Dr. Priya Sharma'],
              ].map(([d,diag,t,doc]) => (
                <tr key={d}><td style={{color:'#64748b'}}>{d}</td><td>{diag}</td><td style={{color:'#64748b'}}>{t}</td><td>{doc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === 'Prescriptions' || tab === 'Reports' || tab === 'Appointments') && (
        <div className="card">
          <div style={{ color:'#94a3b8', textAlign:'center', padding:40, fontSize:14 }}>
            {tab} data will appear here.
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}

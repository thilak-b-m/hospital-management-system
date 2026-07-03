import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoSearch, IcoEye, IcoPrint } from '../../components/ui/Icons';

const RXLIST = [
  { id:'RX001', patient:'Ramesh Sharma', initials:'RS', date:'May 23, 2025', diagnosis:'Hypertension',    meds:3 },
  { id:'RX002', patient:'Priya Mehta',   initials:'PM', date:'May 22, 2025', diagnosis:'Migraine',        meds:2 },
  { id:'RX003', patient:'Amit Verma',    initials:'AV', date:'May 21, 2025', diagnosis:'Chest Pain',      meds:4 },
  { id:'RX004', patient:'Sneha Iyer',    initials:'SI', date:'May 20, 2025', diagnosis:'Arrhythmia',      meds:2 },
  { id:'RX005', patient:'Vikram Singh',  initials:'VS', date:'May 18, 2025', diagnosis:'Heart Failure',   meds:5 },
];

export default function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = RXLIST.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.diagnosis.toLowerCase().includes(search.toLowerCase()));

  return (
    <DoctorLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>Prescriptions</div>
          <div style={{ color:'#64748b', fontSize:13 }}>Manage patient prescriptions</div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/doctor/new-prescription')}>
          <IcoPlus size={14} /> New Prescription
        </button>
      </div>

      <div className="card">
        <div style={{ position:'relative', marginBottom:18, maxWidth:360 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
            <IcoSearch size={14} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search prescriptions..."
            style={{ paddingLeft:32, paddingRight:12, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}>
                <td style={{ color:'#94a3b8', fontSize:13 }}>{r.id}</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="doc-avatar">{r.initials}</div>
                    <span style={{ fontWeight:500 }}>{r.patient}</span>
                  </div>
                </td>
                <td>
                  <span style={{ background:'#ede9fe', color:'#7c3aed', borderRadius:6, padding:'3px 10px', fontSize:12, fontWeight:500 }}>
                    {r.diagnosis}
                  </span>
                </td>
                <td style={{ color:'#64748b' }}>{r.meds} medicines</td>
                <td style={{ color:'#64748b', fontSize:13 }}>{r.date}</td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn-outline btn-sm" onClick={() => navigate('/doctor/new-prescription')}>
                      <IcoEye /> View
                    </button>
                    <button className="btn-sm" onClick={() => window.print()}
                      style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4, color:'#64748b' }}>
                      <IcoPrint /> Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DoctorLayout>
  );
}

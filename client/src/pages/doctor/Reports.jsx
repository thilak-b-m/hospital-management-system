import { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoEye, IcoDownload, IcoSearch, IcoRefresh } from '../../components/ui/Icons';

const REPORTS = [
  { patient:'Ramesh Sharma', initials:'RS', type:'Blood Test',    date:'May 22, 2025' },
  { patient:'Priya Mehta',   initials:'PM', type:'ECG',           date:'May 21, 2025' },
  { patient:'Amit Verma',    initials:'AV', type:'X-Ray',         date:'May 20, 2025' },
  { patient:'Sneha Iyer',    initials:'SI', type:'Blood Test',    date:'May 19, 2025' },
  { patient:'Vikram Singh',  initials:'VS', type:'X-Ray',         date:'May 18, 2025' },
  { patient:'Neha Kapoor',   initials:'NK', type:'Echocardiogram',date:'May 18, 2025' },
];

export default function Reports() {
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  const filtered = REPORTS.filter(r => {
    if (typeFilter !== 'All Types' && r.type !== typeFilter) return false;
    if (patientFilter !== 'All Patients' && r.patient !== patientFilter) return false;
    if (search && !r.patient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DoctorLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>Reports</div>
          <div style={{ color:'#64748b', fontSize:13 }}>View and manage patient reports</div>
        </div>
        <button style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>
          <IcoRefresh />
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
          <select className="form-select" style={{ width:'auto', height:38 }}
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            <option>Blood Test</option>
            <option>ECG</option>
            <option>X-Ray</option>
            <option>Echocardiogram</option>
          </select>
          <select className="form-select" style={{ width:'auto', height:38 }}
            value={patientFilter} onChange={e => setPatientFilter(e.target.value)}>
            <option>All Patients</option>
            {REPORTS.map(r => <option key={r.patient}>{r.patient}</option>)}
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding:'8px 10px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', height:38 }}
            placeholder="From Date"/>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding:'8px 10px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', height:38 }}
            placeholder="To Date"/>
        </div>

        <table className="data-table">
          <thead>
            <tr><th>Report</th><th>Patient</th><th>Type</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight:500 }}>{r.type} Report</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="doc-avatar">{r.initials}</div>
                    <span>{r.patient}</span>
                  </div>
                </td>
                <td>
                  <span style={{ background:'#f1f5f9', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#475569', fontWeight:500 }}>
                    {r.type}
                  </span>
                </td>
                <td style={{ color:'#64748b', fontSize:13 }}>{r.date}</td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <IcoEye /> View
                    </button>
                    <button className="btn-sm"
                      style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4, color:'#64748b' }}>
                      <IcoDownload />
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoSearch, IcoPrint } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions').then(res => setPrescriptions(res.data.prescriptions || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter(r =>
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DoctorLayout>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
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
            placeholder="Search by patient or diagnosis..."
            style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const initials = r.patient?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
                return (
                  <tr key={r._id}>
                    <td style={{ color:'#94a3b8', fontSize:13 }}>{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="doc-avatar">{initials}</div>
                        <span style={{ fontWeight:500 }}>{r.patient?.name||'Patient'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ background:'#ede9fe', color:'#7c3aed', borderRadius:6, padding:'3px 10px', fontSize:12, fontWeight:500 }}>
                        {r.diagnosis}
                      </span>
                    </td>
                    <td style={{ color:'#64748b' }}>{r.medications?.length||0} medicines</td>
                    <td style={{ color:'#64748b', fontSize:13 }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td>
                      <button onClick={() => window.print()}
                        style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4, color:'#64748b' }}>
                        <IcoPrint /> Print
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No prescriptions found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DoctorLayout>
  );
}

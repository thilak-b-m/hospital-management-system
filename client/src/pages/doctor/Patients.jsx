import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoSearch } from '../../components/ui/Icons';
import api from '../../api/axios';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/patients').then(res => setPatients(res.data.patients || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.includes(search) ||
    p.phone?.includes(search)
  );

  return (
    <DoctorLayout>
      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
              <IcoSearch size={14} />
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or phone..."
              style={{ paddingLeft:32, height:38, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:'100%' }}/>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading patients...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>ID</th><th>Gender</th><th>Phone</th><th>Last Visit</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const initials = p.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="doc-avatar">{initials}</div>
                          <span style={{ fontWeight:500 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'#64748b', fontSize:13 }}>{p.patientId||'—'}</td>
                      <td>{p.gender||'—'}</td>
                      <td style={{ color:'#64748b', fontSize:13 }}>{p.phone}</td>
                      <td style={{ color:'#64748b', fontSize:13 }}>
                        {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td>
                        <button className="btn-outline btn-sm"
                          onClick={() => navigate('/doctor/patient-detail', { state: { patient: p } })}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No patients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

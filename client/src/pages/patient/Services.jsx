import { useEffect, useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import api from '../../api/axios';

export default function PatientServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    api.get('/catalog/services').then(res => setServices(res.data.services || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const departments = ['All', ...new Set(services.map(s => s.department))];
  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <PatientLayout>
      <div className="card">
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            style={{ flex:1, minWidth:200, height:38, padding:'0 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}/>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ height:38, padding:'0 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' }}>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading services...</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Service</th><th>Department</th><th>Duration</th><th>Fee</th></tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color:'#64748b' }}>{i+1}</td>
                    <td style={{ fontWeight:500 }}>{s.name}</td>
                    <td style={{ color:'#64748b' }}>{s.department}</td>
                    <td style={{ color:'#64748b' }}>{s.duration}</td>
                    <td style={{ fontWeight:600, color:'#15803d' }}>₹{s.fee}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'#94a3b8', padding:32 }}>No services found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

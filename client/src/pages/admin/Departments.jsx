import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setDepartments(data.departmentStats || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="page-header">
        <div><div className="page-header-title">Departments</div><div className="page-header-sub">Overview derived from doctor profiles and appointments.</div></div>
      </div>

      {loading ? <div className="card" style={{ color:'#64748b', padding:32 }}>Loading departments...</div> : departments.length ? (
        <div className="grid-3">
          {departments.map(department => (
            <div key={department._id} className="card">
              <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>{department._id}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:12 }}>
                {[['Doctors', department.doctors], ['Patients', department.patients], ['Appointments', department.appointments]].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize:20, fontWeight:700, color:'var(--primary)' }}>{value}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="card" style={{ textAlign:'center', color:'#64748b', padding:32 }}>No departments yet. Department groups appear when doctor profiles are added.</div>}
    </AdminLayout>
  );
}

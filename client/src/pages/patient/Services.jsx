import PatientLayout from '../../components/layout/PatientLayout';

const SERVICES = [
  { name: 'General Consultation', dept: 'General Medicine', fee: 'Rs. 500', duration: '30 min', status: 'Active' },
  { name: 'ECG', dept: 'Cardiology', fee: 'Rs. 800', duration: '20 min', status: 'Active' },
  { name: 'X-Ray', dept: 'Radiology', fee: 'Rs. 1,200', duration: '15 min', status: 'Active' },
  { name: 'Blood Test (CBC)', dept: 'Pathology', fee: 'Rs. 600', duration: '1 day', status: 'Active' },
  { name: 'MRI Scan', dept: 'Radiology', fee: 'Rs. 4,500', duration: '45 min', status: 'Inactive' },
  { name: 'Dermatology Consult', dept: 'Dermatology', fee: 'Rs. 700', duration: '30 min', status: 'Active' },
];

export default function PatientServices() {
  return (
    <PatientLayout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Services</div>
          <div className="page-header-sub">View available hospital services.</div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Department</th>
                <th>Fee</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: '#64748b' }}>{s.dept}</td>
                  <td style={{ fontWeight: 600, color: '#15803d' }}>{s.fee}</td>
                  <td style={{ color: '#64748b' }}>{s.duration}</td>
                  <td><span className={`badge ${s.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PatientLayout>
  );
}

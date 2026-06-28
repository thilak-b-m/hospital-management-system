import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';

const APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Robert Smith', dept: 'Cardiology', date: '25 May 2024', time: '10:30 AM', status: 'Upcoming', initials: 'RS' },
  { id: 2, doctor: 'Dr. Emily Johnson', dept: 'Neurology', date: '10 May 2024', time: '02:00 PM', status: 'Completed', initials: 'EJ' },
  { id: 3, doctor: 'Dr. Michael Brown', dept: 'Orthopedic', date: '28 Apr 2024', time: '11:00 AM', status: 'Completed', initials: 'MB' },
  { id: 4, doctor: 'Dr. Sarah Davis', dept: 'Dermatology', date: '15 Apr 2024', time: '03:30 PM', status: 'Cancelled', initials: 'SD' },
  { id: 5, doctor: 'Dr. Robert Smith', dept: 'Cardiology', date: '05 Apr 2024', time: '10:00 AM', status: 'Completed', initials: 'RS' },
];

const STATUS_CLASS = { Upcoming: 'badge-upcoming', Completed: 'badge-completed', Cancelled: 'badge-cancelled' };

export default function MyAppointments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? APPOINTMENTS : APPOINTMENTS.filter(a => a.status === filter);

  return (
    <PatientLayout>
      <div className="card">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                borderColor: filter === f ? 'var(--primary)' : '#e2e8f0',
                background: filter === f ? 'var(--primary)' : 'white',
                color: filter === f ? 'white' : '#64748b',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ color: '#64748b' }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="doc-avatar">{a.initials}</div>
                      <span style={{ fontWeight: 500 }}>{a.doctor}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748b' }}>{a.dept}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.date}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{a.time}</div>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[a.status]}`}>{a.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => navigate('/patient/doctor-details')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PatientLayout>
  );
}

import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import {
  IcoCalPlus, IcoCalendar, IcoPrescription, IcoUser,
  IcoClock, IcoMapPin
} from '../../components/ui/Icons';

const stats = [
  { label: 'Upcoming Appointments', value: 2, sub: 'View this month', color: '#dbeafe', iconColor: '#1d4ed8', Icon: IcoCalendar },
  { label: 'Total Appointments', value: 5, sub: 'View all', color: '#dcfce7', iconColor: '#15803d', Icon: IcoCalPlus },
  { label: 'Total Prescriptions', value: 3, sub: 'View all', color: '#ede9fe', iconColor: '#7c3aed', Icon: IcoPrescription },
  { label: 'Profile', value: 'Complete', sub: 'View profile', color: '#fef9c3', iconColor: '#b45309', Icon: IcoUser },
];

const quickActions = [
  { label: 'Book New Appointment', Icon: IcoCalPlus, to: '/patient/book-appointment' },
  { label: 'View My Appointments', Icon: IcoCalendar, to: '/patient/appointments' },
  { label: 'My Prescriptions', Icon: IcoPrescription, to: '/patient/prescriptions' },
  { label: 'Update Profile', Icon: IcoUser, to: '/patient/profile' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <PatientLayout>
      <p style={{ color: '#64748b', marginBottom: 20, fontSize: 15 }}>Welcome back, John Doe!</p>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {stats.map(({ label, value, sub, color, iconColor, Icon }) => (
          <div key={label} className="stat-card" onClick={() => {}}>
            <div className="stat-icon" style={{ background: color, color: iconColor }}>
              <Icon />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-number" style={{ color: iconColor }}>{value}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Upcoming Appointment */}
        <div className="card">
          <div className="section-title">Upcoming Appointment</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Doctor avatar art */}
            <div style={{ width: 72, height: 72, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 72 72" width="72" height="72">
                <rect width="72" height="72" fill="#dbeafe" rx="10"/>
                <circle cx="36" cy="26" r="14" fill="#93c5fd"/>
                <rect x="16" y="48" width="40" height="24" fill="#bfdbfe" rx="8"/>
                <rect x="28" y="38" width="16" height="10" fill="#93c5fd"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. Robert Smith</div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>Cardiologist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                  <IcoCalendar /><span>25 May 2024</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                  <IcoClock /><span>10:30 AM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                  <IcoMapPin /><span>Cardiology OPD</span>
                </div>
              </div>
              <button
                className="btn-primary btn-sm"
                style={{ marginTop: 14 }}
                onClick={() => navigate('/patient/doctor-details')}
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div className="grid-2">
            {quickActions.map(({ label, Icon, to }) => (
              <div key={label} className="quick-card" onClick={() => navigate(to)}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#dbeafe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

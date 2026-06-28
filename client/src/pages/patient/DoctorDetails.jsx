import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoBriefcase, IcoAward, IcoDollar } from '../../components/ui/Icons';

const AVAIL = [
  { day: 'Monday',    time: '10:00 AM - 05:00 PM', off: false },
  { day: 'Tuesday',   time: '10:00 AM - 05:00 PM', off: false },
  { day: 'Wednesday', time: '10:00 AM - 05:00 PM', off: false },
  { day: 'Thursday',  time: '10:00 AM - 05:00 PM', off: false },
  { day: 'Friday',    time: '10:00 AM - 05:00 PM', off: false },
  { day: 'Saturday',  time: '10:00 AM - 02:00 PM', off: false },
  { day: 'Sunday',    time: '— Not Available',       off: true  },
];

export default function DoctorDetails() {
  const navigate = useNavigate();

  return (
    <PatientLayout>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Doctor info */}
        <div className="card">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#dbeafe', flexShrink: 0, overflow: 'hidden' }}>
              <svg viewBox="0 0 90 90" width="90" height="90">
                <circle cx="45" cy="45" r="45" fill="#dbeafe"/>
                <circle cx="45" cy="32" r="18" fill="#93c5fd"/>
                <rect x="20" y="60" width="50" height="30" fill="#bfdbfe" rx="12"/>
                <rect x="35" y="48" width="20" height="14" fill="#93c5fd"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 22 }}>Dr. Robert Smith</div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>Cardiologist</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Experience</div>
              <div style={{ fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--primary)' }}><IcoBriefcase /></span> 10+ Years
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Qualification</div>
              <div style={{ fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--primary)' }}><IcoAward /></span> MBBS, MD (Cardiology)
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Fees</div>
              <div style={{ fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--primary)' }}><IcoDollar /></span> $20
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>About Doctor</div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
              Dr. Robert Smith is a highly experienced Cardiologist with expertise in diagnosing and
              treating heart diseases and related conditions. He has helped thousands of patients
              achieve better cardiac health through evidence-based treatment and compassionate care.
            </p>
          </div>

          <button
            className="btn-primary"
            style={{ marginTop: 24, justifyContent: 'center', width: '100%', padding: '12px' }}
            onClick={() => navigate('/patient/book-appointment')}
          >
            Book Appointment
          </button>
        </div>

        {/* Availability */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="section-title">Availability</div>
          {AVAIL.map(({ day, time, off }) => (
            <div key={day} className="avail-row">
              <span className={`avail-day${off ? ' avail-off' : ''}`}>{day}</span>
              <span className={off ? 'avail-off' : 'avail-time'}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoBriefcase, IcoDollar, IcoCalendar } from '../../components/ui/Icons';

const DOCTORS = {
  Cardiology: [
    { name: 'Dr. Robert Smith', specialty: 'Cardiologist', exp: '10+ Years', fee: '$20', avail: 'Mon - Sat', hours: '10:00 AM - 05:00 PM' },
  ],
  Neurology: [
    { name: 'Dr. Emily Johnson', specialty: 'Neurologist', exp: '8+ Years', fee: '$25', avail: 'Mon - Fri', hours: '09:00 AM - 04:00 PM' },
  ],
  Orthopedic: [
    { name: 'Dr. Michael Brown', specialty: 'Orthopedist', exp: '12+ Years', fee: '$30', avail: 'Mon - Sat', hours: '10:00 AM - 06:00 PM' },
  ],
  Dermatology: [
    { name: 'Dr. Sarah Davis', specialty: 'Dermatologist', exp: '6+ Years', fee: '$18', avail: 'Tue - Sat', hours: '11:00 AM - 05:00 PM' },
  ],
};

const TIMES = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [dept, setDept] = useState('Cardiology');
  const [docIdx, setDocIdx] = useState(0);
  const [form, setForm] = useState({ date: '', time: '', symptoms: '' });
  const [booked, setBooked] = useState(false);

  const doctors = DOCTORS[dept] || [];
  const doc = doctors[docIdx] || doctors[0];

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    setBooked(true);
    setTimeout(() => { setBooked(false); navigate('/patient/appointments'); }, 2000);
  };

  return (
    <PatientLayout>
      {booked && (
        <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: 10, padding: '14px 20px', marginBottom: 20, fontWeight: 500, border: '1px solid #bbf7d0' }}>
          ✓ Appointment booked successfully! Redirecting...
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <div className="section-title">Find Doctor</div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={dept} onChange={e => { setDept(e.target.value); setDocIdx(0); }}>
                  {Object.keys(DOCTORS).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select className="form-select" value={docIdx} onChange={e => setDocIdx(Number(e.target.value))}>
                  {doctors.map((d, i) => <option key={i} value={i}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Appointment Date</label>
                <input className="form-input" type="date" name="date" value={form.date} onChange={handle} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Time</label>
                <select className="form-select" name="time" value={form.time} onChange={handle} required>
                  <option value="">Select Time</option>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Symptoms / Reason for Visit</label>
              <textarea
                className="form-textarea" name="symptoms"
                placeholder="Enter symptoms or reason for visit"
                value={form.symptoms} onChange={handle}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Book Appointment
            </button>
          </form>
        </div>

        {/* Doctor info card */}
        {doc && (
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#dbeafe', marginBottom: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 90 90" width="90" height="90">
                  <circle cx="45" cy="45" r="45" fill="#dbeafe"/>
                  <circle cx="45" cy="32" r="18" fill="#93c5fd"/>
                  <rect x="20" y="60" width="50" height="30" fill="#bfdbfe" rx="12"/>
                  <rect x="35" y="48" width="20" height="14" fill="#93c5fd"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{doc.name}</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>{doc.specialty}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ color: 'var(--primary)' }}><IcoBriefcase /></div>
                <div><span style={{ color: '#64748b' }}>Experience:</span> <strong>{doc.exp}</strong></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ color: 'var(--primary)' }}><IcoDollar /></div>
                <div><span style={{ color: '#64748b' }}>Fees:</span> <strong>{doc.fee}</strong></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ color: 'var(--primary)' }}><IcoCalendar /></div>
                <div>
                  <span style={{ color: '#64748b' }}>Available:</span> <strong>{doc.avail}</strong><br />
                  <span style={{ color: '#64748b', fontSize: 13 }}>{doc.hours}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

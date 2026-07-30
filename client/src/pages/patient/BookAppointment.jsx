import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoBriefcase, IcoDollar, IcoCalendar, IcoCheck, IcoBan } from '../../components/ui/Icons';
import api from '../../api/axios';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function parseTime(str) {
  if (!str) return null;
  const [time, period] = str.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function getAvailableTimesForDoctor(doctor, dateStr) {
  if (!doctor || !dateStr) return [];
  const dayName = DAY_NAMES[new Date(dateStr).getDay()];
  const slot = doctor.availability?.find(a => a.day === dayName);
  if (!slot || !slot.available || !slot.startTime || !slot.endTime) return [];

  const start = parseTime(slot.startTime);
  const end = parseTime(slot.endTime);
  if (start === null || end === null) return [];

  const times = [];
  for (let t = start; t + 30 <= end; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    times.push(`${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`);
  }
  return times;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dept, setDept] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [form, setForm] = useState({ date: '', time: '', symptoms: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/catalog/doctors').then(res => {
      const docs = res.data.doctors || [];
      setDoctors(docs);
      const depts = [...new Set(docs.map(d => d.department))];
      setDepartments(depts);
      if (depts.length) setDept(depts[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(d => d.department === dept);
    setDoctorId(filtered[0]?._id || '');
    setForm(p => ({ ...p, date: '', time: '' }));
  }, [dept, doctors]);

  useEffect(() => {
    setForm(p => ({ ...p, time: '' }));
  }, [doctorId, form.date]);

  const filteredDoctors = doctors.filter(d => d.department === dept);
  const selectedDoc = doctors.find(d => d._id === doctorId);

  const availableTimes = getAvailableTimesForDoctor(selectedDoc, form.date);

  const isDayOff = (dateStr) => {
    if (!selectedDoc || !dateStr) return false;
    const dayName = DAY_NAMES[new Date(dateStr).getDay()];
    const slot = selectedDoc.availability?.find(a => a.day === dayName);
    return !slot || !slot.available;
  };

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (isDayOff(form.date)) {
      setError('The doctor is not available on the selected day. Please choose another date.');
      return;
    }
    if (!form.time) {
      setError('Please select an appointment time.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctorId,
        appointmentDate: form.date,
        appointmentTime: form.time,
        symptoms: form.symptoms,
      });
      setSuccess(true);
      setTimeout(() => navigate('/patient/appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const dayOff = isDayOff(form.date);

  return (
    <PatientLayout>
      {success && (
        <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: 10, padding: '14px 20px', marginBottom: 20, fontWeight: 500, border: '1px solid #bbf7d0' }}>
          Appointment booked successfully! Redirecting...
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 10, padding: '14px 20px', marginBottom: 20, border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Booking Form */}
        <div className="card">
          <div className="section-title">Book Appointment</div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select className="form-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  {filteredDoctors.map(d => <option key={d._id} value={d._id}>{d.user?.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input className="form-input" type="date" name="date" value={form.date}
                min={new Date().toISOString().split('T')[0]} onChange={handle} required/>
              {form.date && dayOff && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IcoBan /> Doctor is not available on {DAY_NAMES[new Date(form.date).getDay()]}s
                </div>
              )}
              {form.date && !dayOff && availableTimes.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IcoCheck size={12} /> Available on {DAY_NAMES[new Date(form.date).getDay()]}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Time</label>
              {!form.date ? (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#94a3b8', border: '1.5px solid #e2e8f0' }}>
                  Select a date first
                </div>
              ) : dayOff ? (
                <div style={{ padding: '10px 12px', background: '#fee2e2', borderRadius: 8, fontSize: 13, color: '#dc2626', border: '1.5px solid #fecaca' }}>
                  No slots — doctor unavailable this day
                </div>
              ) : availableTimes.length === 0 ? (
                <div style={{ padding: '10px 12px', background: '#fef9c3', borderRadius: 8, fontSize: 13, color: '#92400e', border: '1.5px solid #fde68a' }}>
                  No time slots configured for this day
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableTimes.map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, time: t }))}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: '1.5px solid',
                        borderColor: form.time === t ? 'var(--primary)' : '#e2e8f0',
                        background: form.time === t ? 'var(--primary)' : 'white',
                        color: form.time === t ? 'white' : '#374151',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Symptoms / Reason for Visit</label>
              <textarea className="form-textarea" name="symptoms"
                placeholder="Describe your symptoms or reason for visit..."
                value={form.symptoms} onChange={handle}/>
            </div>

            <button type="submit" className="btn-primary"
              disabled={loading || !doctorId || !form.date || !form.time || dayOff}
              style={{ justifyContent: 'center', padding: '12px', opacity: (loading || !form.time || dayOff) ? 0.6 : 1 }}>
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>

        {/* Doctor Info Panel */}
        {selectedDoc ? (
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#dbeafe', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#1d4ed8' }}>
                {selectedDoc.user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('') || 'DR'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedDoc.user?.name}</div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>{selectedDoc.department}</div>
              {selectedDoc.qualification && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{selectedDoc.qualification}</div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Experience</div>
                <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 16 }}>{selectedDoc.experience} yrs</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Consult Fee</div>
                <div style={{ fontWeight: 700, color: '#15803d', fontSize: 16 }}>₹{selectedDoc.consultationFee}</div>
              </div>
            </div>

            {/* About */}
            {selectedDoc.about && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>About</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{selectedDoc.about}</div>
              </div>
            )}

            {/* Availability schedule */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 10 }}>Weekly Availability</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(selectedDoc.availability || []).map(slot => (
                  <div key={slot.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 7, background: slot.available ? '#f0fdf4' : '#fafafa' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: slot.available ? '#15803d' : '#94a3b8', width: 90 }}>{slot.day}</span>
                    <span style={{ fontSize: 12, color: slot.available ? '#374151' : '#cbd5e1' }}>
                      {slot.available && slot.startTime ? `${slot.startTime} – ${slot.endTime}` : 'Not Available'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: slot.available ? '#15803d' : '#94a3b8' }}>
                      {slot.available ? '●' : '○'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#94a3b8', fontSize: 14 }}>
            Select a doctor to see details
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

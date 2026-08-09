import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoTrash, IcoPrint } from '../../components/ui/Icons';
import api from '../../api/axios';

const EMPTY_MED = { medicine:'', dosage:'', frequency:'', duration:'', instructions:'' };

export default function NewPrescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState(() => location.state?.patientId || location.state?.patient?._id || '');
  const [appointmentId, setAppointmentId] = useState(() => location.state?.appointmentId || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState([{ ...EMPTY_MED }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/doctor/patients'),
      api.get('/appointments'),
    ]).then(([pRes, aRes]) => {
      setPatients(pRes.data.patients || []);
      const confirmed = (aRes.data.appointments || []).filter(a => a.status === 'Confirmed' || a.status === 'Pending');
      setAppointments(confirmed);
      // If we were passed a patientId or appointmentId via navigate state, keep them
      if (location.state?.patientId || location.state?.patient) {
        setPatientId(location.state.patientId || location.state.patient?._id);
      }
      if (location.state?.appointmentId) setAppointmentId(location.state.appointmentId);
    }).catch(console.error);
  }, []);

  const updateMed = (i, k, v) => setMeds(ms => ms.map((m,idx) => idx===i ? {...m,[k]:v} : m));
  const addMed = () => setMeds(ms => [...ms, { ...EMPTY_MED }]);
  const removeMed = i => setMeds(ms => ms.filter((_,idx) => idx !== i));

  const save = async () => {
    setError('');
    if (!patientId || !diagnosis || meds.some(m => !m.medicine)) {
      setError('Please fill patient, diagnosis and all medicine names'); return;
    }
    setLoading(true);
    try {
      await api.post('/prescriptions', { patientId, appointmentId: appointmentId||undefined, diagnosis, medications: meds, notes });
      setSaved(true);
      setTimeout(() => navigate('/doctor/prescriptions'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:700 }}>New Prescription</div>
          <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>Create a prescription for a patient</div>
        </div>

        {saved && (
          <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
            Prescription saved successfully!
          </div>
        )}
        {error && (
          <div style={{ background:'#fee2e2', color:'#dc2626', borderRadius:10, padding:'12px 18px', marginBottom:16 }}>
            {error}
          </div>
        )}

        <div className="card">
          <div className="grid-2" style={{ marginBottom:20 }}>
            <div className="form-group">
              <label className="form-label">Patient <span style={{ color:'#ef4444' }}>*</span></label>
              <select className="form-select" value={patientId} onChange={e => setPatientId(e.target.value)} required>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId||'—'})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Linked Appointment (optional)</label>
              <select className="form-select" value={appointmentId} onChange={e => setAppointmentId(e.target.value)}>
                <option value="">None</option>
                {appointments.filter(a => !patientId || String(a.patient?._id) === patientId).map(a => (
                  <option key={a._id} value={a._id}>
                    {new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} {a.appointmentTime}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <label className="form-label">Diagnosis <span style={{ color:'#ef4444' }}>*</span></label>
            <input className="form-input" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g. Hypertension, Migraine..." required/>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Medications</div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th><th></th></tr>
                </thead>
                <tbody>
                  {meds.map((m, i) => (
                    <tr key={i}>
                      {(['medicine','dosage','frequency','duration','instructions']).map(k => (
                        <td key={k}>
                          <input value={m[k]} onChange={e => updateMed(i, k, e.target.value)}
                            placeholder={k.charAt(0).toUpperCase()+k.slice(1)}
                            style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 8px', fontSize:13, width: k==='medicine'?140:k==='instructions'?120:90, outline:'none' }}/>
                        </td>
                      ))}
                      <td>
                        <button onClick={() => removeMed(i)} disabled={meds.length===1}
                          style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#dc2626', opacity: meds.length===1?0.4:1 }}>
                          <IcoTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addMed}
              style={{ marginTop:10, background:'none', border:'1.5px dashed #cbd5e1', borderRadius:8, cursor:'pointer', padding:'8px 20px', color:'#64748b', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              <IcoPlus size={14} /> Add Medicine
            </button>
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <label className="form-label">Notes for Patient</label>
            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional instructions..." style={{ minHeight:70 }}/>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={loading}>
              {loading ? 'Saving...' : 'Save Prescription'}
            </button>
            <button className="btn-primary" style={{ background:'#0369a1' }} onClick={() => window.print()}>
              <IcoPrint /> Print
            </button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

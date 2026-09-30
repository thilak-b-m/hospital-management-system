import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import DoctorLayout from '../../components/layout/DoctorLayout';
import ConsultationOverview from '../../components/doctor/ConsultationOverview';
import { printPatientSummary } from '../../utils/print';
import { openReportFile } from '../../utils/reportFiles';
import { IcoEdit, IcoPhone, IcoMail, IcoMapPin, IcoActivity, IcoHeart, IcoThermometer, IcoWind } from '../../components/ui/Icons';

const TABS = ['Overview','Medical History','Prescriptions','Reports','Appointments'];

const vitals = [
  { label:'Blood Pressure', value:'140/90 mmHg', Icon: IcoHeart,       color:'#fee2e2', iconColor:'#dc2626' },
  { label:'Heart Rate',     value:'78 bpm',      Icon: IcoActivity,    color:'#dbeafe', iconColor:'#1d4ed8' },
  { label:'Temperature',    value:'98.6 °F',     Icon: IcoThermometer, color:'#fef9c3', iconColor:'#b45309' },
  { label:'Respiratory Rate',value:'18/min',     Icon: IcoWind,        color:'#dcfce7', iconColor:'#15803d' },
];

export default function PatientDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state || {};
  const [tab, setTab] = useState('Overview');

  const [patient, setPatient] = useState(() => passed.patient || null);
  const appointmentId = passed.appointmentId;

  const { user } = useAuth();
  const [history, setHistory] = useState({ entries: [], healthSummary: {} });
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingRx, setLoadingRx] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', type: 'Diagnosis', notes: '', medications: '' });
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [vitalsState, setVitalsState] = useState({ bloodPressure:'', heartRate:'', temperature:'', respiratoryRate:'' });
  const [consultationSummary, setConsultationSummary] = useState('');
  const [consultationStatus, setConsultationStatus] = useState({ message:'', type:'' });
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryState, setSummaryState] = useState({ bloodGroup:'', height:'', weight:'', allergies:'', chronicConditions:'' });
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [apptForm, setApptForm] = useState({ appointmentDate:'', appointmentTime:'', symptoms:'' });

  useEffect(() => {
    if (passed.patient) setPatient(passed.patient);
  }, [passed.patient]);

  useEffect(() => {
    if (!patient?._id) return;
    setLoadingHistory(true);
    api.get(`/medical-history/${patient._id}`)
      .then(res => setHistory(res.data.history || { entries: [] }))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));

    setLoadingReports(true);
    api.get(`/reports/${patient._id}`)
      .then(res => setReports(res.data.reports || []))
      .catch(console.error)
      .finally(() => setLoadingReports(false));

    setLoadingRx(true);
    api.get(`/prescriptions?patientId=${patient._id}`)
      .then(res => setPrescriptions(res.data.prescriptions || []))
      .catch(console.error)
      .finally(() => setLoadingRx(false));
  }, [patient]);

    useEffect(() => {
      if (history?.healthSummary) setSummaryState(history.healthSummary || {});
      // populate latest vitals if present
      if (history?.entries?.length > 0) {
        const latest = history.entries[0];
        if (latest?.vitals) setVitalsState(latest.vitals);
      }
    }, [history]);

  const refreshAll = async () => {
    if (!patient?._id) return;
    try {
      const [hRes, rxRes, rRes] = await Promise.all([
        api.get(`/medical-history/${patient._id}`),
        api.get(`/prescriptions?patientId=${patient._id}`),
        api.get(`/reports/${patient._id}`),
      ]);
      setHistory(hRes.data.history || { entries: [] });
      setPrescriptions(rxRes.data.prescriptions || []);
      setReports(rRes.data.reports || []);
    } catch (err) { console.error(err); }
  };

  const handleSaveConsultationSummary = async () => {
    if (!consultationSummary.trim()) {
      setConsultationStatus({ message: 'Please enter a summary note before saving.', type: 'error' });
      return;
    }
    setConsultationStatus({ message: '', type: '' });
    try {
      await api.post(`/medical-history/${patient._id}/entries`, {
        title: 'Consultation Summary',
        type: 'Consultation',
        notes: consultationSummary,
        appointmentId,
      });
      await refreshAll();
      setConsultationSummary('');
      setConsultationStatus({ message: 'Consultation summary saved.', type: 'success' });
    } catch (err) {
      console.error(err);
      setConsultationStatus({ message: err.response?.data?.message || 'Failed to save consultation summary.', type: 'error' });
    }
  };

  return (
    <DoctorLayout>
      {/* Back + actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={() => navigate('/doctor/patients')}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
          ← Back to Patients
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn-outline btn-sm">By Teams</button>
          <button className="btn-outline btn-sm">↓</button>
        </div>
      </div>

      {/* Patient header */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="patient-overview-header" style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <div style={{ width:90, height:90, borderRadius:'50%', background:'#e2e8f0', flexShrink:0, overflow:'hidden' }}>
            <svg viewBox="0 0 90 90" width="90" height="90">
              <circle cx="45" cy="45" r="45" fill="#cbd5e1"/>
              <circle cx="45" cy="33" r="18" fill="#94a3b8"/>
              <rect x="20" y="62" width="50" height="28" fill="#94a3b8" rx="10"/>
              <rect x="34" y="48" width="22" height="14" fill="#94a3b8"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div className="patient-overview-heading" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:22 }}>{patient?.name || 'Patient Name'}</div>
                <div style={{ color:'#64748b', fontSize:13, marginTop:2 }}>{patient?.patientId || ''}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:16, marginTop:10 }}>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    {patient?.age ? `${patient.age} Years` : ''}{patient?.gender ? `, ${patient.gender}` : ''}
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoPhone />{patient?.phone || ''}
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoMail />{patient?.email || ''}
                  </span>
                  <span style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                    <IcoMapPin />{patient?.address || ''}
                  </span>
                </div>
              </div>
                <div className="patient-overview-actions" style={{ display:'flex', gap:8 }}>
                  <button className="btn-outline btn-sm" onClick={() => printPatientSummary(patient?._id)}>Print Summary</button>
                  <button className="btn-primary btn-sm" onClick={() => {}}>
                    <IcoEdit /> Edit Patient
                  </button>
                </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="patient-detail-tabs" style={{ display:'flex', gap:0, marginTop:20, borderBottom:'2px solid #e2e8f0' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding:'10px 20px', border:'none', background:'none', cursor:'pointer',
                fontSize:14, fontWeight:500, transition:'all 0.2s',
                color: tab===t ? 'var(--primary)' : '#64748b',
                borderBottom: tab===t ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom:'-2px',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {appointmentId && (
        <div className="card" style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700 }}>Appointment confirmed</div>
            <div style={{ color:'#64748b', marginTop:4 }}>You can start the consultation and fill forms for this appointment.</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-outline" onClick={() => setTab('Overview')}>Start Consultation</button>
            <button className="btn-primary" onClick={() => navigate('/doctor/new-prescription', { state: { patientId: patient?._id, appointmentId } })}>Add Prescription</button>
          </div>
        </div>
      )}

      {tab === 'Overview' && (
        <div className="grid-3">
          {/* Health Summary */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontWeight:600 }}>Health Summary</div>
              {user?.role === 'doctor' && (
                <button className="btn-outline btn-sm" onClick={() => setEditingSummary(es => !es)}>{editingSummary ? 'Cancel' : 'Edit'}</button>
              )}
            </div>
            {editingSummary ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input placeholder="Blood Group" value={summaryState.bloodGroup || ''} onChange={e => setSummaryState(s => ({ ...s, bloodGroup: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input placeholder="Height" value={summaryState.height || ''} onChange={e => setSummaryState(s => ({ ...s, height: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input placeholder="Weight" value={summaryState.weight || ''} onChange={e => setSummaryState(s => ({ ...s, weight: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input placeholder="Allergies" value={summaryState.allergies || ''} onChange={e => setSummaryState(s => ({ ...s, allergies: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input placeholder="Chronic Conditions" value={summaryState.chronicConditions || ''} onChange={e => setSummaryState(s => ({ ...s, chronicConditions: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                  <button className="btn-outline" onClick={() => setEditingSummary(false)}>Cancel</button>
                  <button className="btn-primary" onClick={async () => {
                    try {
                      const payload = {
                        bloodGroup: summaryState.bloodGroup,
                        height: summaryState.height,
                        weight: summaryState.weight,
                        allergies: summaryState.allergies,
                        chronicConditions: summaryState.chronicConditions,
                      };
                      await api.put(`/medical-history/${patient._id}/health-summary`, payload);
                      const res = await api.get(`/medical-history/${patient._id}`);
                      setHistory(res.data.history || { entries: [] });
                      setEditingSummary(false);
                      alert('Health summary updated');
                    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Failed to update'); }
                  }}>Save</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Blood Group</span>
                  <span style={{ fontWeight:500 }}>{history?.healthSummary?.bloodGroup || '-'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Height</span>
                  <span style={{ fontWeight:500 }}>{history?.healthSummary?.height || '-'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Weight</span>
                  <span style={{ fontWeight:500 }}>{history?.healthSummary?.weight || '-'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Allergies</span>
                  <span style={{ fontWeight:500 }}>{history?.healthSummary?.allergies || '-'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>Chronic Conditions</span>
                  <span style={{ fontWeight:500 }}>{history?.healthSummary?.chronicConditions || '-'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Consultation Summary */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontWeight:600 }}>Consultation Summary</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Write a note to store in medical history</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <textarea
                value={consultationSummary}
                onChange={(e) => setConsultationSummary(e.target.value)}
                placeholder="Add a summary note here to help create the patient report..."
                style={{ minHeight:140, padding:14, border:'1px solid #e2e8f0', borderRadius:12, fontSize:14, lineHeight:1.6 }}
              />
              {consultationStatus.message && (
                <div style={{ padding:'10px 14px', borderRadius:10, color: consultationStatus.type === 'error' ? '#b91c1c' : '#166534', background: consultationStatus.type === 'error' ? '#fee2e2' : '#dcfce7', border: consultationStatus.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0' }}>
                  {consultationStatus.message}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button className="btn-outline" type="button" onClick={() => setConsultationSummary('')}>Clear</button>
                <button className="btn-primary" type="button" onClick={handleSaveConsultationSummary}>Save Summary</button>
              </div>
            </div>
          </div>

          {/* Latest Diagnosis */}
          <ConsultationOverview patientId={patient?._id} appointmentId={appointmentId} onSaved={refreshAll} />

          <div className="card">
            <div style={{ fontWeight:600, marginBottom:8 }}>Latest Diagnosis</div>
            {history?.entries?.length === 0 ? (
              <div style={{ color:'#64748b' }}>This is the first consultation — no prior diagnosis available.</div>
            ) : (
              (() => {
                const latest = history.entries[0];
                return (
                  <div>
                    <div style={{ fontWeight:700, fontSize:16, color:'#dc2626', marginBottom:6 }}>{latest.title}</div>
                    <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>{new Date(latest.date).toLocaleString()}</div>
                    <div style={{ fontWeight:500, fontSize:13, marginBottom:6 }}>Notes</div>
                    <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{latest.notes || '-'}</div>
                    {latest.medications?.length > 0 && (
                      <div style={{ marginTop:10 }}><strong>Medications:</strong> {latest.medications.join(', ')}</div>
                    )}
                    {latest.vitals && (
                      <div style={{ marginTop:10 }}>
                        <div style={{ color:'#64748b', marginBottom:4 }}>Vitals</div>
                        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                          <div style={{ background:'#f8fafc', padding:8, borderRadius:6 }}><strong>BP:</strong> {latest.vitals.bloodPressure || '-'}</div>
                          <div style={{ background:'#f8fafc', padding:8, borderRadius:6 }}><strong>HR:</strong> {latest.vitals.heartRate || '-'}</div>
                          <div style={{ background:'#f8fafc', padding:8, borderRadius:6 }}><strong>Temp:</strong> {latest.vitals.temperature || '-'}</div>
                          <div style={{ background:'#f8fafc', padding:8, borderRadius:6 }}><strong>RR:</strong> {latest.vitals.respiratoryRate || '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>

          {/* Vital Signs (editable during consultation) */}
          <div className="card">
            <div style={{ fontWeight:600, marginBottom:14 }}>Vital Signs (Latest)</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['bloodPressure','heartRate','temperature','respiratoryRate'].map(key => (
                <div key={key} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:140, color:'#64748b', textTransform:'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                  <input value={vitalsState[key] || ''} onChange={e => setVitalsState(vs => ({ ...vs, [key]: e.target.value }))}
                    placeholder={key === 'bloodPressure' ? 'e.g. 120/80 mmHg' : (key === 'temperature' ? 'e.g. 98.6 °F' : '')}
                    style={{ flex:1, padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                </div>
              ))}
              {user?.role === 'doctor' && (
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                  <button className="btn-outline" onClick={() => setVitalsState({ bloodPressure:'', heartRate:'', temperature:'', respiratoryRate:'' })}>Reset</button>
                  <button className="btn-primary" onClick={async () => {
                    try {
                      await api.post(`/medical-history/${patient._id}/entries`, { title: 'Consultation', type: 'Consultation', notes: '', medications: [], appointmentId, vitals: vitalsState });
                      const res = await api.get(`/medical-history/${patient._id}`);
                      setHistory(res.data.history || { entries: [] });
                      alert('Consultation saved to medical history');
                    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Failed to save consultation'); }
                  }}>Save Consultation</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'Medical History' && (
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>Medical History</div>
            {user?.role === 'doctor' && (
              <div style={{ fontSize:13, color:'#64748b' }}>You can add entries during consultation</div>
            )}
          </div>

          {user?.role === 'doctor' && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <input placeholder="Title (e.g. Hypertension diagnosis)" value={newEntry.title}
                  onChange={e => setNewEntry(ne => ({ ...ne, title: e.target.value }))}
                  style={{ flex:1, padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <select value={newEntry.type} onChange={e => setNewEntry(ne => ({ ...ne, type: e.target.value }))}
                  style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }}>
                  <option>Diagnosis</option>
                  <option>Allergy</option>
                  <option>Surgery</option>
                  <option>Vaccination</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <input placeholder="Medications (comma separated)" value={newEntry.medications}
                  onChange={e => setNewEntry(ne => ({ ...ne, medications: e.target.value }))}
                  style={{ flex:1, padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <button className="btn-primary" onClick={async () => {
                  if (!newEntry.title) return alert('Please enter a title');
                  try {
                    const meds = newEntry.medications ? newEntry.medications.split(',').map(s => s.trim()).filter(Boolean) : [];
                    await api.post(`/medical-history/${patient._id}/entries`, { title: newEntry.title, type: newEntry.type, notes: newEntry.notes, medications: meds, appointmentId });
                    // refresh
                    const res = await api.get(`/medical-history/${patient._id}`);
                    setHistory(res.data.history || { entries: [] });
                    setNewEntry({ title: '', type: 'Diagnosis', notes: '', medications: '' });
                  } catch (err) { console.error(err); alert(err.response?.data?.message || 'Failed to add entry'); }
                }}>Add Entry</button>
              </div>
              <div>
                <textarea placeholder="Notes" value={newEntry.notes} onChange={e => setNewEntry(ne => ({ ...ne, notes: e.target.value }))}
                  style={{ width:'100%', minHeight:80, padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
              </div>
            </div>
          )}

          {loadingHistory ? (
            <div style={{ padding:16, color:'#64748b' }}>Loading history...</div>
          ) : history?.entries?.length === 0 ? (
            <div style={{ padding:16, color:'#64748b' }}>No history records.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {history.entries.map((e, idx) => (
                <div key={idx} style={{ padding:12, border:'1px solid #f1f5f9', borderRadius:8, background:'#fff' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontWeight:700 }}>{e.title}</div>
                    <div style={{ color:'#64748b', fontSize:13 }}>{new Date(e.date).toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop:8, color:'#475569' }}>{e.notes}</div>
                  {e.medications?.length > 0 && (
                    <div style={{ marginTop:8, fontSize:13 }}><strong>Medications:</strong> {e.medications.join(', ')}</div>
                  )}
                  {e.vitals && (
                    <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap' }}>
                      <div style={{ background:'#f8fafc', padding:6, borderRadius:6 }}><strong>BP:</strong> {e.vitals.bloodPressure || '-'}</div>
                      <div style={{ background:'#f8fafc', padding:6, borderRadius:6 }}><strong>HR:</strong> {e.vitals.heartRate || '-'}</div>
                      <div style={{ background:'#f8fafc', padding:6, borderRadius:6 }}><strong>Temp:</strong> {e.vitals.temperature || '-'}</div>
                      <div style={{ background:'#f8fafc', padding:6, borderRadius:6 }}><strong>RR:</strong> {e.vitals.respiratoryRate || '-'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Appointments' && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontWeight:600 }}>Appointments</div>
            {user?.role === 'doctor' && (
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn-outline" onClick={() => setShowAddAppointment(s => !s)}>{showAddAppointment ? 'Close' : 'Add Appointment'}</button>
              </div>
            )}
          </div>

          {showAddAppointment && (
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <input type="date" value={apptForm.appointmentDate} onChange={e => setApptForm(a => ({ ...a, appointmentDate: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input type="time" value={apptForm.appointmentTime} onChange={e => setApptForm(a => ({ ...a, appointmentTime: e.target.value }))} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <input placeholder="Reason / Symptoms" value={apptForm.symptoms} onChange={e => setApptForm(a => ({ ...a, symptoms: e.target.value }))} style={{ flex:1, padding:8, border:'1px solid #e2e8f0', borderRadius:6 }} />
                <button className="btn-primary" onClick={async () => {
                  if (!apptForm.appointmentDate || !apptForm.appointmentTime) return alert('Please select date and time');
                  try {
                    await api.post('/appointments', { appointmentDate: apptForm.appointmentDate, appointmentTime: apptForm.appointmentTime, symptoms: apptForm.symptoms, patientId: patient._id });
                    alert('Appointment added');
                    setShowAddAppointment(false);
                  } catch (err) { console.error(err); alert(err.response?.data?.message || 'Failed to create appointment'); }
                }}>Save</button>
              </div>
            </div>
          )}

          {appointmentId && user?.role === 'doctor' && (
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button className="btn-outline" onClick={() => navigate('/doctor/patients')}>Back</button>
              <button className="btn-primary" onClick={async () => {
                try {
                  await api.put(`/appointments/${appointmentId}/status`, { status: 'Completed' });
                  alert('Appointment marked completed');
                  navigate('/doctor/patients');
                } catch (err) { console.error(err); alert(err.response?.data?.message || 'Failed to complete appointment'); }
              }}>Complete</button>
            </div>
          )}
        </div>
      )}

      {(tab === 'Prescriptions' || tab === 'Reports' || tab === 'Appointments') && (
        <div className="card">
          {tab === 'Prescriptions' && (
            <div>
              {loadingRx ? (
                <div style={{ padding:16, color:'#64748b' }}>Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div style={{ padding:16, color:'#64748b' }}>No prescriptions found.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {prescriptions.map(p => (
                    <div key={p._id} style={{ border:'1px solid #f1f5f9', padding:12, borderRadius:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <div style={{ fontWeight:700 }}>{p.diagnosis}</div>
                        <div style={{ color:'#64748b', fontSize:13 }}>{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ marginTop:8 }}>
                        {p.medications?.map((m, i) => (
                          <div key={i} style={{ fontSize:13 }}>{m.medicine} — {m.dosage}, {m.frequency}, {m.duration}</div>
                        ))}
                      </div>
                      {p.notes && <div style={{ marginTop:8, color:'#475569' }}>{p.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Reports' && (
            <div>
              <div style={{ marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:600 }}>Reports</div>
                {user?.role === 'doctor' && (
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="text" placeholder="Title" value={reportTitle} onChange={e => setReportTitle(e.target.value)} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6, minWidth:180 }} />
                    <input type="file" onChange={e => setReportFile(e.target.files[0])} />
                    <input type="text" placeholder="Notes (optional)" value={reportNotes} onChange={e => setReportNotes(e.target.value)} style={{ padding:8, border:'1px solid #e2e8f0', borderRadius:6, minWidth:180 }} />
                    <button className="btn-primary" onClick={async () => {
                      if (!reportFile) return alert('Please select a file');
                      const fd = new FormData();
                      fd.append('file', reportFile);
                      fd.append('title', reportTitle);
                      fd.append('notes', reportNotes || '');
                      if (appointmentId) fd.append('appointmentId', appointmentId);
                      try {
                        await api.post(`/reports/${patient._id}`, fd);
                        const res = await api.get(`/reports/${patient._id}`);
                        setReports(res.data.reports || []);
                        setReportFile(null); setReportTitle(''); setReportNotes('');
                        alert('Report uploaded');
                      } catch (err) { console.error(err); alert(err.response?.data?.message || 'Upload failed'); }
                    }}>Upload</button>
                  </div>
                )}
              </div>

              {loadingReports ? (
                <div style={{ padding:16, color:'#64748b' }}>Loading reports...</div>
              ) : reports.length === 0 ? (
                <div style={{ padding:16, color:'#64748b' }}>No reports uploaded.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {reports.map(r => (
                    <div key={r._id} style={{ border:'1px solid #f1f5f9', padding:12, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700 }}>{r.title || 'Report'}</div>
                        <div style={{ color:'#64748b', fontSize:13 }}>{new Date(r.createdAt).toLocaleString()}</div>
                        {r.notes && <div style={{ marginTop:6 }}>{r.notes}</div>}
                      </div>
                      <div>
                        <button type="button" onClick={() => openReportFile(r._id).catch(() => alert('Unable to open this report.'))} className="btn-outline">Open</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Appointments' && (
            <div style={{ color:'#94a3b8', textAlign:'center', padding:40, fontSize:14 }}>Appointments data will appear here.</div>
          )}
        </div>
      )}
    </DoctorLayout>
  );
}

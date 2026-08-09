import { useState } from 'react';
import api from '../../api/axios';
import { printPatientSummary } from '../../utils/print';

export default function ConsultationOverview({ patientId, appointmentId, onSaved }) {
  const [complaint, setComplaint] = useState('');
  const [exam, setExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);

  const saveOverview = async () => {
    if (!complaint && !diagnosis) return alert('Please enter complaint or diagnosis');
    setSaving(true);
    try {
      const title = diagnosis || (complaint.length > 40 ? complaint.slice(0,40) + '...' : complaint);
      const notes = `Complaint:\n${complaint}\n\nExam:\n${exam}\n\nPlan:\n${plan}`;
      await api.post(`/medical-history/${patientId}/entries`, { title, type: 'Overview', notes, appointmentId });
      if (onSaved) onSaved();
      setComplaint(''); setExam(''); setDiagnosis(''); setPlan('');
      alert('Consultation overview saved');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save overview');
    } finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div style={{ fontWeight:600, marginBottom:12 }}>Consultation Overview</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <textarea placeholder="Chief complaint" value={complaint} onChange={e=>setComplaint(e.target.value)} style={{ minHeight:60, padding:8 }} />
        <textarea placeholder="Exam findings" value={exam} onChange={e=>setExam(e.target.value)} style={{ minHeight:60, padding:8 }} />
        <input placeholder="Diagnosis" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} style={{ padding:8 }} />
        <textarea placeholder="Plan / Instructions" value={plan} onChange={e=>setPlan(e.target.value)} style={{ minHeight:60, padding:8 }} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn-outline" onClick={() => { setComplaint(''); setExam(''); setDiagnosis(''); setPlan(''); }}>Reset</button>
          <button className="btn-outline" onClick={() => printPatientSummary(patientId)}>Print Summary</button>
          <button className="btn-primary" onClick={saveOverview} disabled={saving}>{saving? 'Saving...' : 'Save Overview'}</button>
        </div>
      </div>
    </div>
  );
}

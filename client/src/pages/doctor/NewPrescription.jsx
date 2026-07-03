import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoPlus, IcoTrash, IcoPrint } from '../../components/ui/Icons';

const EMPTY_MED = { medicine:'', dosage:'', frequency:'', duration:'', instructions:'' };

export default function NewPrescription() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState([
    { medicine:'Amlodipine 5mg',  dosage:'1 Tablet', frequency:'Once Daily',       duration:'30 Days', instructions:'After food' },
    { medicine:'Telmisartan 40mg',dosage:'1 Tablet', frequency:'Once Daily',       duration:'30 Days', instructions:'After food' },
    { medicine:'Atorvastatin 10mg',dosage:'1 Tablet',frequency:'Once Daily (Night)',duration:'30 Days', instructions:'After dinner' },
  ]);
  const [notes, setNotes] = useState('Follow low salt diet and regular exercise. Avoid stress and have good sleep.');
  const [saved, setSaved] = useState(false);

  const updateMed = (i, k, v) => setMeds(ms => ms.map((m,idx) => idx===i ? {...m,[k]:v} : m));
  const addMed = () => setMeds(ms => [...ms, { ...EMPTY_MED }]);
  const removeMed = i => setMeds(ms => ms.filter((_,idx) => idx !== i));

  const save = () => { setSaved(true); setTimeout(() => { setSaved(false); navigate('/doctor/prescriptions'); }, 2000); };

  return (
    <DoctorLayout>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:700 }}>New Prescription</div>
          <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>Create a new prescription for the patient</div>
        </div>

        {saved && (
          <div style={{ background:'#dcfce7', color:'#15803d', borderRadius:10, padding:'12px 18px', marginBottom:16, fontWeight:500 }}>
            ✓ Prescription saved successfully!
          </div>
        )}

        <div className="card">
          {/* Patient info */}
          <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24, padding:'14px 16px', background:'#f8fafc', borderRadius:10 }}>
            <div className="doc-avatar" style={{ width:52, height:52, fontSize:16 }}>RS</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>Ramesh Sharma</div>
              <div style={{ fontSize:13, color:'#64748b' }}>58 Years, Male · PT0001</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12, color:'#64748b' }}>Date</div>
              <div style={{ fontWeight:600, fontSize:14 }}>May 23, 2025</div>
            </div>
          </div>

          {/* Medicines */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Medicines</div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th><th>Dosage</th><th>Frequency</th>
                    <th>Duration</th><th>Instructions</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.map((m, i) => (
                    <tr key={i}>
                      {(['medicine','dosage','frequency','duration','instructions']).map(k => (
                        <td key={k}>
                          <input value={m[k]} onChange={e => updateMed(i, k, e.target.value)}
                            style={{ border:'1px solid #e2e8f0', borderRadius:6, padding:'6px 8px', fontSize:13, width: k==='medicine' ? 140 : k==='instructions' ? 120 : 90, outline:'none' }}/>
                        </td>
                      ))}
                      <td>
                        <button onClick={() => removeMed(i)}
                          style={{ background:'#fee2e2', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#dc2626' }}>
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

          {/* Notes */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>Notes for Patient</div>
            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ minHeight:70 }}/>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Prescription</button>
            <button className="btn-primary" style={{ background:'#0369a1' }} onClick={() => window.print()}>
              <IcoPrint /> Print
            </button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

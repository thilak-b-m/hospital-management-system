import { useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoCalendar } from '../../components/ui/Icons';

const PRESCRIPTIONS = [
  {
    id: 1, doctor: 'Dr. Robert Smith', dept: 'Cardiology', date: '25 May 2024', initials: 'RS',
    diagnosis: 'Hypertension',
    meds: [
      { name: 'Amlodipine 5mg', dosage: '1 tablet', freq: 'Once daily', duration: '30 days' },
      { name: 'Aspirin 75mg', dosage: '1 tablet', freq: 'Once daily', duration: '30 days' },
    ],
    notes: 'Avoid salty foods, monitor blood pressure daily.',
  },
  {
    id: 2, doctor: 'Dr. Emily Johnson', dept: 'Neurology', date: '10 May 2024', initials: 'EJ',
    diagnosis: 'Migraine',
    meds: [
      { name: 'Sumatriptan 50mg', dosage: '1 tablet', freq: 'As needed', duration: '14 days' },
      { name: 'Propranolol 40mg', dosage: '1 tablet', freq: 'Twice daily', duration: '30 days' },
    ],
    notes: 'Rest in dark room during attacks. Stay hydrated.',
  },
  {
    id: 3, doctor: 'Dr. Michael Brown', dept: 'Orthopedic', date: '28 Apr 2024', initials: 'MB',
    diagnosis: 'Lower Back Pain',
    meds: [
      { name: 'Ibuprofen 400mg', dosage: '1 tablet', freq: 'Thrice daily', duration: '7 days' },
      { name: 'Cyclobenzaprine 5mg', dosage: '1 tablet', freq: 'Once at night', duration: '7 days' },
    ],
    notes: 'Avoid heavy lifting. Ice pack for 15 mins, 3x daily.',
  },
];

export default function MyPrescriptions() {
  const [active, setActive] = useState(1);
  const rx = PRESCRIPTIONS.find(p => p.id === active);

  return (
    <PatientLayout>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRESCRIPTIONS.map(p => (
            <div
              key={p.id}
              className="card"
              onClick={() => setActive(p.id)}
              style={{
                cursor: 'pointer',
                border: active === p.id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="doc-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{p.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.doctor}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{p.dept}</div>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IcoCalendar />{p.date}
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13 }}>
                <span style={{ background: '#f1f5f9', borderRadius: 6, padding: '2px 10px', color: '#374151', fontWeight: 500 }}>
                  {p.diagnosis}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {rx && (
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Prescription Details</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {rx.doctor} · {rx.date}
                </div>
              </div>
              <span style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
                {rx.diagnosis}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: '#374151' }}>Medications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rx.meds.map((m, i) => (
                  <div key={i} className="appt-detail-card">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: '#64748b' }}>
                      <span>Dose: <strong style={{ color: '#374151' }}>{m.dosage}</strong></span>
                      <span>Freq: <strong style={{ color: '#374151' }}>{m.freq}</strong></span>
                      <span>Duration: <strong style={{ color: '#374151' }}>{m.duration}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {rx.notes && (
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#374151' }}>Doctor's Notes</div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400e' }}>
                  {rx.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

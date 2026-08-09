import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoCheck, IcoBan, IcoPhone } from '../../components/ui/Icons';
import api from '../../api/axios';

const STATUS_CLS = { Confirmed:'badge-completed', Pending:'badge-upcoming', Completed:'badge-completed', Cancelled:'badge-cancelled' };

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/appointments').then(res => setAppointments(res.data.appointments || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? data.appointment : a));
      // After confirming an appointment, navigate to patient detail to start consultation
      if (status === 'Confirmed') {
        try {
          const patient = data.appointment.patient;
          navigate('/doctor/patient-detail', { state: { patient, appointmentId: data.appointment._id } });
        } catch (e) {
          console.error('Navigation after confirm failed', e);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = appointments.filter(a => {
    if (tab === 'Pending') return a.status === 'Pending';
    if (tab === 'Confirmed') return a.status === 'Confirmed';
    if (tab === 'Completed') return a.status === 'Completed';
    if (tab === 'Cancelled') return a.status === 'Cancelled';
    return true;
  });

  return (
    <DoctorLayout>
      <div className="card">
        <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, marginBottom:20, width:'fit-content' }}>
          {['Pending','Confirmed','Completed','Cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding:'7px 18px', borderRadius:8, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, transition:'all 0.2s',
                background: tab===t ? 'white' : 'transparent',
                color: tab===t ? 'var(--primary)' : '#64748b',
                boxShadow: tab===t ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
              }}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map((a) => {
              const initials = a.patient?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
              return (
                <div key={a._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', border:'1px solid #e2e8f0', borderRadius:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--primary)', width:70, flexShrink:0 }}>{a.appointmentTime}</div>
                  <div className="doc-avatar" style={{ width:44, height:44 }}>{initials}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{a.patient?.name||'Patient'}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{a.patient?.patientId} · {a.symptoms||'Consultation'}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>
                      {new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                  </div>
                  {a.patient?.phone && (
                    <div style={{ fontSize:13, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                      <IcoPhone />{a.patient.phone}
                    </div>
                  )}
                  <span className={`badge ${STATUS_CLS[a.status]||'badge-pending'}`}>{a.status}</span>
                  {a.status === 'Pending' && (
                    <div style={{ display:'flex', gap:6 }}>
                      <button disabled={updating===a._id}
                        onClick={() => updateStatus(a._id, 'Confirmed')}
                        style={{ background:'#dcfce7', color:'#15803d', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                        <IcoCheck size={12} /> Confirm
                      </button>
                      <button disabled={updating===a._id}
                        onClick={() => updateStatus(a._id, 'Cancelled')}
                        style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                        <IcoBan /> Cancel
                      </button>
                    </div>
                  )}
                  {a.status === 'Confirmed' && (
                    <button disabled={updating===a._id}
                      onClick={() => updateStatus(a._id, 'Completed')}
                      style={{ background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 10px', fontSize:12 }}>
                      Mark Complete
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>No {tab.toLowerCase()} appointments.</div>
            )}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

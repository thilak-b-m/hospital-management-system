import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { IcoCalendar, IcoUsers, IcoReport, IcoActivity, IcoClock } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS = { Confirmed:'badge-completed', Pending:'badge-upcoming', Cancelled:'badge-cancelled', Completed:'badge-completed' };

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayAppointments:0, totalPatients:0, pendingAppointments:0, prescriptions:0 });
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/dashboard').then(res => {
      setStats(res.data.stats || {});
      setTodayAppts(res.data.todayAppointments || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label:"Today's Appointments", value: stats.todayAppointments, Icon: IcoCalendar, color:'#dbeafe', iconColor:'#1d4ed8' },
    { label:'Total Patients',        value: stats.totalPatients,     Icon: IcoUsers,    color:'#dcfce7', iconColor:'#15803d' },
    { label:'Pending Appointments',  value: stats.pendingAppointments, Icon: IcoActivity, color:'#ede9fe', iconColor:'#7c3aed' },
    { label:'Prescriptions',         value: stats.prescriptions,     Icon: IcoReport,   color:'#fef9c3', iconColor:'#b45309' },
  ];

  return (
    <DoctorLayout>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>Good Morning, {user?.name || 'Doctor'}!</div>
        <div style={{ color:'#64748b', fontSize:14, marginTop:2 }}>Here's what's happening in your clinic today.</div>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {statCards.map(({ label, value, Icon, color, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color, color:iconColor }}><Icon /></div>
            <div>
              <div className="stat-label" style={{ fontSize:12, color:'#64748b' }}>{label}</div>
              <div className="stat-number" style={{ color:iconColor, fontSize:26 }}>{loading ? '...' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Today's Appointments</div>
            <button className="btn-outline btn-sm" onClick={() => navigate('/doctor/appointments')}>View All</button>
          </div>
          {loading ? (
            <div style={{ color:'#94a3b8', fontSize:14 }}>Loading...</div>
          ) : todayAppts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:14 }}>No appointments today.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {todayAppts.map((a, i) => {
                const initials = a.patient?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'PT';
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f8fafc', borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--primary)', width:60, flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
                      <IcoClock />{a.appointmentTime}
                    </div>
                    <div className="doc-avatar" style={{ width:36, height:36, fontSize:12 }}>{initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{a.patient?.name||'Patient'}</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>{a.symptoms||'Consultation'}</div>
                    </div>
                    <span className={`badge ${STATUS[a.status]||'badge-pending'}`}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          )}
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:14, padding:'10px' }}
            onClick={() => navigate('/doctor/appointments')}>
            View All Appointments
          </button>
        </div>

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Quick Actions</div>
          </div>
          <div className="grid-2">
            {[
              { label:'New Prescription', to:'/doctor/new-prescription', color:'#dbeafe', ic:'#1d4ed8' },
              { label:'My Patients',      to:'/doctor/patients',         color:'#dcfce7', ic:'#15803d' },
              { label:'My Schedule',      to:'/doctor/schedule',         color:'#ede9fe', ic:'#7c3aed' },
              { label:'Reports',          to:'/doctor/reports',          color:'#fef9c3', ic:'#b45309' },
            ].map(({ label, to, color, ic }) => (
              <div key={label} className="quick-card" onClick={() => navigate(to)}>
                <div style={{ width:36, height:36, borderRadius:8, background:color, color:ic, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700 }}>
                  {label[0]}
                </div>
                <span style={{ fontSize:13, fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}

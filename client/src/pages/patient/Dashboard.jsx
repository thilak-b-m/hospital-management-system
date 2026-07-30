import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { IcoCalPlus, IcoCalendar, IcoPrescription, IcoUser, IcoClock } from '../../components/ui/Icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUS_COLOR = { Pending:'#f59e0b', Confirmed:'#1d4ed8', Completed:'#15803d', Cancelled:'#dc2626' };

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/prescriptions')])
      .then(([apptRes, rxRes]) => {
        setAppointments(apptRes.data.appointments || []);
        setPrescriptions(rxRes.data.prescriptions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');
  const nextAppt = upcoming[0];

  const stats = [
    { label:'Upcoming Appointments', value: upcoming.length,      color:'#dbeafe', iconColor:'#1d4ed8', Icon: IcoCalendar,     to:'/patient/appointments'  },
    { label:'Total Appointments',    value: appointments.length,  color:'#dcfce7', iconColor:'#15803d', Icon: IcoCalPlus,      to:'/patient/appointments'  },
    { label:'Total Prescriptions',   value: prescriptions.length, color:'#ede9fe', iconColor:'#7c3aed', Icon: IcoPrescription, to:'/patient/prescriptions' },
    { label:'Patient ID',            value: user?.patientId||'—', color:'#fef9c3', iconColor:'#b45309', Icon: IcoUser,         to:'/patient/profile'       },
  ];

  const quickActions = [
    { label:'Book Appointment', Icon: IcoCalPlus,      to:'/patient/book-appointment' },
    { label:'My Appointments',  Icon: IcoCalendar,     to:'/patient/appointments'     },
    { label:'Prescriptions',    Icon: IcoPrescription, to:'/patient/prescriptions'    },
    { label:'My Profile',       Icon: IcoUser,         to:'/patient/profile'          },
  ];

  return (
    <PatientLayout>
      <p style={{ color:'#64748b', marginBottom:20, fontSize:15 }}>Welcome back, {user?.name || 'Patient'}!</p>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {stats.map(({ label, value, color, iconColor, Icon, to }) => (
          <div key={label} className="stat-card" onClick={() => navigate(to)} style={{ cursor:'pointer' }}>
            <div className="stat-icon" style={{ background:color, color:iconColor }}><Icon /></div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-number" style={{ color:iconColor }}>{loading ? '...' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Next Appointment</div>
          {loading ? (
            <div style={{ color:'#94a3b8', fontSize:14 }}>Loading...</div>
          ) : nextAppt ? (
            <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:72, height:72, borderRadius:10, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:22, fontWeight:700, color:'#1d4ed8' }}>
                {nextAppt.doctor?.user?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')||'DR'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:16 }}>{nextAppt.doctor?.user?.name||'Doctor'}</div>
                <div style={{ color:'#64748b', fontSize:13, marginBottom:10 }}>{nextAppt.doctor?.department||''}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569' }}>
                    <IcoCalendar /><span>{new Date(nextAppt.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569' }}>
                    <IcoClock /><span>{nextAppt.appointmentTime}</span>
                  </div>
                </div>
                <span style={{ display:'inline-block', marginTop:10, padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:STATUS_COLOR[nextAppt.status]+'22', color:STATUS_COLOR[nextAppt.status] }}>
                  {nextAppt.status}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:14 }}>
              No upcoming appointments.
              <br/>
              <button className="btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => navigate('/patient/book-appointment')}>Book Now</button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div className="grid-2">
            {quickActions.map(({ label, Icon, to }) => (
              <div key={label} className="quick-card" onClick={() => navigate(to)}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#dbeafe', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon />
                </div>
                <span style={{ fontSize:13, fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

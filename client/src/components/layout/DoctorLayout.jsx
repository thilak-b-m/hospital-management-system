import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IcoDashboard, IcoCalendar, IcoUsers, IcoCalPlus,
  IcoPrescription, IcoReport, IcoMessage, IcoUser,
  IcoSettings, IcoLogout, IcoBell, IcoMenu, IcoChevronRight, IcoSearch
} from '../ui/Icons';

const NAV = [
  { to: '/doctor/dashboard',    label: 'Dashboard',     Icon: IcoDashboard   },
  { to: '/doctor/appointments', label: 'Appointments',  Icon: IcoCalendar    },
  { to: '/doctor/patients',     label: 'Patients',      Icon: IcoUsers       },
  { to: '/doctor/schedule',     label: 'Schedule',      Icon: IcoCalPlus     },
  { to: '/doctor/prescriptions',label: 'Prescriptions', Icon: IcoPrescription},
  { to: '/doctor/reports',      label: 'Reports',       Icon: IcoReport      },
  { to: '/doctor/messages',     label: 'Messages',      Icon: IcoMessage     },
  { to: '/doctor/profile',      label: 'Profile',       Icon: IcoUser        },
  { to: '/doctor/settings',     label: 'Settings',      Icon: IcoSettings    },
];

const TITLES = {
  '/doctor/dashboard':    'Dashboard',
  '/doctor/appointments': 'Appointments',
  '/doctor/patients':     'Patients',
  '/doctor/schedule':     'Schedule',
  '/doctor/prescriptions':'Prescriptions',
  '/doctor/reports':      'Reports',
  '/doctor/messages':     'Messages',
  '/doctor/profile':      'Profile',
  '/doctor/settings':     'Settings',
  '/doctor/patient-detail':'Patient Detail',
  '/doctor/new-prescription':'New Prescription',
};

export default function DoctorLayout({ children, searchBar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Dashboard';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <circle cx="16" cy="16" r="16" fill="#60a5fa"/>
            <rect x="14" y="7" width="4" height="18" fill="white" rx="1"/>
            <rect x="7" y="14" width="18" height="4" fill="white" rx="1"/>
          </svg>
          CityCare
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon />{label}
            </NavLink>
          ))}
          <button onClick={() => navigate('/login')}
            className="nav-item"
            style={{ width:'100%', background:'none', border:'none', textAlign:'left', marginTop:'auto' }}>
            <IcoLogout />Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ gap:12 }}>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>
              <IcoMenu />
            </button>
            {searchBar ? (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
                  <IcoSearch size={15} />
                </span>
                <input placeholder="Search patients, appointments..."
                  style={{ paddingLeft:32, paddingRight:12, height:36, border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:280, background:'#f8fafc' }}/>
              </div>
            ) : (
              <div>
                <div className="topbar-title">{title}</div>
                {title !== 'Dashboard' && (
                  <div className="topbar-breadcrumb" style={{ display:'flex', alignItems:'center', gap:4 }}>
                    Dashboard <IcoChevronRight /> {title}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="topbar-right">
            <button className="notif-btn"><IcoBell /></button>
            <div className="user-badge">
              <div className="user-avatar" style={{ background:'#0369a1' }}>AP</div>
              <div className="user-info">
                <div className="name">Dr. Arjun Patel</div>
                <div className="role">Cardiologist</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IcoDashboard, IcoCalendar, IcoUsers, IcoCalPlus,
  IcoPrescription, IcoReport, IcoMessage, IcoUser,
  IcoSettings, IcoLogout, IcoBell, IcoChevronRight
} from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/doctor/dashboard',     label: 'Dashboard',     Icon: IcoDashboard    },
  { to: '/doctor/appointments',  label: 'Appointments',  Icon: IcoCalendar     },
  { to: '/doctor/patients',      label: 'Patients',      Icon: IcoUsers        },
  { to: '/doctor/schedule',      label: 'Schedule',      Icon: IcoCalPlus      },
  { to: '/doctor/prescriptions', label: 'Prescriptions', Icon: IcoPrescription },
  { to: '/doctor/reports',       label: 'Reports',       Icon: IcoReport       },
  { to: '/doctor/messages',      label: 'Messages',      Icon: IcoMessage      },
  { to: '/doctor/profile',       label: 'Profile',       Icon: IcoUser         },
  { to: '/doctor/settings',      label: 'Settings',      Icon: IcoSettings     },
];

const TITLES = {
  '/doctor/dashboard':        'Dashboard',
  '/doctor/appointments':     'Appointments',
  '/doctor/patients':         'Patients',
  '/doctor/schedule':         'Schedule',
  '/doctor/prescriptions':    'Prescriptions',
  '/doctor/reports':          'Reports',
  '/doctor/messages':         'Messages',
  '/doctor/profile':          'Profile',
  '/doctor/settings':         'Settings',
  '/doctor/patient-detail':   'Patient Detail',
  '/doctor/new-prescription': 'New Prescription',
};

export default function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const title = TITLES[pathname] || 'Dashboard';
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'DR';

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
          <button onClick={() => { logout(); navigate('/login'); }}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', marginTop: 'auto' }}>
            <IcoLogout />Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">{title}</div>
              {title !== 'Dashboard' && (
                <div className="topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Dashboard <IcoChevronRight /> {title}
                </div>
              )}
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn"><IcoBell /></button>
            <div className="user-badge">
              <div className="user-avatar" style={{ background: '#0369a1' }}>{initials}</div>
              <div className="user-info">
                <div className="name">{user?.name || 'Doctor'}</div>
                <div className="role">{user?.department || 'Doctor'}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

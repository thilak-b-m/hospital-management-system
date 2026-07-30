import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IcoCross, IcoDashboard, IcoCalPlus, IcoCalendar,
  IcoPrescription, IcoUser, IcoMessage, IcoStethoscope,
  IcoLogout, IcoBell, IcoChevronRight
} from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/patient/dashboard',        label: 'Dashboard',        Icon: IcoDashboard    },
  { to: '/patient/book-appointment', label: 'Book Appointment', Icon: IcoCalPlus      },
  { to: '/patient/appointments',     label: 'My Appointments',  Icon: IcoCalendar     },
  { to: '/patient/prescriptions',    label: 'My Prescriptions', Icon: IcoPrescription },
  { to: '/patient/messages',         label: 'Messages',         Icon: IcoMessage      },
  { to: '/patient/services',         label: 'Services',         Icon: IcoStethoscope  },
  { to: '/patient/profile',          label: 'My Profile',       Icon: IcoUser         },
];

const TITLES = {
  '/patient/dashboard':        'Dashboard',
  '/patient/book-appointment': 'Book Appointment',
  '/patient/appointments':     'My Appointments',
  '/patient/prescriptions':    'My Prescriptions',
  '/patient/messages':         'Messages',
  '/patient/services':         'Services',
  '/patient/profile':          'My Profile',
  '/patient/change-password':  'My Profile',
  '/patient/doctor-details':   'Doctor Details',
};

export default function PatientLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const title = TITLES[pathname] || 'Dashboard';
  const parent = title !== 'Dashboard' ? 'Dashboard' : null;

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'PT';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IcoCross />
          HMS
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon />{label}
            </NavLink>
          ))}
          <button onClick={() => { logout(); navigate('/login'); }} className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
            <IcoLogout />Logout
          </button>
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">{title}</div>
              {parent && (
                <div className="topbar-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {parent} <IcoChevronRight /> {title}
                </div>
              )}
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn"><IcoBell /></button>
            <div className="user-badge">
              <div className="user-avatar">{initials}</div>
              <div className="user-info">
                <div className="name">{user?.name || 'Patient'}</div>
                <div className="role">Patient · {user?.patientId || ''}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

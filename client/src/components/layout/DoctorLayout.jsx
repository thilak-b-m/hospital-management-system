import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IcoDashboard, IcoCalendar, IcoUsers, IcoCalPlus,
  IcoPrescription, IcoReport, IcoMessage, IcoUser,
  IcoSettings, IcoLogout, IcoBell
} from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

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
  '/doctor/notifications':    'Notifications',
  '/doctor/patient-detail':   'Patient Detail',
  '/doctor/new-prescription': 'New Prescription',
};

export default function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const title = TITLES[pathname] || 'Dashboard';
  const { unreadCount } = useNotifications();
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'DR';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/shield-plus.svg" alt="" width="28" height="28" />
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
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn notif-wrap" onClick={() => navigate('/doctor/notifications')} aria-label={`Notifications, ${unreadCount} unread`}>
              <IcoBell />{unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
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

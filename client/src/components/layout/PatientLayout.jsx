import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  IcoCross, IcoDashboard, IcoCalPlus, IcoCalendar,
  IcoPrescription, IcoUser, IcoLock, IcoLogout, IcoBell, IcoMenu, IcoChevronRight
} from '../ui/Icons';

const NAV = [
  { to: '/patient/dashboard', label: 'Dashboard', Icon: IcoDashboard },
  { to: '/patient/book-appointment', label: 'Book Appointment', Icon: IcoCalPlus },
  { to: '/patient/appointments', label: 'My Appointments', Icon: IcoCalendar },
  { to: '/patient/prescriptions', label: 'My Prescriptions', Icon: IcoPrescription },
  { to: '/patient/profile', label: 'My Profile', Icon: IcoUser },
  { to: '/patient/change-password', label: 'Change Password', Icon: IcoLock },
];

const TITLES = {
  '/patient/dashboard': 'Dashboard',
  '/patient/book-appointment': 'Book Appointment',
  '/patient/appointments': 'My Appointments',
  '/patient/prescriptions': 'My Prescriptions',
  '/patient/profile': 'My Profile',
  '/patient/change-password': 'Change Password',
  '/patient/doctor-details': 'Doctor Details',
};

export default function PatientLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Dashboard';
  const parent = title !== 'Dashboard' ? 'Dashboard' : null;

  const handleLogout = () => navigate('/login');

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IcoCross />
          HMS
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            <IcoLogout />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <IcoMenu />
            </button>
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
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <div className="name">John Doe</div>
                <div className="role">Patient</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

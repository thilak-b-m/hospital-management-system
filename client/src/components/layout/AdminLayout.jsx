import { NavLink, useNavigate } from 'react-router-dom';
import {
  IcoDashboard, IcoUsers, IcoUser, IcoCalendar, IcoReport,
  IcoSettings, IcoLogout, IcoBell, IcoSearch, IcoMessage
} from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const IcoShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcoGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IcoStaff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoCreditCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const NAV = [
  { to: '/admin/dashboard',     label: 'Dashboard',     Icon: IcoDashboard  },
  { to: '/admin/users',         label: 'Users',         Icon: IcoUsers      },
  { to: '/admin/doctors',       label: 'Doctors',       Icon: IcoUser       },
  { to: '/admin/patients',      label: 'Patients',      Icon: IcoStaff      },
  { to: '/admin/appointments',  label: 'Appointments',  Icon: IcoCalendar   },
  { to: '/admin/departments',   label: 'Departments',   Icon: IcoGrid       },
  { to: '/admin/services',      label: 'Services',      Icon: IcoShield     },
  { to: '/admin/payments',      label: 'Payments',      Icon: IcoCreditCard },
  { to: '/admin/reports',       label: 'Reports',       Icon: IcoReport     },
  { to: '/admin/messages',      label: 'Messages',      Icon: IcoMessage    },
  { to: '/admin/settings',      label: 'Settings',      Icon: IcoSettings   },
  { to: '/admin/notifications', label: 'Notifications', Icon: IcoBell       },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const initials = user?.name
    ? user.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
    : 'AU';

  return (
    <div className="layout">
      <aside className="sidebar admin-sidebar" style={{ width:220 }}>
        <div className="sidebar-logo">
          <div className="logo-row">
            <img src="/shield-plus.svg" alt="" width="26" height="26" />
            CityCare
            <span style={{ fontSize:10, opacity:0.6 }}>HOSPITAL</span>
          </div>
          <div className="panel-label">Admin Panel</div>
        </div>

        <nav className="sidebar-nav" style={{ overflowY:'auto' }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon />{label}
            </NavLink>
          ))}
          <button onClick={() => { logout(); navigate('/login'); }}
            className="nav-item"
            style={{ width:'100%', background:'none', border:'none', textAlign:'left' }}>
            <IcoLogout />Logout
          </button>
        </nav>

        <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
          <div className="user-avatar" style={{ background:'#4f46e5', width:34, height:34, fontSize:13 }}>{initials}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>Super Admin</div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar" style={{ paddingLeft:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="admin-search">
              <IcoSearch size={14} />
              <input placeholder="Search something..." />
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="notif-wrap">
              <button className="notif-btn" onClick={() => navigate('/admin/notifications')} aria-label={`Notifications, ${unreadCount} unread`}>
                <IcoBell />
              </button>
              {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </div>
            <button className="notif-btn" onClick={() => navigate('/admin/messages')} aria-label="Messages"><IcoMessage /></button>
            <div className="user-badge">
              <div className="user-avatar" style={{ background:'#4f46e5' }}>{initials}</div>
              <div className="user-info">
                <div className="name">{user?.name || 'Admin'}</div>
                <div className="role">Super Admin</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

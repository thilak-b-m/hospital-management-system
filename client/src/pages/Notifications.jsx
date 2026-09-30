import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import DoctorLayout from '../components/layout/DoctorLayout';
import PatientLayout from '../components/layout/PatientLayout';
import { IcoBell, IcoCalendar, IcoReport, IcoMessage } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const ICONS = { appointment: IcoCalendar, report: IcoReport, message: IcoMessage, system: IcoBell };
const FILTERS = ['All', 'Unread', 'Read'];

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const Layout = user?.role === 'admin' ? AdminLayout : user?.role === 'doctor' ? DoctorLayout : PatientLayout;
  const filtered = notifications.filter(notification => {
    if (filter === 'Unread') return !notification.readAt;
    if (filter === 'Read') return Boolean(notification.readAt);
    return true;
  });

  const openNotification = async (notification) => {
    setError('');
    try {
      await markRead(notification._id);
      if (notification.link) navigate(notification.link);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this notification.');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-header-title">Notifications</div>
          <div className="page-header-sub">{unreadCount} unread</div>
        </div>
        <button className="btn-outline btn-sm" onClick={() => markAllRead().catch(() => setError('Unable to mark notifications as read.'))} disabled={!unreadCount}>
          Mark all as read
        </button>
      </div>

      <div className="notification-filters" role="tablist" aria-label="Notification status">
        {FILTERS.map(option => (
          <button key={option} type="button" role="tab" aria-selected={filter === option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>
            {option}{option === 'Unread' && unreadCount > 0 ? ` ${unreadCount}` : ''}
          </button>
        ))}
      </div>

      {error && <div role="alert" className="notification-error">{error}</div>}

      <div className="notification-list">
        {filtered.map(notification => {
          const Icon = ICONS[notification.type] || IcoBell;
          const isUnread = !notification.readAt;
          return (
            <button key={notification._id} type="button" className={`notification-item${isUnread ? ' unread' : ''}`} onClick={() => openNotification(notification)}>
              <span className="notification-icon"><Icon /></span>
              <span className="notification-copy">
                <span className="notification-title">{notification.title}</span>
                {notification.message && <span className="notification-message">{notification.message}</span>}
                <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>
              </span>
              {isUnread && <span className="notification-status-dot" aria-label="Unread" />}
            </button>
          );
        })}
        {filtered.length === 0 && <div className="notification-empty">{filter === 'All' ? 'No notifications yet.' : `No ${filter.toLowerCase()} notifications.`}</div>}
      </div>
    </Layout>
  );
}
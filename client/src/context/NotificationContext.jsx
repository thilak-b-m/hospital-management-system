import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import NotificationContext from './notificationContext';
import { connectSocket } from '../utils/socket';

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIds = useRef(new Set());
  const [loadedForToken, setLoadedForToken] = useState(null);

  useEffect(() => {
    if (!token) return;

    let active = true;
    api.get('/notifications').then(({ data }) => {
      if (!active) return;
      const loaded = data.notifications || [];
      seenIds.current = new Set(loaded.map(notification => notification._id));
      setNotifications(loaded);
      setUnreadCount(data.unreadCount || 0);
      setLoadedForToken(token);
    }).catch(console.error);

    const socket = connectSocket(token);
    const handleNew = (notification) => {
      if (seenIds.current.has(notification._id)) return;
      seenIds.current.add(notification._id);
      setNotifications(current => [notification, ...current].slice(0, 50));
      setLoadedForToken(token);
      if (!notification.readAt) setUnreadCount(count => count + 1);
    };
    const refresh = () => api.get('/notifications').then(({ data }) => {
      if (!active) return;
      const loaded = data.notifications || [];
      seenIds.current = new Set(loaded.map(notification => notification._id));
      setNotifications(loaded);
      setUnreadCount(data.unreadCount || 0);
      setLoadedForToken(token);
    }).catch(console.error);
    const handleChange = () => {
      refresh();
    };

    socket.on('notification:new', handleNew);
    socket.on('notification:changed', handleChange);
    return () => {
      active = false;
      socket.off('notification:new', handleNew);
      socket.off('notification:changed', handleChange);
    };
  }, [token]);

  const markRead = async (id) => {
    if (!token) return;
    const item = notifications.find(notification => notification._id === id);
    if (!item || item.readAt) return;
    const { data } = await api.patch(`/notifications/${id}/read`);
    const current = notifications.map(notification => notification._id === id ? data.notification : notification);
    setNotifications(current);
    const { data: latest } = await api.get('/notifications');
    seenIds.current = new Set((latest.notifications || []).map(notification => notification._id));
    setNotifications(latest.notifications || current);
    setUnreadCount(latest.unreadCount || 0);
    setLoadedForToken(token);
  };

  const markAllRead = async () => {
    if (!token || !unreadCount) return;
    await api.patch('/notifications/read-all');
    const { data } = await api.get('/notifications');
    seenIds.current = new Set((data.notifications || []).map(notification => notification._id));
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoadedForToken(token);
  };

  return (
    <NotificationContext.Provider value={{
      notifications: token && loadedForToken === token ? notifications : [],
      unreadCount: token && loadedForToken === token ? unreadCount : 0,
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

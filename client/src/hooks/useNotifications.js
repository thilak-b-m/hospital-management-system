import { useContext } from 'react';
import NotificationContext from '../context/notificationContext';

export const useNotifications = () => useContext(NotificationContext);
import { createContext, useContext, useState, useCallback } from 'react';
import { demoStore } from '../lib/demoStore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    return demoStore.getAll('notifications').filter(n => n.userId === user?.uid || !user);
  });
  const [toasts, setToasts] = useState([]);

  const refreshNotifications = useCallback(() => {
    if (user) {
      setNotifications(demoStore.getByField('notifications', 'userId', user.uid));
    }
  }, [user]);

  const addNotification = useCallback((notification) => {
    const newNotif = demoStore.add('notifications', {
      ...notification,
      userId: user?.uid,
      read: false,
    });
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  }, [user]);

  const markAsRead = useCallback((id) => {
    demoStore.update('notifications', id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(n => {
      if (!n.read) demoStore.update('notifications', n.id, { read: true });
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Toast system
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markAsRead, markAllAsRead,
      refreshNotifications, toasts, showToast, dismissToast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export default NotificationContext;


import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem.jsx';
import { calculateNextCheckDate, getNextCheckDateStatus } from '../utils/calculations.js';

// NotificationsArea Component
export default function NotificationsArea({ devices }) {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const activeNotifications = devices
            .map(device => {
                const nextCheck = calculateNextCheckDate(device.lastCheckDate, device.mpi);
                const status = getNextCheckDateStatus(nextCheck);
                const hasValidPovirkyLocation = device.povirkyLocation && device.povirkyLocation.trim() !== '-' && device.povirkyLocation.trim() !== '';
                if (status.isExpired && hasValidPovirkyLocation) {
                    return {
                        id: device.id + '-expired-notif', 
                        device,
                        title: 'Прострочена Повірка!',
                        nextCheckDateText: status.text,
                        type: 'expired', 
                        date: status.date
                    };
                } else if (status.isWarning && hasValidPovirkyLocation) {
                     return {
                        id: device.id + '-warning-notif', 
                        device,
                        title: 'Незабаром Повірка!',
                        nextCheckDateText: status.text,
                        type: 'warning', 
                        date: status.date
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (a.type === 'expired' && b.type !== 'expired') return -1;
                if (a.type !== 'expired' && b.type === 'expired') return 1;
                if (a.type === 'warning' && b.type !== 'warning') return -1;
                if (a.type !== 'warning' && b.type === 'warning') return 1;
                return (a.date && b.date) ? a.date.getTime() - b.date.getTime() : 0;
            });
        setNotifications(activeNotifications);
    }, [devices]);
    const handleCloseNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    if (notifications.length === 0) return null;
    return (
        <div className="my-4 space-y-3">
            {notifications.map(notif => (
                <NotificationItem key={notif.id} notification={notif} onClose={() => handleCloseNotification(notif.id)} />
            ))}
        </div>
    );
}


import React, { useState } from 'react';

// NotificationItem Component
export default function NotificationItem({ notification, onClose }) {
    const [isVisible, setIsVisible] = useState(true);
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    if (!notification.device) return null;
    const isWarning = notification.type === 'warning';
    const bgColor = isWarning ? 'bg-amber-50 border-amber-400' : 'bg-red-50 border-red-400';
    const iconColor = isWarning ? 'text-amber-500' : 'text-red-500';
    const titleColor = isWarning ? 'text-amber-800' : 'text-red-800';
    const textColor = isWarning ? 'text-amber-700' : 'text-red-700';
    const buttonHoverBg = isWarning ? 'hover:bg-amber-100' : 'hover:bg-red-100';
    const buttonFocusRing = isWarning ? 'focus:ring-amber-600 focus:ring-offset-amber-50' : 'focus:ring-red-600 focus:ring-offset-red-50';
    return (
         <div className={`flex items-start p-3 mb-3 rounded-md shadow-lg border-l-4 ${bgColor} ${isVisible ? 'notification-slide-in' : 'notification-slide-out'}`}>
            <div className="flex-shrink-0 pt-0.5">
                <i className={`fas ${isWarning ? 'fa-triangle-exclamation' : 'fa-calendar-times'} ${iconColor} fa-lg`}></i>
            </div>
            <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${titleColor}`}>
                    <strong>{notification.title}</strong>
                </p>
                <p className={`mt-1 text-xs ${textColor}`}>
                    Прилад типу "{notification.device.type || 'Невідомий тип'}" (РМ: {notification.device.rm || '?'})
                    потребує повірки в "{notification.device.povirkyLocation}". Наступна повірка: {notification.nextCheckDateText}.
                </p>
            </div>
            <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`inline-flex rounded-md p-1.5 ${iconColor} ${buttonHoverBg} focus:outline-none focus:ring-2 ${buttonFocusRing}`}
                    >
                        <span className="sr-only">Закрити</span>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

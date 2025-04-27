import { isNumeric } from './utils.js';

// Функция проверки необходимости поверки
export function checkCalibrationNeeded(device) {
    if (!device.lastCheckDate || !device.mpi) return false;
    
    const lastCheck = new Date(device.lastCheckDate);
    const nextCheck = new Date(lastCheck);
    nextCheck.setFullYear(lastCheck.getFullYear() + device.mpi);
    
    return {
        isNeeded: new Date() > nextCheck && 
                  isNumeric(device.location) && 
                  device.povirkyLocation && 
                  typeof device.povirkyLocation === 'string' && 
                  device.povirkyLocation !== '-',
        nextCheckDate: nextCheck
    };
}

// Функция для отображения уведомлений
export function showNotifications(devices) {
    const notificationContainer = document.getElementById('notification-container') || 
        (() => {
            const container = document.createElement('div');
            container.id = 'notification-container';
            document.body.insertBefore(container, document.body.firstChild);
            return container;
        })();
    
    notificationContainer.innerHTML = '';
    
    devices.forEach(device => {
        const calibrationCheck = checkCalibrationNeeded(device);
        if (calibrationCheck.isNeeded) {
            const notification = document.createElement('div');
            notification.className = 'notification slide-in';
            notification.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                Необхідна повірка приладу ${device.type} (${device.name})
                в ${device.povirkyLocation}
                <button onclick="this.parentElement.remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            notificationContainer.appendChild(notification);
        }
    });
}

// Функция инициализации системы уведомлений
export function initNotifications(devices) {
    showNotifications(devices);
    // Обновление уведомлений каждый час
    setInterval(() => showNotifications(devices), 3600000);
} 
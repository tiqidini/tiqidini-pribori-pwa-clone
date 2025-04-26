import { loadData } from './storage.js';
import { updateOverdueStats, renderDeviceList, initUIHandlers } from './ui.js';
import { initNotifications } from './notifications.js';

// --- Глобальні змінні та DOM елементи ---
let currentDevices = [];
let currentRMFilter = 'all';
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const rmFilterContainer = document.getElementById('rm-filter');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const overdueCountElement = document.getElementById('overdue-count');
const loadingPlaceholder = document.querySelector('.loading-placeholder');

const STORAGE_KEY = 'priboriAppData_v4'; // Новий ключ, щоб уникнути конфлікту з полем

// --- Функції Хелпери (formatDate, calculateNextCheckDate, getNextCheckDateStatus - без змін) ---

function formatDate(dateString) {
    if (!dateString) return '--.--.----';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
             console.warn("Invalid date string received:", dateString);
             return 'Невірна дата';
        }
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Помилка дати';
    }
}

function calculateNextCheckDate(lastCheckDateStr, mpiYears) {
  if (!lastCheckDateStr || !mpiYears || isNaN(parseInt(mpiYears)) || mpiYears <= 0) {
    return null;
  }
  try {
    const lastCheckDate = new Date(lastCheckDateStr);
    if (isNaN(lastCheckDate.getTime())) {
        console.warn("Invalid lastCheckDate for calculation:", lastCheckDateStr);
        return null;
    }
    lastCheckDate.setUTCFullYear(lastCheckDate.getUTCFullYear() + parseInt(mpiYears));
    lastCheckDate.setUTCDate(lastCheckDate.getUTCDate() - 1);
    return lastCheckDate.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error calculating next check date for", lastCheckDateStr, mpiYears, e);
    return null;
  }
}

function getNextCheckDateStatus(nextCheckDateStr) {
    if (!nextCheckDateStr) return { text: 'Не вказано', class: '', date: null };
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    try {
        const nextCheckDate = new Date(nextCheckDateStr);
        if (isNaN(nextCheckDate.getTime())) {
             console.warn("Invalid nextCheckDate for status check:", nextCheckDateStr);
            return { text: 'Невірна дата', class: '', date: null };
        }
        nextCheckDate.setUTCHours(0, 0, 0, 0);
        const warningDate = new Date(nextCheckDate);
        warningDate.setUTCDate(warningDate.getUTCDate() - 30);
        const formattedDate = formatDate(nextCheckDateStr);

        if (nextCheckDate < today) {
            return { text: formattedDate, class: 'date-expired', date: nextCheckDate };
        } else if (warningDate <= today) {
            return { text: formattedDate, class: 'date-warning', date: nextCheckDate };
        } else {
            return { text: formattedDate, class: '', date: nextCheckDate };
        }
    } catch (e) {
        console.error("Error getting next check date status:", nextCheckDateStr, e);
         return { text: 'Помилка дати', class: '', date: null };
    }
}

/**
 * Розраховує відсоток часу, що МИНУВ з останньої повірки.
 * @param {string | null} lastCheckDateStr - Дата останньої повірки.
 * @param {string | null} nextCheckDateStr - Дата наступної повірки.
 * @param {number | null} mpiYears - Міжповірочний інтервал.
 * @returns {{percent: number, statusClass: string}} - Відсоток (0-100) і клас статусу ('ok', 'warning', 'expired').
 */
function getTimelineData(lastCheckDateStr, nextCheckDateStr, mpiYears) {
    // Визначаємо статус для кольору шкали (залишається без змін)
    let statusClass = 'ok';
    const dateStatus = getNextCheckDateStatus(nextCheckDateStr);
    if (dateStatus.class === 'date-expired') {
        statusClass = 'expired';
    } else if (dateStatus.class === 'date-warning') {
        statusClass = 'warning';
    }

    // Розрахунок відсотка часу, що МИНУВ
    if (!lastCheckDateStr || !nextCheckDateStr || !mpiYears || mpiYears <= 0) {
        return { percent: 0, statusClass }; // Немає даних для розрахунку відсотка
    }

    try {
        const lastCheckDate = new Date(lastCheckDateStr);
        const nextCheckDate = new Date(nextCheckDateStr);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        lastCheckDate.setUTCHours(0, 0, 0, 0);
        nextCheckDate.setUTCHours(0, 0, 0, 0);

        if (isNaN(lastCheckDate.getTime()) || isNaN(nextCheckDate.getTime())) {
             return { percent: 0, statusClass };
        }

        // Загальна тривалість інтервалу в мілісекундах
        const totalDuration = nextCheckDate.getTime() - lastCheckDate.getTime();
        // Час, що минув з останньої повірки
        const timeElapsed = today.getTime() - lastCheckDate.getTime();

        let percentElapsed = 0;
        if (totalDuration > 0) {
            // Розраховуємо відсоток часу, що минув
            percentElapsed = (timeElapsed / totalDuration) * 100;
            // Обмежуємо значення від 0 до 100
            percentElapsed = Math.max(0, Math.min(100, percentElapsed));
        } else if (timeElapsed >= 0) {
            // Якщо інтервал 0 або негативний, але час вже пройшов
            percentElapsed = 100;
        }

        // Якщо прострочено, шкала заповнена на 100%
        if (statusClass === 'expired') {
            percentElapsed = 100;
        }

        return { percent: Math.round(percentElapsed), statusClass };

    } catch (e) {
        console.error("Error calculating timeline data:", e);
        return { percent: 0, statusClass };
    }
}


// --- Збереження та Завантаження Даних ---

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDevices));
        console.log("Дані збережено в localStorage.");
    } catch (e) {
        console.error("Помилка збереження даних в localStorage:", e);
        alert("Не вдалося зберегти зміни.");
    }
}

// --- Рендеринг, Сортування та Статистика ---

function sortDevices(devicesToSort) {
     return devicesToSort.sort((a, b) => {
        const statusA = getNextCheckDateStatus(a.nextCheckDate);
        const statusB = getNextCheckDateStatus(b.nextCheckDate);
        const priority = { 'date-expired': 3, 'date-warning': 2, '': 1 };
        const priorityA = statusA.date ? (priority[statusA.class] ?? 0) : 0;
        const priorityB = statusB.date ? (priority[statusB.class] ?? 0) : 0;

        if (priorityB !== priorityA) return priorityB - priorityA;

        const dateA = statusA.date;
        const dateB = statusB.date;
        if (dateA && dateB) return dateA.getTime() - dateB.getTime();
        else if (dateA) return -1;
        else if (dateB) return 1;
        else return 0;
    });
}

function renderDeviceList() {
    deviceListContainer.innerHTML = '';
    loadingPlaceholder?.remove();

    const filteredByRM = currentRMFilter === 'all'
        ? [...currentDevices]
        : currentDevices.filter(device => device.rm === currentRMFilter);

    const sortedDevices = sortDevices(filteredByRM);
    const count = sortedDevices.length;
    deviceCountElement.textContent = count;

    if (count === 0) {
        deviceListContainer.innerHTML = `<p class="no-devices">Немає приладів для РМ "${currentRMFilter}".</p>`;
        return;
    }

    sortedDevices.forEach(device => {
        const card = document.createElement('div');
        card.classList.add('device-card');
        card.dataset.id = device.id || `generated_${Math.random()}`;

        const nextCheckStatus = getNextCheckDateStatus(device.nextCheckDate);
        const timeline = getTimelineData(device.lastCheckDate, device.nextCheckDate, device.mpi);

        // Оновлена структура картки з типом на новому рядку
        card.innerHTML = `
            <h3>${device.name || 'Без назви'}</h3>
            <div class="device-type-container">${device.type || '-'}</div>
            <p><strong>Зав. №:</strong> ${device.serial || '-'}</p>
            <p><strong>РМ:</strong> ${device.rm || '-'}</p>
            <p><strong>Розташування:</strong> ${device.location || '-'}</p>
            <p><strong>Місце повірки:</strong> ${device.povirkyLocation || '-'}</p> <p><strong>Остання пов.:</strong> ${formatDate(device.lastCheckDate)}</p>
            <p><strong>МПІ:</strong> ${device.mpi ? `${device.mpi} р.` : '-'}</p>
            <p><strong>Наступна пов.:</strong>
                <span class="date-cell ${nextCheckStatus.class}">${nextCheckStatus.text}</span>
            </p>
            ${timeline.percent > 0 || timeline.statusClass === 'expired' ? `
            <div class="calibration-timeline" title="Минуло приблизно ${timeline.percent}% інтервалу повірки">
                <div class="timeline-progress ${timeline.statusClass}" style="width: ${timeline.percent}%;"></div>
            </div>
            ` : ''}
            ${device.notes ? `<p><strong>Примітки:</strong> <span class="notes-text">${device.notes}</span></p>` : ''}
        `;

        card.addEventListener('click', () => openModal(device));
        deviceListContainer.appendChild(card);
    });
}

// --- Логіка Модального Вікна та Форми ---

function openModal(device = null) {
    deviceForm.reset();
    deviceForm.classList.remove('was-validated');

    if (device) {
        modalTitle.textContent = 'Редагувати Прилад';
        document.getElementById('device-id').value = device.id || '';
        document.getElementById('device-rm').value = device.rm || '';
        document.getElementById('device-name').value = device.name || '';
        document.getElementById('device-type').value = device.type || '';
        document.getElementById('device-serial').value = device.serial || '';
        document.getElementById('device-lastCheckDate').value = device.lastCheckDate || '';
        document.getElementById('device-mpi').value = device.mpi || '';
        document.getElementById('device-location').value = device.location || '';
        document.getElementById('device-povirkyLocation').value = device.povirkyLocation || ''; // Оновлене поле
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = '';
        if (currentRMFilter !== 'all') {
             document.getElementById('device-rm').value = currentRMFilter;
        }
        deleteDeviceBtn.classList.add('hidden');
    }
    modal.style.display = 'block';
    // Затримка фокусу, щоб уникнути проблем з анімацією
    setTimeout(() => {
         document.getElementById('device-rm').focus();
    }, 100);
}

function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset();
}

// Обробники для закриття модального вікна
addDeviceBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    // Закриваємо тільки якщо клік був на .modal (фоні), а не на .modal-content
    if (event.target === modal) {
        closeModal();
    }
});
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.style.display === 'block') closeModal(); });

// Обробник події для відправки форми
deviceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('device-id').value;
    const formData = {
        rm: document.getElementById('device-rm').value.trim(),
        name: document.getElementById('device-name').value.trim(),
        type: document.getElementById('device-type').value.trim(),
        serial: document.getElementById('device-serial').value.trim(),
        lastCheckDate: document.getElementById('device-lastCheckDate').value || null,
        mpi: parseInt(document.getElementById('device-mpi').value) || null,
        location: document.getElementById('device-location').value.trim() || null,
        povirkyLocation: document.getElementById('device-povirkyLocation').value.trim() || null, // Оновлене поле
        notes: document.getElementById('device-notes').value.trim() || null
    };

    if (!formData.rm || !formData.name || !formData.type || !formData.serial) {
        alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
        return;
    }

    formData.nextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    if (id) {
        const index = currentDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            currentDevices[index] = { ...formData, id: id };
            console.log("Прилад оновлено:", currentDevices[index]);
        } else {
             alert("Помилка: не вдалося знайти прилад для оновлення.");
             return;
        }
    } else {
        let newId = (formData.serial || 'no_serial') + '_' + Date.now();
        while (currentDevices.some(d => d.id === newId)) {
            newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        }
        formData.id = newId;
        currentDevices.push(formData);
        console.log("Новий прилад додано:", formData);
    }

    saveData();
    renderDeviceList();
    closeModal();
});

// Обробник події для кнопки "Видалити"
deleteDeviceBtn.addEventListener('click', () => {
    const id = document.getElementById('device-id').value;
    const deviceName = document.getElementById('device-name').value || 'цей прилад';
    if (!id) return;

    if (confirm(`Ви впевнені, що хочете видалити ${deviceName}?`)) {
        const initialLength = currentDevices.length;
        currentDevices = currentDevices.filter(device => device.id !== id);

        if (currentDevices.length < initialLength) {
            saveData();
            console.log("Прилад видалено з ID:", id);
            renderDeviceList();
            closeModal();
        } else {
             alert("Помилка: не вдалося знайти прилад для видалення.");
        }
    }
});

// --- Логіка Фільтрації РМ ---

rmFilterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;
        if (selectedRM !== currentRMFilter) {
            currentRMFilter = selectedRM;
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            renderDeviceList();
        }
    }
});


// --- Початкове Завантаження ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM завантажено. Завантаження даних...");
    currentDevices = loadData();
    console.log(`Завантажено ${currentDevices.length} приладів.`);
    
    renderDeviceList(currentDevices, currentRMFilter);
    initUIHandlers(currentDevices, currentRMFilter);
    initNotifications(currentDevices);
});

// Функция для проверки является ли строка числом
function isNumeric(str) {
    return /^\d+$/.test(str);
}

// Функция для проверки необходимости поверки
function checkCalibrationNeeded(device) {
    if (!device.lastCheckDate || !device.mpi) return false;
    
    const lastCheck = new Date(device.lastCheckDate);
    const nextCheck = new Date(lastCheck);
    nextCheck.setFullYear(lastCheck.getFullYear() + device.mpi);
    
    return {
        isNeeded: new Date() > nextCheck && 
                  isNumeric(device.location) && 
                  device.calibrationLocation && 
                  typeof device.calibrationLocation === 'string' && 
                  device.calibrationLocation !== '-',
        nextCheckDate: nextCheck
    };
}

// Функция для отображения уведомлений
function showNotifications() {
    const notificationContainer = document.getElementById('notification-container') || 
        (() => {
            const container = document.createElement('div');
            container.id = 'notification-container';
            document.body.insertBefore(container, document.body.firstChild);
            return container;
        })();
    
    notificationContainer.innerHTML = '';
    
    currentDevices.forEach(device => {
        const calibrationCheck = checkCalibrationNeeded(device);
        if (calibrationCheck.isNeeded) {
            const notification = document.createElement('div');
            notification.className = 'notification slide-in';
            notification.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                Необхідна повірка приладу ${device.type} (${device.name})
                в ${device.calibrationLocation}
                <button onclick="this.parentElement.remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            notificationContainer.appendChild(notification);
        }
    });
}

// Вызываем проверку при загрузке страницы и каждый час
document.addEventListener('DOMContentLoaded', () => {
    showNotifications();
    setInterval(showNotifications, 3600000); // Каждый час
});

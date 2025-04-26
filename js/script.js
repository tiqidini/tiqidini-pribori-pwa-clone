// --- Глобальні змінні та DOM елементи ---
let currentDevices = []; // Дані будуть завантажені з localStorage або data.js
let currentRMFilter = 'all'; // Поточний фільтр РМ ('all', '111', '112', ...)
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
// const filterInput = document.getElementById('filter-input'); // Старий фільтр - видалено
const rmFilterContainer = document.getElementById('rm-filter'); // Контейнер кнопок фільтра РМ
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const overdueCountElement = document.getElementById('overdue-count'); // Елемент для статистики
const loadingPlaceholder = document.querySelector('.loading-placeholder');

const STORAGE_KEY = 'priboriAppData_v3'; // Оновлений ключ

// --- Функції Хелпери (formatDate, calculateNextCheckDate, getNextCheckDateStatus - без змін) ---

/**
 * Форматує дату з YYYY-MM-DD в DD.MM.YYYY.
 * @param {string | null} dateString - Рядок дати або null.
 * @returns {string} - Форматований рядок дати або '--.--.----'.
 */
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

/**
 * Обчислює дату наступної повірки.
 * @param {string | null} lastCheckDateStr - Дата останньої повірки (YYYY-MM-DD) або null.
 * @param {number | null} mpiYears - Міжповірочний інтервал в роках або null.
 * @returns {string | null} - Дата наступної повірки (YYYY-MM-DD) або null.
 */
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

/**
 * Визначає статус дати наступної повірки (прострочено, скоро, ОК).
 * @param {string | null} nextCheckDateStr - Дата наступної повірки (YYYY-MM-DD) або null.
 * @returns {{text: string, class: string, date: Date | null}} - Об'єкт зі статусом, класом CSS та датою.
 */
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
        warningDate.setUTCDate(warningDate.getUTCDate() - 30); // Попередження за 30 днів
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
 * Розраховує відсоток часу, що залишився до наступної повірки.
 * @param {string | null} lastCheckDateStr - Дата останньої повірки.
 * @param {string | null} nextCheckDateStr - Дата наступної повірки.
 * @param {number | null} mpiYears - Міжповірочний інтервал.
 * @returns {{percent: number, statusClass: string}} - Відсоток (0-100) і клас статусу ('ok', 'warning', 'expired').
 */
function getTimelineData(lastCheckDateStr, nextCheckDateStr, mpiYears) {
    if (!lastCheckDateStr || !nextCheckDateStr || !mpiYears || mpiYears <= 0) {
        return { percent: 0, statusClass: '' }; // Немає даних для шкали
    }

    try {
        const lastCheckDate = new Date(lastCheckDateStr);
        const nextCheckDate = new Date(nextCheckDateStr);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        lastCheckDate.setUTCHours(0, 0, 0, 0);
        nextCheckDate.setUTCHours(0, 0, 0, 0);

        // Перевірка на валідність дат
        if (isNaN(lastCheckDate.getTime()) || isNaN(nextCheckDate.getTime())) {
             return { percent: 0, statusClass: '' };
        }

        const totalDuration = nextCheckDate.getTime() - lastCheckDate.getTime();
        const timeRemaining = nextCheckDate.getTime() - today.getTime();

        let percent = 0;
        if (totalDuration > 0) {
            percent = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
        } else if (timeRemaining <= 0) { // Якщо інтервал 0 або від'ємний, і дата пройшла
             percent = 0;
        } else { // Якщо інтервал 0 або від'ємний, але дата ще не пройшла
             percent = 100;
        }


        // Визначення статусу для кольору шкали
        let statusClass = 'ok';
        const dateStatus = getNextCheckDateStatus(nextCheckDateStr);
        if (dateStatus.class === 'date-expired') {
            statusClass = 'expired';
            percent = 100; // Заповнюємо шкалу повністю, якщо прострочено
        } else if (dateStatus.class === 'date-warning') {
            statusClass = 'warning';
        }

        // Якщо прострочено, відсоток має бути 0, але шкала червона
        if (statusClass === 'expired') {
             percent = 0; // Показуємо, що часу не залишилось
        }


        return { percent: Math.round(percent), statusClass };

    } catch (e) {
        console.error("Error calculating timeline data:", e);
        return { percent: 0, statusClass: '' };
    }
}


// --- Збереження та Завантаження Даних ---

/**
 * Зберігає поточний масив приладів в localStorage.
 */
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDevices));
        console.log("Дані збережено в localStorage.");
    } catch (e) {
        console.error("Помилка збереження даних в localStorage:", e);
        alert("Не вдалося зберегти зміни. Можливо, сховище переповнене або вимкнене.");
    }
}

/**
 * Завантажує дані з localStorage або використовує початкові дані.
 * Додає поле calibrationLocation, якщо його немає.
 * Перераховує дату наступної повірки для всіх приладів.
 */
function loadData() {
    let loadedData = null;
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData)) {
                loadedData = parsedData;
                console.log("Дані завантажено з localStorage.");
            } else {
                 console.warn("Збережені дані в localStorage мають невірний формат.");
            }
        }
    } catch (e) {
        console.error("Помилка завантаження або парсингу даних з localStorage:", e);
        localStorage.removeItem(STORAGE_KEY);
    }

    if (!loadedData) {
        if (typeof devices !== 'undefined' && Array.isArray(devices)) {
            loadedData = JSON.parse(JSON.stringify(devices)); // Глибоке копіювання
            console.log("Використовуються початкові дані з data.js.");
        } else {
            console.error("Початкові дані 'devices' не знайдено або мають невірний формат.");
            loadedData = [];
        }
    }

    // Переконуємося, що всі об'єкти мають нове поле та перераховуємо дати
    loadedData.forEach(device => {
        // Додаємо нове поле, якщо його немає
        if (device.calibrationLocation === undefined) {
            device.calibrationLocation = null; // або ''
        }
        // Перераховуємо дату наступної повірки
        device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    });

    currentDevices = loadedData;
    updateOverdueStats(); // Оновлюємо статистику після завантаження
}


// --- Рендеринг, Сортування та Статистика ---

/**
 * Сортує масив приладів (логіка без змін).
 */
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

/**
 * Оновлює статистику прострочених приладів у шапці.
 */
function updateOverdueStats() {
    const overdueCount = currentDevices.filter(device => {
        const status = getNextCheckDateStatus(device.nextCheckDate);
        return status.class === 'date-expired';
    }).length;
    overdueCountElement.textContent = overdueCount;
}


/**
 * Відображає список приладів у контейнері з урахуванням фільтра РМ.
 */
function renderDeviceList() {
    deviceListContainer.innerHTML = ''; // Очищуємо контейнер
    loadingPlaceholder?.remove();

    // 1. Фільтруємо за РМ
    const filteredByRM = currentRMFilter === 'all'
        ? [...currentDevices] // Копія, якщо фільтр 'all'
        : currentDevices.filter(device => device.rm === currentRMFilter);

    // 2. Сортуємо відфільтровані прилади
    const sortedDevices = sortDevices(filteredByRM);

    const count = sortedDevices.length;
    deviceCountElement.textContent = count; // Оновлюємо лічильник видимих

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

        card.innerHTML = `
            <h3>${device.name || 'Без назви'} (<span class="device-type">${device.type || '-'}</span>)</h3>
            <p><strong>Зав. №:</strong> ${device.serial || '-'}</p>
            <p><strong>РМ:</strong> ${device.rm || '-'}</p>
            <p><strong>Розташування:</strong> ${device.location || '-'}</p>
            <p><strong>Місце калібр.:</strong> ${device.calibrationLocation || '-'}</p> <p><strong>Остання пов.:</strong> ${formatDate(device.lastCheckDate)}</p>
            <p><strong>МПІ:</strong> ${device.mpi ? `${device.mpi} р.` : '-'}</p>
            <p><strong>Наступна пов.:</strong>
                <span class="date-cell ${nextCheckStatus.class}">${nextCheckStatus.text}</span>
            </p>
            ${timeline.percent > 0 || timeline.statusClass === 'expired' ? `
            <div class="calibration-timeline" title="Залишилось приблизно ${timeline.percent}% часу до повірки">
                <div class="timeline-progress ${timeline.statusClass}" style="width: ${timeline.statusClass === 'expired' ? 100 : timeline.percent}%;"></div>
            </div>
            ` : ''}
            ${device.notes ? `<p><strong>Примітки:</strong> <span class="notes-text">${device.notes}</span></p>` : ''}
        `;

        card.addEventListener('click', () => openModal(device));
        deviceListContainer.appendChild(card);
    });
}

// --- Логіка Модального Вікна та Форми ---

/**
 * Відкриває модальне вікно (додає обробку нового поля).
 */
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
        document.getElementById('device-calibrationLocation').value = device.calibrationLocation || ''; // Нове поле
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = '';
        // Можна встановити РМ за замовчуванням відповідно до поточного фільтра
        if (currentRMFilter !== 'all') {
             document.getElementById('device-rm').value = currentRMFilter;
        }
        deleteDeviceBtn.classList.add('hidden');
    }
    modal.style.display = 'block';
    document.getElementById('device-rm').focus();
}

/**
 * Закриває модальне вікно (без змін).
 */
function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset();
}

// Обробники для закриття модального вікна (без змін)
addDeviceBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.style.display === 'block') closeModal(); });

// Обробник події для відправки форми (додає обробку нового поля)
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
        calibrationLocation: document.getElementById('device-calibrationLocation').value.trim() || null, // Нове поле
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
    updateOverdueStats(); // Оновлюємо статистику
    renderDeviceList(); // Перерендеримо список з урахуванням поточного фільтра РМ
    closeModal();
});

// Обробник події для кнопки "Видалити" (оновлює статистику)
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
            updateOverdueStats(); // Оновлюємо статистику
            renderDeviceList(); // Оновлюємо список з урахуванням фільтра
            closeModal();
        } else {
             alert("Помилка: не вдалося знайти прилад для видалення.");
        }
    }
});

// --- Логіка Фільтрації РМ ---

// Додаємо обробник подій до контейнера кнопок фільтра
rmFilterContainer.addEventListener('click', (event) => {
    // Перевіряємо, чи клікнули саме на кнопку фільтра
    if (event.target.classList.contains('filter-btn')) {
        const selectedRM = event.target.dataset.rm;

        // Якщо клікнули не на активну кнопку
        if (selectedRM !== currentRMFilter) {
            // Оновлюємо поточний фільтр
            currentRMFilter = selectedRM;

            // Знімаємо клас 'active' з усіх кнопок
            rmFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Додаємо клас 'active' до натиснутої кнопки
            event.target.classList.add('active');

            // Перерендеримо список з новим фільтром
            renderDeviceList();
        }
    }
});


// --- Початкове Завантаження ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM завантажено. Завантаження даних...");
    loadData(); // Завантажуємо дані (включає оновлення статистики)
    console.log(`Завантажено ${currentDevices.length} приладів.`);
    renderDeviceList(); // Відображаємо початковий список (фільтр 'all' за замовчуванням)
});

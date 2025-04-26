// --- Глобальні змінні та DOM елементи ---
let currentDevices = []; // Дані будуть завантажені з localStorage або data.js
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const filterInput = document.getElementById('filter-input');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');
const loadingPlaceholder = document.querySelector('.loading-placeholder');

const STORAGE_KEY = 'priboriAppData_v2'; // Оновлений ключ для уникнення конфліктів

// --- Функції Хелпери ---

/**
 * Форматує дату з YYYY-MM-DD в DD.MM.YYYY.
 * @param {string | null} dateString - Рядок дати або null.
 * @returns {string} - Форматований рядок дати або '--.--.----'.
 */
function formatDate(dateString) {
    if (!dateString) return '--.--.----';
    try {
        const date = new Date(dateString);
        // Перевірка на валідність дати (враховує не тільки null, але й некоректні рядки)
        if (isNaN(date.getTime())) {
             console.warn("Invalid date string received:", dateString);
             return 'Невірна дата';
        }
        // Додаємо UTC, щоб уникнути проблем з часовими поясами при форматуванні
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Місяці від 0
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
    // Важлива перевірка на валідність дати
    if (isNaN(lastCheckDate.getTime())) {
        console.warn("Invalid lastCheckDate for calculation:", lastCheckDateStr);
        return null;
    }
    // Додаємо роки МПІ
    lastCheckDate.setUTCFullYear(lastCheckDate.getUTCFullYear() + parseInt(mpiYears));
    // Віднімаємо один день (повірка дійсна до дня перед наступною датою)
    lastCheckDate.setUTCDate(lastCheckDate.getUTCDate() - 1);
    // Повертаємо в форматі YYYY-MM-DD
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
    today.setUTCHours(0, 0, 0, 0); // Порівнюємо тільки дати, без часу

    try {
        const nextCheckDate = new Date(nextCheckDateStr);
         // Перевірка на валідність
        if (isNaN(nextCheckDate.getTime())) {
             console.warn("Invalid nextCheckDate for status check:", nextCheckDateStr);
            return { text: 'Невірна дата', class: '', date: null };
        }
        nextCheckDate.setUTCHours(0, 0, 0, 0); // Нормалізуємо час для порівняння

        const warningDate = new Date(nextCheckDate);
        warningDate.setUTCDate(warningDate.getUTCDate() - 30); // Попередження за 30 днів

        const formattedDate = formatDate(nextCheckDateStr); // Форматуємо валідну дату

        if (nextCheckDate < today) {
            return { text: formattedDate, class: 'date-expired', date: nextCheckDate }; // Прострочено (оранжевий/червоний)
        } else if (warningDate <= today) {
            return { text: formattedDate, class: 'date-warning', date: nextCheckDate }; // Скоро закінчується (жовтий)
        } else {
            return { text: formattedDate, class: '', date: nextCheckDate }; // Все гаразд
        }
    } catch (e) {
        console.error("Error getting next check date status:", nextCheckDateStr, e);
         return { text: 'Помилка дати', class: '', date: null };
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
        localStorage.removeItem(STORAGE_KEY); // Видаляємо пошкоджені дані
    }

    // Якщо дані не завантажено, використовуємо початкові з data.js
    if (!loadedData) {
        // Перевіряємо, чи існує змінна 'devices' з data.js
        if (typeof devices !== 'undefined' && Array.isArray(devices)) {
            loadedData = [...devices]; // Створюємо копію
            console.log("Використовуються початкові дані з data.js.");
        } else {
            console.error("Початкові дані 'devices' не знайдено або мають невірний формат.");
            loadedData = []; // Повертаємо порожній масив у разі помилки
        }
    }

    // Важливо: Перераховуємо дату наступної повірки для ВСІХ завантажених/початкових даних
    loadedData.forEach(device => {
        device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    });

    currentDevices = loadedData; // Оновлюємо глобальну змінну
}


// --- Рендеринг та Сортування ---

/**
 * Сортує масив приладів: спочатку ті, що потребують уваги (прострочені, потім скоро),
 * потім решта. В межах однієї категорії сортує за датою наступної повірки.
 * @param {Array} devicesToSort - Масив приладів для сортування.
 * @returns {Array} - Відсортований масив приладів.
 */
function sortDevices(devicesToSort) {
    return devicesToSort.sort((a, b) => {
        const statusA = getNextCheckDateStatus(a.nextCheckDate);
        const statusB = getNextCheckDateStatus(b.nextCheckDate);

        // Пріоритети: expired > warning > normal > null/invalid
        const priority = {
            'date-expired': 3, // Найвищий
            'date-warning': 2,
            '': 1,             // Нормальний статус
        };

        // Якщо дата null або невірна, ставимо найнижчий пріоритет (0)
        const priorityA = statusA.date ? (priority[statusA.class] ?? 0) : 0;
        const priorityB = statusB.date ? (priority[statusB.class] ?? 0) : 0;


        // 1. Сортуємо за пріоритетом статусу (спочатку ті, що вище)
        if (priorityB !== priorityA) {
            return priorityB - priorityA;
        }

        // 2. Якщо пріоритети однакові, сортуємо за датою наступної повірки (спочатку ті, що раніше)
        // Якщо одна з дат null, вона йде останньою в цій категорії
        const dateA = statusA.date;
        const dateB = statusB.date;

        if (dateA && dateB) {
            return dateA.getTime() - dateB.getTime(); // Порівнюємо мілісекунди
        } else if (dateA) {
            return -1; // A має дату, B - ні, A йде першим
        } else if (dateB) {
            return 1; // B має дату, A - ні, B йде першим
        } else {
            return 0; // Обидві дати null, порядок не важливий
        }
    });
}

/**
 * Відображає список приладів у контейнері.
 * @param {Array} devicesToRender - Масив приладів для відображення.
 */
function renderDeviceList(devicesToRender) {
    deviceListContainer.innerHTML = ''; // Очищуємо контейнер
    loadingPlaceholder?.remove(); // Видаляємо плейсхолдер завантаження, якщо він є

    const count = devicesToRender ? devicesToRender.length : 0;
    deviceCountElement.textContent = count; // Оновлюємо лічильник

    if (count === 0) {
        deviceListContainer.innerHTML = '<p class="no-devices">Немає приладів для відображення.</p>';
        return;
    }

    // Сортуємо прилади перед відображенням
    const sortedDevices = sortDevices([...devicesToRender]); // Сортуємо копію

    sortedDevices.forEach(device => {
        const card = document.createElement('div');
        card.classList.add('device-card');
        card.dataset.id = device.id || `generated_${Math.random()}`; // Додаємо ID для ідентифікації

        const nextCheckStatus = getNextCheckDateStatus(device.nextCheckDate);

        // Формуємо HTML картки
        card.innerHTML = `
            <h3>${device.name || 'Без назви'} (<span class="device-type">${device.type || '-'}</span>)</h3>
            <p><strong>Зав. №:</strong> ${device.serial || '-'}</p>
            <p><strong>РМ:</strong> ${device.rm || '-'}</p>
            <p><strong>Розташування:</strong> ${device.location || '-'}</p>
            <p><strong>Остання пов.:</strong> ${formatDate(device.lastCheckDate)}</p>
            <p><strong>МПІ:</strong> ${device.mpi ? `${device.mpi} р.` : '-'}</p>
            <p><strong>Наступна пов.:</strong>
                <span class="date-cell ${nextCheckStatus.class}">${nextCheckStatus.text}</span>
            </p>
            ${device.notes ? `<p><strong>Примітки:</strong> <span class="notes-text">${device.notes}</span></p>` : ''}
        `;

        // Додаємо обробник кліку для відкриття модального вікна редагування
        card.addEventListener('click', () => openModal(device));
        deviceListContainer.appendChild(card);
    });
}

// --- Логіка Модального Вікна та Форми ---

/**
 * Відкриває модальне вікно для додавання або редагування приладу.
 * @param {object | null} device - Об'єкт приладу для редагування або null для додавання.
 */
function openModal(device = null) {
    deviceForm.reset(); // Скидаємо форму перед заповненням
    deviceForm.classList.remove('was-validated'); // Скидаємо валідацію Bootstrap (якщо використовується)

    if (device) {
        // Режим редагування
        modalTitle.textContent = 'Редагувати Прилад';
        document.getElementById('device-id').value = device.id || ''; // Важливо мати ID
        document.getElementById('device-rm').value = device.rm || '';
        document.getElementById('device-name').value = device.name || '';
        document.getElementById('device-type').value = device.type || '';
        document.getElementById('device-serial').value = device.serial || '';
        // Формат дати для input type="date" має бути YYYY-MM-DD
        document.getElementById('device-lastCheckDate').value = device.lastCheckDate || '';
        document.getElementById('device-mpi').value = device.mpi || '';
        document.getElementById('device-location').value = device.location || '';
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden'); // Показуємо кнопку видалення
    } else {
        // Режим додавання
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = ''; // ID буде згенеровано при збереженні
        deleteDeviceBtn.classList.add('hidden'); // Ховаємо кнопку видалення
    }
    modal.style.display = 'block';
    // Фокус на першому полі вводу для зручності
    document.getElementById('device-rm').focus();
}

/**
 * Закриває модальне вікно.
 */
function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset(); // Очищаємо форму при закритті
}

// Обробник події для кнопки "Додати прилад"
addDeviceBtn.addEventListener('click', () => openModal());

// Обробник події для кнопки закриття модального вікна
closeModalBtn.addEventListener('click', closeModal);

// Закриття модального вікна при кліку поза ним
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Закриття модального вікна при натисканні клавіші Escape
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});


// Обробник події для відправки форми (додавання/редагування)
deviceForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Запобігаємо стандартній відправці

    const id = document.getElementById('device-id').value;
    const formData = {
        // Отримуємо дані з форми, обрізаємо пробіли
        rm: document.getElementById('device-rm').value.trim(),
        name: document.getElementById('device-name').value.trim(),
        type: document.getElementById('device-type').value.trim(),
        serial: document.getElementById('device-serial').value.trim(),
        lastCheckDate: document.getElementById('device-lastCheckDate').value || null, // null якщо порожньо
        mpi: parseInt(document.getElementById('device-mpi').value) || null, // null якщо не число
        location: document.getElementById('device-location').value.trim() || null,
        notes: document.getElementById('device-notes').value.trim() || null
    };

    // Перевірка наявності обов'язкових полів (можна додати валідацію)
    if (!formData.rm || !formData.name || !formData.type || !formData.serial) {
        alert("Будь ласка, заповніть обов'язкові поля: РМ, Найменування, Тип, Заводський номер.");
        return; // Зупиняємо виконання, якщо не всі поля заповнені
    }

    // Розраховуємо дату наступної повірки
    formData.nextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    if (id) {
        // --- Редагування існуючого ---
        const index = currentDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            // Оновлюємо об'єкт в масиві, зберігаючи ID
            currentDevices[index] = { ...formData, id: id };
            console.log("Прилад оновлено:", currentDevices[index]);
        } else {
            console.error("Не вдалося знайти прилад для оновлення з ID:", id);
            // Можливо, додати новий, якщо редагування не вдалося? Або показати помилку.
            // Поки що просто виходимо
             alert("Помилка: не вдалося знайти прилад для оновлення.");
             return;
        }
    } else {
        // --- Додавання нового ---
        // Генеруємо унікальний ID (простий варіант)
        // Використовуємо серійний номер + timestamp для більшої унікальності
        let newId = (formData.serial || 'no_serial') + '_' + Date.now();
        // Перевірка на унікальність ID (про всяк випадок)
        while (currentDevices.some(d => d.id === newId)) {
            newId = (formData.serial || 'no_serial') + '_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        }
        formData.id = newId;
        currentDevices.push(formData);
        console.log("Новий прилад додано:", formData);
    }

    saveData(); // Зберігаємо зміни в localStorage

    // Оновлюємо список, застосовуючи поточний фільтр
    applyFilter(); // Викликаємо функцію, яка фільтрує та рендерить

    closeModal(); // Закриваємо модальне вікно
});

// Обробник події для кнопки "Видалити"
deleteDeviceBtn.addEventListener('click', () => {
    const id = document.getElementById('device-id').value;
    const deviceName = document.getElementById('device-name').value || 'цей прилад';
    if (!id) return; // Нічого видаляти, якщо немає ID

    // Запитуємо підтвердження
    if (confirm(`Ви впевнені, що хочете видалити ${deviceName}?`)) {
        const initialLength = currentDevices.length;
        currentDevices = currentDevices.filter(device => device.id !== id);

        if (currentDevices.length < initialLength) {
            saveData(); // Зберігаємо дані після видалення
            console.log("Прилад видалено з ID:", id);
            applyFilter(); // Оновлюємо список з урахуванням фільтру
            closeModal(); // Закриваємо вікно
        } else {
             console.error("Не вдалося знайти прилад для видалення з ID:", id);
             alert("Помилка: не вдалося знайти прилад для видалення.");
        }
    }
});

// --- Логіка Фільтрації ---

/**
 * Застосовує поточне значення фільтра до списку приладів та рендерить результат.
 */
function applyFilter() {
    const searchTerm = filterInput.value.toLowerCase().trim();

    if (!searchTerm) {
        renderDeviceList(currentDevices); // Якщо фільтр порожній, показуємо все
        return;
    }

    const filteredDevices = currentDevices.filter(device => {
        // Перевіряємо кожне поле на наявність пошукового терміну
        // Використовуємо ?. для безпечного доступу до властивостей, якщо вони можуть бути null/undefined
        return (
            device.name?.toLowerCase().includes(searchTerm) ||
            device.type?.toLowerCase().includes(searchTerm) ||
            device.serial?.toLowerCase().includes(searchTerm) ||
            device.location?.toLowerCase().includes(searchTerm) ||
            // Особлива перевірка для РМ: точне співпадіння або якщо починається з "рм"
            (device.rm && (
                device.rm.toLowerCase() === searchTerm ||
                searchTerm.startsWith('рм') && device.rm.toLowerCase() === searchTerm.substring(2).trim() ||
                searchTerm.startsWith('rm') && device.rm.toLowerCase() === searchTerm.substring(2).trim()
                )) ||
             (device.rm && device.rm.toLowerCase().includes(searchTerm)) // Додаткова перевірка на часткове входження в РМ
        );
    });

    renderDeviceList(filteredDevices);
}


// Обробник події для введення у фільтр
filterInput.addEventListener('input', applyFilter);


// --- Початкове Завантаження ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM завантажено. Завантаження даних...");
    loadData(); // Завантажуємо дані при старті
    console.log(`Завантажено ${currentDevices.length} приладів.`);
    renderDeviceList(currentDevices); // Відображаємо початковий список
});

// Логіка додатку буде тут 

// Глобальна змінна для зберігання даних (з data.js)
// У реальному додатку ці дані краще завантажувати асинхронно або зберігати в localStorage
let currentDevices = [...devices]; // Створюємо копію, щоб не мутувати оригінальний масив

// Отримуємо елементи DOM
const deviceListContainer = document.getElementById('device-list');
const modal = document.getElementById('modal');
const closeModalBtn = modal.querySelector('.close-btn');
const addDeviceBtn = document.getElementById('add-device-btn');
const deviceForm = document.getElementById('device-form');
const modalTitle = document.getElementById('modal-title');
const filterInput = document.getElementById('filter-input');
const deleteDeviceBtn = document.getElementById('delete-device-btn');
const deviceCountElement = document.getElementById('device-count');

// Ключ для localStorage
const STORAGE_KEY = 'priboriAppData';

// --- Функції Хелпери ---

// Форматування дати YYYY-MM-DD -> DD.MM.YYYY
function formatDate(dateString) {
    if (!dateString) return '--.--.----'
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Невірна дата';
    }
}

// Розрахунок статусу дати наступної повірки
function getNextCheckDateStatus(nextCheckDateStr) {
    if (!nextCheckDateStr) return { text: 'Не вказано', class: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Встановлюємо час на початок дня для коректного порівняння
    const nextCheckDate = new Date(nextCheckDateStr);
    if (isNaN(nextCheckDate.getTime())) return { text: 'Невірна дата', class: '' }; 

    const warningDate = new Date(nextCheckDate);
    warningDate.setDate(warningDate.getDate() - 30); // Попередження за 30 днів

    const formattedDate = formatDate(nextCheckDateStr);

    if (nextCheckDate < today) {
        return { text: formattedDate, class: 'date-expired' }; // Прострочено
    } else if (warningDate <= today) {
        return { text: formattedDate, class: 'date-warning' }; // Скоро закінчується
    } else {
        return { text: formattedDate, class: '' }; // Все гаразд
    }
}

// Функція збереження даних в localStorage
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDevices));
    } catch (e) {
        console.error("Помилка збереження даних в localStorage:", e);
        // Можна показати повідомлення користувачу
        alert("Не вдалося зберегти зміни. Можливо, сховище переповнене.");
    }
}

// Функція завантаження даних з localStorage
function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Проста перевірка, чи це масив (можна додати складнішу валідацію)
            if (Array.isArray(parsedData)) {
                 // Перераховуємо nextCheckDate для завантажених даних, 
                 // оскільки функція calculateNextCheckDate може бути недоступна при парсингу JSON
                 parsedData.forEach(device => {
                     device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
                 });
                return parsedData;
            }
        }
    } catch (e) {
        console.error("Помилка завантаження даних з localStorage:", e);
        localStorage.removeItem(STORAGE_KEY); // Видаляємо пошкоджені дані
    }
    // Якщо даних немає або вони пошкоджені, повертаємо початкові дані з data.js
    // Перераховуємо nextCheckDate і для початкових даних на випадок, якщо calculateNextCheckDate в data.js не спрацювала
     devices.forEach(device => {
        device.nextCheckDate = calculateNextCheckDate(device.lastCheckDate, device.mpi);
    });
    return [...devices]; // Повертаємо копію початкових даних
}

// --- Основна логіка рендерингу ---

// Функція для сортування приладів
function sortDevices(devicesToSort) {
    return devicesToSort.sort((a, b) => {
        const statusA = getNextCheckDateStatus(a.nextCheckDate);
        const statusB = getNextCheckDateStatus(b.nextCheckDate);

        // Пріоритети: expired > warning > normal > null/invalid
        const priority = {
            'date-expired': 3,
            'date-warning': 2,
            '': 1, // Нормальний статус
        };

        // Якщо дата null або невірна, ставимо найнижчий пріоритет
        const priorityA = statusA.class ? (priority[statusA.class] || 0) : 0;
        const priorityB = statusB.class ? (priority[statusB.class] || 0) : 0;

        if (priorityB !== priorityA) {
            return priorityB - priorityA; // Спочатку з вищим пріоритетом
        }

        // Якщо пріоритети однакові, сортуємо за датою (спочатку ті, що раніше)
        const dateA = a.nextCheckDate ? new Date(a.nextCheckDate) : new Date(9999, 0, 1); // Далека дата для null
        const dateB = b.nextCheckDate ? new Date(b.nextCheckDate) : new Date(9999, 0, 1);
         if (isNaN(dateA.getTime())) dateA = new Date(9999, 0, 1);
        if (isNaN(dateB.getTime())) dateB = new Date(9999, 0, 1);

        return dateA - dateB;
    });
}

// Функція для відображення списку приладів
function renderDeviceList(devicesToRender) {
    deviceListContainer.innerHTML = ''; // Очищуємо контейнер

    const count = devicesToRender ? devicesToRender.length : 0;
    deviceCountElement.textContent = count; // Оновлюємо лічильник

    if (count === 0) {
        deviceListContainer.innerHTML = '<p>Немає приладів для відображення.</p>';
        return;
    }

    // Сортуємо прилади перед відображенням
    const sortedDevices = sortDevices([...devicesToRender]); // Сортуємо копію

    sortedDevices.forEach(device => {
        const card = document.createElement('div');
        card.classList.add('device-card');
        card.dataset.id = device.id;

        const nextCheckStatus = getNextCheckDateStatus(device.nextCheckDate);

        // Додаємо клас device-type до типу приладу
        card.innerHTML = `
            <h3>${device.name} (<span class="device-type">${device.type || '-'}</span>)</h3> 
            <p><strong>Зав. №:</strong> ${device.serial || '-'}</p>
            <p><strong>РМ:</strong> ${device.rm || '-'}</p>
            <p><strong>Розташування:</strong> ${device.location || '-'}</p>
            <p><strong>Остання повірка:</strong> ${formatDate(device.lastCheckDate)}</p>
            <p><strong>МПІ:</strong> ${device.mpi ? `${device.mpi} р.` : '-'}</p>
            <p><strong>Наступна повірка:</strong> 
                <span class="date-cell ${nextCheckStatus.class}">${nextCheckStatus.text}</span>
            </p>
            ${device.notes ? `<p><strong>Примітки:</strong> ${device.notes}</p>` : ''}
        `;

        card.addEventListener('click', () => openModal(device));
        deviceListContainer.appendChild(card);
    });
}

// --- Логіка Модального Вікна та Форми ---

// Функція відкриття модального вікна
function openModal(device = null) {
    deviceForm.reset(); // Скидаємо форму
    if (device) {
        // Режим редагування
        modalTitle.textContent = 'Редагувати Прилад';
        document.getElementById('device-id').value = device.id;
        document.getElementById('device-rm').value = device.rm || '';
        document.getElementById('device-name').value = device.name || '';
        document.getElementById('device-type').value = device.type || '';
        document.getElementById('device-serial').value = device.serial || '';
        document.getElementById('device-lastCheckDate').value = device.lastCheckDate || '';
        document.getElementById('device-mpi').value = device.mpi || '';
        document.getElementById('device-location').value = device.location || '';
        document.getElementById('device-notes').value = device.notes || '';
        deleteDeviceBtn.classList.remove('hidden'); // Показуємо кнопку видалення
    } else {
        // Режим додавання
        modalTitle.textContent = 'Додати Прилад';
        document.getElementById('device-id').value = ''; // Очищуємо ID
        deleteDeviceBtn.classList.add('hidden'); // Ховаємо кнопку видалення
    }
    modal.style.display = 'block';
}

// Функція закриття модального вікна
function closeModal() {
    modal.style.display = 'none';
    deviceForm.reset();
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

// Обробник події для відправки форми
deviceForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Запобігаємо стандартній відправці

    const id = document.getElementById('device-id').value;
    const formData = {
        rm: document.getElementById('device-rm').value.trim(),
        name: document.getElementById('device-name').value.trim(),
        type: document.getElementById('device-type').value.trim(),
        serial: document.getElementById('device-serial').value.trim(),
        lastCheckDate: document.getElementById('device-lastCheckDate').value || null,
        mpi: parseInt(document.getElementById('device-mpi').value) || null,
        location: document.getElementById('device-location').value.trim() || null,
        notes: document.getElementById('device-notes').value.trim() || null
    };

    // Розраховуємо дату наступної повірки
    formData.nextCheckDate = calculateNextCheckDate(formData.lastCheckDate, formData.mpi);

    if (id) {
        // Редагування існуючого
        const index = currentDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            // Оновлюємо, зберігаючи оригінальний ID
            currentDevices[index] = { ...formData, id: id }; 
        }
    } else {
        // Додавання нового
        // Генеруємо простий ID (можна покращити, наприклад, використовуючи UUID)
        formData.id = formData.serial || `new_${Date.now()}`; // Використовуємо серійний номер або timestamp
        // Перевірка на унікальність ID (бажано реалізувати надійніше)
        if (currentDevices.some(d => d.id === formData.id)) {
            formData.id = `new_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        }
        currentDevices.push(formData);
    }

    saveData(); // Зберігаємо дані після зміни

    renderDeviceList(currentDevices); // Оновлюємо список
    filterInput.value = ''; // Скидаємо фільтр після збереження
    closeModal(); // Закриваємо вікно
});

// Обробник події для кнопки "Видалити"
deleteDeviceBtn.addEventListener('click', () => {
    const id = document.getElementById('device-id').value;
    if (!id) return; // Нічого видаляти

    if (confirm(`Ви впевнені, що хочете видалити прилад ${document.getElementById('device-name').value}?`)) {
        currentDevices = currentDevices.filter(device => device.id !== id);
        saveData(); // Зберігаємо дані після видалення
        renderDeviceList(currentDevices); // Оновлюємо список
        filterInput.value = ''; // Скидаємо фільтр
        closeModal(); // Закриваємо вікно
    }
});

// --- Логіка Фільтрації ---

filterInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (!searchTerm) {
        renderDeviceList(currentDevices); // Якщо фільтр порожній, показуємо все
        return;
    }

    const filteredDevices = currentDevices.filter(device => {
        return (
            (device.name && device.name.toLowerCase().includes(searchTerm)) ||
            (device.type && device.type.toLowerCase().includes(searchTerm)) ||
            (device.serial && device.serial.toLowerCase().includes(searchTerm)) ||
            (device.location && device.location.toLowerCase().includes(searchTerm)) ||
            (device.rm && device.rm.toLowerCase().includes(searchTerm))
        );
    });

    renderDeviceList(filteredDevices);
});


// --- Початкове Завантаження ---

document.addEventListener('DOMContentLoaded', () => {
    // Завантаження даних тепер відбувається при ініціалізації currentDevices
    // loadData() більше не потрібна тут
    renderDeviceList(currentDevices); // Відображаємо список (вже завантажений або початковий)
});

// Перевизначаємо функцію calculateNextCheckDate, якщо вона вже є в data.js
// (Це може бути не найкращим рішенням, краще використовувати модулі в майбутньому)
if (typeof calculateNextCheckDate !== 'function') {
    // Функція для обчислення дати наступної повірки (копія з data.js на випадок, якщо той файл не завантажився)
    function calculateNextCheckDate(lastCheckDateStr, mpiYears) {
        if (!lastCheckDateStr || !mpiYears || isNaN(parseInt(mpiYears))) {
            return null;
        }
        try {
            const lastCheckDate = new Date(lastCheckDateStr);
            if (isNaN(lastCheckDate.getTime())) {
                return null;
            }
            lastCheckDate.setFullYear(lastCheckDate.getFullYear() + parseInt(mpiYears));
            lastCheckDate.setDate(lastCheckDate.getDate() - 1); 
            return lastCheckDate.toISOString().split('T')[0];
        } catch (e) {
            console.error("Error calculating next check date in script.js:", lastCheckDateStr, mpiYears, e);
            return null;
        }
    }
} 
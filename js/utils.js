// Функция форматирования даты
export function formatDate(dateString) {
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

// Функция расчета следующей даты поверки
export function calculateNextCheckDate(lastCheckDateStr, mpiYears) {
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

// Функция получения статуса даты следующей поверки
export function getNextCheckDateStatus(nextCheckDateStr) {
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

// Функция расчета данных для временной шкалы
export function getTimelineData(lastCheckDateStr, nextCheckDateStr, mpiYears) {
    let statusClass = 'ok';
    const dateStatus = getNextCheckDateStatus(nextCheckDateStr);
    if (dateStatus.class === 'date-expired') {
        statusClass = 'expired';
    } else if (dateStatus.class === 'date-warning') {
        statusClass = 'warning';
    }

    if (!lastCheckDateStr || !nextCheckDateStr || !mpiYears || mpiYears <= 0) {
        return { percent: 0, statusClass };
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

        const totalDuration = nextCheckDate.getTime() - lastCheckDate.getTime();
        const timeElapsed = today.getTime() - lastCheckDate.getTime();

        let percentElapsed = 0;
        if (totalDuration > 0) {
            percentElapsed = (timeElapsed / totalDuration) * 100;
            percentElapsed = Math.max(0, Math.min(100, percentElapsed));
        } else if (timeElapsed >= 0) {
            percentElapsed = 100;
        }

        if (statusClass === 'expired') {
            percentElapsed = 100;
        }

        return { percent: Math.round(percentElapsed), statusClass };
    } catch (e) {
        console.error("Error calculating timeline data:", e);
        return { percent: 0, statusClass };
    }
}

// Функция проверки является ли строка числом
export function isNumeric(str) {
    return /^\d+$/.test(str);
}

// Функция сортировки устройств
export function sortDevices(devicesToSort) {
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

export function formatDate(dateString) {
    if (!dateString) return '--.--.----';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Невірна дата';
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    } catch (e) { return 'Помилка дати'; }
}

export function calculateNextCheckDate(lastCheckDateStr, mpiYears) {
    if (!lastCheckDateStr || !mpiYears || isNaN(parseInt(mpiYears)) || mpiYears <= 0) return null;
    try {
        const lastCheckDate = new Date(lastCheckDateStr);
        if (isNaN(lastCheckDate.getTime())) return null;
        lastCheckDate.setUTCFullYear(lastCheckDate.getUTCFullYear() + parseInt(mpiYears));
        lastCheckDate.setUTCDate(lastCheckDate.getUTCDate() - 1); 
        return lastCheckDate.toISOString().split('T')[0]; 
    } catch (e) { return null; }
}

export function getNextCheckDateStatus(nextCheckDateStr) {
    if (!nextCheckDateStr) return { text: 'Не вказано', className: 'text-gray-500', date: null, sortPriority: 0, isWarning: false, isExpired: false };
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    try {
        const nextCheckDate = new Date(nextCheckDateStr);
         if (isNaN(nextCheckDate.getTime())) return { text: 'Невірна дата', className: 'text-red-700', date: null, sortPriority: 0, isWarning: false, isExpired: false };
        nextCheckDate.setUTCHours(0,0,0,0);
        const warningDate = new Date(nextCheckDate);
        warningDate.setUTCDate(warningDate.getUTCDate() - 30);
        const formattedDate = formatDate(nextCheckDateStr);
        if (nextCheckDate < today) {
            return { text: formattedDate, className: 'date-expired-bg', date: nextCheckDate, sortPriority: 3, isWarning: false, isExpired: true };
        } else if (warningDate <= today) {
            return { text: formattedDate, className: 'date-warning-bg', date: nextCheckDate, sortPriority: 2, isWarning: true, isExpired: false };
        } else {
            return { text: formattedDate, className: 'text-gray-700', date: nextCheckDate, sortPriority: 1, isWarning: false, isExpired: false };
        }
    } catch (e) { 
        return { text: 'Помилка дати', className: 'text-red-700', date: null, sortPriority: 0, isWarning: false, isExpired: false }; 
    }
}

export function getTimelineData(lastCheckDateStr, nextCheckDateStr, mpiYears) {
    const statusInfo = getNextCheckDateStatus(nextCheckDateStr);
    let timelineClassName = 'timeline-ok';
    if (statusInfo.isExpired) timelineClassName = 'timeline-expired';
    else if (statusInfo.isWarning) timelineClassName = 'timeline-warning';

    if (!lastCheckDateStr || !nextCheckDateStr || !mpiYears || mpiYears <= 0) {
        return { percent: 0, timelineClassName };
    }
    try {
        const lastCheckDate = new Date(lastCheckDateStr);
        const periodEndDate = new Date(nextCheckDateStr);
        periodEndDate.setUTCDate(periodEndDate.getUTCDate() + 1); 
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        lastCheckDate.setUTCHours(0, 0, 0, 0);
        periodEndDate.setUTCHours(0, 0, 0, 0);

        if (isNaN(lastCheckDate.getTime()) || isNaN(periodEndDate.getTime())) {
            return { percent: 0, timelineClassName };
        }
        const totalDuration = periodEndDate.getTime() - lastCheckDate.getTime();
        const timeElapsed = today.getTime() - lastCheckDate.getTime();
        let percentElapsed = 0;
        if (totalDuration > 0) {
            percentElapsed = (timeElapsed / totalDuration) * 100;
            percentElapsed = Math.max(0, Math.min(100, percentElapsed));
        } else if (timeElapsed >= 0 && totalDuration <= 0) { 
            percentElapsed = 100;
        }
        if (statusInfo.isExpired) {
            percentElapsed = 100;
        }
        return { percent: Math.round(percentElapsed), timelineClassName };
    } catch (e) {
        console.error("Error in getTimelineData", e, {lastCheckDateStr, nextCheckDateStr, mpiYears});
        return { percent: 0, timelineClassName };
    }
}

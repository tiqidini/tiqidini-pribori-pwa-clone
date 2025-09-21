
function escapeCsvCell(cell) {
    if (cell === null || typeof cell === 'undefined') {
        return '';
    }
    const cellStr = String(cell);
    // If the cell contains a comma, a quote, or a newline, wrap it in double quotes.
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        // Escape existing double quotes by doubling them
        const escapedStr = cellStr.replace(/"/g, '""');
        return `"${escapedStr}"`;
    }
    return cellStr;
}

export function exportToCsv(devices, filename = 'pribori_export.csv') {
    if (!devices || devices.length === 0) {
        console.warn("No devices to export.");
        return;
    }

    const headers = [
        'rm', 'name', 'type', 'serial', 'lastCheckDate', 'mpi', 'location', 'povirkyLocation', 'notes'
    ];
    const headerDisplay = [
        'РМ', 'Найменування', 'Тип', 'Зав. №', 'Дата останньої повірки', 'МПІ (роки)', 'Де прилад', 'Місце повірки', 'Примітки'
    ];

    const csvRows = [headerDisplay.join(',')]; // Header row

    devices.forEach(device => {
        const row = headers.map(header => escapeCsvCell(device[header]));
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // Adding BOM for Excel

    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

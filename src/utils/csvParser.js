export async function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const devicesToImport = [];
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(',');
        if (columns.length < 9) continue; 
        const rm = columns[1]?.trim();
        const name = columns[2]?.trim();
        const type = columns[3]?.trim();
        const serial = columns[4]?.trim();
        const lastCheckDateStr = columns[5]?.trim();
        const mpiStr = columns[7]?.trim();
        const location = columns[8]?.trim();
        if (!rm || !name || !type || !serial) continue;
        let lastCheckDate = null;
        const dateMatch = lastCheckDateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (dateMatch) {
            lastCheckDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }
        const mpi = parseInt(mpiStr) || null;
        devicesToImport.push({
            rm, name, type, serial, lastCheckDate, mpi, location: location || null,
            povirkyLocation: null, notes: null,
        });
    }
    return devicesToImport;
}
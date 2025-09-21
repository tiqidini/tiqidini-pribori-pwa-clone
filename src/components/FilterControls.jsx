import React from 'react';

// FilterControls Component
export default function FilterControls({ currentRM, onRMChange, onAddDevice, onExport, onCsvExport, onImportTrigger, searchTerm, onSearchChange, sortOrder, onSortChange }) {
    const rms = ["all", "111", "112"];
    const sortOptions = [
        { value: 'status', label: 'За статусом повiрки' },
        { value: 'name_asc', label: 'За назвою (А-Я)' },
        { value: 'name_desc', label: 'За назвою (Я-А)' },
        { value: 'date_asc', label: 'За датою (спочатку нові)' },
        { value: 'date_desc', label: 'За датою (спочатку старі)' },
    ];

    return (
        <div className="my-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Left side: RM Filter, Search, and Sort */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:flex-nowrap lg:w-auto">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">РМ:</span>
                    <div className="inline-flex rounded-md shadow-sm bg-gray-200">
                        {rms.map(rm => (
                            <button
                                key={rm}
                                onClick={() => onRMChange(rm)}
                                className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md border border-gray-300 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                                    ${currentRM === rm ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {rm === "all" ? "Всі" : rm}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        placeholder="Пошук за назвою, типом, S/N..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="relative">
                     <select 
                        value={sortOrder}
                        onChange={onSortChange}
                        className="block w-full appearance-none bg-white py-1.5 pl-3 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                </div>
            </div>
            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end mt-4 md:mt-0 w-full md:w-auto">
                 <button
                    onClick={onCsvExport}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-md shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2 text-sm"
                >
                   <i className="fas fa-file-csv"></i> Экспорт в CSV
                </button>
                <button
                    onClick={onExport}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2 text-sm"
                >
                   <i className="fas fa-file-export"></i> Экспорт в JSON
                </button>
                <button
                    onClick={onImportTrigger}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-md shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2 text-sm"
                >
                   <i className="fas fa-file-import"></i> Импорт
                </button>
                <button
                    onClick={onAddDevice}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                    Додати
                </button>
            </div>
        </div>
    );
}
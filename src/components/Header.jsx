
import React from 'react';

// Header Component
export default function Header({ overdueCount }) {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center max-w-6xl">
                <h1 className="text-xl sm:text-2xl font-semibold">Список приладів</h1>
                <div title="Кількість приладів з простроченою повіркою" className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-md text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-exclamation-triangle-fill text-yellow-300" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                    </svg>
                    <span>{overdueCount}</span>
                </div>
            </div>
        </header>
    );
}

import React from 'react';

const ICONS = {
    danger: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    info: (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

const STYLES = {
    danger: { bg: 'bg-red-100', button: 'bg-red-500 hover:bg-red-600' },
    success: { bg: 'bg-green-100', button: 'bg-green-500 hover:bg-green-600' },
    info: { bg: 'bg-blue-100', button: 'bg-blue-500 hover:bg-blue-600' },
};

export default function DialogModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'ОК', cancelText = 'Відміна', type = 'info' }) {
    if (!isOpen) return null;

    const Icon = ICONS[type] || ICONS.info;
    const style = STYLES[type] || STYLES.info;

    // If onCancel is not provided, it's an alert. The main button should just close it.
    const handleConfirm = onCancel ? onConfirm : () => onConfirm(); // onConfirm for alert should be the close function

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[1050] modal-animation" onClick={onCancel || handleConfirm}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className={`${style.bg} p-3 rounded-full mb-4`}>
                        {Icon}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
                    <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap">{message}</p>
                    <div className="flex justify-center gap-4 w-full">
                        {onCancel && (
                            <button 
                                onClick={onCancel} 
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button 
                            onClick={handleConfirm} 
                            className={`flex-1 ${style.button} text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
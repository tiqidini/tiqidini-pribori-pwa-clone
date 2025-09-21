
import React from 'react';

// ImageZoomModal Component
export default function ImageZoomModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[1050] modal-animation" 
            onClick={onClose}
        >
            <div 
                className="bg-white p-2 rounded-lg shadow-2xl relative image-zoom-modal-content" 
                onClick={e => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Збільшене зображення приладу" className="max-w-full max-h-full object-contain rounded" />
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-1.5 leading-none"
                    aria-label="Закрити збільшене зображення"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

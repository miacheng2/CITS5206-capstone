import React from 'react';
import './styles/Modal.css';  // Importing the CSS styles

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
                <button onClick={onClose} className="close-button">&times;</button> {/* Using × for the close button */}
            </div>
        </div>
    );
}

export default Modal;




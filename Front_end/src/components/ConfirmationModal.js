// src/components/ConfirmationModal.js
import React from "react";
import "./styles/EventDetailsModal.css";

const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  showConfirmButtons,
}) => {
  if (!isOpen) return null; // If modal is not open, don't render anything

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          {showConfirmButtons ? (
            <>
              <button onClick={onConfirm} className="confirm-btn">
                Yes
              </button>
              <button onClick={onCancel} className="cancel-btn">
                No
              </button>
            </>
          ) : (
            <button onClick={onCancel} className="close-btn">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

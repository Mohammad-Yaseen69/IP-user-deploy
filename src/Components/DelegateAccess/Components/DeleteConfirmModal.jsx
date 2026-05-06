import React from "react";
import { Modal, ModalBody, Button, Spinner } from "reactstrap";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle, XCircle, X } from "react-feather";

const DeleteConfirmModal = ({ isOpen, toggle, onConfirm, itemName, isLoading, isSuccess, isError }) => {
  const { t } = useTranslation();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="status-wrap">
          <Spinner color="primary" className="spinner" />
          <h5 className="mt-3">{t("Deleting...")}</h5>
          <p className="text-muted">{t("Please wait while we process your request.")}</p>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="status-wrap">
          <div className="icon-circle icon-circle-success">
            <CheckCircle size={40} color="#27ae60" />
          </div>
          <h5 className="mt-3 text-success">{t("Success!")}</h5>
          <p className="text-muted">
            {itemName} {t("has been deleted successfully.")}
          </p>
          <Button color="success" className="mt-3 px-4" onClick={toggle}>
            {t("Done")}
          </Button>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="status-wrap">
          <div className="icon-circle icon-circle-error">
            <XCircle size={40} color="#e74c3c" />
          </div>
          <h5 className="mt-3 text-danger">{t("Error!")}</h5>
          <p className="text-muted">{t("Something went wrong. Please try again.")}</p>
          <Button color="danger" className="mt-3 px-4" onClick={toggle}>
            {t("Close")}
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="icon-circle icon-circle-warning">
          <AlertTriangle size={40} color="#f39c12" />
        </div>

        <h5 className="delete-title">{t("Are you sure?")}</h5>
        <p className="delete-message">
          {t("You are about to delete")} <strong>{itemName}</strong>.
          <br />
          {t("This action cannot be undone.")}
        </p>

        <div className="delete-actions">
          <Button color="light" className="px-4 py-2 fw-bold" onClick={toggle} disabled={isLoading}>
            {t("Cancel")}
          </Button>
          <Button color="danger" className="px-4 py-2 fw-bold ms-2" onClick={onConfirm} disabled={isLoading}>
            {t("Delete")}
          </Button>
        </div>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="sm" className="delete-confirm-modal">
      <button className="close-btn" onClick={toggle}>
        <X size={18} />
      </button>
      <ModalBody className="text-center p-4">
        {renderContent()}
      </ModalBody>

      <style>{`
        .delete-confirm-modal .modal-content {
          border-radius: 20px;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .status-wrap {
          padding: 20px 10px;
        }

        .icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .icon-circle-warning { background: #fff9db; }
        .icon-circle-success { background: #e6fffa; }
        .icon-circle-error { background: #fff5f5; }

        .delete-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .delete-message {
          color: #4a5568;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .close-btn {
          position: absolute;
          right: 16px;
          top: 16px;
          background: #f7fafc;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #718096;
          transition: all 0.2s;
          z-index: 10;
        }

        .close-btn:hover {
          background: #edf2f7;
          color: #2d3748;
          transform: rotate(90deg);
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border-width: 0.25em;
        }

        .delete-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      `}</style>
    </Modal>
  );
};

export default DeleteConfirmModal;
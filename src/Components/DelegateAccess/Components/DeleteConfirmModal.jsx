import React from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "react-feather";

const DeleteConfirmModal = ({ isOpen, toggle, onConfirm, itemName }) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm?.();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="sm" className="delete-confirm-modal">
      <ModalBody className="delete-modal-body">
        <div className="delete-icon-wrap">
          <AlertTriangle size={32} color="#e94560" />
        </div>

        <h5 className="delete-title">{t("Delete Delegate")}</h5>

        <p className="delete-message">
          {t("Are you sure you want to delete")}{" "}
          <strong>{itemName || t("this delegate")}</strong>?{" "}
          {t("This action cannot be undone.")}
        </p>

        <div className="delete-actions">
          <Button
            className="btn-cancel"
            onClick={toggle}
          >
            {t("Cancel")}
          </Button>
          <Button
            className="btn-delete"
            onClick={handleConfirm}
          >
            {t("Yes, Delete")}
          </Button>
        </div>
      </ModalBody>

      <style>{`
        .delete-confirm-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .delete-modal-body {
          padding: 36px 28px 28px;
          text-align: center;
          background: #fff;
        }

        .delete-icon-wrap {
          width: 68px;
          height: 68px;
          background: #fff1f3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border: 3px solid #ffd0d8;
        }

        .delete-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 10px;
          letter-spacing: 0.1px;
        }

        .delete-message {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .delete-message strong {
          color: #1a1a2e;
          font-weight: 600;
        }

        .delete-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .btn-cancel {
          flex: 1;
          padding: 10px 0;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          border: none;
          transition: background 0.2s;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          color: #1a1a2e;
        }

        .btn-delete {
          flex: 1;
          padding: 10px 0;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, #e94560, #c0392b);
          color: #fff;
          border: none;
          box-shadow: 0 4px 14px rgba(233, 69, 96, 0.35);
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: linear-gradient(135deg, #c0392b, #a93226);
          box-shadow: 0 6px 18px rgba(233, 69, 96, 0.45);
          transform: translateY(-1px);
        }

        .btn-delete:active {
          transform: translateY(0);
        }
      `}</style>
    </Modal>
  );
};

export default DeleteConfirmModal;
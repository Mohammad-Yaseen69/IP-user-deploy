import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Row,
  Col,
} from "reactstrap";
import { useTranslation } from "react-i18next";

const ViewDetailModal = ({ isOpen, toggle, item }) => {
  const { t } = useTranslation();

  if (!item) return null;

  // Dummy static data for display (replace with real item fields later)
  const data = {
    name: item?.name || "Ahmed Khan",
    phone: item?.phone || "+92 300 1234567",
    email: item?.email || "ahmed.khan@example.com",
    role: item?.role || "Manager",
    status: item?.status || "Active",
    createdAt: item?.createdAt || "2024-11-15 09:30 AM",
    agentId: item?.agentId || "AGT-00421",
    address: item?.address || "Block 7, Gulshan-e-Iqbal, Karachi",
    department: item?.department || "Operations",
    assignedTo: item?.assignedTo || "Head Office",
    notes: item?.notes || "Senior delegate with 5 years of experience.",
  };

  const statusColor =
    data.status?.toLowerCase() === "active"
      ? "success"
      : data.status?.toLowerCase() === "inactive"
      ? "danger"
      : "warning";

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg" className="delegate-modal">
      <ModalHeader toggle={toggle} className="delegate-modal-header">
        <div className="modal-title-wrap">
          <div className="avatar-circle">
            {data.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h5 className="modal-name">{data.name}</h5>
            <span className="modal-id">ID: {data.agentId}</span>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="delegate-modal-body">
        <Row className="detail-row">
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Phone")}</span>
              <span className="detail-value">{data.phone}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Email")}</span>
              <span className="detail-value">{data.email}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Role")}</span>
              <span className="detail-value">{data.role}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Department")}</span>
              <span className="detail-value">{data.department}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Assigned To")}</span>
              <span className="detail-value">{data.assignedTo}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Status")}</span>
              <span className="detail-value">
                <Badge color={statusColor} pill className="status-badge">
                  {t(data.status)}
                </Badge>
              </span>
            </div>
          </Col>
          <Col xs={12}>
            <div className="detail-card">
              <span className="detail-label">{t("Address")}</span>
              <span className="detail-value">{data.address}</span>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-card">
              <span className="detail-label">{t("Created At")}</span>
              <span className="detail-value">{data.createdAt}</span>
            </div>
          </Col>
          <Col xs={12}>
            <div className="detail-card notes-card">
              <span className="detail-label">{t("Notes")}</span>
              <span className="detail-value notes-value">{data.notes}</span>
            </div>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter className="delegate-modal-footer">
        <Button color="secondary" outline onClick={toggle}>
          {t("Close")}
        </Button>
      </ModalFooter>

      
    </Modal>
  );
};

export default ViewDetailModal;
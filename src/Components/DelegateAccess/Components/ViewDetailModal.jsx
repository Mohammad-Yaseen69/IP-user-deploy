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
import styles from "../styles/ViewDetailModal.module.css";

const ViewDetailModal = ({ isOpen, toggle, item, isRole }) => {
  const { t } = useTranslation();

  if (!item) return null;

  const DetailItem = ({ label, value }) => (
    <Col xs={12} md={6} className="mb-3">
      <div className={styles.detailCard}>
        <span className={styles.detailLabel}>{t(label)}</span>
        <span className={styles.detailValue}>{value || "—"}</span>
      </div>
    </Col>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle} className="border-0">
        <div className="d-flex align-items-center">
          <div className={styles.avatarCircle}>
            {(isRole ? item.title : item.first_name)?.charAt(0).toUpperCase()}
          </div>
          <div className="ms-3">
            <h5 className="mb-0 fw-bold">
              {isRole ? item.title : `${item.first_name} ${item.last_name}`}
            </h5>
            <small className="text-muted">
              {t("ID:")}
              {item._id}
            </small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="py-4">
        <Row>
          {isRole ? (
            <>
              <DetailItem label="Title" value={item.title} />
              <DetailItem label="Role Type" value={item.roleType} />
              <DetailItem label="Required OTPs" value={item.requiredOtps} />
              <DetailItem
                label="Created At"
                value={new Date(item.createdAt).toLocaleString()}
              />
              <Col xs={12} className="mb-3">
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>{t("Description")}</span>
                  <span className={styles.detailValue}>{item.description}</span>
                </div>
              </Col>
            </>
          ) : (
            <>
              <DetailItem label="Email" value={item.email} />
              <DetailItem label="Phone" value={item.phone} />
              <DetailItem label="Role" value={item.role?.title || item.role} />
              <DetailItem
                label="Status"
                value={
                  <Badge
                    color={item.status === "active" ? "success" : "warning"}
                    pill
                  >
                    {item.status}
                  </Badge>
                }
              />
              <DetailItem label="Country" value={item.country} />
              <DetailItem
                label="Created At"
                value={new Date(item.createdAt).toLocaleString()}
              />
              <Col xs={12} md={6} className="mb-3">
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>
                    {t("Verifications")}
                  </span>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {item.email_verification && (
                      <Badge color="info">{t("Email")}</Badge>
                    )}
                    {item.sms_verification && (
                      <Badge color="info">{t("SMS")}</Badge>
                    )}
                    {item.whatsapp_verification && (
                      <Badge color="info">{t("WhatsApp")}</Badge>
                    )}
                  </div>
                </div>
              </Col>
            </>
          )}

          <Col xs={12} className="mt-2">
            <div className={styles.permissionsSection}>
              <span className={styles.detailLabel}>{t("Permissions")}</span>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {item.permissions?.length > 0 ? (
                  item.permissions.map((p, i) => (
                    <Badge key={i} color="light" className="text-dark border">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted small">
                    {t("No permissions assigned")}
                  </span>
                )}
              </div>
            </div>
          </Col>

          {item.deniedPermissions?.length > 0 && (
            <Col xs={12} className="mt-3">
              <div className={styles.permissionsSection}>
                <span className={`${styles.detailLabel} text-danger`}>
                  {t("Denied Permissions")}
                </span>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {item.deniedPermissions.map((p, i) => (
                    <Badge key={i} color="danger" outline>
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </Col>
          )}
        </Row>
      </ModalBody>

      <ModalFooter className="border-0">
        <Button color="secondary" outline onClick={toggle} className="px-4">
          {t("Close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewDetailModal;

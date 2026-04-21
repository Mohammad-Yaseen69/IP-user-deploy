import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { CheckCircle, XCircle, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";

const KYCModal = ({ showModal, setShowModal, KYCComments, KYCStatus }) => {
    const { t } = useTranslation();

    const modalStyle = {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
    };

    const headerStyle = {
        backgroundColor: "#007bff",
        color: "#fff",
        borderBottom: "none",
    };

    const headingText = {
        faceMatching: "Face Matching",
        poa: "Proof of Address",
        profileCheck: "Profile Check",
        livenessCheck: "Liveness Check",
        docCheck: "Document Check",
    };

    const replacePoaWithPOA = (description) => {
        return description?.replace(/PoA/g, "Proof of Address");
    };

    return (
        <Modal
            isOpen={showModal}
            toggle={() => setShowModal?.(!showModal)}
            style={{ ...modalStyle, minWidth: "60wv" }}
        >
            <ModalHeader style={headerStyle}>
                {t?.("Verification Status")}
            </ModalHeader>

            <ModalBody>
                {Object.keys(KYCStatus ?? {})?.map((headingKey) => (
                    <div key={headingKey}>
                        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                            <span
                                style={{
                                    color:
                                        KYCStatus?.[headingKey] === "approved"
                                            ? "#28a745"
                                            : KYCStatus?.[headingKey] === "declined"
                                                ? "#dc3545"
                                                : "#007bff",
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    marginRight: "10px",
                                }}
                            >
                                {KYCStatus?.[headingKey] === "approved" ? (
                                    <CheckCircle size={18} />
                                ) : KYCStatus?.[headingKey] === "declined" ? (
                                    <XCircle size={18} />
                                ) : (
                                    <HelpCircle size={18} />
                                )}
                            </span>

                            <h6 style={{ marginBottom: 0 }}>
                                {headingText?.[headingKey]}
                            </h6>
                        </div>

                        {KYCComments?.[headingKey]?.map((comment, index) => (
                            <div key={index} style={{ marginLeft: "34px", marginBottom: "3px" }}>
                                <span
                                    style={{
                                        color:
                                            comment?.status === "approved"
                                                ? "#28a745"
                                                : KYCStatus?.[headingKey] === "declined"
                                                    ? "#dc3545"
                                                    : "#007bff",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {comment?.name}
                                </span>

                                <div style={{ display: "flex", alignItems: "center", marginTop: "5px", marginLeft: "-5px" }}>
                                    <span style={{ color: "#6c757d", fontSize: "12px", marginRight: "5px" }}>
                                        <i className="icon icon-circle" />
                                    </span>

                                    <p style={{ fontSize: "14px", marginBottom: 0 }}>
                                        {replacePoaWithPOA(comment?.description)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </ModalBody>
        </Modal>
    );
};

export default KYCModal;
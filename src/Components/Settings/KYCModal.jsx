import { CheckCircle, HelpCircle, XCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const KYCModal = ({ showModal, setShowModal, KYCComments, KYCStatus }) => {
    const { t } = useTranslation()

    const modalStyle = {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
    };

    const headerStyle = {
        backgroundColor: "#4D28B4",
        color: "#fff",
        borderBottom: "none",
    };

    const headingText = {
        ipAnalysis: "IP Analysis",
        faceMatching: "Face Matching",
        poa: "Proof of Address",
        profileCheck: "Profile Check",
        livenessCheck: "Liveness Check",
        docCheck: "Document Check",
        watchlists: "Watchlists",
    };

    const replacePoaWithPOA = (description) => {
        return description?.replace(/PoA/g, "Proof of Address");
    };

    const isNormalFormat = (item) => {
        return item && typeof item === "object" && "name" in item && "description" in item;
    };

    const isDiditFormat = (item) => {
        return item && typeof item === "object" && ("node_id" in item || "feature" in item || "risk" in item);
    };

    const renderNormalComments = (comments, sectionStatus) => {
        return comments.map((comment, index) => (
            <div key={index} style={{ marginLeft: "34px", marginBottom: "6px" }}>
                <span
                    style={{
                        color:
                            comment?.status === "approved"
                                ? "#28a745"
                                : comment?.status === "declined"
                                    ? "#dc3545"
                                    : "#007bff",
                        textTransform: "capitalize",
                        fontWeight: "500",
                        fontSize: "13px",
                    }}
                >
                    {comment?.name}
                </span>
                <div style={{ display: "flex", alignItems: "flex-start", marginTop: "3px" }}>
                    <span style={{ color: "#6c757d", fontSize: "12px", marginRight: "5px", marginTop: "2px" }}>
                        <i className="icon icon-circle" />
                    </span>
                    <p style={{ fontSize: "13px", marginBottom: 0, color: "#555" }}>
                        {replacePoaWithPOA(comment?.description)}
                    </p>
                </div>
            </div>
        ));
    };

    const renderDiditComments = (comments, headingKey) => {
        return comments.map((item, index) => {
            if (item?.warnings && item.warnings.length > 0) {
                return item.warnings.map((warning, wIdx) => (
                    <div key={`${index}-w-${wIdx}`} style={{ marginLeft: "34px", marginBottom: "6px" }}>
                        <span style={{ color: "#dc3545", fontWeight: "500", fontSize: "13px", textTransform: "capitalize" }}>
                            {warning?.short_description || warning?.risk}
                        </span>
                        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "3px" }}>
                            <span style={{ color: "#6c757d", fontSize: "12px", marginRight: "5px", marginTop: "2px" }}>
                                <i className="icon icon-circle" />
                            </span>
                            <p style={{ fontSize: "13px", marginBottom: 0, color: "#555" }}>
                                {replacePoaWithPOA(warning?.long_description)}
                            </p>
                        </div>
                    </div>
                ));
            }

            if (item?.short_description || item?.risk) {
                return (
                    <div key={index} style={{ marginLeft: "34px", marginBottom: "6px" }}>
                        <span
                            style={{
                                color: item?.log_type === "warning" ? "#ffc107" : "#dc3545",
                                fontWeight: "500",
                                fontSize: "13px",
                                textTransform: "capitalize",
                            }}
                        >
                            {item?.short_description || item?.risk}
                        </span>
                        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "3px" }}>
                            <span style={{ color: "#6c757d", fontSize: "12px", marginRight: "5px", marginTop: "2px" }}>
                                <i className="icon icon-circle" />
                            </span>
                            <p style={{ fontSize: "13px", marginBottom: 0, color: "#555" }}>
                                {replacePoaWithPOA(item?.long_description)}
                            </p>
                        </div>
                    </div>
                );
            }

            if ("score" in item || "method" in item) {
                return (
                    <div key={index} style={{ marginLeft: "34px", marginBottom: "6px" }}>
                        {item?.score && (
                            <span style={{ color: "#28a745", fontSize: "13px", fontWeight: "500" }}>
                                Score: {item.score}%
                            </span>
                        )}
                        {item?.method && (
                            <p style={{ fontSize: "13px", color: "#555", marginBottom: 0 }}>
                                Method: {item.method}
                            </p>
                        )}
                    </div>
                );
            }

            if (item?.ip_address) {
                return (
                    <div key={index} style={{ marginLeft: "34px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>
                            IP: {item.ip_address} | {item.ip_city}, {item.ip_country}
                        </span>
                        {item?.is_vpn_or_tor && (
                            <p style={{ fontSize: "13px", color: "#dc3545", marginBottom: 0 }}>
                                {t("⚠ VPN/TOR detected")}
                            </p>
                        )}
                    </div>
                );
            }

            return null;
        });
    };

    const renderComments = (comments, headingKey, sectionStatus) => {
        if (!comments || comments.length === 0) return null;

        const firstItem = comments[0];

        if (isNormalFormat(firstItem)) {
            return renderNormalComments(comments, sectionStatus);
        }

        if (isDiditFormat(firstItem)) {
            return renderDiditComments(comments, headingKey);
        }

        return null;
    };

    return (
        <Modal
            isOpen={showModal}
            toggle={() => setShowModal?.(!showModal)}
            style={{ ...modalStyle, minWidth: "60vw" }}
        >
            <ModalHeader style={headerStyle}>
                {t("Verification Status")}
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
                                                : "#FFC107",
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
                            <h6 style={{ marginBottom: 0 }}>{t(headingText[headingKey])}</h6>
                        </div>
                        {KYCComments[headingKey]?.length > 0 &&
                            renderComments(KYCComments[headingKey], headingKey, KYCStatus[headingKey])
                        }
                    </div>
                ))}
            </ModalBody>
        </Modal>
    );
};

export default KYCModal;
import { useTranslation } from "react-i18next";
import { Info } from "react-feather";
import { Modal, ModalBody } from "reactstrap";

const CardMaintenanceModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalBody
        style={{
          padding: 0,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "18px 22px",
            background: "rgba(141, 64, 255, 0.08)",
            borderBottom: "1px solid rgba(141, 64, 255, 0.14)",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              boxShadow: "0 8px 18px rgba(141, 64, 255, 0.16)",
              flexShrink: 0,
            }}
          >
            <Info color="#8D40FF" size={22} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                color: "#8D40FF",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {t("Notice")}
            </span>
            <h4
              style={{
                margin: 0,
                color: "#1F1F1F",
                fontSize: "1.15rem",
                fontWeight: 800,
                lineHeight: 1.25,
              }}
            >
              {t("Card payment unavailable")}
            </h4>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "22px",
            textAlign: "left",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#4A4A4A",
              fontSize: "0.95rem",
              fontWeight: 600,
              lineHeight: 1.55,
            }}
          >
            {t(
              "Card processing is under maintenance at the moment, please use a different payment method.",
            )}
          </p>
          <p style={{ margin: 0, color: "#6B6B6B", fontSize: "0.9rem" }}>
            {t("Thank you")}
          </p>
          <button
            type="button"
            onClick={toggle}
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#8D40FF",
              color: "#fff",
              fontWeight: 800,
              padding: "12px 20px",
              marginTop: "4px",
              width: "100%",
              boxShadow: "0 10px 18px rgba(141, 64, 255, 0.22)",
            }}
          >
            {t("Choose another method")}
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CardMaintenanceModal;

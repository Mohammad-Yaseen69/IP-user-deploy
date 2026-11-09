import { useTranslation } from "react-i18next";
import InstaPayLoader from "../Loader";

const PaymentProgressOverlay = ({ show }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        background: "rgba(255, 255, 255, 0.92)",
      }}
    >
      <div style={{ width: "160px", height: "160px" }}>
        <InstaPayLoader fallback transparent fullHeight />
      </div>
      <h4 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>
        {t("Processing your payment...")}
      </h4>
    </div>
  );
};

export default PaymentProgressOverlay;

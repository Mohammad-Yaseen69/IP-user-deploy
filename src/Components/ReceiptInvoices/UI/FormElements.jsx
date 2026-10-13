import { Toggle as CardToggle } from "../../MyMasterCard/CardPurchased";
import styles from "../styles/index.module.scss";
import download from "../files/download.png";
import { useTranslation } from "react-i18next";

export const Field = ({ label, required, children, toggle }) => (
  <div
    style={{
      display: "flex",
      flexDirection: toggle ? "row" : "column",
      gap: 3,
      marginBottom: 7,
      justifyContent: toggle && "space-between",
      padding: toggle && "12px",
      borderRadius: toggle && "8px",
      background: toggle && "#F9F9F9",
      alignItems: toggle && "center",
    }}
  >
    <label style={{ fontWeight: 600, fontSize: 13, marginBottom: "0px" }}>
      {label} {required && <span style={{ color: "#e11d48" }}>*</span>}
    </label>
    {children}
  </div>
);

export const TextInput = ({
  value,
  onChange,
  placeholder,
  onBlur,
  styles,
  ...props
}) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      outline: "none",
      ...styles,
    }}
    onBlur={onBlur}
    {...props}
  />
);

export const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  style,
  ...props
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      outline: "none",
      resize: "vertical",
      ...style,
    }}
    {...props}
  />
);

export const Select = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  style,
}) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      outline: "none",
      ...style,
    }}
  >
    <option value="">{placeholder}</option>
    {options?.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export const Toggle = ({ checked, onChange }) => (
  <CardToggle checked={checked} onChange={onChange} />
);

export const ButtonForRequests = ({ isLoading, onClick, children, style }) => {
  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      style={{
        border: "none",
        outline: "none",
        padding: "10px 16px",
        borderRadius: 8,
        fontWeight: 700,
        background: "#5926F0",
        color: "#fff",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading && 0.5,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const DownloadButton = ({ url, style }) => {
  const { t } = useTranslation();
  return (
    <div style={style} className={styles.downloadBtn}>
      <img src={download} alt="" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ whiteSpace: "nowrap" }}
      >
        <span>{t("Download")}</span>
      </a>
    </div>
  );
};

export const InfoItem = ({ label, children, style }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.expandItem} style={style}>
      <span className={styles.itemHeading}> {t(label)}: </span>
      <div style={{ marginTop: "10px", width: "100%" }}>{children}</div>
    </div>
  );
};

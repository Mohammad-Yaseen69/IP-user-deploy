import React, { useContext, useMemo } from "react";
import styles from "../styles/index.module.scss";
import share from "../files/share.png";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import { toast } from "react-toastify";

const ShareableLink = ({ invoiceId, style, hideHeader = false }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  const shareLink = useMemo(() => {
    const base = window.location.origin || "https://my.insta-pay.ch";
    return `${base}/invoice/${userDetails?.username}/${invoiceId}`;
  }, [invoiceId]);
  return (
    <div style={style} className={styles.linkShare}>
      {!hideHeader && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={share} alt="" />
          <span style={{ fontSize: "14px" }}>{t("Invoice Link")}</span>
        </div>
      )}
      <div className={styles.link}>
        <input
          readOnly
          value={shareLink}
          style={{
            border: "none",
            outline: "none",
            fontSize: "12px",
            padding: "0px",
            width: "80%",
          }}
        />
        <svg
          onClick={() => {
            navigator.clipboard?.writeText(shareLink);
            toast.success("Link copied to clipboard.");
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <path
            d="M5.97089 8.55365C6.24164 8.91561 6.58706 9.2151 6.98373 9.43183C7.38041 9.64855 7.81905 9.77742 8.26991 9.80971C8.72077 9.842 9.1733 9.77695 9.59681 9.61897C10.0203 9.46099 10.4049 9.21377 10.7245 8.89409L12.6158 7.00275C13.19 6.40823 13.5077 5.61197 13.5006 4.78546C13.4934 3.95895 13.1619 3.16833 12.5774 2.58388C11.993 1.99943 11.2023 1.66792 10.3758 1.66073C9.54932 1.65355 8.75306 1.97128 8.15854 2.54548L7.07417 3.62355M8.49268 7.29275C8.22193 6.9308 7.87651 6.6313 7.47983 6.41458C7.08316 6.19786 6.64452 6.06898 6.19366 6.03669C5.7428 6.0044 5.29027 6.06945 4.86676 6.22744C4.44325 6.38542 4.05867 6.63263 3.7391 6.95231L1.84776 8.84366C1.27356 9.43817 0.955828 10.2344 0.96301 11.0609C0.970192 11.8875 1.30171 12.6781 1.88616 13.2625C2.47061 13.847 3.26123 14.1785 4.08774 14.1857C4.91424 14.1929 5.71051 13.8751 6.30502 13.3009L7.38309 12.2229"
            stroke="#333333"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default ShareableLink;

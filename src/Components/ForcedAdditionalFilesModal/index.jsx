import styles from "./styles.module.css";
import { ChevronRight, FileText, Type } from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import logout from "../../Layout/SidebarNew/files/logout_a.svg";
import LanguagePicker from "../LanguagePicker";
import { useTranslation } from "react-i18next";
import { useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import { clearAuthStorage, getLoginPath } from "../../utils/Functions/loginPage";

const MAX_LISTED = 4;

/**
 * Full-screen blocking modal shown when the admin has marked one or more
 * additional files / questions as required. Mirrors ProfileCompletionModal:
 * the user can only log out, change language, or go to the page where the
 * required information is submitted.
 */
const ForcedAdditionalFilesModal = ({ files = [], target }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearData } = useContext(UserContext);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const listed = files.slice(0, MAX_LISTED);
  const remaining = files.length - listed.length;

  return (
    <div className={styles.modal}>
      <div className={styles.modal_dialog}>
        <div className={styles.top_actions}>
          <div
            className={styles.action}
            onClick={() => {
              clearAuthStorage();
              clearData();
              navigate(getLoginPath());
            }}
          >
            <img
              src={logout}
              alt="logout"
              style={{ height: "22px", width: "22px", objectFit: "contain" }}
            />
            <span>{t("Logout")}</span>
          </div>
          <div className={styles.action}>
            <div className={styles.lang_box}>
              <LanguagePicker size={"16"} />
            </div>
            <span>{t("Language")}</span>
          </div>
        </div>

        <div className={styles.extra} />

        <div className={styles.content}>
          <svg
            className={styles.icon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 55 55"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M41.25 4.58333C46.3054 4.58333 50.4167 8.69458 50.4167 13.75V41.25C50.4167 45.5927 47.3829 49.2387 43.323 50.1804C42.1221 42.527 35.4846 36.6667 27.4999 36.6667C19.5153 36.6667 12.8778 42.527 11.6769 50.1804C7.61701 49.2386 4.58333 45.5927 4.58333 41.25V13.75C4.58333 8.69458 8.69458 4.58333 13.75 4.58333H41.25ZM16.2708 50.4167H38.7291C37.6749 45.1917 33.0457 41.2501 27.4999 41.2501C21.9541 41.2501 17.325 45.1917 16.2708 50.4167ZM41.25 0H13.75C6.15542 0 0 6.15542 0 13.75V41.25C0 48.8446 6.15542 55 13.75 55H41.25C48.8446 55 55 48.8446 55 41.25V13.75C55 6.15542 48.8446 0 41.25 0ZM27.4998 34.3749C21.1817 34.3749 16.0415 29.2347 16.0415 22.9166C16.0415 16.5985 21.1817 11.4583 27.4998 11.4583C33.818 11.4583 38.9582 16.5985 38.9582 22.9166C38.9582 29.2347 33.818 34.3749 27.4998 34.3749ZM27.4998 16.0416C23.7094 16.0416 20.6248 19.1262 20.6248 22.9166C20.6248 26.707 23.7094 29.7916 27.4998 29.7916C31.2903 29.7916 34.3748 26.707 34.3748 22.9166C34.3748 19.1262 31.2903 16.0416 27.4998 16.0416Z"
              fill="white"
            />
          </svg>

          <h4 className={styles.title}>{t("Required information needed to continue")}</h4>
          <p className={styles.desc}>
            {t(
              "The administrator requires the following information before you can continue. Please provide it to regain full access.",
            )}
          </p>

          <div className={styles.list_label}>
            {t("Required items")} ({files.length})
          </div>
          <div className={styles.list}>
            {listed.map((item, idx) => (
              <div key={item._id || idx} className={styles.item}>
                <span className={styles.item_icon}>
                  {item.input_type === "text" ? <Type size={14} /> : <FileText size={14} />}
                </span>
                <span className={styles.item_title} title={item.document_type}>
                  {item.document_type || t("Additional Information")}
                </span>
              </div>
            ))}
          </div>
          {remaining > 0 && (
            <span className={styles.more}>
              +{remaining} {t("more")}
            </span>
          )}

          <div className={styles.btn_con}>
            <Link to={target} style={{ width: "100%", display: "block" }}>
              <button type="button" className={styles.btn}>
                {t("Provide Required Information")}
                <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcedAdditionalFilesModal;

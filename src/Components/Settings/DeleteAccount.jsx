import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input, Label } from "reactstrap";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import styles from "./styles/DeleteAccount.module.scss";
import { CaretDown, CheckCircleMedium } from "./Icons";

const PRE_CHECKS = [
  { label: "Wallet balance is zero", value: "EGP 0.00" },
  { label: "No open invoices", value: "0 open" },
  { label: "No scheduled payments", value: "0 scheduled" },
];

const LEAVE_REASONS = [
  "I no longer use InstaPay",
  "I have another InstaPay account",
  "Fees are too high",
  "I'm worried about privacy or security",
  "Something else",
];

const CONFIRM_WORD = "CLOSE";

const DeleteAccount = () => {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate("");

  const { userDetails, authHeader } = useContext(UserContext);

  const check = confirmText.trim() === CONFIRM_WORD;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const deleteAccountHandler = async () => {
    axios
      .delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-account/${userDetails?._id}`, {
        headers: authHeader,
        data: { data: encryptData({ reason }) },
      })
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        handleLogout();
        // console.log(decrypted)
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        // console.log(decrypted)
      });
  };
  const can = usePermission();
  const isEdit = can("settings.delete-account.delete");

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Close account")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("This permanently deletes your profile and stops all payments. It can't be undone.")}
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <h4 className={styles.cardTitle}>{t("Before you close")}</h4>
            <p className={styles.cardSubtitle}>{t("All checks need to pass.")}</p>
          </div>
          <span className={styles.pill}>{t("Ready")}</span>
        </div>
        <div className={styles.checks}>
          {PRE_CHECKS.map((item) => (
            <div key={item.label} className={styles.checkRow}>
              <CheckCircleMedium />
              <p className={styles.checkLabel}>{t(item.label)}</p>
              <p className={styles.checkValue}>{t(item.value)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.card} ${styles.cardDanger}`}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>{t("What happens next")}</h4>
        </div>
        <div className={styles.dangerBody}>
          <ul className={styles.bullets}>
            <li>{t("You'll be signed out everywhere and can't sign back in.")}</li>
            <li>
              {t("Your username @{{username}} is released after 90 days.", {
                username: userDetails?.username ?? "",
              })}
            </li>
            <li>{t("We keep transaction records for 10 years, as Swiss law requires.")}</li>
          </ul>

          <div className={styles.field}>
            <Label className={styles.label} for="close-reason">
              {t("Why are you leaving? (optional)")}
            </Label>
            <div className={`${styles.control} ${styles.withTrailingIcon}`}>
              <Input
                id="close-reason"
                type="select"
                className={reason ? "" : styles.placeholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="" disabled>
                  {t("Choose a reason")}
                </option>
                {LEAVE_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {t(item)}
                  </option>
                ))}
              </Input>
              <span className={styles.trailingIcon}>
                <CaretDown />
              </span>
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldConfirm}`}>
            <Label className={styles.label} for="close-confirm">
              {t("Type CLOSE to confirm")}
            </Label>
            <Input
              id="close-confirm"
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.buttonDestructive}
            disabled={!check || !isEdit}
            onClick={deleteAccountHandler}
          >
            {t("Close my account")}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeleteAccount;

import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import styles from "./styles/HowOthersFindYou.module.scss";
import { toast } from "react-toastify";
import Switch from "./Switch";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import CountryBasedPhone from "../PhoneInput/PhoneNumberBasedOnCountry.json";
import {
  AtSmall,
  CheckCircle,
  EnvelopeSimpleSmall,
  EyeSmall,
  Info,
  PhoneSmall,
  UserSmall,
} from "./Icons";
import { maskEmail, maskPhone } from "../../utils/Functions/maskContact";

const HowOthersFindYou = () => {
  const { t } = useTranslation();
  const { userDetails, authHeader, verifyToken } = useContext(UserContext);
  const [emailActive, setEmailActive] = useState(false);
  const [phoneActive, setPhoneActive] = useState(false);
  const [nameActive, setNameActive] = useState(true);
  const [usernameActive, setUsernameActive] = useState(true);
  const can = usePermission();
  const isEdit = can("settings.how-others-find-you.update");

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // will be used later to get info
  useEffect(() => {
    if (userDetails && !editMode) {
      setPhoneActive(userDetails?.isPhoneSearch ?? false);
      setEmailActive(userDetails?.isEmailSearch ?? false);
      setNameActive(userDetails?.isNameSearch ?? true);
      setUsernameActive(userDetails?.isUsernameSearch ?? true);
    }
  }, [userDetails]);

  const updateHandler = async () => {
    setIsSaving(true);

    try {
      const data = {
        email: emailActive,
        phone: phoneActive,
        account_id: userDetails?._id,
      };

      const encrypted = encryptData(data);

      const response = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/set-search-users-checks`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const decrypted = await decryptData(response.data.data);

      setSaved(true);

      verifyToken();

      setTimeout(() => {
        setSaved(false);
        setEditMode(false);
      }, 2000);
    } catch (error) {
      toast.error("Cannot disable both.");
    } finally {
      setIsSaving(false);
    }
  };

  const isIndividualAccount = userDetails?.account_type?.toLowerCase() === "individual";
  const displayName = isIndividualAccount
    ? `${userDetails?.user?.first_name ?? ""} ${userDetails?.user?.last_name ?? ""}`.trim()
    : (userDetails?.company?.company_name ?? "");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const photo = userDetails?.profileImage?.url;
  const dialCode = CountryBasedPhone?.[userDetails?.country_iso_code]?.dial_code;
  const username = userDetails?.username ? `@${userDetails.username}` : "";

  const searchableBy = [
    emailActive && t("Email"),
    phoneActive && t("Phone"),
    nameActive && t("Name"),
    usernameActive && t("Username"),
  ].filter(Boolean);

  const rows = [
    userDetails?.email
      ? {
          key: "email",
          icon: <EnvelopeSimpleSmall />,
          title: t("Email address"),
          detail: maskEmail(userDetails.email),
          toggle: (
            <Switch
              checked={emailActive}
              callback={(e) => setEmailActive(!emailActive)}
              disabled={!editMode || isSaving}
            />
          ),
        }
      : null,
    userDetails?.phone
      ? {
          key: "phone",
          icon: <PhoneSmall />,
          title: t("Phone number"),
          detail: maskPhone(userDetails.phone, dialCode),
          toggle: (
            <Switch
              checked={phoneActive}
              callback={(e) => setPhoneActive(e.target.checked)}
              disabled={!editMode || isSaving}
            />
          ),
        }
      : null,
    {
      key: "name",
      icon: <UserSmall />,
      title: t("Full name"),
      detail: displayName,
      toggle: <Switch checked={nameActive} disabled />,
    },
    {
      key: "username",
      icon: <AtSmall />,
      title: t("Username"),
      detail: username,
      toggle: <Switch checked={usernameActive} disabled />,
    },
  ].filter(Boolean);

  return (
    <div className={styles.container} id="two_factor">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("How people find you")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("Choose what people can search to find and pay you.")}
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>
            <EyeSmall />
            {t("What others see in search")}
          </p>
          <div className={styles.result}>
            <span className={styles.avatar}>{photo ? <img src={photo} alt="" /> : initials}</span>
            <div className={styles.resultText}>
              <p className={styles.resultName}>{displayName}</p>
              {username && <p className={styles.resultUsername}>{username}</p>}
              {searchableBy.length > 0 && (
                <div className={styles.pills}>
                  {searchableBy.map((label) => (
                    <span key={label} className={styles.pill}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rows}>
          {rows.map((row) => (
            <div key={row.key} className={styles.row}>
              <span className={styles.tile}>{row.icon}</span>
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{row.title}</p>
                {row.detail && <p className={styles.rowSubtitle}>{row.detail}</p>}
              </div>
              {row.toggle}
            </div>
          ))}
        </div>

        <div className={styles.cardFooter}>
          {editMode ? (
            <>
              {saved ? (
                <button type="button" className={`${styles.button} ${styles.buttonSuccess}`}>
                  <CheckCircle color="#047857" />
                  {t("Updated Successfully!")}
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={isSaving}
                  onClick={updateHandler}
                >
                  {isSaving ? t("Updating") : t("Update")}
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={!isEdit}
              onClick={() => setEditMode(true)}
            >
              {t("Edit")}
            </button>
          )}
        </div>
      </section>

      <div className={styles.note}>
        <Info />
        <p>{t("Email or phone must stay on. People can still pay you with your payment link.")}</p>
      </div>
    </div>
  );
};

export default HowOthersFindYou;

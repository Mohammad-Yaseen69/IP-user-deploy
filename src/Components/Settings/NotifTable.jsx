import React, { useContext, useEffect, useState } from "react";
import styles from "./styles/Notifications.module.scss";
import Switch from "./Switch";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { BellSmall, CheckCircle } from "./Icons";
import { toast } from "react-toastify";
import InstaPayLoader from "../Loader";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import {
  isPushSupported,
  getPushPermissionState,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "../../Services/PushNotificationService";

const NotifTable = () => {
  const { t, i18n } = useTranslation();
  const { userDetails, authHeader, verifyToken } = useContext(UserContext);
  const [rpEmail, setRpEmail] = useState(false);
  const [bpEmail, setBpEmail] = useState(false);
  const [prEmail, setPrEmail] = useState(false);
  const [afEmail, setAfEmail] = useState(false);
  const [rqEmail, setRqEmail] = useState(false);
  const [sqEmail, setSqEmail] = useState(false);
  const [refEmail, setRefEmail] = useState(false);
  const [rpPhone, setRpPhone] = useState(false);
  const [bpPhone, setBpPhone] = useState(false);
  const [prPhone, setPrPhone] = useState(false);
  const [afPhone, setAfPhone] = useState(false);
  const [rqPhone, setRqPhone] = useState(false);
  const [sqPhone, setSqPhone] = useState(false);
  const [refPhone, setRefPhone] = useState(false);
  const [rpPush, setRpPush] = useState(false);
  const [bpPush, setBpPush] = useState(false);
  const [prPush, setPrPush] = useState(false);
  const [afPush, setAfPush] = useState(false);
  const [rqPush, setRqPush] = useState(false);
  const [sqPush, setSqPush] = useState(false);
  const [refPush, setRefPush] = useState(false);
  const [rpTelegram, setRpTelegram] = useState(false);
  const [bpTelegram, setBpTelegram] = useState(false);
  const [prTelegram, setPrTelegram] = useState(false);
  const [afTelegram, setAfTelegram] = useState(false);
  const [rqTelegram, setRqTelegram] = useState(false);
  const [sqTelegram, setSqTelegram] = useState(false);
  const [refTelegram, setRefTelegram] = useState(false);
  const can = usePermission();
  const isEdit = can("settings.notifications.update");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getNotificationsDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/notifications-status/get-notifications/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const data = await decryptData(res.data.data);
        const n = data?.notifications;
        // console.log(n)
        setRpEmail(n?.payments?.email ?? false);
        setBpEmail(n?.bulk_payments?.email ?? false);
        setPrEmail(n?.payment_requests?.email ?? false);
        setAfEmail(n?.add_funds?.email ?? false);
        setRqEmail(n?.quotation?.email ?? false);
        setSqEmail(n?.login?.email ?? false);
        setRefEmail(n?.referrals?.email ?? false);
        setRpPhone(n?.payments?.phone ?? false);
        setBpPhone(n?.bulk_payments?.phone ?? false);
        setPrPhone(n?.payment_requests?.phone ?? false);
        setAfPhone(n?.add_funds?.phone ?? false);
        setRqPhone(n?.quotation?.phone ?? false);
        setSqPhone(n?.login?.phone ?? false);
        setRefPhone(n?.referrals?.phone ?? false);
        setRpPush(n?.payments?.instagram ?? false);
        setBpPush(n?.bulk_payments?.instagram ?? false);
        setPrPush(n?.payment_requests?.instagram ?? false);
        setAfPush(n?.add_funds?.instagram ?? false);
        setRqPush(n?.quotation?.instagram ?? false);
        setSqPush(n?.login?.instagram ?? false);
        setRefPush(n?.referrals?.instagram ?? false);
        setRpTelegram(n?.payments?.telegram ?? false);
        setBpTelegram(n?.bulk_payments?.telegram ?? false);
        setPrTelegram(n?.payment_requests?.telegram ?? false);
        setAfTelegram(n?.add_funds?.telegram ?? false);
        setRqTelegram(n?.quotation?.telegram ?? false);
        setSqTelegram(n?.login?.telegram ?? false);
        setRefTelegram(n?.referrals?.telegram ?? false);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    if (userDetails) {
      getNotificationsDetails();
    }
  }, [userDetails]);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkPush = async () => {
      if (!isPushSupported()) {
        setIsSupported(false);
        return;
      }
      const sub = await getExistingSubscription();
      const perm = getPushPermissionState();
      setPushEnabled(Boolean(sub) && perm === "granted");
    };
    checkPush();
  }, []);

  const handlePushSwitchToggle = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(authHeader);
        setPushEnabled(false);
        toast.info(t("Browser push alerts disabled on this device."));
      } else {
        const res = await subscribeToPush(userDetails?._id, authHeader);
        if (res.success) {
          setPushEnabled(true);
          toast.success(t("Browser push alerts enabled successfully!"));
        } else {
          toast.error(res.error || t("Failed to enable push alerts."));
        }
      }
    } catch (e) {
      toast.error(e.message || t("An error occurred."));
    } finally {
      setPushLoading(false);
    }
  };

  const getPushStatusText = () => {
    if (!isSupported) return t("Not supported by this browser");
    const perm = getPushPermissionState();
    if (perm === "denied") return t("Blocked in browser settings");
    if (pushEnabled) return t("Active - receiving alerts on this device");
    return t("Disabled - click to enable alerts on this device");
  };

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const shownToggles = [
    rpEmail,
    rpPush,
    rpPhone,
    rpTelegram,
    prEmail,
    prPush,
    prPhone,
    prTelegram,
    afEmail,
    afPush,
    afPhone,
    afTelegram,
    rqEmail,
    rqPush,
    rqPhone,
    rqTelegram,
    refEmail,
    refPush,
    refPhone,
    refTelegram,
    sqEmail,
    sqPush,
    sqPhone,
    sqTelegram,
  ];
  const alertsOn = shownToggles.filter(Boolean).length;

  const updateNotifications = async () => {
    setIsSaving(true);

    const payload = {
      payments: {
        email: rpEmail,
        phone: rpPhone,
        instagram: rpPush,
        telegram: rpTelegram,
      },
      bulk_payments: {
        email: bpEmail,
        phone: bpPhone,
        instagram: bpPush,
        telegram: bpTelegram,
      },
      payment_requests: {
        email: prEmail,
        phone: prPhone,
        instagram: prPush,
        telegram: prTelegram,
      },
      add_funds: {
        email: afEmail,
        phone: afPhone,
        instagram: afPush,
        telegram: afTelegram,
      },
      quotation: {
        email: rqEmail,
        phone: rqPhone,
        instagram: rqPush,
        telegram: rqTelegram,
      },
      login: {
        email: sqEmail,
        phone: sqPhone,
        instagram: sqPush,
        telegram: sqTelegram,
      },
      referrals: {
        email: refEmail,
        phone: refPhone,
        instagram: refPush,
        telegram: refTelegram,
      },
    };
    const enc = encryptData(payload);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/notifications-status/set-notifications/${userDetails?._id}`,
        {
          data: enc,
        },
        {
          headers: authHeader,
        },
      );

      const decrypted = decryptData(res.data.data);
      setSaved(true);
      verifyToken();
      setTimeout(() => {
        setSaved(false);
        setEditMode(false);
      }, 2000);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div style={{ height: "400px", width: "400px", margin: "0 auto" }}>
          <InstaPayLoader />
        </div>
      ) : (
        <>
          <section className={styles.card}>
            <div className={styles.pushRow}>
              <span className={styles.tile}>
                <BellSmall />
              </span>
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{t("Browser Push Alerts")}</p>
                <span
                  className={`${styles.rowSubtitle} ${pushEnabled ? styles.rowSubtitleOn : ""}`}
                >
                  {getPushStatusText()}
                </span>
              </div>
              <Switch
                checked={pushEnabled}
                callback={handlePushSwitchToggle}
                disabled={pushLoading || !isSupported}
              />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.toolbar}>
              <p className={styles.count}>
                {alertsOn} {t("of")} {shownToggles.length} {t("alerts on")}
              </p>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("Activity")}</th>
                    <th>{t("Email")}</th>
                    <th>
                      {window.innerWidth < 1000 && i18n.language === "en"
                        ? "Insta"
                        : t("Instagram")}
                    </th>
                    <th>{t("SMS")}</th>
                    <th>{t("Telegram")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Payments")}</span>
                      <span className={styles.activityHint}>{t("Money you send and receive")}</span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={rpEmail}
                        callback={() => setRpEmail(!rpEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={rpPush}
                        callback={() => setRpPush(!rpPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={rpPhone}
                        callback={() => setRpPhone(!rpPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={rpTelegram}
                        callback={() => setRpTelegram(!rpTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                  {/* <tr>
                        <td data-label="Activity">{t("Bulk Payments")}</td>
                        <td data-label={t("Email")}>
                            <Switch checked={bpEmail} callback={() => setBpEmail(!bpEmail)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("Instagram")}>
                            <Switch checked={bpPush} callback={() => setBpPush(!bpPush)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("Telegram")}>
                            <Switch checked={bpTelegram} callback={() => setBpTelegram(!bpTelegram)} disabled={!editMode || isSaving} />
                        </td>
                        <td data-label={t("SMS")}>
                            <Switch checked={bpPhone} callback={() => setBpPhone(!bpPhone)} disabled={!editMode || isSaving} />
                        </td>
                    </tr> */}
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Payment Requests")}</span>
                      <span className={styles.activityHint}>
                        {t("Requests you send and receive")}
                      </span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={prEmail}
                        callback={() => setPrEmail(!prEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={prPush}
                        callback={() => setPrPush(!prPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={prPhone}
                        callback={() => setPrPhone(!prPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={prTelegram}
                        callback={() => setPrTelegram(!prTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Add Funds")}</span>
                      <span className={styles.activityHint}>{t("Top-ups to your wallet")}</span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={afEmail}
                        callback={() => setAfEmail(!afEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={afPush}
                        callback={() => setAfPush(!afPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={afPhone}
                        callback={() => setAfPhone(!afPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={afTelegram}
                        callback={() => setAfTelegram(!afTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Quotations")}</span>
                      <span className={styles.activityHint}>
                        {t("Quotes you send and receive")}
                      </span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={rqEmail}
                        callback={() => setRqEmail(!rqEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={rqPush}
                        callback={() => setRqPush(!rqPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={rqPhone}
                        callback={() => setRqPhone(!rqPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={rqTelegram}
                        callback={() => setRqTelegram(!rqTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Referrals")}</span>
                      <span className={styles.activityHint}>
                        {t("When someone joins with your link")}
                      </span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={refEmail}
                        callback={() => setRefEmail(!refEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={refPush}
                        callback={() => setRefPush(!refPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={refPhone}
                        callback={() => setRefPhone(!refPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={refTelegram}
                        callback={() => setRefTelegram(!refTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Activity">
                      <span className={styles.activity}>{t("Login")}</span>
                      <span className={styles.activityHint}>
                        {t("New sign-ins to your account")}
                      </span>
                    </td>
                    <td data-label={t("Email")}>
                      <Switch
                        checked={sqEmail}
                        callback={() => setSqEmail(!sqEmail)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Instagram")}>
                      <Switch
                        checked={sqPush}
                        callback={() => setSqPush(!sqPush)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("SMS")}>
                      <Switch
                        checked={sqPhone}
                        callback={() => setSqPhone(!sqPhone)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                    <td data-label={t("Telegram")}>
                      <Switch
                        checked={sqTelegram}
                        callback={() => setSqTelegram(!sqTelegram)}
                        disabled={!editMode || isSaving}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
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
                      onClick={updateNotifications}
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
        </>
      )}
    </>
  );
};

export default NotifTable;

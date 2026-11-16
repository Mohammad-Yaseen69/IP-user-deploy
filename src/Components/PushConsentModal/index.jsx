import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Shield, Zap } from "react-feather";
import { toast } from "react-toastify";
import styles from "./PushConsentModal.module.css";
import { subscribeToPush } from "../../Services/PushNotificationService";

const PushConsentModal = ({ isOpen, onClose, accountId, authHeader, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await subscribeToPush(accountId, authHeader);
      if (result.success) {
        toast.success(t("Push notifications enabled successfully!"));
        if (onSuccess) onSuccess();
        onClose(true);
      } else {
        toast.error(result.error || t("Could not enable notifications."));
        onClose(false);
      }
    } catch (e) {
      toast.error(e.message || t("Failed to enable notifications."));
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("instapay_push_prompt_dismissed", String(Date.now()));
    onClose(false);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.iconWrapper}>
          <Bell size={32} />
        </div>

        <h3 className={styles.title}>{t("Stay Updated with Instant Alerts")}</h3>

        <p className={styles.description}>
          {t(
            "Enable notifications to receive real-time updates for money transfers, payment requests, wallet deposits, and security alerts.",
          )}
        </p>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <Zap size={16} color="#5926f0" />
            <span>{t("Instant payment and transfer notifications")}</span>
          </div>
          <div className={styles.benefitItem}>
            <Shield size={16} color="#5926f0" />
            <span>{t("Immediate security and login verification")}</span>
          </div>
          <div className={styles.benefitItem}>
            <Bell size={16} color="#5926f0" />
            <span>{t("Alerts delivered even when InstaPay is closed")}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.enableBtn}
            onClick={handleEnable}
            disabled={loading}
          >
            <Bell size={16} />
            <span>{loading ? t("Enabling...") : t("Enable Notifications")}</span>
          </button>

          <button
            type="button"
            className={styles.dismissBtn}
            onClick={handleDismiss}
            disabled={loading}
          >
            {t("Maybe Later")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushConsentModal;

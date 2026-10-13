import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import styles from "./AddressTooLongBanner.module.css";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError";
import { UserContext } from "../../../../Context/UserContext";
import { ADDRESS_LINE_MAX, getBeneficiaryAddress, getBeneficiaryName } from "./beneficiaryHelpers";

const AddressTooLongBanner = ({ beneficiary, onAddressSaved }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setProfileLockTime } = useContext(UserContext);
  const [address, setAddress] = useState(getBeneficiaryAddress(beneficiary));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAddress(getBeneficiaryAddress(beneficiary));
  }, [beneficiary]);

  const trimmed = address.trim();
  const addressError =
    trimmed.length > ADDRESS_LINE_MAX
      ? t("Keep this to {{max}} characters or fewer.", {
          max: ADDRESS_LINE_MAX,
        })
      : "";
  const canSave = !!trimmed && !addressError && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    const extras = {
      ...(beneficiary?.extras || {}),
      address: trimmed,
      beneficiaryAddress: trimmed,
    };

    try {
      await apiWrapper({
        endpoint: `/api/beneficiary/v2/${beneficiary._id}`,
        method: "PUT",
        payload: { address: trimmed, extras },
        isEncrypted: true,
        isDecrypted: true,
      });

      await onAddressSaved({ ...beneficiary, address: trimmed, extras });
      toast.success(t("Address updated."));
    } catch (error) {
      handlePaymentApiError({
        error,
        navigate,
        setProfileLockTime,
        fallback: t("We could not update the address. Please try again."),
        setError: (message) => toast.error(message),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.header}>
        <span className={styles.icon}>⚠</span>
        <div>
          <strong>{t("Address is too long for this transfer")}</strong>
          <p>
            {t(
              "Maximum length for beneficiary address is {{max}} characters. Shorten {{name}}'s address below to continue.",
              {
                max: ADDRESS_LINE_MAX,
                name: getBeneficiaryName(beneficiary),
              },
            )}
          </p>
        </div>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t("Address *")}</span>
          <input
            type="text"
            value={address}
            placeholder={t("Address only")}
            className={addressError ? styles.fieldError : ""}
            onChange={(event) => setAddress(event.target.value)}
          />
          {addressError ? (
            <span className={styles.errorText}>{addressError}</span>
          ) : (
            <small>
              {trimmed.length}/{ADDRESS_LINE_MAX}
            </small>
          )}
        </label>
        <button type="button" className={styles.saveBtn} disabled={!canSave} onClick={handleSave}>
          {saving ? t("Updating...") : t("Update")}
        </button>
      </div>
    </div>
  );
};

export default AddressTooLongBanner;

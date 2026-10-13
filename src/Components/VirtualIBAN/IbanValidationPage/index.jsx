import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { CheckCircle, Shield, XCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import InstaPayLoader from "../../Loader";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { asVirtualIban, formatVirtualIbanBankAddress } from "../utils/virtualIban";
import logo from "../../../assets/images/logo/logo.svg";
import styles from "./index.module.css";

const unwrapValidationResponse = (response) => response?.data ?? response;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMoney = (amount, currency) => {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) return "-";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

const DetailItem = ({ label, value, mono = false, wide = false }) => (
  <div className={`${styles.detailItem} ${wide ? styles.wide : ""}`}>
    <span>{label}</span>
    <strong className={mono ? styles.mono : ""}>{value || "-"}</strong>
  </div>
);

const Illustration = ({ valid }) => (
  <div
    className={`${styles.illustration} ${valid ? styles.validIllustration : styles.invalidIllustration}`}
    aria-hidden="true"
  >
    <div className={styles.illustrationRing}>
      {valid ? <CheckCircle size={84} /> : <XCircle size={84} />}
    </div>
    <div className={styles.illustrationBadge}>
      <Shield size={22} />
    </div>
  </div>
);

const LoadingState = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.loadingPanel}>
        <div className={styles.loaderBox}>
          <InstaPayLoader fallback transparent fullHeight />
        </div>
        <h1>{t("Verifying virtual IBAN")}</h1>
        <p>{t("Please wait while we confirm this virtual IBAN with InstaPay records.")}</p>
      </div>
    </main>
  );
};

const InvalidState = ({ ibanId }) => {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <section className={styles.resultShell}>
        <div className={styles.brandRow}>
          <img src={logo} alt="InstaPay" />
          <span>{t("Virtual IBAN verification")}</span>
        </div>
        <div className={styles.resultHero}>
          <Illustration valid={false} />
          <span className={`${styles.statusPill} ${styles.invalidPill}`}>{t("Not verified")}</span>
          <h1>{t("This virtual IBAN is not valid")}</h1>
          <p>
            {t(
              "We could not find an active InstaPay virtual IBAN for this verification link. Please check the link or request a fresh verification link from the account holder.",
            )}
          </p>
        </div>
        <div className={styles.noteBox}>
          <span>{t("Verification ID")}</span>
          <strong>{ibanId || "-"}</strong>
        </div>
      </section>
    </main>
  );
};

const ValidState = ({ iban, account }) => {
  const { t } = useTranslation();
  const bankAddress =
    formatVirtualIbanBankAddress(iban?.bank?.address) ||
    iban?.bank?.formattedAddress ||
    iban?.bank_address;
  const accountName = account?.company_name || iban?.account_holder_name || account?.username;

  return (
    <main className={styles.page}>
      <section className={styles.resultShell}>
        <div className={styles.brandRow}>
          <img src={logo} alt="InstaPay" />
          <span>{t("Virtual IBAN verification")}</span>
        </div>

        <div className={styles.resultHero}>
          <Illustration valid />
          <span className={`${styles.statusPill} ${styles.validPill}`}>{t("Verified")}</span>
          <h1>{t("This virtual IBAN is valid")}</h1>
          <p>
            {t(
              "This virtual IBAN is registered with InstaPay and the IBAN information below matches our records.",
            )}
          </p>
        </div>

        <div className={styles.summaryBar}>
          <div>
            <span>{t("Account holder")}</span>
            <strong>{iban?.account_holder_name || accountName || "-"}</strong>
          </div>
          <div>
            <span>{t("IBAN")}</span>
            <strong>{iban?.iban || "-"}</strong>
          </div>
          <div>
            <span>{t("Status")}</span>
            <strong>{iban?.status || "-"}</strong>
          </div>
        </div>

        {/*
                <div className={styles.detailsGrid}>
                    <section className={styles.detailSection}>
                        <h2>{t('Account information')}</h2>
                        <div className={styles.detailList}>
                            <DetailItem label={t('Account name')} value={accountName} />
                            <DetailItem label={t('Account type')} value={account?.account_type} />
                            <DetailItem label={t('Username')} value={account?.username} />
                            <DetailItem label={t('Timezone')} value={account?.timezone} />
                        </div>
                    </section>

                    <section className={styles.detailSection}>
                        <h2>{t('IBAN information')}</h2>
                        <div className={styles.detailList}>
                            <DetailItem label={t('IBAN')} value={iban?.iban} mono wide />
                            <DetailItem label={t('Virtual IBAN ID')} value={iban?.virtualIbanId} mono wide />
                            <DetailItem label={t('Wallet ID')} value={iban?.wallet_id} mono wide />
                            <DetailItem label={t('Balance')} value={formatMoney(iban?.balance, iban?.currency)} />
                            <DetailItem label={t('Created on')} value={formatDate(iban?.createdAt)} />
                        </div>
                    </section>

                    <section className={`${styles.detailSection} ${styles.fullWidth}`}>
                        <h2>{t('Bank information')}</h2>
                        <div className={styles.detailList}>
                            <DetailItem label={t('Bank name')} value={iban?.bank?.name} wide />
                            <DetailItem label={t('BIC')} value={iban?.bank?.bic} mono />
                            <DetailItem label={t('Bank country')} value={iban?.bank?.address?.country} />
                            <DetailItem label={t('Bank address')} value={bankAddress} wide />
                        </div>
                    </section>
                </div>
                */}
      </section>
    </main>
  );
};

const IbanValidationPage = () => {
  const { ibanId } = useParams();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["iban-validation", ibanId],
    queryFn: async () => {
      const response = await apiWrapper({
        endpoint: `/api/virtual-iban/validate/${ibanId}`,
        isPublic: true,
      });

      return unwrapValidationResponse(response);
    },
    enabled: Boolean(ibanId),
    retry: false,
  });

  const ibanData = useMemo(() => asVirtualIban(data?.iban), [data?.iban]);
  const account = data?.account || ibanData?.account;
  const isValid = Boolean(ibanData?._id && ibanData?.iban && account);

  if (isLoading || isFetching) return <LoadingState />;

  if (isError || !isValid) return <InvalidState ibanId={ibanId} />;

  return <ValidState iban={ibanData} account={account} />;
};

export default IbanValidationPage;

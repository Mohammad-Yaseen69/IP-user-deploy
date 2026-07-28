import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/support.module.css';
import TopRight from '../../topRight';

const Support = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Support")}</h1>
                    <p>{t("Need help? Contact the white-label platform operator directly.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.cardGrid}>
                    <div className={styles.supportCard}>
                        <h3 className={styles.cardTitle}>{t("Compliance & KYB Desk")}</h3>
                        <p className={styles.cardText}>
                            {t("Questions regarding client verification status, proof of address, or compliance queries.")}
                        </p>
                        <button className={styles.contactBtn}>{t("Contact Compliance")}</button>
                    </div>

                    <div className={styles.supportCard}>
                        <h3 className={styles.cardTitle}>{t("Payouts & Commission Queries")}</h3>
                        <p className={styles.cardText}>
                            {t("Get support with sub-agent splits, monthly payouts, or IBAN settlement.")}
                        </p>
                        <button className={styles.contactBtn}>{t("Contact Finance")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;

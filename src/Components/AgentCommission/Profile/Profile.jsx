import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/profile.module.css';
import TopRight from '../../topRight';

const Profile = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Agent Profile")}</h1>
                    <p>{t("View and edit your agent account details and IBAN for payouts.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.cardSection}>
                    <h3 className={styles.sectionTitle}>{t("Account Information")}</h3>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>{t("Agent Name")}</span>
                        <span className={styles.value}>JJ Elong</span>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>{t("Role / Type")}</span>
                        <span className={styles.value}>{t("Master Introducer")}</span>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>{t("Default Payout IBAN")}</span>
                        <span className={styles.value}>GB82 INSTA 0012 9988 7766 01</span>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>{t("Commission Rate")}</span>
                        <span className={styles.value}>70% Tier 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

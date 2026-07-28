import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/reports.module.css';
import TopRight from '../../topRight';
import { Download } from 'react-feather';

const Reports = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Reports & Analytics")}</h1>
                    <p>{t("Detailed performance reports, lead funnel analytics, and export tools.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.boxSection}>
                    <h3 className={styles.sectionTitle}>{t("Export Financial & Lead Reports")}</h3>
                    <div className={styles.exportButtons}>
                        <button className={styles.exportBtn}>
                            <Download size={16} />
                            <span>{t("Export Monthly Payouts (CSV)")}</span>
                        </button>
                        <button className={styles.exportBtn}>
                            <Download size={16} />
                            <span>{t("Export Lead Funnel (PDF)")}</span>
                        </button>
                        <button className={styles.exportBtn}>
                            <Download size={16} />
                            <span>{t("Export Sub-Agent Performance")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

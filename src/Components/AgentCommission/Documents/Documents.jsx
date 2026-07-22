import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/documents.module.css';
import TopRight from '../../topRight';

const Documents = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const missingDocsList = [
        {
            id: 1,
            client: "Anna Petrova",
            missingDoc: "Proof of address",
            status: "Docs pending"
        },
        {
            id: 2,
            client: "GreenBean Traders",
            missingDoc: "UBO eKYC ×2",
            status: "Docs pending"
        },
        {
            id: 3,
            client: "West Africa Agro Inputs",
            missingDoc: "Proof of address",
            status: "Docs pending"
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Documents")}</h1>
                    <p>{t("Review missing client documents and send reminders.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.noticeCard}>
                    <h3 className={styles.noticeTitle}>{t("Missing documents")}</h3>
                    <p className={styles.noticeSubtext}>
                        {t("3 leads are waiting on documents - nudge clients to keep onboarding moving.")}
                    </p>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableHeaderRow}>
                        <div>{t("CLIENT")}</div>
                        <div>{t("MISSING DOCUMENTS")}</div>
                        <div>{t("STATUS")}</div>
                        <div>{t("ACTION")}</div>
                    </div>

                    {missingDocsList.map((item) => (
                        <div key={item.id} className={styles.tableDataRow}>
                            <div className={styles.clientName}>{item.client}</div>
                            <div>
                                <span className={styles.docBadge}>{t(item.missingDoc)}</span>
                            </div>
                            <div>
                                <span className={styles.statusPending}>{t(item.status)}</span>
                            </div>
                            <div>
                                <button className={styles.reminderBtn}>
                                    {t("Send reminder")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Documents;

import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from '../styles/clients.module.css';
import TopRight from '../../topRight';
import { Search } from 'react-feather';

const Clients = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const clientsList = [
        {
            id: 1,
            name: "Regal Goldsmiths",
            avatarText: "RG",
            avatarColor: styles.avatarPurple,
            type: "Business",
            region: "Europe",
            iban: "GB82 INSTA 0012 3456 7890 01",
            status: "Active",
            volume: "€1.2M"
        },
        {
            id: 2,
            name: "Apex Platinum Co.",
            avatarText: "AP",
            avatarColor: styles.avatarBlue,
            type: "Business",
            region: "North America",
            iban: "GB82 INSTA 0012 3456 7890 02",
            status: "Active",
            volume: "€0.9M"
        },
        {
            id: 3,
            name: "Anna Petrova",
            avatarText: "AP",
            avatarColor: styles.avatarGreen,
            type: "Individual",
            region: "Europe",
            iban: "GB82 INSTA 0012 3456 7890 03",
            status: "Active",
            volume: "€140k"
        }
    ];

    const missingDocuments = [
        { id: 1, client: 'Anna Petrova', document: 'Proof of address' },
        { id: 2, client: 'GreenBean Traders', document: 'UBO eKYC ×2' },
        { id: 3, client: 'West Africa Agro Inputs', document: 'Proof of address' }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Clients")}</h1>
                    <p>{t("Your activated clients and the revenue they generate.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.controlsRow}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input type="text" placeholder={t("Search...")} className={styles.searchInput} />
                    </div>

                    <div className={styles.actionGroup}>
                        <button className={styles.secondaryBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            {t("Filter")}
                        </button>

                        <button className={styles.secondaryBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 5L6 10L1 5"></path>
                                <path d="M6 19V6"></path>
                                <path d="M13 19L18 14L23 19"></path>
                                <path d="M18 5V18"></path>
                            </svg>
                            {t("Sort By")}
                        </button>


                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableHeaderRow}>
                        <div>{t("CLIENT")}</div>
                        <div>{t("TYPE")}</div>
                        <div>{t("REGION")}</div>
                        <div>{t("IBAN")}</div>
                        <div>{t("STATUS")}</div>
                        <div>{t("TOTAL VOLUME")}</div>
                    </div>

                    {clientsList.map((c) => (
                        <div key={c.id} className={styles.tableDataRow}>
                            <div className={styles.clientCell}>
                                <div className={`${styles.avatar} ${c.avatarColor}`}>
                                    {c.avatarText}
                                </div>
                                <span className={styles.clientName}>{c.name}</span>
                            </div>
                            <div>{t(c.type)}</div>
                            <div>{c.region}</div>
                            <div>{c.iban}</div>
                            <div>
                                <span className={styles.badgeActive}>{t(c.status)}</span>
                            </div>
                            <div>{c.volume}</div>
                        </div>
                    ))}
                </div>

                <section className={styles.missingDocumentsCard} aria-labelledby="missing-documents-title">
                    <h2 id="missing-documents-title" className={styles.missingDocumentsTitle}>
                        {t('Missing documents')}
                    </h2>

                    <p className={styles.missingDocumentsNotice}>
                        {t('3 leads are waiting on documents - nudge clients to keep onboarding moving.')}
                    </p>

                    <div className={styles.missingDocumentsTable}>
                        <div className={styles.missingDocumentsHeader}>
                            <span>{t('Client')}</span>
                            <span>{t('Missing documents')}</span>
                            <span>{t('STATUS')}</span>
                        </div>

                        {missingDocuments.map((item) => (
                            <div key={item.id} className={styles.missingDocumentsRow}>
                                <span className={styles.missingDocumentsClient}>{item.client}</span>
                                <span>
                                    <span className={styles.missingDocumentBadge}>{t(item.document)}</span>
                                </span>
                                <button type="button" className={styles.sendReminderButton}>
                                    {t('Send reminder')}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Clients;

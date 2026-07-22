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

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Clients")}</h1>
                    <p>{t("Manage activated clients and view their performance.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.controlsRow}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input type="text" placeholder={t("Search clients...")} className={styles.searchInput} />
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
            </div>
        </div>
    );
};

export default Clients;

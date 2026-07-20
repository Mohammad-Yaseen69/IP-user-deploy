import React from 'react';
import useWindowWidth from '../../../utils/useWindowWidth';
import { useTranslation } from 'react-i18next';
import styles from "../styles/leads.module.css";
import TopRight from '../../topRight';
import { Search } from 'react-feather';

const Leads = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const buttons = [
        { label: "All" },
        { label: "KYB In Review" },
        { label: "Pricing Pending" },
        { label: "Activation Fee Pending" },
        { label: "IBAN Generated" },
        { label: "Active" }
    ];

    // Table Data matching exactly with Figma Rows
    const tableData = [
        {
            id: 1,
            name: "Anna Petrova",
            avatarText: "AP",
            avatarColor: styles.avatarPurple,
            type: "Individual",
            stage: "Pricing Pending",
            stageClass: styles.stageOrange,
            kyc: "Docs pending",
            kycClass: styles.statusOrange,
            compliance: "Clear",
            complianceClass: styles.statusGreen,
            pricing: "Sent",
            pricingClass: styles.statusPurple,
            commission: "—"
        },
        {
            id: 2,
            name: "Apex Platinum Co.",
            avatarText: "AP",
            avatarColor: styles.avatarBlue,
            type: "Business",
            stage: "Activation Fee Pending",
            stageClass: styles.stageOrange,
            kyc: "Verified",
            kycClass: styles.statusGreen,
            compliance: "Clear",
            complianceClass: styles.statusGreen,
            pricing: "Approved",
            pricingClass: styles.statusGreen,
            commission: "€1,120 (pending)"
        },
        {
            id: 3,
            name: "Regal Goldsmiths",
            avatarText: "RG",
            avatarColor: styles.avatarLightBlue,
            type: "Business",
            stage: "IBAN Generated",
            stageClass: styles.stageBlue,
            kyc: "Verified",
            kycClass: styles.statusGreen,
            compliance: "Clear",
            complianceClass: styles.statusGreen,
            pricing: "Approved",
            pricingClass: styles.statusGreen,
            commission: "€1,400"
        },
        {
            id: 4,
            name: "Summit Metals Inc.",
            avatarText: "SM",
            avatarColor: styles.avatarDeepPurple,
            type: "Business",
            stage: "KYB in Review",
            stageClass: styles.stagePurple,
            kyc: "Docs pending",
            kycClass: styles.statusOrange,
            compliance: "Open",
            complianceClass: styles.statusOrange,
            pricing: "N/A",
            pricingClass: styles.statusGray,
            commission: "—"
        },
        {
            id: 5,
            name: "BlueLine Button Traders",
            avatarText: "BB",
            avatarColor: styles.avatarGreen,
            type: "Business",
            stage: "KYB in Review",
            stageClass: styles.stagePurple,
            kyc: "Docs pending",
            kycClass: styles.statusOrange,
            compliance: "Open",
            complianceClass: styles.statusOrange,
            pricing: "N/A",
            pricingClass: styles.statusGray,
            commission: "—"
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header section */}
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Leads")}</h1>
                    <p>{t("Introduce clients and track them from onboarding to IBAN activation.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.headercontent}>
                    <p>{t("You're an introducer: submit a lead and send a secure self-onboarding invite. You get read-only visibility of each prospect's KYC/KYB status and any compliance request - no need to contact the operator. You never collect or handle your client's documents.")}</p>
                </div>

                <div className={styles.buttons}>
                    {buttons.map((button, index) => (
                        <button key={index} className={styles.button}>{t(button.label)}</button>
                    ))}
                </div>

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

                        <button className={styles.primaryBtn}>
                            <span>+ {t("Add new lead")}</span>
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>

                        <div className={styles.tableHeaderRow}>
                            <div className={styles.thCell}>{t("Client")}</div>
                            <div className={styles.thCell}>{t("Type")}</div>
                            <div className={styles.thCell}>{t("Stage")}</div>
                            <div className={styles.thCell}>{t("KYC/KYB")}</div>
                            <div className={styles.thCell}>{t("Compliance")}</div>
                            <div className={styles.thCell}>{t("Pricing")}</div>
                            <div className={styles.thCell}>{t("Commission")}</div>
                        </div>

                        <div className={styles.tableBody}>
                            {tableData.map((row) => (
                                <div key={row.id} className={styles.tableDataRow}>
                                    <div className={`${styles.tdCell} ${styles.clientCell}`}>
                                        <div className={`${styles.avatar} ${row.avatarColor}`}>
                                            {row.avatarText}
                                        </div>
                                        <span className={styles.clientName}>{t(row.name)}</span>
                                    </div>
                                    <div className={styles.tdCell}>{t(row.type)}</div>
                                    <div className={styles.tdCell}>
                                        <span className={`${styles.badge} ${row.stageClass}`}>
                                            {t(row.stage)}
                                        </span>
                                    </div>
                                    <div className={styles.tdCell}>
                                        <span className={`${styles.textIndicator} ${row.kycClass}`}>
                                            {t(row.kyc)}
                                        </span>
                                    </div>
                                    <div className={styles.tdCell}>
                                        <span className={`${styles.textIndicator} ${row.complianceClass}`}>
                                            {t(row.compliance)}
                                        </span>
                                    </div>
                                    <div className={styles.tdCell}>
                                        <span className={`${styles.textIndicator} ${row.pricingClass}`}>
                                            {t(row.pricing)}
                                        </span>
                                    </div>
                                    <div className={styles.tdCell}>{t(row.commission)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.paginationRow}>
                        <div className={styles.paginationPages}>
                            <button className={styles.pageArrow}>&lt;</button>
                            <button className={`${styles.pageNumber} ${styles.pageActive}`}>1</button>
                            <button className={styles.pageNumber}>2</button>
                            <button className={styles.pageNumber}>3</button>
                            <button className={styles.pageNumber}>4</button>
                            <button className={styles.pageNumber}>5</button>
                            <button className={styles.pageNumber}>6</button>
                            <button className={styles.pageNumber}>7</button>
                            <button className={styles.pageNumber}>8</button>
                            <button className={styles.pageNumber}>9</button>
                            <span className={styles.pageEllipsis}>...</span>
                            <button className={styles.pageNumber}>20</button>
                            <button className={styles.pageArrow}>&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leads;
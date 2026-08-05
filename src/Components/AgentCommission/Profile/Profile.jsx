import { useState } from 'react';
import {
    Briefcase,
    CheckCircle,
    CreditCard,
    Edit2,
    Globe,
    Info,
    Sliders,
    Users
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/profile.module.css';

const Profile = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { id: 'all', label: t('Corporate profile'), icon: <Briefcase size={16} /> },
        { id: 'kyb', label: t('KYB · Directors & UBOs'), icon: <Users size={16} /> },
        { id: 'iban', label: t('Payout IBAN'), icon: <CreditCard size={16} /> },
        { id: 'commission', label: t('Commission setup'), icon: <Sliders size={16} /> },
    ];

    const showAll = activeTab === 'all';

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
                <div className={styles.tabsNav}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabItemActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.cardsStack}>
                    {(showAll || activeTab === 'all') && (
                        <div className={styles.cardSection}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.sectionTitle}>{t("Corporate profile")}</h3>
                            </div>

                            <div className={styles.infoRowsList}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Company")}</span>
                                    <span className={styles.value}>Mensah Trade Partners Ltd</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Country")}</span>
                                    <span className={styles.value}>Ghana</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Sub-agents")}</span>
                                    <span className={styles.value}>3</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Type")}</span>
                                    <span className={styles.badgeReseller}>
                                        <Globe size={12} />
                                        {t("Corporate reseller")}
                                    </span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Since")}</span>
                                    <span className={styles.value}>Jan 2025</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(showAll || activeTab === 'kyb') && (
                        <div className={styles.cardSection}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.sectionTitle}>{t("Directors & UBOs")}</h3>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t("Name")}</th>
                                            <th>{t("Role")}</th>
                                            <th>{t("eKYC")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Akosua Mensah</td>
                                            <td>Director · UBO 70%</td>
                                            <td>
                                                <span className={styles.badgeVerified}>
                                                    <CheckCircle size={12} />
                                                    {t("Verified")}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Kofi Mensah</td>
                                            <td>UBO 30%</td>
                                            <td>
                                                <span className={styles.badgeVerified}>
                                                    <CheckCircle size={12} />
                                                    {t("Verified")}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(showAll || activeTab === 'iban') && (
                        <div className={styles.cardSection}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.sectionTitle}>{t("Payout IBAN")}</h3>
                            </div>

                            <div className={styles.infoRowsList}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Commission payout account")}</span>
                                    <span className={styles.value}>MT84 SYPL 3948 6011 •••• ••••</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Currency")}</span>
                                    <span className={styles.value}>EUR</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>{t("Status")}</span>
                                    <span className={styles.badgeVerified}>
                                        <CheckCircle size={12} />
                                        {t("Verified")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(showAll || activeTab === 'commission') && (
                        <div className={styles.cardSection}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.sectionTitle}>{t("Commission setup")}</h3>
                                <button className={styles.editBtn}>
                                    <Edit2 size={13} />
                                    {t("Edit")}
                                </button>
                            </div>

                            <div className={styles.infoBanner}>
                                <Info size={18} style={{ minWidth: 18 }} />
                                <span>
                                    {t("Your revenue-share rates are agreed with InstaPay and applied automatically per product.")}
                                </span>
                            </div>

                            <div className={styles.ratesGrid}>
                                <div className={styles.rateCard}>
                                    <span className={styles.rateLabel}>{t("IBAN activation")}</span>
                                    <span className={styles.rateValue}>20%</span>
                                </div>
                                <div className={styles.rateCard}>
                                    <span className={styles.rateLabel}>{t("Monthly fee")}</span>
                                    <span className={styles.rateValue}>15%</span>
                                </div>
                                <div className={styles.rateCard}>
                                    <span className={styles.rateLabel}>{t("SWIFT")}</span>
                                    <span className={styles.rateValue}>12%</span>
                                </div>
                                <div className={styles.rateCard}>
                                    <span className={styles.rateLabel}>{t("Cards")}</span>
                                    <span className={styles.rateValue}>15%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

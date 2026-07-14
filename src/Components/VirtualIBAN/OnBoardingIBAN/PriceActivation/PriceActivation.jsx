import { Info, Plus } from 'react-feather';
import styles from "../style/PriceActivation.module.css";
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../../utils/useWindowWidth';
import TopRight from '../../../topRight';
import NewActivationPackModal from './NewActivationPackModal';
import { useState } from 'react';

const PriceActivation = () => {
    const width = useWindowWidth()
    const [showModal, setShowModal] = useState(false)
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <div className={styles.titleWithBack}>

                        <h1>{t("Business IBAN")}</h1>
                    </div>
                    <p>{t("Activate a dedicated business account to receive and hold company funds.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>
            <div className={styles.mainContent}>

                <div className={styles.headerRow}>
                    <div>
                        <h2 className={styles.headerTitle}>Pricing & Activation Packs</h2>
                        <p className={styles.headerSubtitle}>
                            Activate a dedicated business account to receive and hold company funds.
                        </p>
                    </div>
                    <button className={styles.activateBtn}

                        onClick={() => {
                            console.log("clicked");
                            setShowModal(true);
                        }}
                    >
                        <Plus size={16} /> New activation pack
                    </button>
                </div>

                <div className={styles.cardsGrid}>
                    <div className={`${styles.card} ${styles.cardActive}`}>
                        <div className={styles.iconcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path d="M13.8125 2.39062H3.1875C2.82227 2.39062 2.5096 2.52067 2.24951 2.78076C1.98942 3.04085 1.85938 3.35352 1.85938 3.71875V7.4375C1.85938 8.33398 1.95898 9.14746 2.1582 9.87793C2.35742 10.6084 2.61198 11.2614 2.92188 11.8369C3.23177 12.4124 3.57487 12.9105 3.95117 13.3311C4.32747 13.7627 4.70378 14.1279 5.08008 14.4268C5.86589 15.0687 6.58805 15.5169 7.24658 15.7715C7.90511 16.026 8.25098 16.1589 8.28418 16.1699C8.31738 16.181 8.35335 16.1893 8.39209 16.1948C8.43083 16.2004 8.4668 16.2031 8.5 16.2031C8.5332 16.2031 8.56917 16.2004 8.60791 16.1948C8.64665 16.1893 8.68262 16.181 8.71582 16.1699C8.74902 16.1589 9.09489 16.026 9.75342 15.7715C10.4119 15.5169 11.1341 15.0687 11.9199 14.4268C12.2962 14.1279 12.6725 13.7627 13.0488 13.3311C13.4251 12.9105 13.7682 12.4124 14.0781 11.8369C14.388 11.2614 14.6426 10.6084 14.8418 9.87793C15.041 9.14746 15.1406 8.33398 15.1406 7.4375V3.71875C15.1406 3.35352 15.0106 3.04085 14.7505 2.78076C14.4904 2.52067 14.1777 2.39062 13.8125 2.39062ZM13.5469 7.4375C13.5469 8.03516 13.4915 8.59961 13.3809 9.13086C13.2702 9.67318 13.1069 10.1823 12.8911 10.6582C12.6753 11.1341 12.4069 11.5824 12.0859 12.0029C11.765 12.4124 11.3887 12.7998 10.957 13.165C10.6139 13.4528 10.2404 13.7129 9.83643 13.9453C9.43245 14.1777 9.00358 14.377 8.5498 14.543L8.5 14.5762C8.02409 14.3991 7.58138 14.1916 7.17188 13.9536C6.76237 13.7157 6.38053 13.4473 6.02637 13.1484L6.04297 13.165C5.61133 12.7998 5.23503 12.4124 4.91406 12.0029C4.5931 11.5824 4.32471 11.1341 4.10889 10.6582C3.89307 10.1823 3.72982 9.67318 3.61914 9.13086C3.50846 8.59961 3.45312 8.03516 3.45312 7.4375V3.98438H13.5469V7.4375ZM5.2793 9.5957C5.21289 9.51823 5.15755 9.43245 5.11328 9.33838C5.06901 9.2443 5.04688 9.14193 5.04688 9.03125C5.04688 8.8099 5.12435 8.62174 5.2793 8.4668C5.43424 8.31185 5.6224 8.23438 5.84375 8.23438C5.95443 8.23438 6.05957 8.25374 6.15918 8.29248C6.25879 8.33122 6.3418 8.38932 6.4082 8.4668L7.4375 9.49609L10.5918 6.3418C10.6693 6.26432 10.755 6.20622 10.8491 6.16748C10.9432 6.12874 11.0456 6.10938 11.1562 6.10938C11.3776 6.10938 11.5658 6.18685 11.7207 6.3418C11.8757 6.49675 11.9531 6.6849 11.9531 6.90625C11.9531 7.01693 11.9338 7.1193 11.895 7.21338C11.8563 7.30745 11.7982 7.39323 11.7207 7.4707L8.00195 11.1895C7.93555 11.2559 7.85254 11.3112 7.75293 11.3555C7.65332 11.3997 7.54818 11.4219 7.4375 11.4219C7.32682 11.4219 7.22445 11.3997 7.13037 11.3555C7.0363 11.3112 6.95052 11.2559 6.87305 11.1895L5.2793 9.5957Z" fill="white" />
                            </svg>
                        </div>                    <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Standard - Low risk</h3>
                                <span className={`${styles.badge} ${styles.badgePrimary}`}>SUGGESTED</span>
                            </div>
                            <p className={styles.cardDesc}>Opening €100 - Institution €0/mo</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconcon}
                            style={{
                                background: "linear-gradient(135deg, #DCC900 0%, #A89600 100%)"

                            }}
                        >

                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path d="M13.8125 2.39062H3.1875C2.82227 2.39062 2.5096 2.52067 2.24951 2.78076C1.98942 3.04085 1.85938 3.35352 1.85938 3.71875V7.4375C1.85938 8.33398 1.95898 9.14746 2.1582 9.87793C2.35742 10.6084 2.61198 11.2614 2.92188 11.8369C3.23177 12.4124 3.57487 12.9105 3.95117 13.3311C4.32747 13.7627 4.70378 14.1279 5.08008 14.4268C5.86589 15.0687 6.58805 15.5169 7.24658 15.7715C7.90511 16.026 8.25098 16.1589 8.28418 16.1699C8.31738 16.181 8.35335 16.1893 8.39209 16.1948C8.43083 16.2004 8.4668 16.2031 8.5 16.2031C8.5332 16.2031 8.56917 16.2004 8.60791 16.1948C8.64665 16.1893 8.68262 16.181 8.71582 16.1699C8.74902 16.1589 9.09489 16.026 9.75342 15.7715C10.4119 15.5169 11.1341 15.0687 11.9199 14.4268C12.2962 14.1279 12.6725 13.7627 13.0488 13.3311C13.4251 12.9105 13.7682 12.4124 14.0781 11.8369C14.388 11.2614 14.6426 10.6084 14.8418 9.87793C15.041 9.14746 15.1406 8.33398 15.1406 7.4375V3.71875C15.1406 3.35352 15.0106 3.04085 14.7505 2.78076C14.4904 2.52067 14.1777 2.39062 13.8125 2.39062ZM13.5469 7.4375C13.5469 8.03516 13.4915 8.59961 13.3809 9.13086C13.2702 9.67318 13.1069 10.1823 12.8911 10.6582C12.6753 11.1341 12.4069 11.5824 12.0859 12.0029C11.765 12.4124 11.3887 12.7998 10.957 13.165C10.6139 13.4528 10.2404 13.7129 9.83643 13.9453C9.43245 14.1777 9.00358 14.377 8.5498 14.543L8.5 14.5762C8.02409 14.3991 7.58138 14.1916 7.17188 13.9536C6.76237 13.7157 6.38053 13.4473 6.02637 13.1484L6.04297 13.165C5.61133 12.7998 5.23503 12.4124 4.91406 12.0029C4.5931 11.5824 4.32471 11.1341 4.10889 10.6582C3.89307 10.1823 3.72982 9.67318 3.61914 9.13086C3.50846 8.59961 3.45312 8.03516 3.45312 7.4375V3.98438H13.5469V7.4375Z" fill="white" />
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Standard - Medium risk</h3>
                            </div>
                            <p className={styles.cardDesc}>Opening €300 - Institution €50/mo</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconcon}
                            style={{
                                background: "linear-gradient(135deg, #EF4444 0%, #B32020 100%)"

                            }}
                        >

                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path d="M13.8125 2.39062H3.1875C2.82227 2.39062 2.5096 2.52067 2.24951 2.78076C1.98942 3.04085 1.85938 3.35352 1.85938 3.71875V7.4375C1.85938 8.33398 1.95898 9.14746 2.1582 9.87793C2.35742 10.6084 2.61198 11.2614 2.92188 11.8369C3.23177 12.4124 3.57487 12.9105 3.95117 13.3311C4.32747 13.7627 4.70378 14.1279 5.08008 14.4268C5.86589 15.0687 6.58805 15.5169 7.24658 15.7715C7.90511 16.026 8.25098 16.1589 8.28418 16.1699C8.31738 16.181 8.35335 16.1893 8.39209 16.1948C8.43083 16.2004 8.4668 16.2031 8.5 16.2031C8.5332 16.2031 8.56917 16.2004 8.60791 16.1948C8.64665 16.1893 8.68262 16.181 8.71582 16.1699C8.74902 16.1589 9.09489 16.026 9.75342 15.7715C10.4119 15.5169 11.1341 15.0687 11.9199 14.4268C12.2962 14.1279 12.6725 13.7627 13.0488 13.3311C13.4251 12.9105 13.7682 12.4124 14.0781 11.8369C14.388 11.2614 14.6426 10.6084 14.8418 9.87793C15.041 9.14746 15.1406 8.33398 15.1406 7.4375V3.71875C15.1406 3.35352 15.0106 3.04085 14.7505 2.78076C14.4904 2.52067 14.1777 2.39062 13.8125 2.39062ZM13.5469 7.4375C13.5469 8.03516 13.4915 8.59961 13.3809 9.13086C13.2702 9.67318 13.1069 10.1823 12.8911 10.6582C12.6753 11.1341 12.4069 11.5824 12.0859 12.0029C11.765 12.4124 11.3887 12.7998 10.957 13.165C10.6139 13.4528 10.2404 13.7129 9.83643 13.9453C9.43245 14.1777 9.00358 14.377 8.5498 14.543L8.5 14.5762C8.02409 14.3991 7.58138 14.1916 7.17188 13.9536C6.76237 13.7157 6.38053 13.4473 6.02637 13.1484L6.04297 13.165C5.61133 12.7998 5.23503 12.4124 4.91406 12.0029C4.5931 11.5824 4.32471 11.1341 4.10889 10.6582C3.89307 10.1823 3.72982 9.67318 3.61914 9.13086C3.50846 8.59961 3.45312 8.03516 3.45312 7.4375V3.98438H13.5469V7.4375Z" fill="white" />
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Standard - High risk / High Vol</h3>
                            </div>
                            <p className={styles.cardDesc}>Opening €1000 - Institution €200/mo</p>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconcon}
                            style={{
                                background: "linear-gradient(135deg, #4A32E3 0%, #5926F0 100%)"

                            }}
                        >

                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path d="M13.8125 2.39062H3.1875C2.82227 2.39062 2.5096 2.52067 2.24951 2.78076C1.98942 3.04085 1.85938 3.35352 1.85938 3.71875V7.4375C1.85938 8.33398 1.95898 9.14746 2.1582 9.87793C2.35742 10.6084 2.61198 11.2614 2.92188 11.8369C3.23177 12.4124 3.57487 12.9105 3.95117 13.3311C4.32747 13.7627 4.70378 14.1279 5.08008 14.4268C5.86589 15.0687 6.58805 15.5169 7.24658 15.7715C7.90511 16.026 8.25098 16.1589 8.28418 16.1699C8.31738 16.181 8.35335 16.1893 8.39209 16.1948C8.43083 16.2004 8.4668 16.2031 8.5 16.2031C8.5332 16.2031 8.56917 16.2004 8.60791 16.1948C8.64665 16.1893 8.68262 16.181 8.71582 16.1699C8.74902 16.1589 9.09489 16.026 9.75342 15.7715C10.4119 15.5169 11.1341 15.0687 11.9199 14.4268C12.2962 14.1279 12.6725 13.7627 13.0488 13.3311C13.4251 12.9105 13.7682 12.4124 14.0781 11.8369C14.388 11.2614 14.6426 10.6084 14.8418 9.87793C15.041 9.14746 15.1406 8.33398 15.1406 7.4375V3.71875C15.1406 3.35352 15.0106 3.04085 14.7505 2.78076C14.4904 2.52067 14.1777 2.39062 13.8125 2.39062ZM13.5469 7.4375C13.5469 8.03516 13.4915 8.59961 13.3809 9.13086C13.2702 9.67318 13.1069 10.1823 12.8911 10.6582C12.6753 11.1341 12.4069 11.5824 12.0859 12.0029C11.765 12.4124 11.3887 12.7998 10.957 13.165C10.6139 13.4528 10.2404 13.7129 9.83643 13.9453C9.43245 14.1777 9.00358 14.377 8.5498 14.543L8.5 14.5762C8.02409 14.3991 7.58138 14.1916 7.17188 13.9536C6.76237 13.7157 6.38053 13.4473 6.02637 13.1484L6.04297 13.165C5.61133 12.7998 5.23503 12.4124 4.91406 12.0029C4.5931 11.5824 4.32471 11.1341 4.10889 10.6582C3.89307 10.1823 3.72982 9.67318 3.61914 9.13086C3.50846 8.59961 3.45312 8.03516 3.45312 7.4375V3.98438H13.5469V7.4375Z" fill="white" />
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Pack One</h3>
                            </div>
                            <p className={styles.cardDesc}>Opening €500 - Activation €200 - €70/mo</p>
                        </div>
                    </div>
                </div>

                <div className={styles.tableSection}>
                    <h3 className={styles.tableTitle}>Fee schedule - Standard - Low risk</h3>

                    <table className={styles.feeTable}>
                        <thead>
                            <tr>
                                <th>FEE ITEM</th>
                                <th className={styles.textRight}>FLAT FEE</th>
                                <th className={styles.textRight}>% OF AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Opening fee (one-time)</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="99" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>IBAN activation (one-time)</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>Monthly IBAN fee</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="49" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>SEPA inward</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>SEPA outward</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0.5" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>SWIFT inward</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="5" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>SWIFT outward</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="16" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                            </tr>
                            <tr>
                                <td>Crypto on/off ramp</td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0" /></td>
                                <td className={styles.textRight}><input type="text" className={styles.inputField} defaultValue="0.7" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.footerInfo}>
                    <Info />
                    <p className={styles.footerText}>
                        Pricing can differ per client by FX volumes, risk, negotiation, agent/tournament, and variations, exactly what FX tiers are valid in the client profile.
                    </p>
                </div>
            </div>
            {showModal &&
                <NewActivationPackModal
                    open={showModal}
                    handleClose={() => setShowModal(false)}
                />
            }
        </div>
    );
};

export default PriceActivation;
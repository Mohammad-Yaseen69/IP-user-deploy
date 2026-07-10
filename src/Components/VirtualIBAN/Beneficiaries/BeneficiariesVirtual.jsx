import React, { useState } from 'react';
import { Copy, Plus, ChevronLeft, Search, User } from 'react-feather';
import styles from './BeneficiariesVirtual.module.css';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import DynamicChannelModal from './Modals/DynamicChannelModal';

const BeneficiariesVirtual = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };
    const handleSaveChannel = (channelData) => {
        console.log("Saved dynamic dataset payload:", channelData);
    };
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitleMain}>
                    <div className={styles.titleWithBack}>
                        <h1>{t("Crypto & Stablecoins")}</h1>
                    </div>
                    <p>{t("Manage your crypto and stablecoin wallet beneficiaries.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.mainContent}>

                <div className={styles.navigationHeader}>
                    <div className={styles.navigationRow}>
                        <button className={styles.backBtn}>
                            <ChevronLeft size={16} /> {t("Back")}
                        </button>
                        <span className={styles.breadcrumb}>
                            {t("My virtual bank")} &gt; <span className={styles.breadcrumbActive}>{t("Beneficiaries")}</span>
                        </span>
                    </div>
                </div>



                <div className={styles.contentLayout}>

                    <div className={styles.columnsFlexGrid}>

                        <div className={styles.leftColumn}>
                            <div className={styles.lefHeader}>
                                <div className={styles.subHeaderFlex}>
                                    <h1>{t("Beneficiaries")}</h1>
                                    <button className={styles.addBeneficiaryBtn}>
                                        <Plus size={16} /> {t("Add beneficiary")}
                                    </button>
                                </div>
                                <div className={styles.searchBarWrapper}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input type="text" placeholder={t("Search items...")} className={styles.searchInput} />
                                </div>
                            </div>

                            <div className={styles.beneficiariesList}>
                                <div className={`${styles.beneficiaryItem} ${styles.activeItem}`}>
                                    <div className={styles.avatarCircle} style={{ background: '#F59E0B' }}>AM</div>
                                    <div className={styles.itemMeta}>
                                        <h4>Arnold Mbuka</h4>
                                        <p>Individual • TRON network</p>
                                    </div>
                                </div>

                                <div className={styles.beneficiaryItem}>
                                    <div className={styles.avatarCircle} style={{ background: '#4F46E5' }}>SS</div>
                                    <div className={styles.itemMeta}>
                                        <h4>System Pay Services Solutions Spain</h4>
                                        <p>Company • ERC-20 network</p>
                                    </div>
                                </div>

                                <div className={styles.beneficiaryItem}>
                                    <div className={styles.avatarCircle} style={{ background: '#10B981' }}>AM</div>
                                    <div className={styles.itemMeta}>
                                        <h4>Anat Moula</h4>
                                        <p>Individual • Sol Network</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>

                            <div className={styles.profileHeaderBox}>
                                <div className={styles.profileLeftGroup}>
                                    <div className={styles.avatarCircleBig}>{t("AM")}</div>
                                    <div className={styles.profileTitleBlock}>
                                        <div className={styles.nameBadgeRow}>
                                            <h2>{t("Arnold Mbuka")}</h2>
                                            <span className={styles.badgeLabel}>{t("Individual")}</span>
                                        </div>
                                        <p className={styles.subTextDetail}>{t("Added 11 months ago")}</p>
                                    </div>
                                </div>

                                <div className={styles.profileActionGroup}>
                                    <button className={styles.payDetailsBtn}>{t("Pay details")}</button>
                                    <button className={styles.editIconButton}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className={styles.sectionHeaderRow}>
                                <span className={styles.sectionSubTitle}>{t("Payout Channels")}</span>
                                <button className={styles.addChannelLink}
                                    onClick={() => setIsModalOpen(true)}
                                >+ {t("Add channel")}</button>
                            </div>

                            <div className={styles.cryptoWalletCard}>
                                <div className={styles.walletHeader}>
                                    <div className={styles.channelTypeLabel}>
                                        <div className={styles.iconwrap}
                                            style={{
                                                borderRadius: "12px",
                                                background: "#F5F2FF"
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                                                <path d="M15.4004 4.73145C15.0169 4.5459 14.6025 4.37891 14.1572 4.23047C13.7119 4.08203 13.2419 3.95833 12.7471 3.85938C12.2523 3.76042 11.7327 3.6862 11.1885 3.63672C10.6442 3.58724 10.0814 3.5625 9.5 3.5625C8.91862 3.5625 8.35579 3.58724 7.81152 3.63672C7.26725 3.6862 6.74772 3.76042 6.25293 3.85938C5.75814 3.95833 5.28809 4.08203 4.84277 4.23047C4.39746 4.37891 3.98307 4.5459 3.59961 4.73145C2.82031 5.11491 2.22347 5.56641 1.80908 6.08594C1.39469 6.60547 1.1875 7.14974 1.1875 7.71875V11.2812C1.1875 11.8503 1.39779 12.3945 1.81836 12.9141C2.23893 13.4336 2.83268 13.8851 3.59961 14.2686C3.98307 14.4541 4.39746 14.6211 4.84277 14.7695C5.28809 14.918 5.75814 15.0417 6.25293 15.1406C6.74772 15.2396 7.26725 15.3138 7.81152 15.3633C8.35579 15.4128 8.91862 15.4375 9.5 15.4375C10.0814 15.4375 10.6442 15.4128 11.1885 15.3633C11.7327 15.3138 12.2523 15.2396 12.7471 15.1406C13.2419 15.0417 13.7119 14.918 14.1572 14.7695C14.6025 14.6211 15.0169 14.4541 15.4004 14.2686C16.1797 13.8851 16.7765 13.4336 17.1909 12.9141C17.6053 12.3945 17.8125 11.8503 17.8125 11.2812V7.71875C17.8125 7.14974 17.6022 6.60547 17.1816 6.08594C16.7611 5.56641 16.1673 5.11491 15.4004 4.73145ZM9.5 4.75C10.6628 4.75 11.6895 4.84896 12.5801 5.04688C13.4583 5.23242 14.1974 5.47363 14.7974 5.77051C15.3973 6.06738 15.8519 6.389 16.1611 6.73535C16.4704 7.08171 16.625 7.4095 16.625 7.71875C16.625 8.02799 16.4704 8.35579 16.1611 8.70215C15.8519 9.0485 15.3973 9.37012 14.7974 9.66699C14.1974 9.96387 13.4583 10.2051 12.5801 10.3906C11.6895 10.5885 10.6628 10.6875 9.5 10.6875C8.33724 10.6875 7.31055 10.5885 6.41992 10.3906C5.54167 10.2051 4.80257 9.96387 4.20264 9.66699C3.6027 9.37012 3.14811 9.0485 2.83887 8.70215C2.52962 8.35579 2.375 8.02799 2.375 7.71875C2.375 7.4095 2.52962 7.08171 2.83887 6.73535C3.14811 6.389 3.6027 6.06738 4.20264 5.77051C4.80257 5.47363 5.54167 5.23242 6.41992 5.04688C7.31055 4.84896 8.33724 4.75 9.5 4.75ZM8.90625 11.8564V14.2314C8.20117 14.2191 7.55176 14.1634 6.95801 14.0645C6.36426 13.9655 5.82617 13.8356 5.34375 13.6748V11.3555C5.87565 11.5039 6.44157 11.6214 7.0415 11.708C7.64144 11.7946 8.25684 11.8441 8.8877 11.8564H8.90625ZM10.0938 11.8564C10.737 11.8441 11.3647 11.7946 11.9771 11.708C12.5894 11.6214 13.1862 11.4977 13.7676 11.3369L13.6562 11.3555V13.6748C13.1738 13.8356 12.6357 13.9655 12.042 14.0645C11.4482 14.1634 10.7988 14.2191 10.0938 14.2314V11.8564ZM2.375 11.2812V9.9082C2.54818 10.0566 2.73372 10.1958 2.93164 10.3257C3.12956 10.4556 3.33984 10.5762 3.5625 10.6875L3.59961 10.7061C3.6862 10.7432 3.77588 10.7834 3.86865 10.8267C3.96143 10.87 4.05729 10.9102 4.15625 10.9473V13.2109C3.57487 12.9141 3.13265 12.5955 2.82959 12.2554C2.52653 11.9152 2.375 11.5905 2.375 11.2812ZM14.8438 13.2109V10.9473C14.9427 10.9102 15.0386 10.87 15.1313 10.8267C15.2241 10.7834 15.3138 10.7432 15.4004 10.7061C15.6354 10.5824 15.855 10.4556 16.0591 10.3257C16.2632 10.1958 16.458 10.0566 16.6436 9.9082H16.625V11.2812C16.625 11.5905 16.4735 11.9152 16.1704 12.2554C15.8674 12.5955 15.4251 12.9141 14.8438 13.2109Z" fill="#5926F0" />
                                            </svg>
                                        </div>
                                        <span className={styles.networkTag}>{t("Crypto wallet")}</span>
                                        <span className={styles.networkActive}>{t("Primary")}</span>
                                    </div>
                                </div>
                                <div className={styles.addressRow}>
                                    <span className={styles.cryptoAddress}>{t("USDT - Tron • TL3sP2pXm4vH6e5wQrA1Zk7BvD9nM4vX2sL")}</span>
                                    <button className={styles.copyBtn} onClick={() => handleCopy("TL3sP2pXm4vH6e5wQrA1Zk7BvD9nM4vX2sL")}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cryptoWalletCard} style={{ marginTop: '12px' }}>
                                <div className={styles.walletHeader}>
                                    <div className={styles.channelTypeLabel}>
                                        <div className={styles.iconwrap}
                                            style={{
                                                borderRadius: "12px",
                                                background: "#F5F2FF"
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                                                <path d="M13.0625 1.1875H5.9375C5.44271 1.1875 5.02214 1.36068 4.67578 1.70703C4.32943 2.05339 4.15625 2.47396 4.15625 2.96875V16.0312C4.15625 16.526 4.32943 16.9466 4.67578 17.293C5.02214 17.6393 5.44271 17.8125 5.9375 17.8125H13.0625C13.5573 17.8125 13.9779 17.6393 14.3242 17.293C14.6706 16.9466 14.8438 16.526 14.8438 16.0312V2.96875C14.8438 2.47396 14.6706 2.05339 14.3242 1.70703C13.9779 1.36068 13.5573 1.1875 13.0625 1.1875ZM5.34375 4.75H13.6562V14.25H5.34375V4.75ZM5.9375 2.375H13.0625C13.2233 2.375 13.3625 2.43376 13.48 2.55127C13.5975 2.66878 13.6562 2.80794 13.6562 2.96875V3.5625H5.34375V2.96875C5.34375 2.80794 5.40251 2.66878 5.52002 2.55127C5.63753 2.43376 5.77669 2.375 5.9375 2.375ZM13.0625 16.625H5.9375C5.77669 16.625 5.63753 16.5662 5.52002 16.4487C5.40251 16.3312 5.34375 16.1921 5.34375 16.0312V15.4375H13.6562V16.0312C13.6562 16.1921 13.5975 16.3312 13.48 16.4487C13.3625 16.5662 13.2233 16.625 13.0625 16.625Z" fill="#0D9F6E" />
                                            </svg>
                                        </div>
                                        <span className={styles.networkTag}>{t("Mobile wallet")}</span>
                                    </div>
                                </div>
                                <div className={styles.addressRow}>
                                    <span className={styles.cryptoAddress}>{t("Orange Money • +237 670 123 456")}</span>
                                    <button className={styles.copyBtn} onClick={() => handleCopy("+237 670 123 456")}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            <span className={styles.sectionSubTitle} style={{ marginTop: '28px', display: 'block' }}>{t("Recent activity")}</span>

                            <table className={styles.fileOptionTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.metaLabel}>
                                            <div className={styles.txIconTitleRow}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                                <div className={styles.txTitle}>{t("Sent via Crypto wallet")}</div>
                                            </div>
                                            <div className={styles.txDate}>{t("12 Feb 2025 • 14:32 • Sent")}</div>
                                        </td>
                                        <td className={styles.metaValue}>{t("125,121.00 USDT")}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>
                                            <div className={styles.txIconTitleRow}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                                <div className={styles.txTitle}>{t("Sent via Mobile wallet")}</div>
                                            </div>
                                            <div className={styles.txDate}>{t("Today • 09:15 • Orange Money")}</div>
                                        </td>
                                        <td className={styles.metaValue}>{t("45,000 XAF")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
            <DynamicChannelModal
                open={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
                onSave={handleSaveChannel}
            />
        </div >
    );
};

export default BeneficiariesVirtual;
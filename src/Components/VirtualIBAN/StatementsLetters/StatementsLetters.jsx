import React from 'react';
import { Copy, Download, Share2, FileText, ChevronLeft, Eye } from 'react-feather';
import styles from './StatementsLetters.module.css';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';

const StatementsLetters = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitleMain}>
                    <div className={styles.titleWithBack}>
                        <h1>{t("Statements & letters")}</h1>
                    </div>
                    <p>{t("Statements, IBAN confirmation letter")}</p>
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
                            {t("My virtual bank")} &gt; <span className={styles.breadcrumbActive}>{t("Statements & letters")}</span>
                        </span>
                    </div>
                </div>

                <div className={styles.subSectionHeader}>
                    <h1>{t("EUR IBAN account")}</h1>
                    <p>
                        {t("Your dedicated Malta (MT) virtual IBAN, provided through InstaPay - a brand of Kemit Kingdom SA (K2 SA).")}
                        <br />
                        {t("Download an official ownership confirmation letter anytime.")}
                    </p>
                </div>

                <div className={styles.contentLayout}>

                    <div className={styles.accountCard}>
                        <div className={styles.accountHeader}>
                            <span>{t("EUR SEPA Account")}</span>
                            <FileText size={18} />
                        </div>

                        <div className={styles.ibanRow}>
                            <span>MT84 SPSM 3610 0000 0000 0123 4567 890</span>
                            <button className={styles.copyBtnWhite} onClick={() => handleCopy("MT84 SPSM 3610 0000 0000 0123 4567 890")}>
                                <Copy size={14} />
                            </button>
                        </div>

                        <div className={styles.innerBalanceBox}>
                            <span className={styles.balanceLabel}>{t("BIC / SWIFT Status")} — EUR</span>
                            <span className={styles.balanceAmount}>Updated 12 Feb 2025</span>
                        </div>
                    </div>

                    <div className={styles.columnsFlexGrid}>

                        <div className={styles.leftColumn}>
                            <span className={styles.sectionHeadingTitle}>{t("Documents")}</span>
                            <p className={styles.sectionHeadingSub}>{t("Official letters and statements for your IBAN account.")}</p>

                            <div className={styles.actionCard}>
                                <div className={styles.iconCircleWrapper}>
                                    <FileText size={20} style={{ color: '#fff' }} />
                                </div>
                                <div className={styles.actionContent}>
                                    <h3 className={styles.actionTitle}>{t("Account & IBAN Confirmation Letter")}</h3>
                                    <p className={styles.actionDesc}>
                                        {t("With placeholder info for your account details setup.")}
                                    </p>


                                </div>

                            </div>
                            <div className={styles.btnGroup}>
                                <button className={styles.previewBtn}>
                                    <Eye size={14} /> {t("Preview")}
                                </button>
                                <button className={styles.downloadBtn}>
                                    <Download size={14} /> {t("Download PDF")}
                                </button>
                                <button className={styles.shareBtn}>
                                    <Share2 size={14} /> {t("Share")}
                                </button>
                            </div>
                            <div className={styles.infoHelpAlertBox}>
                                <p>
                                    {t("This letter is generated automatically with up-to-date fields today, so no manually waiting. It reflects the live account status right the time you download.")}
                                </p>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            <span className={styles.sectionSubTitle}>{t("What the letter contains")}</span>
                            <p className={styles.sectionHeadingSub}>{t("Live blueprint from your instant account record.")}</p>

                            <table className={styles.fileOptionTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Account Holder")}</td>
                                        <td className={styles.metaValue}>Heiko Von Der Meyer</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("IBAN")}</td>
                                        <td className={styles.metaValue} style={{ fontFamily: 'monospace' }}>MT84 SPSM 3610 0000 0000 0123 4567 890</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("BIC / SWIFT")}</td>
                                        <td className={styles.metaValue}>SPSMMTMTXXX</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Currency")}</td>
                                        <td className={styles.metaValue}>EUR (Euro)</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Account Type")}</td>
                                        <td className={styles.metaValue}>E-money payment account (Virtual IBAN)</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Status")}</td>
                                        <td className={styles.metaValueStatus}>Active</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Date Issued")}</td>
                                        <td className={styles.metaValue}>12 February 2025</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Company Address")}</td>
                                        <td className={styles.metaValueAddress}>Kemit Kingdom SA B2 541</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Provider")}</td>
                                        <td className={styles.metaValue}>System Pay Services (Malta) Limited</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default StatementsLetters;
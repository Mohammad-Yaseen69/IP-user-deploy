import { useContext, useMemo, useState } from 'react';
import { Copy, Download, Share2, FileText, ChevronLeft, Eye, Loader, File, Globe, Check } from 'react-feather';
import styles from './StatementsLetters.module.css';
import IbanBreadcrumb from '../components/IbanBreadcrumb';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import { UserContext } from '../../../Context/UserContext';
import { useVirtualIbans, useVirtualIbanDetails } from '../../../hooks/useVirtualIban';
import { normalizeVirtualIban } from '../utils/virtualIban';
import generateIbanLetterPdf from './generateIbanLetterPdf';
import generateSwiftLetterPdf from './generateSwiftLetterPdf';
import SwiftCurrencyModal from './SwiftCurrencyModal';
import StatementModal from '../StatementModal';
import { toast } from 'react-toastify';

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getSafeString = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        return val.country_name || val.name || val.title || val.label || fallback;
    }
    return fallback;
};

const StatementsLetters = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const { userDetails, selectedAccount } = useContext(UserContext);
    const [downloading, setDownloading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [ibanCopied, setIbanCopied] = useState(false);
    const [showSwiftModal, setShowSwiftModal] = useState(false);
    const [swiftActionType, setSwiftActionType] = useState('preview');
    const [swiftProcessing, setSwiftProcessing] = useState(false);

    const { data: rawIbans = [] } = useVirtualIbans(userDetails?._id);

    const selectedIban = useMemo(() => {
        if (!rawIbans.length) return null;
        return rawIbans.find((iban) => (iban?._id || iban?.id) === selectedAccount) || rawIbans[0];
    }, [rawIbans, selectedAccount]);

    const ibanId = selectedIban?._id || selectedIban?.id;

    const { data: ibanDetailData } = useVirtualIbanDetails(ibanId);
    const iban = useMemo(
        () => normalizeVirtualIban(ibanDetailData || selectedIban) || {},
        [ibanDetailData, selectedIban]
    );

    const handleCopy = async (text, isIban = false) => {
        try {
            await navigator.clipboard.writeText(text);

            if (isIban) {
                setIbanCopied(true);

                setTimeout(() => {
                    setIbanCopied(false);
                }, 2000);

                return;
            }

        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error(t('Failed to copy to clipboard.'));
        }
    };

    const handlePreviewPdf = async () => {
        if (previewing || downloading) return;
        setPreviewing(true);
        try {
            await generateIbanLetterPdf(iban, userDetails, { isPreview: true });
        } catch (error) {
            console.error('PDF preview failed:', error);
            toast.error(t('Failed to preview PDF. Please try again.'));
        } finally {
            setPreviewing(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (downloading || previewing) return;
        setDownloading(true);
        try {
            await generateIbanLetterPdf(iban, userDetails, { isPreview: false });
            toast.success(t('IBAN confirmation letter downloaded successfully!'));
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error(t('Failed to generate PDF. Please try again.'));
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = () => {
        const virtualIbanId = iban?.virtualIbanId || iban?._id || iban?.id || '';
        const base_url = window.location.origin || 'https://my.insta-pay.ch';
        const shareUrl = `${base_url}/v/${virtualIbanId}`;
        if (navigator.share) {
            navigator.share({
                title: t('IBAN Confirmation Letter'),
                text: t('Official InstaPay IBAN Account Confirmation Letter'),
                url: shareUrl,
            }).catch(() => handleCopy(shareUrl));
        } else {
            handleCopy(shareUrl);
        }
    };

    const handleOpenSwiftModal = (actionType) => {
        setSwiftActionType(actionType);
        setShowSwiftModal(true);
    };

    const handleSwiftActionConfirm = async (currency, actionType) => {
        setSwiftProcessing(true);
        try {
            if (actionType === 'preview') {
                await generateSwiftLetterPdf(iban, userDetails, { isPreview: true, currency });
                setShowSwiftModal(false);
            } else if (actionType === 'download') {
                await generateSwiftLetterPdf(iban, userDetails, { isPreview: false, currency });
                toast.success(t('SWIFT confirmation letter downloaded successfully!'));
                setShowSwiftModal(false);
            } else if (actionType === 'share') {
                const virtualIbanId = iban?.virtualIbanId || iban?._id || iban?.id || '';
                const base_url = window.location.origin || 'https://my.insta-pay.ch';
                const shareUrl = `${base_url}/v/${virtualIbanId}?type=swift&curr=${currency}`;
                if (navigator.share) {
                    navigator.share({
                        title: t('SWIFT Confirmation Letter'),
                        text: t('Official InstaPay International / SWIFT Payment Instructions'),
                        url: shareUrl,
                    }).catch(() => handleCopy(shareUrl));
                } else {
                    handleCopy(shareUrl);
                }
                setShowSwiftModal(false);
            }
        } catch (error) {
            console.error('SWIFT letter action failed:', error);
            toast.error(t('Failed to process SWIFT letter. Please try again.'));
        } finally {
            setSwiftProcessing(false);
        }
    };

    const holderName = getSafeString(iban?.account_holder_name || iban?.accountHolderName || userDetails?.fullName || userDetails?.companyName || userDetails?.name, 'HEAVYMORE LTD');
    const holderType = getSafeString(iban?.holderType || userDetails?.accountType, (userDetails?.companyName ? 'Business / Company' : 'Individual / Personal'));
    const companyType = getSafeString(iban?.companyType || userDetails?.companyType, (userDetails?.companyName ? 'Limited Liability Company' : 'Individual Account'));
    const jurisdiction = getSafeString(iban?.incorporationJurisdiction || userDetails?.country?.country_name || userDetails?.country || userDetails?.jurisdiction, 'Cyprus');
    const ibanNumber = getSafeString(iban?.iban, 'MT17 SYPL 3948 0354 2000 1814 7054 916');
    const bic = getSafeString(iban?.bank?.bic || iban?.swift_code || iban?.bic, 'SYPLMTM2');
    const currency = getSafeString(iban?.currency, 'EUR');
    const currencyLabel = currency === 'EUR' ? 'EUR (Euro)' : currency;
    const status = getSafeString(iban?.status, 'Active');
    const dateIssued = formatDate(iban?.createdAt);
    const bankName = getSafeString(iban?.bank?.name || iban?.bank_name, 'System Pay Services (Malta) Limited');
    const bankAddress = getSafeString(iban?.bankAddress || iban?.bank?.formattedAddress || iban?.bank_address, 'Route des Falaises 7, 2000 Neuchâtel, Switzerland');
    const lastUpdated = formatDate(iban?.updatedAt || iban?.createdAt);

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
                    <IbanBreadcrumb items={[
                        { label: "My virtual bank", path: "/virtual-IBAN" },
                        { label: "Statements & letters" }
                    ]} />
                </div>

                <div className={styles.subSectionHeader}>
                    <h1>{t("EUR IBAN account")}</h1>
                    <p>
                        {t("Your dedicated Malta (MT) virtual IBAN, provided through InstaPay - a brand of Kemit Kingdom SA (K2 SA).")}
                        <br />
                        {t("Download official ownership confirmation letters or transaction statements anytime.")}
                    </p>
                </div>

                <div className={styles.contentLayout}>

                    <div className={styles.accountCard}>
                        <div className={styles.accountHeader}>
                            <span>{t("EUR SEPA Account")}</span>
                            <FileText size={18} />
                        </div>

                        <div className={styles.ibanRow}>
                            <span>{ibanNumber}</span>
                            <button
                                className={styles.copyBtnWhite}
                                onClick={() => handleCopy(ibanNumber, true)}
                                aria-label={ibanCopied ? t('Copied') : t('Copy IBAN')}
                            >
                                {ibanCopied ? (
                                    <Check size={20} color='#32CD32' />
                                ) : (
                                    <Copy size={14} />
                                )}
                            </button>
                        </div>

                        <div className={styles.innerBalanceBox}>
                            <span className={styles.balanceLabel}>{t("BIC / SWIFT Status")} — {currency}</span>
                            <span className={styles.balanceAmount}> {t("Updated")} {lastUpdated}</span>
                        </div>
                    </div>

                    <div className={styles.columnsFlexGrid}>

                        <div className={styles.leftColumn}>
                            <span className={styles.sectionHeadingTitle}>{t("Documents & Statements")}</span>
                            <p className={styles.sectionHeadingSub}>{t("Choose official ownership confirmation letter or transaction activity statement.")}</p>

                            <div className={styles.docBlock}>
                                <div className={styles.actionCard}>
                                    <div className={styles.iconCircleWrapper}>
                                        <FileText size={20} style={{ color: '#fff' }} />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h3 className={styles.actionTitle}>{t("Account & IBAN Confirmation Letter")}</h3>
                                        <p className={styles.actionDesc}>
                                            {t("Official signed bank document verifying account ownership, IBAN, BIC/SWIFT, and regulatory status (PDF).")}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.btnGroup}>
                                    <button
                                        className={styles.previewBtn}
                                        onClick={handlePreviewPdf}
                                        disabled={previewing || downloading}
                                    >
                                        {previewing ? (
                                            <><Loader size={14} className={styles.spinIcon} /> {t("Loading...")}</>
                                        ) : (
                                            <><Eye size={14} /> {t("Preview Letter")}</>
                                        )}
                                    </button>
                                    <button
                                        className={styles.downloadBtn}
                                        onClick={handleDownloadPdf}
                                        disabled={downloading || previewing}
                                    >
                                        {downloading ? (
                                            <><Loader size={14} className={styles.spinIcon} /> {t("Generating...")}</>
                                        ) : (
                                            <><Download size={14} /> {t("Download Confirmation Letter")}</>
                                        )}
                                    </button>
                                    <button className={styles.shareBtn} onClick={handleShare}>
                                        <Share2 size={14} /> {t("Share")}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            {/* Section 2: SWIFT Confirmation Letter */}
                            <div className={styles.docBlock}>
                                <div className={styles.actionCard}>
                                    <div className={styles.iconCircleWrapperPurple}>
                                        <Globe size={20} style={{ color: '#fff' }} />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h3 className={styles.actionTitle}>{t("International / SWIFT Confirmation Letter")}</h3>
                                        <p className={styles.actionDesc}>
                                            {t("Official bank document with international receiving instructions, correspondent bank details, and reference code (USD / EUR).")}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.btnGroup}>
                                    <button
                                        className={styles.previewBtn}
                                        onClick={() => handleOpenSwiftModal('preview')}
                                        disabled={swiftProcessing}
                                    >
                                        <Eye size={14} /> {t("Preview Letter")}
                                    </button>
                                    <button
                                        className={styles.downloadBtn}
                                        onClick={() => handleOpenSwiftModal('download')}
                                        disabled={swiftProcessing}
                                    >
                                        <Download size={14} /> {t("Download Confirmation Letter")}
                                    </button>
                                    <button
                                        className={styles.shareBtn}
                                        onClick={() => handleOpenSwiftModal('share')}
                                        disabled={swiftProcessing}
                                    >
                                        <Share2 size={14} /> {t("Share")}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            {/* Section 3: Account Statement (Transactions) */}
                            <div className={styles.docBlock}>
                                <div className={styles.actionCard}>
                                    <div className={styles.iconCircleWrapperGreen}>
                                        <File size={20} style={{ color: '#fff' }} />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h3 className={styles.actionTitle}>{t("Account Transactions Statement")}</h3>
                                        <p className={styles.actionDesc}>
                                            {t("Download incoming & outgoing transaction records for any selected date period in PDF or CSV format.")}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.btnGroup}>
                                    <button
                                        className={styles.downloadStatementBtn}
                                        onClick={() => setShowStatementModal(true)}
                                    >
                                        <Download size={14} /> {t("Download Statements")}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.infoHelpAlertBox}>
                                <p>
                                    {t("The Confirmation Letter serves as official bank ownership proof, while Account Statements list detailed credit/debit transaction history for custom date ranges.")}
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
                                        <td className={styles.metaValue}>{holderName}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Holder Type")}</td>
                                        <td className={styles.metaValue}>{holderType}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Company Type")}</td>
                                        <td className={styles.metaValue}>{companyType}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Jurisdiction")}</td>
                                        <td className={styles.metaValue}>{jurisdiction}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("IBAN")}</td>
                                        <td className={styles.metaValue} style={{ fontFamily: 'monospace' }}>{ibanNumber}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("BIC / SWIFT")}</td>
                                        <td className={styles.metaValue} style={{ fontFamily: 'monospace' }}>{bic}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Currency")}</td>
                                        <td className={styles.metaValue}>{currencyLabel}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Account Type")}</td>
                                        <td className={styles.metaValue}>{t("E-money payment account (Virtual IBAN)")}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Status")}</td>
                                        <td className={styles.metaValueStatus}>{status}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Date Issued")}</td>
                                        <td className={styles.metaValue}>{dateIssued}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.metaLabel}>{t("Provider")}</td>
                                        <td className={styles.metaValue}>{bankName}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
            <StatementModal
                isOpen={showStatementModal}
                toggle={() => setShowStatementModal(false)}
                selectedIban={iban}
            />
            <SwiftCurrencyModal
                isOpen={showSwiftModal}
                toggle={() => setShowSwiftModal(false)}
                actionType={swiftActionType}
                onConfirm={handleSwiftActionConfirm}
                isProcessing={swiftProcessing}
            />
        </div>
    );
};

export default StatementsLetters;
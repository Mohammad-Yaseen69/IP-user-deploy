import { useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from "@mui/material/Tooltip";
import { ArrowDownCircle, RefreshCw, Send } from 'react-feather';
import useWindowWidth from '../../../../utils/useWindowWidth';
import TopRight from '../../../topRight';
import styles from "../style/moveMoney.module.css";
import IbanBreadcrumb from '../../components/IbanBreadcrumb';
import CryptoTopupModal from '../../CryptoTopupModal';
import IbanToCryptoModal from '../../IbanToCryptoModal';
import IbanCryptoPayoutModal from '../../IbanCryptoPayoutModal';
import { useSyncVirtualIbanBalance, useVirtualIbans } from '../../../../hooks/useVirtualIban';
import { asVirtualIbanArray, isVirtualIbanOutboundBlocked } from '../../utils/virtualIban';
import { UserContext } from '../../../../Context/UserContext';
import { usePermission } from '../../../../hooks/GeneralUse/usePermission';
import MobileHeader from '../../../../Common/Component/MobileHeader';

const TEMP_ALLOWED_USERS=['yaseen123', 'ahmed', 'jackeb777', 'hunain','ali_tov']

const CryptoActions = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const isMobile = width <= 600;
    const can = usePermission();
    const convertRef = useRef(null);
    const payoutRef = useRef(null);

    const [showTopup, setShowTopup] = useState(false);
    const [showConvert, setShowConvert] = useState(false);
    const [showPayout, setShowPayout] = useState(false);

    const { userDetails, selectedAccount } = useContext(UserContext);
    const { data: rawIbans = [] } = useVirtualIbans(userDetails?._id);
    const ibans = useMemo(() => asVirtualIbanArray(rawIbans), [rawIbans]);
    const selectedIban = useMemo(
        () => ibans.find((iban) => (iban?._id || iban?.id) === selectedAccount) || ibans[0],
        [ibans, selectedAccount]
    );
    const ibanId = selectedIban?._id || selectedIban?.id;
    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId);
    const currentBalance = syncedBalance?.balance ?? selectedIban?.balance ?? 0;

    const isOutboundBlocked =
        isVirtualIbanOutboundBlocked(syncedBalance) || isVirtualIbanOutboundBlocked(selectedIban);
    const canConvert = can("virtual-iban.funds.convert") && !isOutboundBlocked;
    const convertTooltip = isOutboundBlocked
        ? t("Outgoing transfers are disabled for this virtual IBAN.")
        : !can("virtual-iban.funds.convert")
            ? t("You don't have permission to do this.")
            : "";

    const canPayout = can("virtual-iban.funds.withdraw") && !isOutboundBlocked;
    const payoutTooltip = isOutboundBlocked
        ? t("Outgoing transfers are disabled for this virtual IBAN.")
        : !can("virtual-iban.funds.withdraw")
            ? t("You don't have permission to do this.")
            : "";

    const showConvertPage = showConvert && isMobile;
    const closeConvert = () => setShowConvert(false);
    const showPayoutPage = showPayout && isMobile;
    const closePayout = () => setShowPayout(false);

    const isExternalCryptosAllowed = TEMP_ALLOWED_USERS.includes(userDetails?.username);

    return (
        <>
            {showConvertPage &&
                <MobileHeader
                    title={"IBAN to crypto"}
                    handleAction={closeConvert}
                    handleBack={() => convertRef.current?.back()}
                />
            }
            {showPayoutPage &&
                <MobileHeader
                    title={"External crypto payout"}
                    handleAction={closePayout}
                    handleBack={() => payoutRef.current?.back()}
                />
            }
            <div className={styles.container}>
                {!isMobile &&
                    <div className={styles.top}>
                        <div className={styles.headerTitle}>
                            <h1>{t("Crypto")}</h1>
                            <p>{t("Top up with crypto, convert your balance to crypto, and send it out.")}</p>
                        </div>
                        <div className={styles.topright}>
                            {width > 1000 && <TopRight />}
                        </div>
                    </div>
                }

                <div className={styles.mainContent}>
                    {showConvertPage ? (
                        <IbanToCryptoModal
                            isPage
                            ref={convertRef}
                            selectedIban={selectedIban}
                            availableBalance={currentBalance}
                            toggle={closeConvert}
                        />
                    ) : showPayoutPage ? (
                        <IbanCryptoPayoutModal
                            isPage
                            ref={payoutRef}
                            selectedIban={selectedIban}
                            availableBalance={currentBalance}
                            toggle={closePayout}
                        />
                    ) : (
                        <>
                            <div className={styles.headerTitle}>
                                <IbanBreadcrumb items={[
                                    { label: "My virtual bank", path: "/virtual-IBAN" },
                                    { label: "Crypto" }
                                ]} />
                                <h1>{t("What would you like to do with crypto?")}</h1>
                                <p>{t("Move money between your virtual IBAN and crypto — pick one to begin.")}</p>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("Crypto actions")} <span>{t("Add, convert and send crypto from your virtual IBAN")}</span></div>
                                <div className={styles.cardsGrid3}>
                                    <div className={styles.card} onClick={() => setShowTopup(true)} style={{ cursor: "pointer" }}>
                                        <div className={`${styles.iconBox} ${styles.bgBlue}`}>
                                            <ArrowDownCircle size={20} />
                                        </div>
                                        <div className={styles.cardBody}>
                                            <h3 className={styles.cardTitle}>{t("Top up with crypto")}</h3>
                                            <p className={styles.cardDesc}>
                                                {t("Pay in USDT and receive euro on your virtual IBAN.")}
                                            </p>
                                            <div className={styles.badgeRow}>
                                                <span className={`${styles.tag} ${styles.tagBlue}`}>{t("USDT")}</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>{t("Crypto to EUR")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Tooltip title={convertTooltip} arrow>
                                        <div
                                            className={`${styles.card} ${canConvert ? "" : styles.cardDisabled}`}
                                            onClick={canConvert ? () => setShowConvert(true) : undefined}
                                            style={{ cursor: canConvert ? "pointer" : "not-allowed" }}
                                        >
                                            <div className={`${styles.iconBox} ${styles.bgGreen}`}>
                                                <RefreshCw size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("IBAN to crypto wallet")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("Convert euro from your virtual IBAN into your InstaPay USDT wallet.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagBlue}`}>{t("EUR to USDT")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGreen}`}>{t("Minutes")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title={isExternalCryptosAllowed?payoutTooltip:'Coming Soon'} arrow>
                                        <div
                                            className={`${styles.card} ${canPayout ? "" : styles.cardDisabled}`}
                                            onClick={(canPayout && isExternalCryptosAllowed)  ? () => setShowPayout(true) : undefined}
                                            style={{ cursor: canPayout ? "pointer" : "not-allowed" }}
                                        >
                                            <div className={`${styles.iconBox} ${styles.bgYellow}`}>
                                                <Send size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("External crypto payout")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("Send from your virtual IBAN straight to an external crypto wallet.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagBlue}`}>{t("EUR to USDT / USDC")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGreen}`}>{t("Minutes")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <CryptoTopupModal
                    isOpen={showTopup}
                    toggle={() => setShowTopup(false)}
                    selectedIban={selectedIban}
                />
                {!isMobile && (
                    <IbanCryptoPayoutModal
                        isOpen={showPayout}
                        toggle={closePayout}
                        selectedIban={selectedIban}
                        availableBalance={currentBalance}
                    />
                )}
                {!isMobile && (
                    <IbanToCryptoModal
                        isOpen={showConvert}
                        toggle={closeConvert}
                        selectedIban={selectedIban}
                        availableBalance={currentBalance}
                    />
                )}
            </div>
        </>
    );
};

export default CryptoActions;

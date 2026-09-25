import React, { useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../../utils/useWindowWidth';
import TopRight from '../../../topRight';
import styles from "../style/moveMoney.module.css";
import IbanBreadcrumb from '../../components/IbanBreadcrumb';
import Tooltip from "@mui/material/Tooltip";
import {
    Compass,
    Globe,
    Briefcase,
    RefreshCw,
    CreditCard,
    ArrowLeft,
    Search,
    ChevronLeft
} from 'react-feather';
import SepaTransfer from '../../SendMoney/SepaTransfer';
import SwiftTransfer from '../../SendMoney/SwiftTransfer';
import CryptoTopupModal from '../../CryptoTopupModal';
import { useSyncVirtualIbanBalance, useVirtualIbans } from '../../../../hooks/useVirtualIban';
import { asVirtualIbanArray, isVirtualIbanOutboundBlocked } from '../../utils/virtualIban';
import { UserContext } from '../../../../Context/UserContext';
import { useNavigate } from 'react-router';
import MobileHeader from '../../../../Common/Component/MobileHeader';

const MoveMoney = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [showSepaPage, setShowSepaPage] = useState(false);
    const [showSwiftPage, setShowSwiftPage] = useState(false);
    const [showCryptoTopupModal, setShowCryptoTopupModal] = useState(false);
    const btnRef = useRef(null);

    const {
        userDetails,
        selectedAccount,
    } = useContext(UserContext);

    const { data: rawIbans = [], isLoading: ibansLoading } =
        useVirtualIbans(userDetails?._id);
    const ibans = useMemo(
        () => asVirtualIbanArray(rawIbans),
        [rawIbans]
    );
    const selectedIban = useMemo(
        () =>
            ibans.find(
                (iban) => (iban?._id || iban?.id) === selectedAccount
            ) || ibans[0],
        [ibans, selectedAccount]
    );

    const ibanId = selectedIban?._id || selectedIban?.id;

    const { data: syncedBalance } = useSyncVirtualIbanBalance(ibanId);

    const currentBalance = syncedBalance?.balance ?? selectedIban?.balance ?? 0

    // Outgoing transfers are switched off for this IBAN, so SEPA and SWIFT
    // cannot be started from here.
    const isOutboundBlocked =
        isVirtualIbanOutboundBlocked(syncedBalance) || isVirtualIbanOutboundBlocked(selectedIban)
    const outboundBlockedTooltip = t("Outgoing transfers are disabled for this virtual IBAN.")
    const handleClose = () => setShowSwiftPage(false);

    return (
        <>
            {(showSwiftPage && width <= 600) &&
                <MobileHeader 
                    title={"SWIFT International"}
                    handleAction={handleClose}
                    handleBack={() => btnRef.current?.back()}
                />
            }
        <div className={styles.container}>      
            {width > 600 &&     
                <div className={styles.top}>
                    <div className={styles.headerTitle}>
                        <h1>{t("Move money")}</h1>
                        <p>{t("Choose how to pay, get paid and manage your balances — pick one to begin.")}</p>
                    </div>
                    <div className={styles.topright}>
                        {width > 1000 && <TopRight />}
                    </div>
                </div>
            }

            <div className={styles.mainContent}>
                {
                    showSepaPage ?
                        <>
                            <IbanBreadcrumb items={[
                                { label: "My virtual bank", path: "/virtual-IBAN" },
                                { label: "Move money", onClick: () => setShowSepaPage(false) },
                                { label: "SEPA Transfer" }
                            ]} />
                            <SepaTransfer
                                isPage={true}
                                selectedIban={selectedIban}
                                availableBalance={currentBalance}
                                toggle={() => setShowSepaPage(false)}
                            />
                        </>
                    : showSwiftPage ?
                        <>
                        {width > 600 &&
                            <IbanBreadcrumb items={[
                                { label: "My virtual bank", path: "/virtual-IBAN" },
                                { label: "Move money", onClick: handleClose },
                                { label: "SWIFT Transfer" }
                            ]} />
                        }
                            <SwiftTransfer
                                isPage={true}
                                selectedIban={selectedIban}
                                availableBalance={currentBalance}
                                toggle={handleClose}
                                ref={btnRef}
                            />
                        </>

                        : <>                            
                            <div className={styles.headerTitle}>
                                <IbanBreadcrumb items={[
                                    { label: "My virtual bank", path: "/virtual-IBAN" },
                                    { label: "Move money" }
                                ]} />
                                <h1>{t("How would you like to move money?")}</h1>
                                <p>{t("Six ways to pay, get paid and manage your balances — pick one to begin.")}</p>

                            </div>
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("Send money out")} <span>{t("Instant, free transfers between InstaPay accounts")}</span></div>
                                <div className={styles.cardsGrid3}>

                                    <Tooltip title={isOutboundBlocked ? outboundBlockedTooltip : ""} arrow>
                                    <div
                                        className={`${styles.card} ${isOutboundBlocked ? styles.cardDisabled : ""}`}
                                        onClick={isOutboundBlocked ? undefined : () => setShowSepaPage(true)}
                                        style={{ cursor: isOutboundBlocked ? "not-allowed" : "pointer" }}
                                    >
                                        <div className={`${styles.iconBox} ${styles.bgBlue}`}>
                                            <Compass size={20} />
                                        </div>
                                        <div className={styles.cardBody}>
                                            <h3 className={styles.cardTitle}>{t("SEPA Transfer")}</h3>
                                            <p className={styles.cardDesc}>
                                                {t("European bank transfers in euro — fast, and low-cost across 30+ SEPA countries.")}
                                            </p>
                                            <div className={styles.badgeRow}>
                                                <span className={`${styles.tag} ${styles.tagBlue}`}>{t("Euro")}</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>{t("1-3 Days")}</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>{t("Low-cost")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    </Tooltip>
                                    <Tooltip title={isOutboundBlocked ? outboundBlockedTooltip : ""} arrow>
                                    <div
                                        className={`${styles.card} ${isOutboundBlocked ? styles.cardDisabled : ""}`}
                                        onClick={isOutboundBlocked ? undefined : () => setShowSwiftPage(true)}
                                        style={{ cursor: isOutboundBlocked ? "not-allowed" : "pointer" }}
                                    >
                                        <div className={`${styles.iconBox} ${styles.bgYellow}`}>
                                            <Globe size={20} />
                                        </div>
                                        <div className={styles.cardBody}>
                                            <h3 className={styles.cardTitle}>{t("SWIFT International")}</h3>
                                            <p className={styles.cardDesc}>
                                                {t("Worldwide bank transfers in USD, EUR, GBP, CHF and more, with country-specific routing.")}
                                            </p>
                                            <div className={styles.badgeRow}>
                                                <span className={`${styles.tag} ${styles.tagBlue}`}>USD, EUR, GBP</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>1-5 Days</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>Worldwide</span>
                                            </div>
                                        </div>
                                    </div>
                                    </Tooltip>
                                    <Tooltip title="Coming Soon" arrow>

                                        <div className={`${styles.card}`}>
                                            <div className={`${styles.iconBox} ${styles.bgGreen}`}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("Global Remittance Hub")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("Pay to bank account, mobile money, wallet or cash pickup — country-adaptive, powered by Thunes.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag}`}>{t("Worldwide")}</span>
                                                    <span className={`${styles.tag}`}>{t("Fast lookup")}</span>
                                                    <span className={`${styles.tag}`}>{t("Country-adaptive")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>

                                </div>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("WITHIN INSTAPAY")} <span>{t("Instant, free transfers between InstaPay accounts")}</span></div>

                                <div className={styles.cardsGrid2}>
                                    <Tooltip title={t("Coming Soon")} arrow>

                                        <div className={styles.card}>
                                            <div className={`${styles.iconBox} ${styles.bgRed}`}>
                                                <RefreshCw size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("Move & Send")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("Move between your own accounts, or send to any InstaPay user by phone, username, email or IBAN.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagGreen}`}>{t("Instant")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>{t("Free")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>{t("Internal Send")}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </Tooltip>
                                </div>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("YOUR MONEY & ASSETS")} <span>{t("Hold, convert and grow your balances")}</span></div>
                                <div className={styles.cardsGrid2}>
                                    <Tooltip title={t("Coming Soon")} arrow>

                                        <div className={styles.card}>
                                            <div className={`${styles.iconBox} ${styles.bgGreen}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("Balances")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("All your money in one place — hold EUR, USD, CHF and crypto, and convert instantly at live FX.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagBlue}`}>{t("Multi-currency")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>{t("Fiat/Crypto")}</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>{t("Accounts")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>

                            
                        </>
                }

            </div>

            <CryptoTopupModal
                isOpen={showCryptoTopupModal}
                toggle={() => setShowCryptoTopupModal(false)}
                selectedIban={selectedIban}
            />

        </div>
        </>
    );
};

export default MoveMoney;
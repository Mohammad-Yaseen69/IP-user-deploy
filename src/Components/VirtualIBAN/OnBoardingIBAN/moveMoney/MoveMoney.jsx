import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../../utils/useWindowWidth';
import TopRight from '../../../topRight';
import styles from "../style/moveMoney.module.css";
import Tooltip from "@mui/material/Tooltip";
import {
    Compass,
    Globe,
    Briefcase,
    RefreshCw,
    CreditCard,
    Cpu,
    ArrowLeft,
    Search
} from 'react-feather';
import SepaTransfer from '../../SendMoney/SepaTransfer';
import { useSyncVirtualIbanBalance, useVirtualIbans } from '../../../../hooks/useVirtualIban';
import { asVirtualIbanArray } from '../../utils/virtualIban';
import { UserContext } from '../../../../Context/UserContext';
import { useNavigate } from 'react-router';

const MoveMoney = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const [showSepaPage, setShowSepaPage] = useState(false);
    const navigate = useNavigate();
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

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Move money")}</h1>
                    <p>{t("Choose how to pay, get paid and manage your balances — pick one to begin.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.mainContent}>
                {
                    showSepaPage ?
                        <>
                            <div className={styles.headerTitle}>

                                <div className={styles.navigationRow}>
                                    <button className={styles.backBtn}
                                        onClick={() => setShowSepaPage(false)}
                                    >
                                        <ArrowLeft size={16} /> {t("Back")}
                                    </button>
                                    <span className={styles.breadcrumb}>
                                        {t("My virtual bank")} &gt; <span className={styles.breadcrumbActive}>{t("Move money")}</span>
                                    </span>
                                </div>


                            </div>
                            <SepaTransfer
                                isPage={true}
                                selectedIban={selectedIban}
                                availableBalance={currentBalance}
                                toggle={() => setShowSepaPage(false)}
                            />
                        </>

                        : <>
                            <div className={styles.headerTitle}>

                                <div className={styles.navigationRow}>
                                    <button className={styles.backBtn}
                                        onClick={() => navigate("/virtual-IBAN")}
                                    >
                                        <ArrowLeft size={16} /> {t("Back")}
                                    </button>
                                    <span className={styles.breadcrumb}>
                                        {t("My virtual bank")} &gt; <span className={styles.breadcrumbActive}>{t("Move money")}</span>
                                    </span>
                                </div>

                                <h1>{t("How would you like to move money?")}</h1>
                                <p>{t("Six ways to pay, get paid and manage your balances — pick one to begin.")}</p>

                                <div className={styles.searchContainer}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder={t("Search — e.g. Europe, crypto, cash, instant_")}
                                    />
                                </div>
                            </div>
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("Send money out")} <span>{t("Instant, free transfers between InstaPay accounts")}</span></div>
                                <div className={styles.cardsGrid3}>

                                    <div className={styles.card} onClick={() => setShowSepaPage(true)}
                                        style={{ cursor: "pointer" }}
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
                                                <span className={`${styles.tag} ${styles.tagBlue}`}>Euro</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>1-3 Days</span>
                                                <span className={`${styles.tag} ${styles.tagGray}`}>Low-cost</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Tooltip title="Coming Soon" arrow>

                                        <div className={styles.card}>
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

                                        <div className={`${styles.card} ${styles.cardPurple}`}>
                                            <div className={`${styles.iconBox} ${styles.bgWhiteTrans}`}>
                                                <Briefcase size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitleWhite}>{t("Global Remittance Hub")}</h3>
                                                <p className={styles.cardDescWhite}>
                                                    {t("Pay to bank account, mobile money, wallet or cash pickup — country-adaptive, powered by Thunes.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagWhite}`}>Worldwide</span>
                                                    <span className={`${styles.tag} ${styles.tagWhite}`}>Fast lookup</span>
                                                    <span className={`${styles.tag} ${styles.tagWhite}`}>Country-adaptive</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>

                                </div>
                            </div>

                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("WITHIN INSTAPAY")} <span>{t("Instant, free transfers between InstaPay accounts")}</span></div>

                                <div className={styles.cardsGrid2}>
                                    <Tooltip title="Coming Soon" arrow>

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
                                                    <span className={`${styles.tag} ${styles.tagGreen}`}>Instant</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Free</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Internal Send</span>
                                                </div>
                                            </div>
                                        </div>

                                    </Tooltip>
                                </div>
                            </div>


                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionLabel}>{t("YOUR MONEY & ASSETS")} <span>{t("Hold, convert and grow your balances")}</span></div>
                                <div className={styles.cardsGrid2}>
                                    <Tooltip title="Coming Soon" arrow>

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
                                                    <span className={`${styles.tag} ${styles.tagBlue}`}>Multi-currency</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Fiat/Crypto</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Accounts</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Coming Soon" arrow>
                                        <div className={styles.card}>
                                            <div className={`${styles.iconBox} ${styles.bgOrange}`}>
                                                <Cpu size={20} />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.cardTitle}>{t("Crypto & Stablecoins")}</h3>
                                                <p className={styles.cardDesc}>
                                                    {t("Receive, send, convert, request and mass-pay in crypto — auto-settle to your IBAN. Powered by BVNK.")}
                                                </p>
                                                <div className={styles.badgeRow}>
                                                    <span className={`${styles.tag} ${styles.tagBlue}`}>Assets</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Payouts</span>
                                                    <span className={`${styles.tag} ${styles.tagGray}`}>Gateways</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </>
                }

            </div>

        </div >
    );
};

export default MoveMoney;
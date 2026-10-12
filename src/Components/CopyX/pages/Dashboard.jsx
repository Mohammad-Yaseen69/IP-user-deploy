import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { EyeOff } from "lucide-react"
import { COPY_STATUS, PAGES, isCopyLive } from "../../../stateMachines/copyTrading"
import { selectStrategy } from "../api"
import activityCopyIcon from "../assets/figma/dash-activity-copy.svg"
import activityCreditIcon from "../assets/figma/dash-activity-credit.svg"
import activityReceiptIcon from "../assets/figma/dash-activity-receipt.svg"
import arrowUpRightIcon from "../assets/figma/dash-arrow-up-right.svg"
import bankIcon from "../assets/figma/dash-bank.svg"
import cardGlow from "../assets/figma/dash-card-glow.svg"
import cardTexture from "../assets/figma/dash-card-texture.png"
import copyWhiteIcon from "../assets/figma/dash-copy-white.svg"
import copyIcon from "../assets/figma/dash-copy.svg"
import mobileIcon from "../assets/figma/dash-device-mobile.svg"
import dotNeutral from "../assets/figma/dash-dot-neutral.svg"
import dotSuccess from "../assets/figma/dash-dot-success.svg"
import eyeIcon from "../assets/figma/dash-eye.svg"
import headsetIcon from "../assets/figma/dash-headset.svg"
import searchIcon from "../assets/figma/dash-magnifying-glass.svg"
import sendIcon from "../assets/figma/dash-paper-plane.svg"
import plusIcon from "../assets/figma/dash-plus.svg"
import walletIcon from "../assets/figma/dash-wallet.svg"
import warningIcon from "../assets/figma/dash-warning.svg"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatAmount, formatAmountNumber, formatDateTime, formatTime, formatUsd, formatUsdNumber } from "../state/money"
import { strategyCopies, totalEquityCents, totalWithdrawableCents, unitsPerUsd } from "../state/selectors"
import { ACCOUNT_STATUS } from "../ui/icons"
import { Page } from "../ui/layout"
import { Modal } from "../ui/overlays"
import { Button } from "../ui/primitives"
import styles from "../styles/copyTrading.module.css"
import s from "./Dashboard.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

const JOURNEY = [
    ["Choose a strategy", "Compare drawdown and fees"],
    ["Connect and verify", "Secure broker connection"],
    ["Fund your trading account", "From your IBAN-linked wallet"],
    ["Confirm the copy mandate", "Separate, explicit consent"],
    ["Withdraw available cash", "To your own account"],
]

const STATUS_PILL = { done: [s.pillSuccess, "Completed"], failed: [s.pillError, "Failed"] }

const COPY_PILL = {
    [COPY_STATUS.ACTIVE]: [s.pillSuccess, "Copying"],
    [COPY_STATUS.PAUSED]: [s.pillNeutral, "Paused"],
    [COPY_STATUS.STOPPED]: [s.pillError, "Stopped"],
}
const copyPill = (status) => COPY_PILL[status] || [s.pillWarning, "Pending"]
const ACCOUNT_TONE = { success: s.toneSuccess, warning: s.toneWarning, error: s.toneError }
const HIDDEN = "••••••"

const greetingKey = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning, {{name}}."
    if (hour < 18) return "Good afternoon, {{name}}."
    return "Good evening, {{name}}."
}

const activityIcon = (item) => {
    if (item.kind === "copy") return activityCopyIcon
    if (item.kind === "account") return bankIcon
    if (item.kind === "wallet") return walletIcon
    if (item.currency) return activityReceiptIcon
    return activityCreditIcon
}

/* Broker credits read as incoming USD; wallet debits and payouts in their own currency. */
const activityAmount = (item) => {
    if (item.amountCents) return { sign: item.kind === "funding" ? "+ " : "", value: formatUsdNumber(item.amountCents), unit: "USD", credit: item.kind === "funding" }
    if (item.amount) return { sign: item.kind === "funding" ? "− " : "", value: formatAmountNumber(item.amount, item.currency), unit: item.currency, credit: false }
    return null
}

const StatusCard = ({ icon, title, subtitle, value, unit, foot, success, compact, onClick }) => (
    <button type="button" className={cx(s.statusCard, compact && s.statusCardCompact)} onClick={onClick}>
        <span className={s.statusTop}>
            <span className={s.iconTile}><img src={icon} alt="" /></span>
            <span className={s.openTile}><img src={arrowUpRightIcon} alt="" /></span>
        </span>
        <span className={s.statusText}>
            <span className={s.statusTitle}>{title}</span>
            <span className={s.statusSub}>{subtitle}</span>
        </span>
        <span className={s.statusValue}>
            {unit
                ? <span className={s.valueNumber}>{value}<span className={s.valueUnit}> {unit}</span></span>
                : <span className={s.valueText}>{value}</span>}
            <span className={cx(s.status, success && s.statusSuccess)}>
                <img src={success ? dotSuccess : dotNeutral} alt="" />
                {foot}
            </span>
        </span>
    </button>
)

/* WEB-01 in its three states: not connected, connected, copying active. */
const Dashboard = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const ctx = useCopyTrading()
    const { state, go, customer, iban, wallets, fundingWallet, receiving, openSupport } = ctx
    const [hidden, setHidden] = useState(false)
    const [howOpen, setHowOpen] = useState(false)

    const linked = state.profile.brokerLink === "linked"
    /* Strategies run in parallel with separate funds; the cards add them up, the table lists each one. */
    const copies = strategyCopies(state)
    const live = copies.some(item => isCopyLive(item.status))
    const activating = !live && copies.some(item => item.status === COPY_STATUS.ACTIVATION_PENDING)
    const lastRefresh = Object.values(state.copies).map(slot => slot.broker?.refreshedAt).filter(Boolean).sort().pop()
    const strategyName = (id) => state.strategies.find(item => item.id === id)?.name
    const brokerLast4 = state.profile.brokerAccountId?.slice(-4)
    /* The hero shows the wallet copy trading pays from; the other real wallets are listed in the aside. */
    const wallet = fundingWallet || wallets[0] || null
    const currency = wallet?.currency
    const rate = unitsPerUsd(state, currency)
    const walletName = currency ? t("{{currency}} Wallet", { currency }) : t("InstaPay Wallet")
    const walletLabel = iban ? t("{{wallet}} · IBAN ending {{last4}}", { wallet: walletName, last4: iban.masked.slice(-4) }) : walletName
    const balance = hidden ? HIDDEN : wallet ? formatAmountNumber(wallet.balance, currency) : "…"
    const otherWallets = wallets.filter(item => item.id !== wallet?.id)
    const accounts = receiving.accounts
    const doneActivity = state.activity.filter(item => item.status !== "pending").slice(0, 5)
    const brokerStatus = linked ? "Connected" : state.profile.brokerLink === "pending" ? "In review" : "Not connected"

    const openStrategy = (id) => { selectStrategy(id); go(PAGES.WORKSPACE) }
    const openCopyTrading = () => {
        if (!copies.length) return go(PAGES.STRATEGIES)
        openStrategy(copies.some(item => item.id === state.draft.strategyId) ? state.draft.strategyId : copies[0].id)
    }

    return (
        <Page title={t("Dashboard")} subtitle={t("Copy Trading with Tag Markets")}>
            <h2 className={s.greeting}>{t(greetingKey(), { name: customer.firstName || t("there") })}</h2>
            <p className={s.lead}>{t("Your wallet, your trading account and your receiving destinations, clearly separated.")}</p>

            <div className={s.grid}>
                <div className={s.main}>
                    <div className={s.balanceGroup}>
                        <section className={s.hero}>
                            <span className={s.heroRing} aria-hidden="true" />
                            <div className={s.heroRow}>
                                <div className={s.heroText}>
                                    <p className={s.heroLabel}>{walletLabel}</p>
                                    <p className={s.heroValue}>
                                        {currency && <span className={s.heroCurrency}>{currency}</span>}
                                        <span className={s.heroAmount}>{balance}</span>
                                    </p>
                                    {wallet && rate && currency !== "USD" && (
                                        <p className={s.heroHint}>{t("Approx. {{usd}} at {{rate}} {{currency}} per USD", { usd: hidden ? HIDDEN : formatUsd(Math.round((wallet.balance / rate) * 100), { decimals: false }), rate: formatAmountNumber(rate, currency), currency })}</p>
                                    )}
                                </div>
                                <button type="button" className={s.eyeBtn} onClick={() => setHidden(value => !value)} aria-label={t(hidden ? "Show balance" : "Hide balance")}>
                                    {hidden ? <EyeOff size={18} aria-hidden="true" /> : <img src={eyeIcon} alt="" />}
                                </button>
                            </div>
                        </section>

                        <div className={s.quickActions}>
                            <button type="button" className={s.quickAction} onClick={() => navigate("/add-funds")}><img src={plusIcon} alt="" />{t("Add funds")}</button>
                            <button type="button" className={s.quickAction} onClick={() => go(PAGES.SETTINGS)}><img src={sendIcon} alt="" />{t("Receiving accounts")}</button>
                            <button type="button" className={cx(s.quickAction, s.quickActionBrand)} onClick={openCopyTrading}>
                                <img src={copyIcon} alt="" />{t("Copy Trading")}
                                <span className={s.newBadge}>{t("New")}</span>
                            </button>
                        </div>
                    </div>

                    <section className={s.promo}>
                        <div className={s.promoMain}>
                            <div className={s.promoIntro}>
                                <p className={s.promoEyebrow}>{t("Copy Trading · Tag Markets")}</p>
                                <div className={s.promoCopy}>
                                    <h3 className={s.promoTitle}>{t("Copy a strategy. Fund locally.")}<br />{t("Withdraw to your own account.")}</h3>
                                    <p className={s.promoText}>{t("Explore strategies, choose your allocation and manage copying. Pay and receive through eligible InstaPay methods.")}</p>
                                </div>
                            </div>
                            <div className={s.promoFoot}>
                                <p className={s.risk}><img src={warningIcon} alt="" />{t("Capital is at risk. No guaranteed returns.")}</p>
                                <div className={s.promoActions}>
                                    <button type="button" className={s.primaryBtn} onClick={() => go(PAGES.STRATEGIES)}>{t("Explore strategies")}</button>
                                    {live || activating
                                        ? <button type="button" className={s.textBtn} onClick={openCopyTrading}>{t("Manage copying")}</button>
                                        : <button type="button" className={s.textBtn} onClick={() => setHowOpen(true)}>{t("How it works")}</button>}
                                </div>
                            </div>
                        </div>
                        <div className={s.journey}>
                            <p className={s.journeyTitle}>{t("Your end-to-end journey")}</p>
                            <ol className={s.journeyList}>
                                {JOURNEY.map(([name, hint], index) => (
                                    <li key={name} className={s.journeyItem}>
                                        <span className={s.journeyNum}>{index + 1}</span>
                                        <span className={s.journeyText}>
                                            <span className={s.journeyName}>{t(name)}</span>
                                            <span className={s.journeyHint}>{t(hint)}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <div className={s.statusCards}>
                        {live || activating ? (
                            <StatusCard icon={searchIcon} title={t("Strategies")} subtitle={copies.map(item => item.strategy?.name).join(" · ")} value={String(copies.length)} unit={t("active")} success={!activating} foot={t(activating ? "Activation pending" : "Copying in parallel")} compact={live} onClick={openCopyTrading} />
                        ) : (
                            <StatusCard icon={searchIcon} title={t("Strategies")} subtitle={t("Compare drawdown and fees")} value={String(state.strategies.length || 4)} unit={t("strategies")} success foot={t("Browse strategies")} onClick={() => go(PAGES.STRATEGIES)} />
                        )}
                        {live ? (
                            <StatusCard icon={bankIcon} title={t("Tag Markets")} subtitle={t(copies.length > 1 ? "Total trading equity" : "Trading equity")} value={formatUsdNumber(totalEquityCents(state))} unit="USD" success foot={t("Updated {{time}}", { time: formatTime(lastRefresh) })} compact onClick={openCopyTrading} />
                        ) : (
                            <StatusCard
                                icon={bankIcon}
                                title={t("Tag Markets")}
                                subtitle={t("Trading account")}
                                value={t(brokerStatus)}
                                success={linked}
                                foot={linked ? (brokerLast4 ? t("Account ending {{last4}}", { last4: brokerLast4 }) : t("Ready to fund")) : t("Connect to fund")}
                                onClick={() => go(state.draft.strategyId ? PAGES.ACCOUNTS : PAGES.STRATEGIES)}
                            />
                        )}
                        {live ? (
                            <StatusCard icon={walletIcon} title={t("Withdraw")} subtitle={t(copies.length > 1 ? "Cash across strategies" : "Broker cash only")} value={formatUsdNumber(totalWithdrawableCents(state))} unit="USD" success foot={t("Broker-confirmed")} compact onClick={openCopyTrading} />
                        ) : linked ? (
                            <StatusCard icon={walletIcon} title={t("Withdraw")} subtitle={t("Broker cash only")} value={formatUsdNumber(totalWithdrawableCents(state))} unit="USD" foot={t("After copying starts")} onClick={() => go(PAGES.STRATEGIES)} />
                        ) : (
                            <StatusCard icon={walletIcon} title={t("Withdraw")} subtitle={t("Broker cash only")} value={t("Connect to view")} foot={t("Withdrawable balance")} onClick={() => go(PAGES.STRATEGIES)} />
                        )}
                    </div>

                    {copies.length > 0 && (
                        <section className={s.panel}>
                            <div className={s.panelHead}>
                                <h3 className={s.panelTitle}>{t("Your strategies")}</h3>
                                <button type="button" className={s.manage} onClick={() => go(PAGES.STRATEGIES)}>{t("Copy another strategy")}</button>
                            </div>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th>{t("Strategy")}</th>
                                        <th className={s.colStatus}>{t("Status")}</th>
                                        <th className={s.colAmount}>{t("Equity · withdrawable")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {copies.map(item => {
                                        const [pillClass, label] = copyPill(item.status)
                                        return (
                                            <tr key={item.id} className={s.rowLink} onClick={() => openStrategy(item.id)} tabIndex={0} onKeyDown={e => e.key === "Enter" && openStrategy(item.id)}>
                                                <td>
                                                    <span className={s.activityCell}>
                                                        <span className={s.activityIcon}><img src={activityCopyIcon} alt="" /></span>
                                                        <span className={s.activityText}>
                                                            <span className={s.activityTitle}>{item.strategy?.name}</span>
                                                            <span className={s.activityMeta}>{t("{{count}} open positions", { count: item.positions })}{item.withdrawing ? ` · ${t("Withdrawal in progress")}` : ""}</span>
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className={s.colStatus}><span className={cx(s.pill, pillClass)}>{t(label)}</span></td>
                                                <td className={s.colAmount}>
                                                    <p className={s.amountValue}>{formatUsdNumber(item.equityCents)}</p>
                                                    <p className={s.amountUnit}>{t("{{amount}} withdrawable", { amount: formatUsd(item.withdrawableCents) })}</p>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </section>
                    )}

                    <section className={s.panel}>
                        <h3 className={s.panelTitle}>{t("Recent copy-trading activity")}</h3>
                        {doneActivity.length === 0 ? (
                            <p className={s.empty}>{t(linked ? "Account connected. Choose a strategy to start copying." : "No trading activity yet. Choose a strategy and connect your account to get started.")}</p>
                        ) : (
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th>{t("Activity")}</th>
                                        <th className={s.colStatus}>{t("Status")}</th>
                                        <th className={s.colAmount}>{t("Amount")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doneActivity.map(item => {
                                        const [pillClass, label] = STATUS_PILL[item.status] || STATUS_PILL.done
                                        const amount = activityAmount(item)
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <span className={s.activityCell}>
                                                        <span className={s.activityIcon}><img src={activityIcon(item)} alt="" /></span>
                                                        <span className={s.activityText}>
                                                            <span className={s.activityTitle}>{t(item.label)}</span>
                                                            <span className={s.activityMeta}>{formatDateTime(item.at)}{strategyName(item.strategyId) ? ` · ${strategyName(item.strategyId)}` : ""}</span>
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className={s.colStatus}><span className={cx(s.pill, pillClass)}>{t(label)}</span></td>
                                                <td className={s.colAmount}>
                                                    {amount ? (
                                                        <>
                                                            <p className={cx(s.amountValue, amount.credit && s.amountCredit)}>{amount.sign}{amount.value}</p>
                                                            <p className={s.amountUnit}>{amount.unit}</p>
                                                        </>
                                                    ) : <p className={s.amountValue}>-</p>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </section>
                </div>

                <aside className={s.aside}>
                    <div className={s.asideHead}>
                        <h3 className={s.asideTitle}>{t("My Wallet")}</h3>
                        <button type="button" className={s.manage} onClick={() => navigate("/wallets")}>{t("Manage")}</button>
                    </div>

                    <div className={s.card}>
                        <span className={s.cardBg} aria-hidden="true">
                            <span className={s.cardTexture} style={{ backgroundImage: `url(${cardTexture})` }} />
                            <span className={s.cardGlow}><span className={s.cardGlowInner}><img src={cardGlow} alt="" /></span></span>
                        </span>
                        <span className={s.cardRingA} aria-hidden="true" />
                        <span className={s.cardRingB} aria-hidden="true" />
                        <div className={s.cardTop}>
                            <div className={s.cardBalance}>
                                <p className={s.cardLabel}>{walletName}</p>
                                <p className={s.cardAmount}><span>{balance}</span>{currency && <span> {currency}</span>}</p>
                            </div>
                            {iban && <span className={s.ibanPill}>{t("IBAN linked")}</span>}
                        </div>
                        {iban && (
                            <div className={s.cardBottom}>
                                <p className={s.ibanRow}>
                                    <span>{t("IBAN")} {iban.masked}</span>
                                    <button type="button" className={s.copyBtn} onClick={() => navigator.clipboard?.writeText(iban.masked)} aria-label={t("Copy IBAN")}><img src={copyWhiteIcon} alt="" /></button>
                                </p>
                                {linked && <span className={s.cardSpacer} aria-hidden="true" />}
                            </div>
                        )}
                    </div>

                    <div className={s.rows}>
                        {otherWallets.map(item => (
                            <div key={item.id} className={s.row}>
                                <span className={s.rowLabel}>{t("{{currency}} Wallet", { currency: item.currency })}</span>
                                <span className={s.rowValue}>{hidden ? HIDDEN : formatAmount(item.balance, item.currency)}</span>
                            </div>
                        ))}
                        <div className={s.row}>
                            <span className={s.rowLabel}>{t("Broker connection")}</span>
                            <span className={s.rowValue}>{t(brokerStatus)}</span>
                        </div>
                    </div>

                    <div className={s.asideHead}>
                        <h3 className={s.asideTitle}>{t("Receiving accounts")}</h3>
                        <button type="button" className={s.manage} onClick={() => go(PAGES.SETTINGS)}>{t("Manage")}</button>
                    </div>
                    {receiving.loaded && accounts.length === 0 && (
                        <p className={s.empty}>
                            {t("No receiving account yet. Create a withdrawal channel to receive your payouts.")}{" "}
                            <button type="button" className={styles.link} onClick={() => go(PAGES.SETTINGS)}>{t("Add receiving account")}</button>
                        </p>
                    )}
                    {accounts.length > 0 && (
                        <div>
                            {accounts.slice(0, 3).map(account => {
                                const status = ACCOUNT_STATUS[account.status]
                                return (
                                    <div key={account.id} className={s.account}>
                                        <span className={s.accountIcon}><img src={account.method === "bank_account" ? bankIcon : mobileIcon} alt="" /></span>
                                        <span className={s.accountText}>
                                            <span className={s.accountTitle}>{account.providerLabel}{account.last4 && ` · ${t("ending {{last4}}", { last4: account.last4 })}`} · {account.countryName}</span>
                                            {status && <span className={cx(s.accountStatus, ACCOUNT_TONE[status.tone])}>{t(status.label)}</span>}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className={s.supportWrap}>
                        <div className={s.support}>
                            <img src={headsetIcon} alt="" />
                            <div className={s.supportText}>
                                <p className={s.supportTitle}>{t("Talk to us")}</p>
                                <p className={s.supportSub}>{t("Chat on WhatsApp, or open a ticket.")}</p>
                                <button type="button" className={s.supportLink} onClick={openSupport}>{t("Contact support")}</button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <Modal
                open={howOpen}
                onClose={() => setHowOpen(false)}
                title={t("How copy trading works")}
                subtitle={t("You choose the strategy and the amount. Copying follows the trader's new trades in your account.")}
                footer={<Button onClick={() => { setHowOpen(false); go(PAGES.STRATEGIES) }}>{t("Explore strategies")}</Button>}
            >
                <ol className={styles.numbered} style={{ paddingLeft: 18 }}>
                    <li><p className={styles.numberedTitle}>{t("Payment and copying are separate")}</p><p className={styles.numberedBody}>{t("Funding your account does not start copying. You confirm a separate copy mandate.")}</p></li>
                    <li><p className={styles.numberedTitle}>{t("You stay in control")}</p><p className={styles.numberedBody}>{t("Pause stops new copying; existing positions stay open. Stopping shows whether positions stay open or close, with costs, before you confirm.")}</p></li>
                    <li><p className={styles.numberedTitle}>{t("Only cash is withdrawable")}</p><p className={styles.numberedBody}>{t("Equity in open positions cannot be withdrawn. Withdrawals go to a verified account in your own name.")}</p></li>
                    <li><p className={styles.numberedTitle}>{t("Risk")}</p><p className={styles.numberedBody}>{t("CFD trading can result in substantial losses. Historical results do not guarantee future performance.")}</p></li>
                </ol>
            </Modal>
        </Page>
    )
}

export default Dashboard

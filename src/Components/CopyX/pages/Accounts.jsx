import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PAGES, STAGE } from "../../../stateMachines/copyTrading"
import { linkBrokerAccount } from "../api"
import checkCircleIcon from "../assets/figma/acc-check-circle.svg"
import linkIcon from "../assets/figma/acc-link.svg"
import lockSmallIcon from "../assets/figma/acc-lock-small.svg"
import refreshIcon from "../assets/figma/acc-arrows-clockwise.svg"
import lockIcon from "../assets/figma/lock.svg"
import useCopyTrading from "../hooks/useCopyTrading"
import { formatAmount } from "../state/money"
import { activeStrategy } from "../state/selectors"
import styles from "../styles/copyTrading.module.css"
import { Intro, Split } from "../ui/layout"
import { Button, Rows, Timeline } from "../ui/primitives"
import SecureAuthModal from "../ui/SecureAuthModal"
import { SetupFrame } from "./frames"
import s from "./Accounts.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

const STATUS = { success: s.statusSuccess, warning: s.statusWarning, neutral: s.statusNeutral }

const Status = ({ tone, children }) => <span className={cx(s.status, STATUS[tone])}>{children}</span>

/* WEB-03. Continue unlocks only after the broker confirms the link and eligibility.
   The draft aside is local: the shared SummaryPanel wraps its rows in a ticket card, this screen does not. */
const Accounts = () => {
    const { t } = useTranslation()
    const ctx = useCopyTrading()
    const { state, go, customer, openSupport } = ctx
    const [authOpen, setAuthOpen] = useState(false)
    const [checking, setChecking] = useState(false)
    const strategy = activeStrategy(state)
    const link = state.profile.brokerLink
    const linked = link === "linked"

    const checkVerification = () => {
        setChecking(true)
        setTimeout(() => setChecking(false), 900)
    }

    return (
        <SetupFrame ctx={ctx} current={1} title={t("Accounts and verification")} subtitle={t("Connect the correct trading account securely.")}>
            <Split
                side={(
                    <div className={s.panel}>
                        <div className={s.panelTop}>
                            <h3 className={s.panelTitle}>{t("Your draft")}</h3>
                            <Rows items={[
                                { label: t("Strategy"), value: strategy?.name },
                                { label: t("Allocation"), value: state.draft.method ? formatAmount(state.draft.allocation, state.draft.currency) : t("Not set yet") },
                                { label: t("Funding source"), value: state.draft.method ? t(state.draft.method.label) : t("Not selected") },
                            ]} />
                            <div className={s.success} role="status">
                                <img src={checkCircleIcon} alt="" />
                                <p>{t("Your selection is saved. You can leave and come back at any time.")}</p>
                            </div>
                            <p className={s.ownership}>
                                <img src={lockSmallIcon} alt="" />
                                <span>{t("A matching phone number or a user assertion does not establish ownership. Documents and credentials stay on secure pages.")}</span>
                            </p>
                        </div>
                        <div className={styles.panelBottom}>
                            <p className={styles.secureLine}>
                                <img src={lockIcon} alt="" />
                                <span>
                                    {t("Payments and consent happen on secure InstaPay pages.")}{" "}
                                    <button type="button" className={styles.link} onClick={openSupport}>{t("Talk to support")}</button>
                                </span>
                            </p>
                            <div className={styles.panelActions}>
                                <Button size="lg" block className={s.continueBtn} disabled={!linked} onClick={() => go(PAGES.ALLOCATION)}>{t("Continue")}</Button>
                                <p className={styles.caption}>{linked ? t("Next: set your allocation") : t("Continue is enabled only after connection and verification complete.")}</p>
                            </div>
                        </div>
                    </div>
                )}
            >
                <Intro eyebrow={t("Step {{n}} of {{total}}", { n: 2, total: 6 })} title={t("Connect your accounts")} lead={t("Your selection is saved while identity, eligibility and account ownership are checked.")} />

                <section className={cx(s.block, s.identityBlock)}>
                    <h3 className={s.blockTitle}>{t("InstaPay identity")}</h3>
                    <div className={s.identity}>
                        <span className={s.identityAvatar}>{(customer.name || "?")[0]}</span>
                        <span className={s.identityText}>
                            <span className={s.identityName}>{customer.name}</span>
                            <span className={s.identityCountry}>{t(customer.country)}</span>
                        </span>
                        <Status tone="success">{t("Verified")}</Status>
                    </div>
                </section>

                <section className={s.block}>
                    <div className={s.blockHead}>
                        <div>
                            <h3 className={s.blockTitle}>{t("Tag Markets account")}</h3>
                            <p className={s.blockSub}>{t("Connect on the broker's secure page.")}</p>
                        </div>
                        <Status tone={linked ? "success" : link === "pending" ? "warning" : "neutral"}>
                            {t(linked ? "Connected" : link === "pending" ? "In review" : "Not connected")}
                        </Status>
                    </div>
                    <div className={cx(s.accountCard, !linked && s.accountCardDisabled)} aria-disabled={!linked || undefined}>
                        <span className={cx(s.radio, linked && s.radioOn)} aria-hidden="true" />
                        <span className={s.accountText}>
                            <span className={s.accountTitle}>{linked ? t("CopyX USD account · {{id}}", { id: state.profile.brokerAccountId }) : t("CopyX USD account")}</span>
                            <span className={s.accountSub}>{linked ? t("Eligible for copy trading") : t("Eligibility is not established until the account is connected.")}</span>
                        </span>
                    </div>
                    {!linked && (
                        <div>
                            <Button variant="secondary" className={s.actionBtn} onClick={() => setAuthOpen(true)} disabled={link === "pending"}>
                                <img src={linkIcon} alt="" />{t("Connect securely")}
                            </Button>
                        </div>
                    )}
                </section>

                <section className={cx(s.block, s.lastBlock)}>
                    <div className={s.blockHead}>
                        <h3 className={s.blockTitle}>{t("Eligibility and verification")}</h3>
                        <Status tone={linked ? "success" : "warning"}>{t(linked ? "Complete" : "Pending")}</Status>
                    </div>
                    <div className={cx(s.timeline, !linked && s.timelineOpen)}>
                        <Timeline items={[
                            { key: "account", label: linked ? "Account discovered" : "Account not yet discovered", hint: linked ? state.profile.brokerAccountId : t("Sign in securely to check eligibility"), state: linked ? STAGE.DONE : link === "pending" ? STAGE.PENDING : STAGE.UPCOMING },
                            { key: "verification", label: "Verification", hint: linked ? t("Identity and eligibility confirmed") : t("Pending account connection"), state: linked ? STAGE.DONE : STAGE.UPCOMING },
                        ]} />
                    </div>
                    <div>
                        <Button variant="secondary" className={s.actionBtn} onClick={checkVerification} loading={checking}>
                            {!checking && <img src={refreshIcon} alt="" />}{t("Check verification")}
                        </Button>
                    </div>
                </section>
            </Split>

            <SecureAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                title={t("Connect Tag Markets")}
                confirmLabel={t("Connect securely")}
                rows={[
                    { label: t("InstaPay identity"), value: customer.name },
                    { label: t("Broker"), value: "Tag Markets" },
                    { label: t("Access requested"), value: t("Balances, funding credit and copy mandate") },
                ]}
                onAuthorize={async () => {
                    await linkBrokerAccount()
                    setAuthOpen(false)
                }}
            />
        </SetupFrame>
    )
}

export default Accounts

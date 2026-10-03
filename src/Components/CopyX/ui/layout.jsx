import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css"
import TopRight from "../../topRight"
import useWindowWidth from "../../../utils/useWindowWidth"
import arrowLeftIcon from "../assets/figma/arrow-left.svg"
import chevronRightIcon from "../assets/figma/chevron-right.svg"
import lockIcon from "../assets/figma/lock.svg"
import stepCheckIcon from "../assets/figma/step-check.svg"
import styles from "../styles/copyTrading.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

export const Page = ({ title, subtitle, children }) => {
    const width = useWindowWidth()
    return (
        <div className={cx(abf.root, styles.page)}>
            <header className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>{title}</h1>
                    {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
                </div>
                {width > 1000 && <TopRight position="relative" />}
            </header>
            {children}
        </div>
    )
}

export const Crumbs = ({ onBack, items }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.crumbRow}>
            {onBack && (
                <button type="button" className={styles.backBtn} onClick={onBack}>
                    <img src={arrowLeftIcon} alt="" />{t("Back")}
                </button>
            )}
            <nav className={styles.crumbs} aria-label={t("Breadcrumb")}>
                {items.map((item, index) => {
                    const last = index === items.length - 1
                    return (
                        <Fragment key={item.label}>
                            {last
                                ? <span className={styles.crumbCurrent} aria-current="page">{item.label}</span>
                                : <button type="button" onClick={item.onClick}>{item.label}</button>}
                            {!last && <img src={chevronRightIcon} alt="" />}
                        </Fragment>
                    )
                })}
            </nav>
        </div>
    )
}

const DOT_CLASS = { done: styles.stepDotDone, current: styles.stepDotCurrent }

/* steps: [{ label, meta, state: "done" | "current" | "upcoming" }] — track row on top, labels underneath. */
export const Stepper = ({ steps }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.stepper} aria-label={t("Progress")}>
            <div className={styles.stepTrackRow} aria-hidden="true">
                {steps.map((step, index) => (
                    <Fragment key={step.label}>
                        <span className={cx(styles.stepDot, DOT_CLASS[step.state])}>
                            {step.state === "done" && <img src={stepCheckIcon} alt="" />}
                        </span>
                        {index < steps.length - 1 && <span className={cx(styles.stepLine, step.state === "done" && styles.stepLineDone)} />}
                    </Fragment>
                ))}
            </div>
            <ol className={styles.stepLabels} style={{ listStyle: "none", margin: 0, padding: "8px 0 0" }}>
                {steps.map(step => (
                    <li
                        key={step.label}
                        className={cx(styles.stepItem, step.state === "done" && styles.stepDone, step.state === "current" && styles.stepCurrent)}
                        aria-current={step.state === "current" ? "step" : undefined}
                    >
                        <p className={styles.stepLabel}>{t(step.label)}</p>
                        {step.meta && <p className={styles.stepMeta}>{step.meta}</p>}
                    </li>
                ))}
            </ol>
        </div>
    )
}

export const FlowCard = ({ label, asideTitle, asideMeta, steps, children }) => (
    <section className={styles.card}>
        <div className={styles.flowHead}>
            <span className={styles.flowLabel}>{label}</span>
            {asideTitle && (
                <span className={styles.flowAside}>
                    <span className={styles.flowAsideTitle}>{asideTitle}</span>
                    {asideMeta && <span className={styles.flowAsideMeta}>{asideMeta}</span>}
                </span>
            )}
        </div>
        {steps && <Stepper steps={steps} />}
        {children}
    </section>
)

export const Split = ({ children, side }) => (
    <div className={styles.split}>
        <div className={styles.main}>{children}</div>
        <aside>{side}</aside>
    </div>
)

export const Intro = ({ eyebrow, tone, title, lead }) => (
    <div className={styles.introBlock}>
        {eyebrow && <p className={cx(styles.eyebrow, tone === "success" && styles.eyebrowSuccess, tone === "warning" && styles.eyebrowWarning)}>{eyebrow}</p>}
        <h2 className={styles.heading}>{title}</h2>
        {lead && <p className={styles.lead}>{lead}</p>}
    </div>
)

/* Right-hand summary used on every flow screen: ticket card, note, secure line, actions, caption. */
export const SummaryPanel = ({ title, badge, amountLabel, amount, rows = [], note, actions, caption, onSupport }) => {
    const { t } = useTranslation()
    const visibleRows = rows.filter(Boolean)
    return (
        <div className={styles.panel}>
            <div className={styles.panelTop}>
                <div className={styles.summary}>
                    <div className={styles.summaryHead}>
                        <span className={styles.summaryTitle}>{title}</span>
                        {badge}
                    </div>
                    {(amountLabel || amount) && (
                        <div className={styles.summaryAmountBlock}>
                            {amountLabel && <p className={styles.summaryLabel}>{amountLabel}</p>}
                            {amount && <p className={styles.summaryAmount}>{amount}</p>}
                        </div>
                    )}
                    {visibleRows.length > 0 && (
                        <>
                            {(amountLabel || amount) && (
                                <div className={styles.ticket} aria-hidden="true">
                                    <span className={cx(styles.ticketNotch, styles.ticketNotchLeft)} />
                                    <span className={cx(styles.ticketNotch, styles.ticketNotchRight)} />
                                </div>
                            )}
                            <div className={styles.summaryRows}>
                                {visibleRows.map(row => (
                                    <div key={row.label} className={styles.summaryRow}><span>{row.label}</span><span>{row.value}</span></div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                {note && <div className={styles.panelNote}>{note}</div>}
            </div>
            <div className={styles.panelBottom}>
                <p className={styles.secureLine}>
                    <img src={lockIcon} alt="" />
                    <span>
                        {t("Payments and consent happen on secure InstaPay pages.")}{" "}
                        <button type="button" className={styles.link} onClick={onSupport}>{t("Talk to support")}</button>
                    </span>
                </p>
                {actions && <div className={styles.panelActions}>{actions}</div>}
                {caption && <p className={styles.caption}>{caption}</p>}
            </div>
        </div>
    )
}

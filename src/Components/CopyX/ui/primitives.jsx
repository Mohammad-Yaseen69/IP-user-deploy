import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { AlertTriangle, Check, CheckCircle2, X } from "lucide-react"
import { useCountdown } from "../../../hooks/useCountdown"
import { STAGE } from "../../../stateMachines/copyTrading"
import infoIcon from "../assets/figma/info.svg"
import warningIcon from "../assets/figma/warning.svg"
import styles from "../styles/copyTrading.module.css"

const cx = (...names) => names.filter(Boolean).join(" ")

const BUTTON = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    danger: styles.btnDanger,
    ghost: styles.btnGhost,
    outline: styles.btnOutline,
}

export const Button = ({ variant = "primary", size, block, loading, disabled, icon: Icon, children, className, ...props }) => (
    <button
        type="button"
        className={cx(styles.btn, BUTTON[variant], size === "lg" && styles.btnLg, block && styles.btnBlock, className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
    >
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : Icon && <Icon size={18} aria-hidden="true" />}
        {children}
    </button>
)

const BADGE = { neutral: styles.badgeNeutral, success: styles.badgeSuccess, warning: styles.badgeWarning, error: styles.badgeError, brand: styles.badgeBrand }

export const Badge = ({ tone = "neutral", children }) => <span className={cx(styles.badge, BADGE[tone])}>{children}</span>

const NOTICE = {
    info: [styles.noticeInfo, null],
    success: [styles.noticeSuccess, CheckCircle2],
    warning: [styles.noticeWarning, AlertTriangle],
    error: [styles.noticeError, AlertTriangle],
}

export const Notice = ({ tone = "info", children }) => {
    const [className, Icon] = NOTICE[tone]
    return (
        <div className={cx(styles.notice, className)} role={tone === "error" ? "alert" : "status"}>
            {Icon ? <Icon size={18} aria-hidden="true" /> : <img src={infoIcon} alt="" />}
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    )
}

export const RiskLine = ({ children }) => (
    <p className={styles.riskLine}><img src={warningIcon} alt="" />{children}</p>
)

export const Section = ({ title, aside, children }) => (
    <section className={styles.section}>
        {(title || aside) && (
            <div className={styles.sectionHead}>
                {title && <h3 className={styles.sectionTitle}>{title}</h3>}
                {aside && <span className={styles.sectionAside}>{aside}</span>}
            </div>
        )}
        {children}
    </section>
)

const VALUE_TONE = { success: styles.rowValueSuccess, warning: styles.rowValueWarning, error: styles.rowValueError }

export const Rows = ({ items }) => (
    <div className={styles.rows}>
        {items.filter(Boolean).map(item => (
            <div key={item.label} className={styles.row}>
                <span className={styles.rowLabel}>{item.label}</span>
                <span className={cx(styles.rowValue, VALUE_TONE[item.tone])}>{item.value}</span>
            </div>
        ))}
    </div>
)

export const DetailRow = ({ icon: Icon, title, subtitle, actionLabel, onAction, trailing }) => (
    <div className={styles.detail}>
        <span className={styles.iconTile}>{typeof Icon === "string" ? <img src={Icon} alt="" /> : <Icon size={18} aria-hidden="true" />}</span>
        <div className={styles.detailText}>
            <p className={styles.detailTitle}>{title}</p>
            {subtitle && <p className={styles.detailSub}>{subtitle}</p>}
        </div>
        {trailing}
        {actionLabel && <button type="button" className={styles.changeBtn} onClick={onAction}>{actionLabel}</button>}
    </div>
)

const T_STATE = { [STAGE.DONE]: styles.tDone, [STAGE.PENDING]: styles.tPending, [STAGE.FAILED]: styles.tFailed, [STAGE.UPCOMING]: styles.tUpcoming }

/* Every marker also carries its state in text, so status never depends on colour alone. */
export const Timeline = ({ items }) => {
    const { t } = useTranslation()
    const stateText = { [STAGE.DONE]: t("Complete"), [STAGE.PENDING]: t("In progress"), [STAGE.FAILED]: t("Failed"), [STAGE.UPCOMING]: t("Not started") }
    return (
        <ol className={styles.timeline} aria-live="polite">
            {items.map(item => (
                <li key={item.key} className={cx(styles.tItem, T_STATE[item.state])}>
                    <span className={styles.tDot} aria-hidden="true">
                        {item.state === STAGE.DONE && <Check size={11} strokeWidth={3} />}
                        {item.state === STAGE.FAILED && <X size={12} strokeWidth={3} />}
                    </span>
                    <span className={styles.tText}>
                        <span className={styles.tLabel}>{t(item.label)}<span className={styles.srOnly}> - {stateText[item.state]}</span></span>
                        {item.hint && <span className={styles.tHint}>{item.hint}</span>}
                    </span>
                </li>
            ))}
        </ol>
    )
}

export const Segmented = ({ options, value, onChange, label }) => (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
        {options.map(option => (
            <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value === option.value}
                disabled={option.disabled}
                className={cx(styles.segment, value === option.value && styles.segmentActive)}
                onClick={() => onChange(option.value)}
            >
                {option.icon && <option.icon size={18} aria-hidden="true" />}
                {option.label}
            </button>
        ))}
    </div>
)

export const RadioCard = ({ title, subtitle, selected, disabled, onSelect }) => (
    <button type="button" role="radio" aria-checked={selected} disabled={disabled} onClick={onSelect} className={cx(styles.radioCard, selected && styles.radioCardSelected)}>
        <span className={cx(styles.radio, selected && styles.radioOn)} aria-hidden="true" />
        <span>
            <span className={styles.radioTitle}>{title}</span>
            {subtitle && <p className={styles.radioSub}>{subtitle}</p>}
        </span>
    </button>
)

const secondsUntil = (iso) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000))

export const QuoteExpiry = ({ expiresAt, onExpire }) => {
    const { t } = useTranslation()
    const { seconds, setSeconds, formatMMSS } = useCountdown(secondsUntil(expiresAt))
    const fired = useRef(false)

    useEffect(() => {
        fired.current = false
        setSeconds(secondsUntil(expiresAt))
    }, [expiresAt])

    useEffect(() => {
        if (seconds === 0 && !fired.current) {
            fired.current = true
            onExpire?.()
        }
    }, [seconds])

    return <Badge tone={seconds ? "warning" : "error"}>{seconds ? t("Expires in {{time}}", { time: formatMMSS() }) : t("Expired")}</Badge>
}

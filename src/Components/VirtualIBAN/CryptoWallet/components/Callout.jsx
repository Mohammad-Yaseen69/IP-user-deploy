import styles from "../cryptoWallet.module.scss"
import { CheckCircleIcon, InfoIcon, WarningIcon } from "./icons"

const VARIANTS = {
    info: { className: "", Icon: InfoIcon },
    warning: { className: styles.calloutWarning, Icon: WarningIcon },
    success: { className: styles.calloutSuccess, Icon: CheckCircleIcon },
    note: { className: styles.calloutInfoBlue, Icon: InfoIcon },
    brand: { className: styles.calloutBrand, Icon: InfoIcon },
}

const Callout = ({ variant = "info", title, children }) => {
    const { className, Icon } = VARIANTS[variant] || VARIANTS.info

    return (
        <div className={`${styles.callout} ${className}`}>
            <span className={styles.calloutIcon}>
                <Icon />
            </span>
            <span>
                {title ? <strong className={styles.calloutStrong}>{title} </strong> : null}
                {children}
            </span>
        </div>
    )
}

export default Callout

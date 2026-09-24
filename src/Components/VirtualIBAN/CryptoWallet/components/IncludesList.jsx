import styles from "../cryptoWallet.module.scss"
import { CheckIcon } from "./icons"

const IncludesList = ({ heading, items = [] }) => (
    <div>
        {heading ? <div className={styles.includesHeading}>{heading}</div> : null}
        <ul className={styles.includesList}>
            {items.map((item) => (
                <li className={styles.includesItem} key={item}>
                    <span className={styles.checkDot}>
                        <CheckIcon />
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
)

export default IncludesList

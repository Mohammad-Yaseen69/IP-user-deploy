import { Plus } from "react-feather"
import { useTranslation } from "react-i18next"
import { Icon } from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components"
import styles from "../styles/WithdrawalsNew.module.css"
import AccountRow from "./AccountRow"

const AccountGroup = ({ title, flag, icon, meta, addLabel, onAdd, canAdd, rows, rowProps, emptyText }) => {
    const { t } = useTranslation()

    return (
        <section className={styles.group}>
            <div className={styles.groupHead}>
                <div className={styles.groupName}>
                    {flag
                        ? <img className={styles.groupFlag} src={flag} alt="" draggable="false" />
                        : icon && <Icon name={icon} size={18} color="var(--abf-primary)" />}
                    <p>{title}</p>
                    {meta && <span className={styles.groupMeta}>· {meta}</span>}
                </div>
                {onAdd && (
                    <button type="button" className={styles.linkAction} onClick={onAdd} disabled={!canAdd}>
                        <Plus size={16} />
                        {addLabel}
                    </button>
                )}
            </div>

            <div className={styles.rows}>
                {rows.length === 0 && emptyText && <p className={styles.rowsEmpty}>{t(emptyText)}</p>}
                {rows.map(row => <AccountRow key={row.key} row={row} {...rowProps} />)}
            </div>
        </section>
    )
}

export default AccountGroup

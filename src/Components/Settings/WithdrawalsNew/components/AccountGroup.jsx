import { useTranslation } from "react-i18next";
import { Coins, Plus } from "../../Icons";
import styles from "../styles/Withdrawals.module.scss";
import AccountRow from "./AccountRow";

const GROUP_ICONS = { coins: Coins };

const AccountGroup = ({
  title,
  flag,
  icon,
  meta,
  addLabel,
  onAdd,
  canAdd,
  rows,
  rowProps,
  emptyText,
}) => {
  const { t } = useTranslation();
  const GroupIcon = GROUP_ICONS[icon];

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.groupName}>
          {flag ? (
            <img className={styles.groupFlag} src={flag} alt="" draggable="false" />
          ) : (
            GroupIcon && <GroupIcon color="#5926F0" />
          )}
          <h4 className={styles.cardTitle}>{title}</h4>
          {meta && <span className={styles.groupMeta}>· {meta}</span>}
        </div>
        {onAdd && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonTertiary}`}
            onClick={onAdd}
            disabled={!canAdd}
          >
            <Plus color="#5926F0" />
            {addLabel}
          </button>
        )}
      </div>

      <div className={styles.rows}>
        {rows.length === 0 && emptyText && <p className={styles.rowsEmpty}>{t(emptyText)}</p>}
        {rows.map((row) => (
          <AccountRow key={row.key} row={row} {...rowProps} />
        ))}
      </div>
    </section>
  );
};

export default AccountGroup;

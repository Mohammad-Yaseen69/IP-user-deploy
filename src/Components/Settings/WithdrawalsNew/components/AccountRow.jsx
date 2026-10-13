import { useEffect, useRef, useState } from "react";
import { Edit2, MoreVertical, Star, Trash2 } from "react-feather";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import styles from "../styles/WithdrawalsNew.module.css";

const AccountRow = ({
  row,
  canEdit,
  canDelete,
  onSetDefault,
  onEdit,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  /* Card channels can no longer be added or edited, only removed. */
  const editable = canEdit && row.method !== "card_payment";
  const canDefault = canEdit && !row.isCrypto && !row.isDefault;
  const hasMenu = editable || canDefault || canDelete;

  const pick = (action) => () => {
    setOpen(false);
    action(row);
  };

  return (
    <div className={styles.row}>
      <span className={styles.rowIcon}>
        <Icon name={row.icon} size={20} color="var(--abf-primary)" />
      </span>

      <div className={styles.rowText}>
        <div className={styles.rowTitle}>
          <p>{row.title}</p>
          {row.isDefault && (
            <span className={styles.badge}>{t("Default")}</span>
          )}
        </div>
        <p className={styles.rowSubtitle}>{row.subtitle}</p>
      </div>

      {hasMenu && (
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={t("Account options")}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div className={styles.menu} role="menu">
              {canDefault && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={pick(onSetDefault)}
                >
                  <Star size={16} />
                  {t("Set as default")}
                </button>
              )}
              {editable && (
                <button type="button" role="menuitem" onClick={pick(onEdit)}>
                  <Edit2 size={16} />
                  {t("Edit details")}
                </button>
              )}
              {canDelete && (
                <>
                  {(canDefault || editable) && (
                    <span className={styles.menuDivider} />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuDanger}
                    onClick={pick(onRemove)}
                  >
                    <Trash2 size={16} />
                    {t("Remove account")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountRow;

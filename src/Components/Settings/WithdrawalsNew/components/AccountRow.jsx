import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BankSmall,
  Coins,
  DeviceMobile,
  DotsThreeVertical,
  Money,
  PencilSimple,
  Star,
  TrashSmall,
} from "../../Icons";
import styles from "../styles/Withdrawals.module.scss";

const ROW_ICONS = {
  bank: BankSmall,
  "device-mobile": DeviceMobile,
  money: Money,
  coins: Coins,
};

const AccountRow = ({ row, canEdit, canDelete, onSetDefault, onEdit, onRemove }) => {
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

  const RowIcon = ROW_ICONS[row.icon];

  return (
    <div className={styles.row}>
      <span className={styles.tile}>{RowIcon && <RowIcon color="#6E7687" />}</span>

      <div className={styles.rowText}>
        <div className={styles.rowTitle}>
          <p>{row.title}</p>
          {row.isDefault && <span className={styles.badge}>{t("Default")}</span>}
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
            <DotsThreeVertical />
          </button>

          {open && (
            <div className={styles.menu} role="menu">
              {canDefault && (
                <button type="button" role="menuitem" onClick={pick(onSetDefault)}>
                  <Star />
                  {t("Set as default")}
                </button>
              )}
              {editable && (
                <button type="button" role="menuitem" onClick={pick(onEdit)}>
                  <PencilSimple color="#6E7687" />
                  {t("Edit details")}
                </button>
              )}
              {canDelete && (
                <>
                  {(canDefault || editable) && <span className={styles.menuDivider} />}
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.menuDanger}
                    onClick={pick(onRemove)}
                  >
                    <TrashSmall color="#DC2626" size={16} />
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

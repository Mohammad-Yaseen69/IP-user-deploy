import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { formatUsd } from "../state/money";
import { strategyCopies } from "../state/selectors";
import local from "./StrategySwitcher.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

/* Running strategies side by side; each one has its own funds, so switching changes every figure on the page. */
const StrategySwitcher = ({ state, activeId, onSelect, onAdd }) => {
  const { t } = useTranslation();
  const copies = strategyCopies(state);
  if (!copies.length) return null;

  return (
    <div className={local.root} role="tablist" aria-label={t("Your strategies")}>
      {copies.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === activeId}
          className={cx(local.tab, item.id === activeId && local.tabActive)}
          onClick={() => onSelect(item.id)}
        >
          <span className={local.avatar}>{item.strategy?.name?.[0]}</span>
          <span className={local.text}>
            <span className={local.name}>{item.strategy?.name}</span>
            <span className={local.meta}>{formatUsd(item.equityCents)}</span>
          </span>
        </button>
      ))}
      <button type="button" className={cx(local.tab, local.add)} onClick={onAdd}>
        <Plus size={16} aria-hidden="true" />
        {t("Copy another strategy")}
      </button>
    </div>
  );
};

export default StrategySwitcher;

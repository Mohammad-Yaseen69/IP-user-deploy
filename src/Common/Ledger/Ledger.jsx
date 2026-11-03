import { Calendar, Download, Funnel, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import { useTranslation } from "react-i18next";
import s from "./ledger.module.scss";

const Ledger = ({
  tabs,
  active,
  onTab,
  search,
  dateRange,
  onDateChange,
  dateLabel,
  filters,
  activeFilters,
  onDownload,
  hideDownload,
  columns,
  template,
  children,
}) => {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (e) => !pickerRef.current?.contains(e.target) && setPickerOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pickerOpen]);

  return (
    <div className={s.ledger} style={{ "--cols": template }}>
      <div className={s.tabs}>
        {tabs?.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            className={`${s.tab} ${active === key ? s.active : ""}`}
            onClick={() => onTab?.(key)}
          >
            {t(label)}
            {count != null && <span>{count}</span>}
          </button>
        ))}
      </div>

      <div className={s.tools}>
        <label className={s.search}>
          <Search size={20} />
          <input
            placeholder={search?.placeholder}
            value={search?.value}
            onChange={(e) => search?.onChange?.(e.target.value)}
          />
        </label>
        <div className={s.actions}>
          <button type="button" className={s.btn} onClick={() => setPickerOpen(true)}>
            <Calendar size={16} />
            {dateLabel}
          </button>
          {filters ?? (
            <button type="button" className={s.btn} disabled>
              <Funnel size={16} />
              {t("Filters")}
            </button>
          )}
          {!hideDownload && (
            <button type="button" className={s.iconBtn} disabled={!onDownload} onClick={onDownload}>
              <Download size={20} />
            </button>
          )}
          {pickerOpen && (
            <div ref={pickerRef} className={s.picker}>
              <DateRangePicker maxDate={new Date()} ranges={[dateRange]} onChange={onDateChange} />
            </div>
          )}
        </div>
      </div>
      {activeFilters}

      <div className={s.scroll}>
        <div className={s.table}>
          <div className={`${s.cols} ${s.head}`}>
            {columns?.map((name, i) => (
              <div key={i}>{name && t(name)}</div>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Ledger;

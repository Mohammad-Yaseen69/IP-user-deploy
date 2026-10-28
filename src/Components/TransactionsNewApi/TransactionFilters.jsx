import { Funnel, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import f from "./styles/filters.module.scss";
import s from "./styles/ledger.module.scss";

const FILTER_GROUPS = [
  // {
  //   key: "service_type",
  //   label: "Service",
  //   options: [
  //     "crypto_payout",
  //     "topup",
  //     "wallet_to_wallet",
  //     "invoice",
  //     "subscription_renewal",
  //     "mastercard",
  //   ],
  // },
  {
    key: "status",
    label: "Status",
    options: ["CANCELLED", "COMPLETED", "DECLINED", "FAILED", "INITIATED", "PENDING", "PROCESSING"],
  },
  { key: "transaction_type", label: "Type", options: ["credit", "debit"] },
  // {
  //   key: "payment_type",
  //   label: "Payment",
  //   options: ["bank", "bank_transfer", "card", "crypto", "iban"],
  // },
];

export const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v));

const prettify = (value) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Iban", "IBAN");

const TransactionFilters = ({ filters = {}, count = 0, onApply }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (key, value) =>
    setDraft((d) => clean({ ...d, [key]: d?.[key] === value ? "" : value }));

  return (
    <div ref={ref} className={f.wrap}>
      <button
        type="button"
        className={s.btn}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          setDraft(filters);
          setOpen(!open);
        }}
      >
        <Funnel size={16} />
        {t("Filters")}
        {count > 0 && ` (${count})`}
      </button>

      {open && (
        <div className={f.panel}>
          <div className={f.groups}>
            {FILTER_GROUPS.map(({ key, label, options }) => (
              <div key={key}>
                <p className={f.heading}>{t(label)}</p>
                <div className={f.pills}>
                  {options.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={draft?.[key] === value}
                      className={`${f.pill} ${draft?.[key] === value ? f.on : ""}`}
                      onClick={() => pick(key, value)}
                    >
                      {t(prettify(value))}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={f.foot}>
            <button type="button" className={s.btn} onClick={() => setDraft({})}>
              {t("Clear")}
            </button>
            <button
              type="button"
              className={s.btnPrimary}
              onClick={() => {
                onApply?.(draft);
                setOpen(false);
              }}
            >
              {t("Apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ActiveFilters = ({ filters = {}, dateLabel, onApply, onClearDate, onClearAll }) => {
  const { t } = useTranslation();

  const chips = [
    ...FILTER_GROUPS.filter(({ key }) => filters[key]).map(({ key, label }) => ({
      id: key,
      label,
      value: prettify(filters[key]),
      remove: () => onApply(clean({ ...filters, [key]: "" })),
    })),
    ...(dateLabel ? [{ id: "date", label: "Date", value: dateLabel, remove: onClearDate }] : []),
  ];

  if (!chips.length) return null;

  return (
    <div className={f.chips}>
      {chips.map(({ id, label, value, remove }) => (
        <span key={id} className={f.chip}>
          {t(label)}
          <b>{t(value)}</b>
          <button type="button" onClick={remove} aria-label={t("Remove")}>
            <X size={14} />
          </button>
        </span>
      ))}
      <button type="button" className={f.clearAll} onClick={onClearAll}>
        {t("Clear all")}
      </button>
    </div>
  );
};

export default TransactionFilters;

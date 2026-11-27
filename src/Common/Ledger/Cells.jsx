import s from "./ledger.module.scss";
import { initials, statusDot } from "./utils";

export const TxCell = ({ Icon, title, sub, subMobile = sub }) => (
  <div className={s.tx}>
    <div className={s.tile}>
      <Icon size={18} />
    </div>
    <div className={s.lines}>
      <p className={s.title}>{title}</p>
      <p className={s.sub}>
        <span className={s.d}>{sub}</span>
        <span className={s.m}>{subMobile}</span>
      </p>
    </div>
  </div>
);

export const PartyCell = ({ name = "", note }) => (
  <div className={`${s.tx} ${s.cp}`}>
    {initials(name) && <div className={s.avatar}>{initials(name)}</div>}
    <div className={s.lines}>
      <p className={s.title}>{name}</p>
      {note && <p className={s.sub}>{note}</p>}
    </div>
  </div>
);

export const StatusCell = ({ status, label }) => (
  <div className={s.status}>
    <span className={s.dot} style={{ background: statusDot(status) }} />
    {label}
  </div>
);

export const AmountCell = ({ sign = "", value, code, variant = [] }) => (
  <div
    className={`${s.amount} ${variant
      .filter(Boolean)
      .map((v) => s[v])
      .join(" ")}`}
  >
    <b>
      {sign}
      {value}
    </b>
    <span>{code}</span>
  </div>
);

export const DateGroup = ({ label, meta }) => (
  <div className={s.group}>
    {label}
    {meta && <span>{meta}</span>}
  </div>
);

export const EmptyState = ({ Icon, title, text, children }) => (
  <div className={s.empty}>
    <div className={`${s.tile} ${s.big}`}>
      <Icon size={22} />
    </div>
    <h5>{title}</h5>
    {text && <p>{text}</p>}
    {children && <div>{children}</div>}
  </div>
);

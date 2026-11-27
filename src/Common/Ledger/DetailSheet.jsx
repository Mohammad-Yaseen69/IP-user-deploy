import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Check, Copy, X } from "lucide-react";
import s from "./ledger.module.scss";
import { statusDot } from "./utils";

export const DetailSheet = ({ title, onClose, footer, children }) => {
  const isMobile = useMediaQuery("(max-width:1000px)");

  return (
    <Drawer
      open
      onClose={onClose}
      anchor={isMobile ? "bottom" : "right"}
      sx={{ zIndex: 1040 }}
      PaperProps={{ className: s.sheet }}
    >
      <div className={s.top}>
        <h5>{title}</h5>
        <button type="button" className={s.close} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className={s.body}>{children}</div>
      {footer && <div className={s.foot}>{footer}</div>}
    </Drawer>
  );
};

export const Section = ({ title, children }) => (
  <div>
    <p className={s.eyebrow}>{title}</p>
    {children}
  </div>
);

export const KeyValues = ({ rows }) => (
  <div className={s.kv}>
    {rows
      .filter((row) => row && row[1])
      .map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
  </div>
);

export const Timeline = ({ items }) => (
  <ul className={s.timeline}>
    {items.map(({ status, color, text, time }, i) => (
      <li key={i}>
        <i className={s.dot} style={{ background: color ?? statusDot(status) }} />
        <span>{text}</span>
        {time && <time>{time}</time>}
      </li>
    ))}
  </ul>
);

export const Copyable = ({ text, handleCopy, isCopied }) => (
  <>
    {text}
    <button type="button" className={s.copy} onClick={() => handleCopy?.(text)}>
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  </>
);

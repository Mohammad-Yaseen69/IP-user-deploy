import s from "./ui.module.scss";

export const Panel = ({ title, sub, right, className = "", children, ...rest }) => (
  <section className={`${s.panel} ${className}`} {...rest}>
    {(title || right) && (
      <div className={s.panelHead}>
        <div>
          <h3 className={s.title}>{title}</h3>
          {sub && <p className={s.sub}>{sub}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

export const Segmented = ({ options, value, onChange, label }) => (
  <div className={s.seg} role="tablist" aria-label={label}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role="tab"
        aria-selected={value === opt.value}
        className={`${s.segBtn} ${value === opt.value ? s.segActive : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

import styles from "../AddBeneficiaryFlowV2.module.css";

/* Icon assets exported from the Figma design, used as downloaded. */
import bankIcon from "../icons/bank.svg";
import bankAvatarIcon from "../icons/bank-avatar.svg";
import bankGroupIcon from "../icons/bank-group.svg";
import buildingsIcon from "../icons/buildings.svg";
import checkIcon from "../icons/check.svg";
import chevronDownIcon from "../icons/chevron-down.svg";
import coinsIcon from "../icons/coins.svg";
import deviceMobileIcon from "../icons/device-mobile.svg";
import errorWarningLineIcon from "../icons/error-warning-line.svg";
import globeIcon from "../icons/globe.svg";
import globeGroupIcon from "../icons/globe-group.svg";
import infoIcon from "../icons/info.svg";
import infoSmallIcon from "../icons/info-small.svg";
import moneyIcon from "../icons/money.svg";
import radioActiveIcon from "../icons/radio-active.svg";
import userIcon from "../icons/user.svg";
import warningIcon from "../icons/warning.svg";
import warningSmallIcon from "../icons/warning-small.svg";
import xCircleIcon from "../icons/x-circle.svg";

const ICONS = {
  bank: bankIcon,
  "bank-avatar": bankAvatarIcon,
  "bank-group": bankGroupIcon,
  buildings: buildingsIcon,
  check: checkIcon,
  "chevron-down": chevronDownIcon,
  coins: coinsIcon,
  "device-mobile": deviceMobileIcon,
  "error-warning-line": errorWarningLineIcon,
  globe: globeIcon,
  "globe-group": globeGroupIcon,
  info: infoIcon,
  "info-small": infoSmallIcon,
  money: moneyIcon,
  "radio-active": radioActiveIcon,
  user: userIcon,
  warning: warningIcon,
  "warning-small": warningSmallIcon,
  "x-circle": xCircleIcon,
};

/* Glyphs that carry more than one colour cannot be re-painted through a mask. */
const MULTICOLOUR = ["radio-active", "info-small"];

/**
 * Renders a design asset. Monochrome glyphs are painted via CSS mask so the same
 * exported file can be shown in whichever colour the current state calls for;
 * multi-colour glyphs render as a plain image at their exported colours.
 */
export const Icon = ({ name, size = 20, color, className = "", style }) => {
  const src = ICONS[name];
  if (!src) return null;

  if (MULTICOLOUR.includes(name)) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`${styles.iconImg} ${className}`}
        style={style}
      />
    );
  }

  /*
   * Vite inlines these assets as data URIs, which carry commas and brackets,
   * so the url() argument has to be quoted or the declaration is discarded.
   */
  const maskUrl = `url("${src}")`;

  return (
    <span
      aria-hidden="true"
      className={`${styles.icon} ${className}`}
      style={{
        width: size,
        height: size,
        color,
        WebkitMaskImage: maskUrl,
        maskImage: maskUrl,
        ...style,
      }}
    />
  );
};

/* Radio control used by every selectable card in the flow. */
export const RadioDot = ({ checked }) =>
  checked ? (
    <Icon name="radio-active" size={20} className={styles.radioActive} />
  ) : (
    <span className={styles.radio} />
  );

/* Four-segment progress header. `current` is 1-based. */
export const Stepper = ({ steps, current }) => (
  <div className={styles.stepper}>
    {steps.map((label, index) => {
      const position = index + 1;
      const isCurrent = position === current;
      const isDone = position < current;

      return (
        <div key={label} className={styles.step}>
          <span
            className={[
              styles.stepBar,
              isDone ? styles.stepBarDone : "",
              isCurrent ? styles.stepBarCurrent : "",
            ].join(" ")}
          />
          <p
            className={[
              styles.stepLabel,
              isDone ? styles.stepLabelDone : "",
              isCurrent ? styles.stepLabelCurrent : "",
            ].join(" ")}
          >
            {position}. {label}
          </p>
        </div>
      );
    })}
  </div>
);

/**
 * Selectable card: icon tile, title, subtitle, and a trailing radio. Also covers
 * the unavailable variant (dashed border, muted text, trailing note).
 */
export const OptionCard = ({
  icon,
  title,
  subtitle,
  note,
  timing,
  selected = false,
  disabled = false,
  tight = false,
  strongBorder = false,
  onSelect,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={disabled ? undefined : onSelect}
    className={[
      styles.option,
      selected ? styles.optionSelected : "",
      disabled ? styles.optionDisabled : "",
      strongBorder && !selected && !disabled ? styles.optionStrongBorder : "",
    ].join(" ")}
  >
    <span className={`${styles.optionIcon} ${selected ? styles.optionIconSelected : ""}`}>
      <Icon
        name={icon}
        size={20}
        color={
          disabled
            ? "var(--abf-text-muted)"
            : selected
              ? "var(--abf-primary)"
              : "var(--abf-text-primary)"
        }
      />
    </span>

    <span className={`${styles.optionText} ${tight ? styles.optionTextTight : ""}`}>
      <span className={`${styles.optionTitle} ${disabled ? styles.optionTitleDisabled : ""}`}>
        {title}
      </span>
      {subtitle && !disabled && <span className={styles.optionSubtitle}>{subtitle}</span>}
    </span>

    {note && <span className={styles.optionNote}>{note}</span>}
    {timing && !disabled && <span className={styles.optionTiming}>{timing}</span>}
    {!disabled && !note && <RadioDot checked={selected} />}
  </button>
);

/* Group heading above a set of payout methods. */
export const GroupHeader = ({ icon, title, subtitle }) => (
  <div className={styles.groupHeader}>
    <div className={styles.groupHeaderTitle}>
      <Icon name={icon} size={20} color="var(--abf-primary)" />
      <p className={styles.groupTitle}>{title}</p>
    </div>
    {subtitle && <p className={styles.groupSubtitle}>{subtitle}</p>}
  </div>
);

/* "Who you are paying" card shown at the top of steps 2 and 3. */
export const ContextCard = ({ initial, icon, name, meta, actionLabel, onAction }) => (
  <div className={styles.contextCard}>
    <div className={styles.contextAvatar}>
      {icon ? <Icon name={icon} size={20} color="var(--abf-primary)" /> : initial}
    </div>
    <div className={styles.contextText}>
      <p className={styles.contextName}>{name}</p>
      {meta && <p className={styles.contextMeta}>{meta}</p>}
    </div>
    {actionLabel && (
      <button type="button" className={styles.btnSmall} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export const FieldLabel = ({ children, htmlFor }) => (
  <label className={styles.fieldLabel} htmlFor={htmlFor}>
    {children}
  </label>
);

/* Hint line under a field. Renders the error treatment when `error` is set. */
export const Hint = ({ children, error = false }) => {
  if (!children) return null;
  return (
    <div className={styles.hint}>
      <Icon
        name={error ? "warning-small" : "error-warning-line"}
        size={12}
        color={error ? "var(--abf-error)" : "var(--abf-grey-400)"}
      />
      <p className={`${styles.hintText} ${error ? styles.hintTextError : ""}`}>{children}</p>
    </div>
  );
};

export const TextField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  disabled = false,
  trailingIcon,
  flex = false,
  inputMode,
  type = "text",
  maxLength,
}) => (
  <div className={`${styles.field} ${flex ? styles.fieldFlex : ""}`}>
    {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
    <div className={`${styles.inputShell} ${error ? styles.inputShellError : ""}`}>
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange && onChange(event.target.value)}
      />
      {trailingIcon && <Icon name={trailingIcon} size={16} color="var(--abf-text-secondary)" />}
    </div>
    <Hint error={!!error}>{error || hint}</Hint>
  </div>
);

export const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  hint,
  error,
  disabled = false,
  flex = false,
}) => (
  <div className={`${styles.field} ${flex ? styles.fieldFlex : ""}`}>
    {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
    <div
      className={`${styles.inputShell} ${styles.selectShell} ${error ? styles.inputShellError : ""}`}
    >
      <select
        id={id}
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange && onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <Icon name="chevron-down" size={16} color="var(--abf-grey-900)" />
    </div>
    <Hint error={!!error}>{error || hint}</Hint>
  </div>
);

export const FieldRow = ({ children, alignEnd = false }) => (
  <div className={`${styles.fieldRow}`}>{children}</div>
);

export const Fields = ({ children }) => <div className={styles.fields}>{children}</div>;

/* "Also required by this bank" heading, with the rule and the reason line. */
export const SectionTitle = ({ title, why }) => (
  <div className={styles.sectionHead}>
    <div className={styles.sectionTitleRow}>
      <p className={styles.sectionTitle}>{title}</p>
      <span className={styles.sectionRule} />
    </div>
    {why && (
      <div className={styles.sectionWhy}>
        <Icon name="info-small" size={16} />
        <p className={styles.sectionWhyText}>{why}</p>
      </div>
    )}
  </div>
);

export const Section = ({ children }) => <div className={styles.section}>{children}</div>;

export const SummaryCard = ({ heading, action, onAction, children }) => (
  <div className={styles.summary}>
    {heading && (
      <div className={styles.summaryHeading}>
        <p className={styles.summaryHeadingText}>{heading}</p>
        {action && (
          <button type="button" className={styles.btnSmall} onClick={onAction}>
            {action}
          </button>
        )}
      </div>
    )}
    {children}
  </div>
);

export const SummaryRow = ({
  label,
  value,
  icon,
  iconColor,
  success,
  action,
  onAction,
  narrow,
}) => (
  <div className={styles.summaryRow}>
    <p className={`${styles.summaryLabel} ${narrow ? styles.summaryLabelNarrow : ""}`}>{label}</p>
    <div className={styles.summaryValue}>
      {icon && <Icon name={icon} size={16} color={iconColor} />}
      <p className={`${styles.summaryValueText} ${success ? styles.summaryValueSuccess : ""}`}>
        {value}
      </p>
    </div>
    {action && (
      <button type="button" className={styles.btnSmall} onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

const ALERT_VARIANTS = {
  info: {
    className: styles.alertInfo,
    icon: "info",
    color: "var(--abf-blue-700)",
  },
  error: {
    className: styles.alertError,
    icon: "x-circle",
    color: "var(--abf-error-700)",
  },
  warning: {
    className: styles.alertWarning,
    icon: "warning",
    color: "#B5A300",
  },
};

export const Alert = ({ variant = "info", title, icon, children }) => {
  const tone = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info;

  return (
    <div className={`${styles.alert} ${tone.className}`}>
      <Icon name={icon || tone.icon} size={20} color={tone.color} />
      <div className={styles.alertText}>
        {title && <p className={styles.alertTitle}>{title}</p>}
        {children && <p className={styles.alertBody}>{children}</p>}
      </div>
    </div>
  );
};

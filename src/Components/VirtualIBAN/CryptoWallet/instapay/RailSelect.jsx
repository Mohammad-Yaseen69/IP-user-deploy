import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "react-feather";
import styles from "../cryptoPage.module.scss";

/**
 * The rail's dropdown: a closed row that looks like the static mock, and a list
 * underneath when opened. `options` carry their own `render` so a wallet can show
 * its balance and a beneficiary its address without this knowing either.
 */
const RailSelect = ({
  value,
  options = [],
  onChange,
  placeholder = "Select",
  emptyText = "Nothing to choose from",
  disabled = false,
  small = false,
  renderValue,
  searchPlaceholder,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const shown = query
    ? options.filter((option) => String(option.label).toLowerCase().includes(query))
    : options;
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const selected = options.find((option) => option.value === value) || null;

  return (
    <div className={styles.railSelectWrap} ref={rootRef}>
      <button
        type="button"
        className={`${styles.railSelect} ${styles.railSelectBtn} ${small ? styles.railSelectSm : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          setSearch("");
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          renderValue ? (
            renderValue(selected)
          ) : (
            selected.render?.(selected) || (
              <span className={styles.railSelectMain}>{selected.label}</span>
            )
          )
        ) : (
          <span className={`${styles.railSelectMain} ${styles.railSelectPlaceholder}`}>
            {placeholder}
          </span>
        )}
        <ChevronDown size={18} className={styles.railChevron} />
      </button>

      {open && (
        <div className={styles.railMenu} role="listbox">
          {searchPlaceholder && (
            <input
              autoFocus
              className={styles.railMenuSearch}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          )}
          {shown.length === 0 && <div className={styles.railMenuEmpty}>{emptyText}</div>}
          {shown.map((option) => (
            <button
              type="button"
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.railMenuItem} ${option.value === value ? styles.railMenuItemActive : ""}`}
              onClick={() => {
                onChange?.(option);
                setOpen(false);
              }}
            >
              {option.render ? (
                option.render(option)
              ) : (
                <span className={styles.railSelectMain}>{option.label}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RailSelect;

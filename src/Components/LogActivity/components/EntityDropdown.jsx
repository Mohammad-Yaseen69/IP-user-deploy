import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "../styles/Index.module.css";
export const EntityDropdown = ({
  value,
  onChange,
  fmt,
  adminActivitiesData,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const { t } = useTranslation();
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className={styles.filterWrapper}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={styles.filterButton}
        style={{
          background: value.length ? "#F3F3F4" : "#F3F3F4",
          color: value.length ? "#4f46e5" : "#64748b",
          boxShadow: open ? "0 4.328px 35.702px 0 rgba(0, 0, 0, 0.06)" : "none",
          borderColor: open ? "#4f46e5" : value.length ? "#c7d2fe" : "#e2e8f0",
        }}
      >
        <span className={styles.filterText}>
          {value ? fmt(value) : t("Filter by Entity")}
        </span>

        <div className={styles.filterActions}>
          {value && (
            <span
              onMouseDown={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className={styles.clearBtn}
            >
              <X size={13} />
            </span>
          )}

          <ChevronDown
            size={14}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          {adminActivitiesData.map(({ entity }) => (
            <div
              key={entity}
              onClick={() => {
                onChange(entity === value ? "" : entity);
                setOpen(false);
              }}
              className={`${styles.dropdownItem} ${
                entity === value ? styles.activeItem : ""
              }`}
              onMouseEnter={(e) => {
                if (entity !== value) e.target.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (entity !== value) e.target.style.background = "transparent";
              }}
            >
              {fmt(entity)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

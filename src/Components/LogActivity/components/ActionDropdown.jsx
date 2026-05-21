import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from "react-feather"
import { useTranslation } from "react-i18next"
import styles from "../styles/Index.module.css"

export const ActionDropdown = ({ selectedEntity, value, onChange, adminActivitiesData, fmt }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef()
    const { t } = useTranslation()
    const availableActions = selectedEntity
        ? adminActivitiesData.find(e => e.entity === selectedEntity)?.actions ?? []
        : adminActivitiesData.flatMap(e => e.actions).filter((a, i, arr) => arr.indexOf(a) === i)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    useEffect(() => { onChange([]) }, [selectedEntity])

    const toggle = (action) => {
        onChange(prev =>
            prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
        )
    }

    const label = value.length === 0
        ? "Filter by Action"
        : value.length === 1
            ? fmt(value[0])
            : `${value.length} Actions selected`

    return (
        <div ref={ref} className={styles.multiFilterWrapper}>
            <button
                onClick={() => setOpen(o => !o)}
                className={styles.multiFilterButton}
                style={{
                    background: value.length ? "#f0f4ff" : "#F3F3F4",
                    color: value.length ? "#4f46e5" : "#64748b",
                    boxShadow: open ? "0 4.328px 35.702px 0 rgba(0, 0, 0, 0.06)" : "none",
                    borderColor: open ? "#4f46e5" : value.length ? "#c7d2fe" : "#e2e8f0",
                }}
            >
                <span className={styles.multiFilterText}>
                    {t(label)}
                </span>

                <div className={styles.multiFilterActions}>
                    {value.length > 0 && (
                        <span
                            onMouseDown={e => {
                                e.stopPropagation();
                                onChange([]);
                            }}
                            className={styles.multiClearBtn}
                        >
                            <X size={13} />
                        </span>
                    )}

                    <ChevronDown
                        size={14}
                        style={{
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s"
                        }}
                    />
                </div>
            </button>

            {open && (
                <div className={styles.multiDropdownMenu}>
                    {availableActions.length === 0 ? (
                        <div className={styles.noActionText}>
                            {t("No actions available")}
                        </div>
                    ) : (
                        availableActions.map(action => {
                            const checked = value.includes(action);

                            return (
                                <div
                                    key={action}
                                    onClick={() => toggle(action)}
                                    className={`${styles.multiDropdownItem} ${checked ? styles.multiActiveItem : ""
                                        }`}
                                    onMouseEnter={e => {
                                        if (!checked)
                                            e.currentTarget.style.background = "#f8fafc";
                                    }}
                                    onMouseLeave={e => {
                                        if (!checked)
                                            e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <div
                                        className={styles.checkboxBox}
                                        style={{
                                            border: `2px solid ${checked ? "#4f46e5" : "#d1d5db"
                                                }`,
                                            background: checked ? "#4f46e5" : "#fff",
                                        }}
                                    >
                                        {checked && (
                                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                <path
                                                    d="M1 3.5L3.5 6L8 1"
                                                    stroke="white"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>

                                    {fmt(action)}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    )
}


import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from "react-feather"
import { useTranslation } from "react-i18next"

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
        <div ref={ref} style={{ position: "relative", minWidth: 190 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    borderRadius: 3,
                    padding: "8px 14px",
                    border: "var(--SPACING-spacing-0, 8px)",
                    background: value.length ? "#f0f4ff" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: value.length ? "#4f46e5" : "#64748b",
                    whiteSpace: "nowrap",
                    transition: "border-color 0.15s",
                    outline: "none",
                    boxShadow: open ? "0 4.328px 35.702px 0 rgba(0, 0, 0, 0.06)" : "none",
                    borderColor: open ? "#4f46e5" : value.length ? "#c7d2fe" : "#e2e8f0",
                }}
            >
                <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {value.length > 0 && (
                        <span
                            onMouseDown={e => { e.stopPropagation(); onChange([]) }}
                            style={{ display: "flex", alignItems: "center", color: "#94a3b8", cursor: "pointer" }}
                        >
                            <X size={13} />
                        </span>
                    )}
                    <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </div>
            </button>

            {
                open && (
                    <div style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 999,
                        background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "100%",
                        maxHeight: 260, overflowY: "auto", padding: "4px 0",
                    }}>
                        {availableActions.length === 0 ? (
                            <div style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>
                                {t("No actions available")}
                            </div>
                        ) : availableActions.map(action => {
                            const checked = value.includes(action)
                            return (
                                <div
                                    key={action}
                                    onClick={() => toggle(action)}
                                    style={{
                                        padding: "8px 14px",
                                        fontSize: 13,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        color: checked ? "#4f46e5" : "#374151",
                                        background: checked ? "#f0f4ff" : "transparent",
                                        fontWeight: checked ? 600 : 400,
                                        transition: "background 0.12s",
                                    }}
                                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "#f8fafc" }}
                                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = "transparent" }}
                                >
                                    <div style={{
                                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                        border: `2px solid ${checked ? "#4f46e5" : "#d1d5db"}`,
                                        background: checked ? "#4f46e5" : "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.15s",
                                    }}>
                                        {checked && (
                                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    {fmt(action)}
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div >
    )
}


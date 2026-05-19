import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from "react-feather"
import { useTranslation } from "react-i18next"

export const EntityDropdown = ({ value, onChange, fmt, adminActivitiesData, }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef()
    const { t } = useTranslation()
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])
console.log(adminActivitiesData,"filter ka dtat")
    return (
        <div ref={ref} style={{ position: "relative", minWidth: 170 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    borderRadius: "6px",
                    padding: "8px 14px",
                    border: "var(--SPACING-spacing-0, 8px)",
                    background: value.length ? "#f0f4ff" : "#F3F3F4",
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
                <span>{value ? fmt(value) : t("Filter by Entity")}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {value && (
                        <span
                            onMouseDown={e => { e.stopPropagation(); onChange("") }}
                            style={{ display: "flex", alignItems: "center", color: "#94a3b8", cursor: "pointer" }}
                        >
                            <X size={13} />
                        </span>
                    )}
                    <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </div>
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 999,
                    background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "100%",
                    maxHeight: 240, overflowY: "auto", padding: "4px 0",
                }}>
                    {adminActivitiesData.map(({ entity }) => (
                        <div
                            key={entity}
                            onClick={() => { onChange(entity === value ? "" : entity); setOpen(false) }}
                            style={{
                                padding: "8px 14px",
                                fontSize: 13,
                                cursor: "pointer",
                                fontWeight: entity === value ? 600 : 400,
                                color: entity === value ? "#4f46e5" : "#374151",
                                background: entity === value ? "#f0f4ff" : "transparent",
                                transition: "background 0.12s",
                            }}
                            onMouseEnter={e => { if (entity !== value) e.target.style.background = "#f8fafc" }}
                            onMouseLeave={e => { if (entity !== value) e.target.style.background = "transparent" }}
                        >
                            {fmt(entity)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

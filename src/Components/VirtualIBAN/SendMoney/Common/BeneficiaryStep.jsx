import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, Plus, Search, Sliders } from "react-feather";
import styles from "./BeneficiaryStep.module.css";
import {
  getBeneficiaryName,
  getBeneficiarySubtitle,
  getBeneficiaryInitial,
  getBeneficiaryId,
  getBeneficiaryAccountCount,
} from "./beneficiaryHelpers";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (Newest first)" },
  { value: "date_asc", label: "Date (Oldest first)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "type", label: "Type" },
];

const getCreatedAt = (b) => new Date(b?.createdAt || 0).getTime();

const BeneficiaryStep = ({
  beneficiaries = [],
  selectedBeneficiary,
  setSelectedBeneficiary,
  onAddBeneficiary,
  emptyMessage,
  children,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [openMenu, setOpenMenu] = useState(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = (beneficiaries || []).filter((b) => {
      if (typeFilter === "business" && b?.beneficiary_type !== "business") return false;
      if (typeFilter === "individual" && b?.beneficiary_type === "business") return false;

      if (!q) return true;
      return `${getBeneficiaryName(b)} ${getBeneficiarySubtitle(b)}`.toLowerCase().includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "date_desc" || sortBy === "date_asc") {
        const diff = getCreatedAt(a) - getCreatedAt(b);
        return sortBy === "date_desc" ? -diff : diff;
      }
      if (sortBy === "type") {
        return (a?.beneficiary_type || "").localeCompare(b?.beneficiary_type || "");
      }
      const cmp = (getBeneficiaryName(a) || "").localeCompare(getBeneficiaryName(b) || "");
      return sortBy === "name_desc" ? -cmp : cmp;
    });
  }, [beneficiaries, query, typeFilter, sortBy]);

  const toggleMenu = (name) => setOpenMenu((prev) => (prev === name ? null : name));

  return (
    <div className={styles.beneficiaryStep}>
      <div className={styles.beneficiaryHeader}>
        <h3>{t("Beneficiaries")}</h3>
        <button type="button" className={styles.primarySmallBtn} onClick={onAddBeneficiary}>
          <Plus size={16} />
          {t("Add beneficiary")}
        </button>
      </div>

      <label className={styles.searchBox}>
        <Search size={15} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search beneficiaries")}
        />
      </label>

      <div className={styles.toolbarRow} ref={toolbarRef}>
        <div className={styles.dropdown}>
          <button type="button" className={styles.toolbarBtn} onClick={() => toggleMenu("filter")}>
            <Filter size={14} /> {t("Filter")}
          </button>
          {openMenu === "filter" && (
            <div className={styles.menu}>
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.menuItem} ${typeFilter === o.value ? styles.menuItemActive : ""}`}
                  onClick={() => {
                    setTypeFilter(o.value);
                    setOpenMenu(null);
                  }}
                >
                  {t(o.label)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dropdown}>
          <button type="button" className={styles.toolbarBtn} onClick={() => toggleMenu("sort")}>
            <Sliders size={14} /> {t("Sort")}
          </button>
          {openMenu === "sort" && (
            <div className={styles.menu}>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.menuItem} ${sortBy === o.value ? styles.menuItemActive : ""}`}
                  onClick={() => {
                    setSortBy(o.value);
                    setOpenMenu(null);
                  }}
                >
                  {t(o.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.beneficiaryList}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>{emptyMessage || t("No beneficiaries found.")}</div>
        )}
        {filtered.map((b) => {
          const id = getBeneficiaryId(b);
          const selected = getBeneficiaryId(selectedBeneficiary) === id;
          return (
            <button
              type="button"
              key={id}
              className={`${styles.beneficiaryCard} ${selected ? styles.selectedBeneficiary : ""}`}
              onClick={() => setSelectedBeneficiary(b)}
            >
              <span className={`${styles.avatar} ${styles[b.accent || "blue"]}`}>
                {getBeneficiaryInitial(b)}
              </span>
              <span className={styles.beneficiaryCopy}>
                <strong>{getBeneficiaryName(b)}</strong>
                <small>{getBeneficiarySubtitle(b)}</small>
              </span>
              <span className={`${styles.accountBadge} ${selected ? styles.activeBadge : ""}`}>
                {getBeneficiaryAccountCount(b)}
              </span>
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
};

export default BeneficiaryStep;

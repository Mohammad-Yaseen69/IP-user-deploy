import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "react-feather";
import styles from "./BeneficiaryStep.module.css";
import {
  getBeneficiaryName,
  getBeneficiarySubtitle,
  getBeneficiaryInitial,
  getBeneficiaryId,
  getBeneficiaryAccountCount,
} from "./beneficiaryHelpers";

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

  const filtered = (beneficiaries || []).filter((b) =>
    `${getBeneficiaryName(b)} ${getBeneficiarySubtitle(b)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className={styles.beneficiaryStep}>
      <div className={styles.beneficiaryHeader}>
        <h3>{t("Beneficiaries")}</h3>
        <button
          type="button"
          className={styles.primarySmallBtn}
          onClick={onAddBeneficiary}
        >
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

      <div className={styles.beneficiaryList}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            {emptyMessage || t("No beneficiaries found.")}
          </div>
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
              <span
                className={`${styles.avatar} ${styles[b.accent || "blue"]}`}
              >
                {getBeneficiaryInitial(b)}
              </span>
              <span className={styles.beneficiaryCopy}>
                <strong>{getBeneficiaryName(b)}</strong>
                <small>{getBeneficiarySubtitle(b)}</small>
              </span>
              <span
                className={`${styles.accountBadge} ${selected ? styles.activeBadge : ""}`}
              >
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

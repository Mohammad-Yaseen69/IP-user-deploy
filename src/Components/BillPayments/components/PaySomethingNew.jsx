import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "react-feather";
import styles from "../billPayments.module.scss";
import { useBillers } from "../hooks/useBillPaymentQueries";
import BillIcon from "./BillIcon";

const MAX_TILES = 4;

const PaySomethingNew = ({ country, onPickBiller, onChooseCountry }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: billers = [], isLoading } = useBillers(country?.alpha3);

  const matches = billers
    .filter((biller) => biller.name?.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, MAX_TILES);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span>{t("Pay something new")}</span>
        {country && <span className={styles.muted}>{country.name}</span>}
      </div>

      {isLoading ? (
        <div className={styles.empty}>{t("Loading billers...")}</div>
      ) : matches.length ? (
        <div className={styles.tiles}>
          {matches.map((biller) => (
            <button
              type="button"
              key={biller.id}
              className={styles.tile}
              onClick={() => onPickBiller(biller)}
            >
              <BillIcon name={biller.name} />
              <span className={styles.rowTitle}>{biller.name}</span>
            </button>
          ))}
        </div>
      ) : country ? (
        <div className={styles.empty}>{t("No billers found.")}</div>
      ) : (
        <div className={styles.empty}>
          <p>{t("Billers near you show up here.")}</p>
          <button
            type="button"
            className={`${styles.ghostBtn} ${styles.smallBtn}`}
            onClick={onChooseCountry}
          >
            {t("Choose a country")}
          </button>
        </div>
      )}

      {billers.length > MAX_TILES && (
        <label className={styles.search}>
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("Search billers")}
          />
        </label>
      )}
    </div>
  );
};

export default PaySomethingNew;

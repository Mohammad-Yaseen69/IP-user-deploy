import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Bookmark, Search } from "react-feather";
import styles from "../billPayments.module.scss";
import RailSelect from "../../VirtualIBAN/CryptoWallet/instapay/RailSelect";
import BillIcon from "../components/BillIcon";
import { useBillers, useSavedBills } from "../hooks/useBillPaymentQueries";
import { PAY_STEPS } from "../hooks/usePayBillFlow";

const Flag = ({ country }) => (
  <img
    src={`https:${country.file_url}`}
    alt=""
    width={22}
    height={15}
    style={{ borderRadius: 2, objectFit: "cover" }}
    referrerPolicy="no-referrer"
  />
);

const findSavedBill = (bills, text) => {
  const query = text.trim().toLowerCase();
  if (query.length < 3) return null;
  return bills.find((bill) =>
    [bill.nickname, bill.identifiers?.account_number, bill.identifiers?.mobile_number]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)),
  );
};

const BillerStep = ({ flow, countries, isAdding }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: billers = [], isLoading, isError } = useBillers(flow.country?.alpha3);

  const countryOptions = countries.map((country) => ({
    value: country.alpha3,
    label: country.name,
    country,
    render: () => (
      <>
        <Flag country={country} />
        <span className={styles.rowTitle}>{country.name}</span>
      </>
    ),
  }));

  const { data: savedBills = [] } = useSavedBills();
  const showSavedBills = !isAdding && savedBills.length > 0;
  const savedMatch = showSavedBills ? findSavedBill(savedBills, search) : null;
  const pickSavedBill = (bill) =>
    flow.pickSavedBill(
      bill,
      countries.find((item) => item.alpha3 === bill.country?.iso_code),
    );

  const matches = billers.filter((biller) =>
    biller.name?.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <div className={styles.drawerBody}>
        <div className={styles.field}>
          <span className={styles.eyebrow}>{t("Country")}</span>
          <RailSelect
            small
            value={flow.country?.alpha3}
            options={countryOptions}
            onChange={(option) => flow.selectCountry(option.country)}
            placeholder={t("Choose a country")}
            emptyText={t("Bill payment is not available in any country yet.")}
          />
        </div>

        {flow.country && (
          <div className={styles.field}>
            <span className={styles.eyebrow}>{t("Biller")}</span>
            <label className={styles.search} style={{ marginTop: 0 }}>
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search billers")}
              />
            </label>

            {savedMatch && (
              <button
                type="button"
                className={styles.matchHint}
                onClick={() => pickSavedBill(savedMatch)}
              >
                <Bookmark size={13} /> {t("Matches your saved bill")} &ldquo;{savedMatch.nickname}
                &rdquo;
              </button>
            )}

            {isLoading ? (
              <div className={styles.empty}>{t("Loading billers...")}</div>
            ) : matches.length ? (
              <div className={`${styles.rows} ${styles.options}`}>
                {matches.map((biller) => {
                  const isActive = flow.biller?.id === biller.id;
                  return (
                    <button
                      type="button"
                      key={biller.id}
                      className={`${styles.row} ${styles.option} ${isActive ? styles.optionActive : ""}`}
                      onClick={() => flow.selectBiller(biller)}
                    >
                      <BillIcon name={biller.name} />
                      <span className={`${styles.rowMain} ${styles.rowTitle}`}>{biller.name}</span>
                      <span className={`${styles.radio} ${isActive ? styles.radioOn : ""}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                {isError
                  ? t("We could not load billers. Please try again.")
                  : t("No billers found.")}
              </div>
            )}
          </div>
        )}

        {showSavedBills && (
          <div className={styles.field}>
            <span className={styles.eyebrow}>{t("Or pick a saved bill")}</span>
            <div className={styles.chips}>
              {savedBills.map((bill) => (
                <button
                  type="button"
                  key={bill.id}
                  className={styles.chip}
                  onClick={() => pickSavedBill(bill)}
                >
                  <BillIcon name={bill.product?.category} size={12} />
                  {bill.nickname}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.drawerFoot}>
        <span className={styles.muted}>{t("Fees are shown before you pay")}</span>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!flow.biller}
          onClick={() => flow.setStep(PAY_STEPS.PAYMENT)}
        >
          {t("Continue")} <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
};

export default BillerStep;

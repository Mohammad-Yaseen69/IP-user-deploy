// import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next";
import TopRight from "../topRight";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Top from "./Top";
import CenterContainer from "./Center";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import TransactionsTable from "./TransactionTable";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import AccountLimits from "./AccountLimits";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import QrGenerate from "../Settings/QrGenerate";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { getLimits } from "./getLimits";
// import { useLocation } from "react-router"

export { getLimits };

const WalletsNew = () => {
  const { t } = useTranslation();
  const [currentWallet, setCurrentWallet] = useState(null);
  const cancelTokenRef = useRef();
  const [currentType, setCurrentType] = useState("");
  const [filtered, setFiltered] = useState([]);
  const can = usePermission();

  const [categories, setCategories] = useState([
    {
      _id: "uncategorized",
      name: "Uncategorized",
      value: 0,
      color: "#5926f0",
    },
  ]);
  useEffect(() => {
    const updatedCategories = categories.map((category) => {
      const filteredTransactions = filtered.filter((trx) => {
        return (
          trx?.status?.toLowerCase() == "completed" &&
          trx?.categories?.some((trxCat) => trxCat === category._id) &&
          trx?.transaction_type === currentType
        );
      });

      const totalAmount = filteredTransactions.reduce((acc, trx) => acc + trx.amount, 0);

      return {
        ...category,
        value: totalAmount,
      };
    });

    const uncategorizedTransactions = filtered.filter(
      (trx) =>
        trx?.status?.toLowerCase() == "completed" &&
        (!trx.categories || trx.categories?.length === 0) &&
        trx?.transaction_type === currentType,
    );
    const totalUncategorizedAmount = uncategorizedTransactions.reduce(
      (acc, trx) => acc + trx.amount,
      0,
    );

    const uncategorizedIndex = updatedCategories.findIndex(
      (category) => category._id === "uncategorized",
    );

    if (uncategorizedIndex !== -1) {
      updatedCategories[uncategorizedIndex].value = totalUncategorizedAmount;
    } else {
      const uncategorizedCategory = {
        _id: "uncategorized",
        name: "Uncategorized",
        value: totalUncategorizedAmount,
        color: "#5926f0",
      };

      updatedCategories.push(uncategorizedCategory);
    }

    setCategories(updatedCategories);
  }, [currentType]);

  useEffect(() => {
    let timeeout;
    setCurrentType("debit");
    timeeout = setTimeout(() => {
      setCurrentType("credit");
    }, 500);
    return () => clearTimeout(timeeout);
  }, [filtered]);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { authHeader, userWallets } = useContext(UserContext);

  useEffect(() => {
    if (currentWallet?._id) {
      if (cancelTokenRef.current) {
        cancelTokenRef.current?.cancel();
      }

      cancelTokenRef.current = axios.CancelToken.source();
      getLimits(
        currentWallet,
        setData,
        authHeader,
        setLoading,
        setError,
        cancelTokenRef.current.token,
      );
    }

    return () => {
      if (cancelTokenRef?.current) {
        cancelTokenRef.current?.cancel();
      }
    };
  }, [currentWallet]);

  const nonQrWallets = useMemo(() => {
    return userWallets?.filter((item) => !item?.qrCode?.url) ?? [];
  }, [userWallets]);

  if (!can("wallet.view")) return null;

  return (
    <>
      {nonQrWallets?.length > 0 && (
        <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
      )}
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <div className={styles.top}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
            </div>
            <TopRight />
          </div>
          <div
            className={styles.bottom}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "36px",
              marginBottom: "1rem",
            }}
          >
            <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />
            {can("wallet.limits.view") && (
              <AccountLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )}
            {can("wallet.analytics.view") && (
              <CenterContainer
                categories={categories}
                setCategories={setCategories}
                currentType={currentType}
                setCurrentType={setCurrentType}
                currentWallet={currentWallet}
              />
            )}

            {can("transactions.wallet.list") && (
              <TransactionsTable
                currentWallet={currentWallet}
                filtered={filtered}
                setFiltered={setFiltered}
              />
            )}
          </div>
        </div>
      ) : (
        <div className={styles.mobile}>
          <div className={styles.top}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
            </div>
            <p style={{ margin: "1rem 0 1.5rem" }}>
              {t("manage my Wallets and see the transaction details")
                .split(" ")
                .map((item) => service_name_formatter(item))
                .join(" ")}
            </p>
          </div>
          <div
            className={styles.bottom}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "36px",
              marginBottom: "1rem",
            }}
          >
            <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />
            {can("wallet.limits.view") && (
              <AccountLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )}

            {can("wallet.analytics.view") && (
              <CenterContainer
                categories={categories}
                setCategories={setCategories}
                currentType={currentType}
                setCurrentType={setCurrentType}
                currentWallet={currentWallet}
              />
            )}
            {can("transactions.wallet.list") && (
              <TransactionsTable
                currentWallet={currentWallet}
                filtered={filtered}
                setFiltered={setFiltered}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WalletsNew;

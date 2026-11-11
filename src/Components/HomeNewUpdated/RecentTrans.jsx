import React, { useContext, useEffect, useState } from "react";
import { Card, CardHeader } from "reactstrap";
import { MoreHorizontal } from "react-feather";
import styles from "./styles/Recents.module.css";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import InstaPayLoader from "../Loader";
import RecentTransItem from "./RecentTransItem";
import { ChevronRight } from "react-feather";

const RecentTrans = ({ currentWallet }) => {
  const { t } = useTranslation();
  const { userDetails, authHeader } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [windowWidth, setWindowWidth] = useState(window?.innerWidth);
  const resizeHandler = () => setWindowWidth(window?.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setTransactions([]);
      try {
        if (currentWallet) {
          const res = await axios.get(
            `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/0/10`,
            {
              headers: authHeader,
            },
          );

          const decrypted = decryptData(res.data.data);
          setIsLoading(false);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          console.log(decrypted);

          decrypted.transactionList = decrypted.transactionList.map((item) => {
            const transactionDate = new Date(item.createdAt);
            transactionDate.setHours(0, 0, 0, 0);

            const diffInDays = Math.floor(
              (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            let headerText;

            if (diffInDays === 0) {
              // headerText = "Today";
            } else if (diffInDays > 0 && diffInDays <= 7) {
              // headerText = "Last Week";
            } else if (diffInDays > 7) {
              // headerText = "Older Transaction";
            } else {
              headerText = "Today";
            }
            return {
              ...item,
              headerText,
            };
          });

          setTransactions(decrypted.transactionList);
        }
      } catch (err) {
        return err;
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWallet]);
  return (
    <Card
      style={{
        marginBottom: 0,
        flex: 1,
        scrollbarWidth: "none",
        borderRadius: "10px",
        minWidth: "265px",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-start "
        style={{ padding: "1rem" }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              lineHeight: "20px",
              color: "#111827",
            }}
          >
            {t("Recent activity")}
          </h4>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              fontWeight: "400",
              lineHeight: "20px",
              color: "#9AA3B2",
            }}
          >
            All currencies
          </p>
        </div>

        <a
          href="/transactions"
          className="d-flex align-items-center"
          style={{
            gap: "2px",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "20px",
            color: "#5926F0",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          See all
          <ChevronRight size={16} />
        </a>
      </div>
      <div
        style={{
          padding: "0.5rem",
        }}
        className={styles.body}
      >
        {/* {
                    transactions.length > 0 &&
                    <CardText className="text-muted">{t("Today")}:</CardText>
                } */}
        {isLoading ? (
          <InstaPayLoader />
        ) : (
          <>
            {transactions.length > 0 ? (
              transactions.map((transaction, i) => (
                <RecentTransItem
                  i={i}
                  transaction={transaction}
                  transactions={transactions}
                  key={i}
                  windowWidth={windowWidth}
                />
              ))
            ) : (
              <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No Transactions")}</div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default RecentTrans;

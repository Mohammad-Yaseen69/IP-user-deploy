import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../Helper/AmountFormat";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";
import { useAccountTransactions } from "./useAccountTransactions";
import styles from "./styles/WalletActivityMobile.module.scss";
import InstaPayLoader from "../Loader";
import { useNavigate } from "react-router";

const getAmount = (item) => {
  const topupBank = item?.service_type === "topup" && item?.payment_type === "bank";
  return {
    code: topupBank ? item?.recipient_received_currency : item?.currency?.code,
    value: topupBank ? item?.recipient_received_amount : item?.total,
  };
};

const WalletActivityMobile = ({ onSeeAll }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transactions, isLoading } = useAccountTransactions();

  const rows = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0),
    [transactions],
  );

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>{t("Wallet activity")}</h3>
        <button type="button" className={styles.seeAll} onClick={() => navigate("/transactions")}>
          {t("See all")}
          <ChevronRight size={14} />
        </button>
      </header>

      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.empty}>
            <InstaPayLoader />
          </p>
        ) : rows.length === 0 ? (
          <p className={styles.empty}>{t("No transactions yet")}</p>
        ) : (
          rows.map((item) => {
            const isDebit = item?.transaction_type?.toLowerCase() === "debit";
            const Icon = isDebit ? ArrowUpRight : ArrowDownLeft;
            const { code, value } = getAmount(item);
            const title = [
              item?.service_type === "topup" && "Wallet",
              service_name_formatter(t(item?.service_type)),
            ]
              .filter(Boolean)
              .join(" ");
            const isCompleted = item?.status?.toLowerCase() === "completed";
            const sub = [
              dayjs(item?.createdAt).format("D MMM, HH:mm"),
              !isCompleted && t(item?.status?.toLowerCase()),
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div key={item._id ?? item.id} className={styles.row}>
                <span className={styles.icon}>
                  <Icon size={18} />
                </span>

                <div className={styles.info}>
                  <p className={styles.name}>{title}</p>
                  <p className={styles.sub}>{sub}</p>
                </div>

                <div className={styles.amountWrap}>
                  <p
                    className={`${styles.amount} ${isDebit ? styles.out : styles.in} ${
                      !isCompleted ? styles.muted : ""
                    }`}
                  >
                    {isDebit ? "−" : "+"}
                    {formatCurrency(value, true)}
                  </p>
                  <p className={styles.code}>{code}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default WalletActivityMobile;

import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss";
import TopRight from "../topRight";
import TransactionsTable from "./TransactionsTable";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import s from "../../Common/Ledger/ledger.module.scss";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

const TransactionsNewApi = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const can = usePermission();

  if (!can("transactions.main.view")) return null;

  return (
    <>
      {userDetails && (
        <>
          <div className={styles.container}>
            <div className={styles.top}>
              <h4>{t("Transactions")}</h4>
              <TopRight />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button onClick={() => navigate("/payments")} type="button" className={s.btnPrimary}>
                <Plus size={16} />
                {t("New payment")}
              </button>
            </div>
            <TransactionsTable />
          </div>
          <div className={styles.mobile}>
            <div className={styles.top}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <h4>{t("Transactions")}</h4>
                <button
                  onClick={() => navigate("/payments")}
                  type="button"
                  className={s.btnPrimary}
                >
                  <Plus size={16} />
                  {t("New payment")}
                </button>
              </div>
            </div>
            <TransactionsTable />
          </div>
        </>
      )}
    </>
  );
};

export default TransactionsNewApi;

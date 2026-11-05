import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import s from "../../Common/Ledger/ledger.module.scss";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import TopRight from "../topRight";
import PaymentRequestsTable from "./PaymentRequestsTable";
import { useNavigate } from "react-router";
import { useMediaQuery } from "@mui/material";

const PendingNew = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:1000px)");

  return (
    <>
      {isMobile ? (
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
              <h4>{t("Payment Requests")}</h4>
              <button
                onClick={() => navigate("/payments?payment_action=req_money")}
                type="button"
                className={s.btnPrimary}
              >
                <Plus size={16} />
                {t("Request money")}
              </button>
            </div>
          </div>
          <PaymentRequestsTable />
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.top}>
            <h4>{t("Payment Requests")}</h4>
            <p>{t("Requests you've received and sent, in one place.")}</p>
            <TopRight />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button
              onClick={() => navigate("/payments?payment_action=req_money")}
              type="button"
              className={s.btnPrimary}
            >
              <Plus size={16} />
              {t("Request money")}
            </button>
          </div>
          <PaymentRequestsTable />
        </div>
      )}
    </>
  );
};

export default PendingNew;

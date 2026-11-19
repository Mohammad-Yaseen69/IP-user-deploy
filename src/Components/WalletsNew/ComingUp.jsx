import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Panel } from "../../Common/WalletUI/Primitives";
import { upcoming } from "../../Common/WalletUI/utils";
import u from "../../Common/WalletUI/ui.module.scss";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { formatCurrency } from "../../Helper/AmountFormat";
import r from "./styles/redesign.module.scss";

// Same four lists the Scheduled & Subscriptions page (/other-transactions) loads.
const ENDPOINTS = [
  "subcribe-payment-request-w2w",
  "schedule-payment-request-w2w",
  "subcribe-payment-w2w",
  "schedule-payment-w2w",
];

const ComingUp = () => {
  const { t, i18n } = useTranslation();
  const { userDetails, authHeader } = useContext(UserContext);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["comingUp", userDetails?._id],
    enabled: !!userDetails?._id,
    queryFn: async () => {
      // A list with nothing in it answers with an error, so failed lists just count as empty.
      const lists = await Promise.allSettled(
        ENDPOINTS.map((path) =>
          axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/${path}/${userDetails._id}`, {
            headers: authHeader,
          }),
        ),
      );
      return lists.flatMap((res) =>
        res.status === "fulfilled" ? (decryptData(res.value.data.data)?.data ?? []) : [],
      );
    },
  });

  const rows = upcoming(items);

  return (
    <Panel
      title={t("Coming up")}
      sub={t("Next 14 days")}
      right={
        <Link to="/other-transactions" className={u.link}>
          {t("Scheduled")}
          <ChevronRight size={16} />
        </Link>
      }
    >
      {isLoading ? (
        <div className={u.state}>{t("Loading...")}</div>
      ) : rows.length === 0 ? (
        <div className={u.state}>{t("Nothing scheduled in the next 14 days.")}</div>
      ) : (
        <div className={r.upList}>
          {rows.map(({ item, date }) => {
            const isPayment = item?.type === "payment";
            const details = item?.[isPayment ? "payment" : "request_payment"];
            const party = details?.receiver;
            return (
              <div key={item?._id} className={r.upRow}>
                <div className={r.upDate}>
                  <b>{String(date.getDate()).padStart(2, "0")}</b>
                  <small>{date.toLocaleString(i18n.language, { month: "short" })}</small>
                </div>
                <div className={r.upText}>
                  <strong>
                    {party?.company_name ||
                      [party?.first_name, party?.last_name].filter(Boolean).join(" ") ||
                      t(isPayment ? "Payment" : "Payment request")}
                  </strong>
                  <small>
                    {t(item?.recursive ? "Subscription" : "Scheduled")}
                    {" · "}
                    {t(isPayment ? "Payment" : "Payment request")}
                  </small>
                </div>
                <p className={r.upAmount}>
                  {isPayment ? "−" : ""}
                  {formatCurrency(details?.amount ?? 0, true)}
                  <small>{details?.currency?.code}</small>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

export default ComingUp;

import axios from "axios";
import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { statusDot } from "../../../Common/Ledger/utils";
import { Panel } from "../../../Common/WalletUI/Primitives";
import Skeleton from "../../../Common/WalletUI/Skeleton";
import u from "../../../Common/WalletUI/ui.module.scss";
import { UserContext } from "../../../Context/UserContext";
import { formatCurrency } from "../../../Helper/AmountFormat";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { renderAccountName } from "../../../utils/Functions/transactionHelpers";
import { paymentLabel } from "./paymentLabel";
import d from "./dashboard.module.scss";

const ROWS = 6;

// Latest transactions of the selected wallet (same request as the old Recent Transactions card).
const RecentActivity = ({ currentWallet }) => {
  const { t } = useTranslation();
  const { authHeader, beneficiaries, walletsLoading } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const walletId = currentWallet?.wallet_id;

  useEffect(() => {
    if (!walletId) return undefined;

    const controller = new AbortController();
    setIsLoading(true);
    setTransactions([]);
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${walletId}/0/10`,
        { headers: authHeader, signal: controller.signal },
      )
      .then((res) => setTransactions(decryptData(res.data.data)?.transactionList ?? []))
      // A wallet without transactions answers with an error; the empty state covers it.
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [walletId]);

  return (
    <Panel
      title={t("Recent activity")}
      sub={currentWallet ? `${currentWallet?.currency?.code} ${t("Wallet")}` : ""}
      right={
        <Link to="/transactions" className={u.link}>
          {t("See all")}
          <ChevronRight size={16} />
        </Link>
      }
    >
      {isLoading && (walletId || walletsLoading) ? (
        <div className={d.activity}>
          {Array.from({ length: ROWS }, (_, index) => (
            <div key={index} className={d.skeletonRow}>
              <Skeleton width={36} height={36} sx={{ borderRadius: "10px", flex: "none" }} />
              <div className={d.skeletonLines}>
                <Skeleton width="55%" height={14} />
                <Skeleton width="35%" height={12} />
              </div>
              <Skeleton width={72} height={16} />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className={u.state}>{t("No Transactions")}</div>
      ) : (
        <div className={d.activity}>
          {transactions.slice(0, ROWS).map((tx) => {
            const isCredit = tx?.transaction_type?.toLowerCase() !== "debit";
            const receiver = tx?.beneficiary
              ? beneficiaries.find((item) => item?._id === tx.beneficiary) || tx?.beneficiaryDetails
              : null;
            const created = dayjs(tx?.createdAt);
            const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
            return (
              <div key={tx?._id} className={`${d.activityRow} ${isCredit ? d.activityIn : ""}`}>
                <i>
                  <Icon size={16} />
                </i>
                <div className={d.activityText}>
                  <strong>{renderAccountName(tx, receiver) || t(paymentLabel(tx))}</strong>
                  <small style={{ "--dot": statusDot(tx?.status) }}>
                    {t(paymentLabel(tx))},{" "}
                    {created.isSame(dayjs(), "day")
                      ? created.format("HH:mm")
                      : created.format("D MMM")}
                  </small>
                </div>
                <p className={`${d.amount} ${isCredit ? d.amountIn : ""}`}>
                  {isCredit ? "+" : "−"}
                  {formatCurrency(tx?.total ?? 0, true)}
                  <small>{tx?.currency?.code}</small>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

export default RecentActivity;

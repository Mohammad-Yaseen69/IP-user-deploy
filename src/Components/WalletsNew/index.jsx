import { useTranslation } from "react-i18next";
import PageHeader from "../../Common/PageHeader";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Top from "./Top";
import WalletLimits from "./WalletLimits";
import WalletLedger from "./WalletLedger";
// import ComingUp from "./ComingUp";
import axios from "axios";
import { getLimits } from "./getLimits";
import { UserContext } from "../../Context/UserContext";
import QrGenerate from "../Settings/QrGenerate";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
// import { useLocation } from "react-router"
import CurConversion from "../HomeNewUpdated/CurConversion";
import MoneyInOut from "../../Common/WalletUI/MoneyInOut";
import { useMoneyInOut } from "../../Common/WalletUI/useMoneyInOut";
import u from "../../Common/WalletUI/ui.module.scss";

// Lives in its own file so other screens can load it without the whole page; re-exported for old imports.
export { getLimits };

const WalletsNew = () => {
  const { t } = useTranslation();
  const [currentWallet, setCurrentWallet] = useState(null);
  const cancelTokenRef = useRef();
  const can = usePermission();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { authHeader, userWallets } = useContext(UserContext);
  const { data: moneyData, loading: moneyLoading } = useMoneyInOut(currentWallet);

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

  // Same list the wallet carousel shows: crypto wallets live on the Crypto page.
  const currencyCount = useMemo(
    () =>
      (userWallets ?? []).filter((w) => w?.provider !== "bvnk" && w?.wallet_type !== "crypto")
        .length,
    [userWallets],
  );

  if (!can("wallet.view")) return null;

  return (
    <>
      {nonQrWallets?.length > 0 && (
        <QrGenerate wallets={userWallets?.filter((item) => !item?.qrCode?.url)} />
      )}
      <div className={u.page}>
        <PageHeader
          title={t("My Wallets")}
          subtitle={
            <>
              {currencyCount === 1
                ? t("1 currency in one wallet.")
                : t("{{n}} currencies in one wallet.", { n: currencyCount })}
              {currentWallet?.wallet_id &&
                ` ${t("Wallet ID")} ${currentWallet?.wallet_type?.toUpperCase()}-${currentWallet.wallet_id.toUpperCase()}.`}
            </>
          }
        />
        <div className={u.content}>
          <Top currentWallet={currentWallet} setCurrentWallet={setCurrentWallet} data={data} />

          <div className={`${u.row} ${u.rowWide}`}>
            {can("wallet.analytics.view") && (
              <MoneyInOut
                currency={currentWallet?.currency?.code}
                data={moneyData}
                loading={moneyLoading}
              />
            )}
            {can("wallet.payment.conversion") && <CurConversion variant="card" />}
          </div>

          <div className={`${u.row} ${u.rowWide}`}>
            {can("wallet.limits.view") && (
              <WalletLimits
                data={data}
                error={error}
                loading={loading}
                currentWallet={currentWallet}
              />
            )}
            {/* {can("schedules.view") && <ComingUp />} */}
          </div>

          {can("transactions.wallet.list") && <WalletLedger currentWallet={currentWallet} />}
        </div>
      </div>
    </>
  );
};

export default WalletsNew;

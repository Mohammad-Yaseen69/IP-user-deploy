import { useContext, useEffect, useState } from "react";
import styles from "./Wallets.module.css";
import { UserContext } from "../../../Context/UserContext";
import card_styles from "../../PaymentsNewer/InternationalFlow/styles/walletscomponent.module.css";
import logo_white from "../../../assets/images/logo/logo_white.png";
import { Progress } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useWalletLimits } from "../../../hooks/GeneralUse/useWalletsLimits";
import { removeCommasAndCurrency } from "../../WalletsNew/AccountLimits";
import { formatCurrencyLocal } from "./Amount";
import { useLocation } from "react-router";

const Wallets = ({ data, dataHandler }) => {
  const { userWallets } = useContext(UserContext);

  return (
    <div className={styles.container}>
      {userWallets
        ?.filter(
          (item) =>
            !item?.blocked &&
            !item?.admin_blocked &&
            item?.status === "active" &&
            item?.wallet_type === "insta",
        )
        ?.map((item) => (
          <WalletCard item={item} key={item?._id} data={data} dataHandler={dataHandler} />
        ))}
    </div>
  );
};

export default Wallets;

const WalletCard = ({ item, data, dataHandler }) => {
  const { t } = useTranslation();
  const { limits: walletData, isLoading: limitsLoading } = useWalletLimits(item);
  const [updateValue, setUpdateValue] = useState(0);

  useEffect(() => {
    if (!limitsLoading) return;
    dataHandler("loading", true);
    return () => dataHandler("loading", false);
  }, [limitsLoading]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const wallet_address = queryParams.get("wallet_address");

  useEffect(() => {
    if (wallet_address === item?.wallet_id) {
      setUpdateValue((prev) => prev + 1);
    }
  }, [wallet_address]);

  useEffect(() => {
    if (updateValue > 0) {
      dataHandler("limits", {
        min: walletData?.min_topup_amount ?? data?.limits?.min,
        max: walletData?.max_topup_amount ?? data?.limits?.max,
      });
      dataHandler(
        "amount",
        formatCurrencyLocal(walletData?.min_topup_amount) ?? formatCurrencyLocal(data?.limits?.min),
      );
      dataHandler("wallet", item);
      if (wallet_address === item?.wallet_id) {
        dataHandler("step", 2);
      }
    }
  }, [updateValue, wallet_address]);

  return (
    <div
      key={item?._id}
      className={`${styles.card} ${data.wallet?._id === item?._id ? styles.active : ""}`}
      onClick={() => {
        setUpdateValue((prev) => prev + 1);
      }}
    >
      <div className={styles.left}>
        <h5>
          {item?.currency?.code}
          {t("Wallet")}
        </h5>
        <div className={styles.badge}>{item?.wallet_id}</div>
      </div>
      <div className={styles.card_view}>
        <WalletCardView wallet={item} walletData={walletData} />
      </div>
    </div>
  );
};

const WalletCardView = ({ wallet, walletData }) => {
  const { t } = useTranslation();

  return (
    <div className={`${card_styles.card}`}>
      <div className={card_styles.top}>
        <div className={card_styles.left}>
          <span>{t("Balance")}</span>
          <h4>
            {wallet?.currency?.code} {wallet?.balance?.available?.toFixed(2)}
          </h4>
        </div>
        <img src={logo_white} alt="" />
      </div>

      <div className={card_styles.bottom}>
        <p>{t("Monthly limit")}</p>
        <h3>
          {walletData?.balance_limits?.total} / {walletData?.balance_limits?.remaining}
        </h3>
        <div className={card_styles.bb}>
          <Progress
            value={
              (removeCommasAndCurrency(walletData?.balance_limits?.used) /
                removeCommasAndCurrency(walletData?.balance_limits?.total)) *
              100
            }
            barStyle={{
              background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
              borderRadius: "50px",
              margin: "2px",
            }}
            style={{
              height: window.innerWidth > 1500 ? "12px" : "9px",
              background: "rgba(256,256,256,.3)",
            }}
          />
          <span style={{ right: "5px" }}>{walletData?.balance_limits?.remaining}</span>
        </div>
      </div>
    </div>
  );
};

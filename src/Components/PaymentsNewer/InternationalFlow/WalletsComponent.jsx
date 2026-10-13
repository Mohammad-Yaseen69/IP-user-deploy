import { useTranslation } from "react-i18next";
import styles from "./styles/walletscomponent.module.css";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import logo_white from "../../../assets/images/logo/logo_white.png";
import { Progress } from "reactstrap";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import CurConversion from "../../HomeNewUpdated/CurConversion";
import InstaPayLoader from "../../Loader";
import FeesComponent from "./FeesComponent";
import { getLimits } from "../../WalletsNew";
import { removeCommasAndCurrency } from "../../WalletsNew/AccountLimits";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";

const WalletsComponent = ({ data, dataHandler, loading = false, inEsim }) => {
  const { t } = useTranslation();
  const { userWallets, getUserWallets } = useContext(UserContext);
  useEffect(() => {
    getUserWallets();
  }, []);

  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )
      ?.sort((a, b) => (b?.default === true ? 1 : -1))
      ?.map((item) => ({ name: item?.currency?.code, ...item }));
  }, [userWallets]);

  const blockedWallets = useMemo(() => {
    return userWallets
      ?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          (item?.blocked || item?.admin_blocked || item?.status !== "active"),
      )
      ?.map((item) => ({ name: item?.currency?.code, ...item }));
  }, [userWallets]);

  // const width = useWindowWidth()

  return (
    <>
      {window.innerWidth < 1000 ? (
        loading ? (
          <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
            <InstaPayLoader />
          </div>
        ) : (
            data.payment_type?.value === "wallet" && !inEsim
              ? data.wallet?._id
              : true
          ) ? (
          <FeesComponent data={data} />
        ) : (
          ""
        )
      ) : (
        ""
      )}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h5>{t("Select Your Currency Wallet")}</h5>
          <div className={styles.wallets}>
            {filteredWallets?.map((item) => (
              <WalletCard
                key={item?._id}
                loading={loading}
                wallet={item}
                data={data}
                dataHandler={dataHandler}
                amount={data?.package?.prices?.amount}
              />
            ))}
            {blockedWallets?.map((item) => (
              <WalletCard
                key={item?._id}
                loading={loading}
                wallet={item}
                data={data}
                dataHandler={dataHandler}
                blocked={true}
              />
            ))}
          </div>
          {
            data?.wallet?.currency?.code && (
              <p
                style={{
                  fontSize: ".8rem",
                  fontWeight: "500",
                  marginBottom: window.innerWidth > 1000 ? "auto" : "1rem",
                  padding: "0 1.5rem",
                  borderRadius: ".6rem ",
                  textAlign: "center ",
                }}
              >
                {t(
                  "You Have Selected PKR Currency Wallet For This Transaction",
                ).replace("PKR", `${data.wallet?.currency?.code}`)}
              </p>
            )
            // <strong style={{ fontWeight: "900", fontSize: "1rem" }}>{data.wallet?.currency?.code}</strong>
          }
          {filteredWallets?.length > 1 && !inEsim && (
            <CurConversion showHeading={false} />
          )}
        </div>
      </div>
    </>
  );
};

export default WalletsComponent;

export const WalletCard = ({
  wallet,
  data,
  dataHandler,
  loading,
  blocked = false,
  cardType,
  isInVCard = false,
  card,
  amount,
  addFunds,
  allowWalletSelection = false,
  isSufficientOverride,
  paymentType,
  filteredWallets,
  cardToWallet,
}) => {
  const { t } = useTranslation();
  const { authHeader } = useContext(UserContext);
  const [walletData, setWalletData] = useState({});
  const [walletfeeDetails, setWalletFeeDetails] = useState([]);

  useEffect(() => {
    if (wallet?._id) {
      getLimits(
        wallet,
        setWalletData,
        authHeader,
        () => {},
        () => {},
      );
    }
  }, [wallet]);

  const getExchangedAmounts = async (from, to, amount) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`,
        {
          headers: authHeader,
        },
      );
      const dec = decryptData(res?.data?.data);

      return dec?.exchangeRate?.exchanged_amount ?? 0;
    } catch (error) {
      return 0; // return 0 in case of error
    }
  };

  const getFee = async () => {
    if (!addFunds) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-vvc-fee/${wallet?.wallet_id}/${cardType}/wallet`,
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(response?.data?.data);
        // setFeeDetail(dec?.data)
        setIsSufficient(wallet?.balance?.available > dec.data?.fee);
        // console.log(dec)
      } catch (error) {
        const dec = decryptData(error.response?.data?.data);
        console.log(dec);
      }
    } else {
      if (walletfeeDetails.length && filteredWallets.length) {
        return false;
      }
      const data = {
        cardId: card._id,
        walletId: wallet?._id,
        amount: +String(amount)?.replaceAll(",", ""),
        type: paymentType,
      };

      const enc = encryptData(data);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-card-topup-fee`,
          { data: enc },
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(response?.data?.data);

        // console.log(dec)

        setWalletFeeDetails((prev) => [...prev, dec.data]);
        wallet.isSufficient =
          wallet?.balance?.available >
          +dec.data?.feeDetails?.totalAmount.replace(/[,]/g, "");
        setIsSufficient(
          wallet?.balance?.available >
            +dec.data?.feeDetails?.totalAmount.replace(/[,]/g, ""),
        );
      } catch (error) {
        const dec = decryptData(error.response?.data?.data);
        console.log(dec);
      }
    }
  };

  const [isSufficient, setIsSufficient] = useState(false);
  const hasSufficientOverride = typeof isSufficientOverride === "boolean";
  const canUseWallet = hasSufficientOverride
    ? isSufficientOverride
    : isSufficient;

  useEffect(() => {
    if (hasSufficientOverride) return;

    if (!isInVCard) {
      if (!blocked && wallet) {
        let amount;

        if (data?.amount) {
          amount = +String(data?.amount)?.replaceAll(",", "");
        }
        if (data?.package_details?.response) {
          amount = data.package_details?.response?.total;
        }
        if (data?.package_details?.filteredData?.[0]) {
          amount = data.package_details?.filteredData?.[0]?.total;
        }

        const apidata = [
          data?.currency_wallet?.currency?.code ??
            data?.localWallet?.currency?.code,
          wallet?.currency?.code,
          Number(amount) || data?.package?.prices?.amount,
        ];

        getExchangedAmounts(...apidata).then((res) => {
          setIsSufficient(wallet?.balance?.available > res);
        });
      }
    } else {
      getFee();
    }
  }, [wallet, blocked, cardType, hasSufficientOverride]);

  const handleClick = () => {
    if (
      !loading &&
      !blocked &&
      (canUseWallet || cardToWallet || allowWalletSelection)
    ) {
      dataHandler("wallet", wallet);
    }
  };

  useEffect(() => {
    if (
      !loading &&
      !blocked &&
      (canUseWallet || allowWalletSelection) &&
      (!data?.wallet || Object.keys(data?.wallet).length === 0)
    ) {
      if (wallet.default) {
        dataHandler("wallet", wallet);
      }
    }
  }, [wallet, loading, canUseWallet, blocked, allowWalletSelection]);

  return (
    <div
      data-content={t("Insufficient Balance")}
      style={{ backgroundSize: "cover", width: "100%" }}
      data-block-content={t("Blocked Wallet")}
      className={`${styles.card} ${canUseWallet || cardToWallet || allowWalletSelection ? "" : styles.disabled_card} ${blocked ? styles.blocked_card : ""} ${data?.wallet?._id === wallet?._id ? styles.active : ""}`}
      onClick={handleClick}
    >
      <div className={styles.top}>
        <div className={styles.left}>
          <span>{t("Balance")}</span>
          <h4>
            {wallet?.currency?.code} {wallet?.balance?.available?.toFixed(2)}
          </h4>
        </div>
        {data?.wallet?._id === wallet?._id ? (
          <div className={styles.top_badge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
            >
              <g clipPath="url(#clip0_2796_2328)">
                <path
                  d="M4.87502 7.37061L6.62502 9.12061L10.125 5.62061M13.3334 7.37061C13.3334 10.5923 10.7217 13.2039 7.50002 13.2039C4.27836 13.2039 1.66669 10.5923 1.66669 7.37061C1.66669 4.14895 4.27836 1.53728 7.50002 1.53728C10.7217 1.53728 13.3334 4.14895 13.3334 7.37061Z"
                  stroke="#1FC16B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_2796_2328">
                  <rect
                    width="14"
                    height="14"
                    fill="white"
                    transform="translate(0.5 0.370605)"
                  />
                </clipPath>
              </defs>
            </svg>
            <span>{t("Wallet Selected")}</span>
          </div>
        ) : (
          <img src={logo_white} alt="" />
        )}
      </div>

      <div className={styles.bottom}>
        <p>{t("Monthly limit")}</p>
        <h3>
          {walletData?.balance_limits?.total} /{" "}
          {walletData?.balance_limits?.remaining}
        </h3>
        <div className={styles.bb}>
          <Progress
            value={
              (removeCommasAndCurrency(walletData?.balance_limits?.used) /
                removeCommasAndCurrency(walletData?.balance_limits?.total)) *
              100
            }
            barStyle={{
              background:
                "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
              borderRadius: "50px",
              margin: "2px",
            }}
            style={{
              height: window.innerWidth > 1500 ? "12px" : "9px",
              background: "rgba(256,256,256,.3)",
            }}
          />
          <span style={{ right: "5px" }}>
            {walletData?.balance_limits?.remaining}
          </span>
        </div>
      </div>
    </div>
  );
};

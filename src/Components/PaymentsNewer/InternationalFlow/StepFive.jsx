import { useTranslation } from "react-i18next";
import styles from "./styles/stepfive.module.css";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import er_icon from "./files/exchange_rate.svg";
import { getBeneficiaryDisplayName } from "./beneficiaryHelpers";

const StepFive = ({ data }) => {
  const { t } = useTranslation();
  const { authHeader } = useContext(UserContext);
  const [exchangedAmount, setExchangedAmount] = useState(0);

  useEffect(() => {
    if (data.currency_wallet?._id !== data?.wallet?._id) {
      const getExchangedAmounts = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${data?.currency?.currency?.code || data?.currency}&to=${data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code}&amount=${data.amount}`,
            {
              headers: authHeader,
            },
          );
          const dec = decryptData(res?.data?.data);
          setExchangedAmount(dec?.exchangeRate?.exchanged_amount ?? 0);
        } catch {
          return 0;
        }
      };

      getExchangedAmounts();
    }
  }, [data]);

  console.log(data.wallet, data.exchange_rate, data.currency);
  return (
    <div className={styles.container}>
      <h4>{getBeneficiaryDisplayName(data.beneficiary)}</h4>
      <div className={styles.receiver_amount}>
        <h5>
          {data.exchange_rate?.receiver?.amount?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h5>
        <h5>{data.exchange_rate?.receiver?.currency}</h5>
      </div>
      <div className={styles.exchange_rate_details}>
        {data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code &&
          data.payment_type?.value === "wallet" && (
            <div className={styles.wallet_conversion}>
              <div className={styles.left}>
                <span>{t("Sending")}</span>
                <h5>
                  {data.amount?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {data.currency_wallet?.currency?.code}{" "}
                </h5>
              </div>
              <div className={styles.er_details}>
                <img src={er_icon} alt="" />
                <span>
                  1.00 {data?.currency?.currency?.code || data?.currency} ={" "}
                  {Number(
                    exchangedAmount / Number(String(data.amount)?.replace(/,/g, "")),
                  )?.toLocaleString("en-US", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 4,
                  })}{" "}
                  {data.payment_type?.value !== "wallet"
                    ? data.currency_wallet?.currency?.code
                    : data.wallet?.currency?.code}{" "}
                </span>
              </div>
              <div className={styles.right}>
                <div className={styles.wc_pt}>
                  <div>
                    <img src={data.payment_type?.icon} alt="" />
                    <span>{t(data.payment_type?.name)}</span>
                  </div>
                  <span style={{ textAlign: "right" }}>{data?.wallet?.wallet_id}</span>
                </div>
                {/* <h5>{Number(exchangedAmount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code} </h5> */}
                <h5>
                  {data.exchange_rate?.sending?.amount?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {data.payment_type?.value !== "wallet"
                    ? data.currency_wallet?.currency?.code
                    : data.wallet?.currency?.code}{" "}
                </h5>
              </div>
            </div>
          )}

        <div className={styles.amount_and_others}>
          {data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code &&
            data.payment_type?.value === "wallet" && (
              <div className={styles.aao_item}>
                <span>{t("Sending")}</span>
                {/* <span>{Number(data.exchange_rate?.total - data.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code} </span> */}
                <span>
                  {Number(data.exchange_rate?.sending?.amount)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {data.exchange_rate?.sending?.currency}
                </span>
              </div>
            )}
          {(data.wallet?.currency
            ? data.wallet?.currency?.code !== data.exchange_rate?.receiver?.currency
            : (data?.currency?.currency?.code || data?.currency) !==
              data?.exchange_rate?.receiver?.currency) && (
            <div className={styles.aao_item}>
              <span>{t("Exchange Rate")}</span>
              <span>
                1.00{" "}
                {data.payment_type?.value !== "wallet"
                  ? data.currency_wallet?.currency?.code
                  : data.wallet?.currency?.code}{" "}
                = {String(data.exchange_rate?.exchange_rate)?.slice(0, 6)}{" "}
                {data.exchange_rate?.receiver?.currency}
              </span>
            </div>
          )}
          <div className={styles.aao_item}>
            <span>{t("Transfer Fees")}</span>
            <span>
              {Number(data.exchange_rate?.fee?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {data.payment_type?.value !== "wallet"
                ? data.currency_wallet?.currency?.code
                : data.wallet?.currency?.code}{" "}
            </span>
          </div>
          <div className={styles.aao_item}>
            <span>{t("Estimated Time")}</span>
            <span>{t("within minutes")}</span>
          </div>
        </div>

        <div className={styles.total}>
          <span>{t("Total")}</span>
          <span>
            {data.exchange_rate?.total?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code
              ? (data.wallet?.currency?.code ?? data?.currency_wallet?.currency?.code)
              : data.currency?.currency?.code || data?.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepFive;

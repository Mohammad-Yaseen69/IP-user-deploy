import React, { useContext, useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import styles from "../../PaymentsNewer/styles/AmountAndCurrency.module.scss";
import { reasons } from "../../PaymentsNewer/AmountAndCurrency";
import { ChevronRight } from "react-feather";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AmountAndCurrency = ({
  amount,
  setAmount,
  currency,
  setCurrency,
  reason,
  setReason,
  paymentType,
  subService = "",
  quotationDetails,
  setQuotationDetails,
  setStep,
  step,
  service,
}) => {
  const [exchangeRate, setExchangeRate] = useState();
  const [exchangeError, setExchangeError] = useState("");
  const [balance, setBalance] = useState(null);
  const { userDetails, authHeader, userWallets } = useContext(UserContext);
  const { t } = useTranslation();

  const invalid =
    userWallets?.filter((item) => item.currency.code === currency)[0]?.balance
      ?.available < amount;
  useEffect(() => {
    if (invalid) {
      setExchangeError("insufficient balance");
    } else {
      if (paymentType === "international") {
        if (balance && amount > balance) {
          setExchangeError("1006001");
        } else {
          if (amount.length > 0 && +amount >= 1) {
            const data = {
              wallet_id: userWallets?.filter(
                (item) =>
                  item?.currency?.code?.toLowerCase() ===
                  currency?.toLowerCase(),
              )[0]?._id,
              transaction_type: "C2C",
              amount: +amount,
            };

            // console.log(data)

            const encrypted = encryptData(data);

            axios
              .post(
                `${import.meta.env.VITE_THUNES_API}/get-rates/${subService?.id}`,
                {
                  data: encrypted,
                },
                {
                  headers: authHeader,
                },
              )
              .then((res) => {
                const decrypted = decryptData(res.data.data);
                const data = {
                  wholesale_fx_rate: decrypted?.result?.exchange_rate,
                  destination: {
                    currency: decrypted?.result?.destination_currency,
                    amount: decrypted?.result?.converted_amount,
                  },
                  fee: { amount: decrypted?.result?.fee.toFixed(2) },
                };
                // console.log(decrypted)
                setExchangeRate(data);
                setQuotationDetails(decryptData(res.data.data));
                setExchangeError("");
              })
              .catch((err) => {
                // console.log(err.response.data)
                setExchangeError(decryptData(err.response.data.data));
              });
          } else {
            setExchangeError("Invalid Amount..");
          }
        }
      }

      if (paymentType === "wallet") {
        if (amount.length > 0) {
          axios
            .get(
              `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-exchange-rate?from=${currency}&to=EUR&amount=${amount}&type=wallet_to_wallet&level_id=${userDetails.level?._id}`,
              {
                headers: authHeader,
              },
            )
            .then((res) => {
              const decrypted = decryptData(res.data.data);
              const data = {
                wholesale_fx_rate: decrypted?.exchangeRate?.new_rate,
                destination: {
                  currency: decrypted?.exchangeRate?.query?.to,
                  amount: decrypted?.exchangeRate?.exchanged_amount,
                },
                fee: { amount: decrypted?.exchangeRate?.fee?.fee.toFixed(2) },
              };
              setExchangeError("");
              setExchangeRate(data);
            })
            .catch((err) => {
              const decrypted = decryptData(err.response.data.data);
            });
        } else {
          setExchangeError("Invalid Amount..");
        }
      }
    }
  }, [amount, balance, currency]);

  return (
    <div
      style={{
        paddingBottom: "0",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderRadius: "20px",
        padding: "14px",
        background: "rgba(0,0,0,.03)",
        paddingBottom: 0,
        boxShadow:
          "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(to bottom right, #EC2AB6 0%, #5926F0 100%)",
          border: "0.5px solid rgba(0, 0, 0, 0.08)",
          boxShadow:
            "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
          borderRadius: "24px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h4
          style={{
            marginBottom: 0,
            color: "white",
            fontSize: "1.3rem",
            fontWeight: 400,
            transform: "translate(15px, 5px)",
          }}
        >
          {currency === "USD" && "$"}
          {currency === "EUR" && "€"}
          {currency === "GBP" && "£"}
        </h4>
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          style={{
            width: "100%",
            border: "none",
            flex: 1,
            background: "transparent",
            color: "white",
            fontSize: "2.5rem",
            paddingLeft: "1.6rem",
          }}
          className={`i_t_amount ${styles.input}`}
        />
        <Input
          type="select"
          style={{
            borderRadius: "100px",
            padding: ".3rem .2rem .2rem .6rem",
            fontSize: ".7rem",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            width: "60px",
            border: "none",
            outline: "none",
          }}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">{t("USD")}</option>
          <option value="GBP">{t("GBP")}</option>
          <option value="EUR">{t("EUR")}</option>
        </Input>
      </div>
      <Input
        type="select"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-2"
        style={{
          background: "rgba(89, 38, 240, 0.04)",
          borderRadius: "10px",
          appearance: "menulist",
          fontSize: "1rem",
          fontWeight: 600,
          padding: "1rem 1.25rem",
        }}
      >
        <option value="">{t("Select Remark / Reason")}</option>
        {reasons.map((item) => (
          <option value={item.value} key={item.value}>
            {item.name}
          </option>
        ))}
      </Input>
      <div
        style={{
          padding: ".6rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: ".4rem",
          minHeight: "103px",
        }}
      >
        {!exchangeError ? (
          <>
            <p
              style={{
                marginBottom: "3px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#a0a0a0" }}>{t("Exchange Rate")}:</span>
              <span style={{ color: "#a0a0a0" }}>
                {+exchangeRate?.wholesale_fx_rate?.toFixed(2) ?? ""}{" "}
                {exchangeRate?.destination?.currency ?? ""}
              </span>
            </p>
            <p
              style={{
                marginBottom: "3px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#a0a0a0" }}>{t("Tax")}:</span>
              <span style={{ color: "#a0a0a0" }}>
                ${+exchangeRate?.fee?.amount ?? ""}
              </span>
            </p>
            <p
              style={{
                marginBottom: "3px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: "600" }}>
                {t("How much they receive:")}
              </span>
              <span style={{ fontWeight: "600" }}>
                {+exchangeRate?.destination?.amount?.toFixed(2) ?? ""}{" "}
                {exchangeRate?.destination?.currency ?? ""}
              </span>
            </p>
          </>
        ) : (
          <>
            {exchangeError.includes("strictly positive value expected") && (
              <>
                <p
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: ".8rem",
                    fontWeight: 600,
                  }}
                >
                  {"Minimum transaction amount should be"}
                </p>
                <h2
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                  }}
                >
                  {+service?.transaction_types?.C2C?.minimum_transaction_amount}{" "}
                  {service?.currency}
                </h2>
              </>
            )}
            {exchangeError.includes("over maximum of the selected payer") ||
              (exchangeError.includes("1003012") && (
                <>
                  <p
                    style={{
                      marginBottom: 0,
                      textAlign: "center",
                      fontSize: ".8rem",
                      fontWeight: 600,
                    }}
                  >
                    {"This amount exceeds our limit of"}{" "}
                    <b>
                      {
                        +service?.transaction_types?.C2C?.maximum_transaction_amount.toLocaleString()
                      }{" "}
                      {service?.currency}
                    </b>{" "}
                    {t("for a single transfer to")} <b>{service.name}</b>.
                  </p>
                </>
              ))}
            {exchangeError.includes("1006001") && (
              <>
                <p
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: ".8rem",
                    fontWeight: 600,
                  }}
                >
                  {t(
                    "You have entered an amount that exceeds our limit at the moment.",
                  )}
                </p>
              </>
            )}
            {exchangeError.includes("Invalid Amount..") && (
              <>
                <h2
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                  }}
                >
                  {t("Invalid Amount")}
                </h2>
              </>
            )}
            {exchangeError.includes("insufficient balance") && (
              <>
                <h2
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                  }}
                >
                  {t("Insufficient Balance")}
                </h2>
              </>
            )}
            {exchangeError.includes(
              "An error occurred while creating the quotation",
            ) && (
              <>
                <h2
                  style={{
                    marginBottom: 0,
                    textAlign: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                  }}
                >
                  {t(
                    "We cannot process your request at the moment, please try again later.",
                  )}
                </h2>
                <p style={{ marginBottom: 0, textAlign: "center" }}>
                  {t("Please try again later")}
                </p>
              </>
            )}
          </>
        )}
      </div>
      <Button
        size="sm"
        style={{
          border: "none",
          outline: "none",
          background:
            " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
          backgroundBlendMode: "overlay, normal",
          boxShadow:
            "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          // maxWidth: "120px"
          alignSelf: "flex-end",
        }}
        className="i_t_button"
        disabled={!amount || !currency || !reason || exchangeError}
        // onClick={createQuotation}
        onClick={() => {
          setStep(step);
        }}
      >
        <span>{t("Confirm")}</span>
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default AmountAndCurrency;

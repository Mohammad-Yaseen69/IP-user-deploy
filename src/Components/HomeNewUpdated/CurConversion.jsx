import { useContext, useEffect, useMemo, useState } from "react";
import { Form } from "reactstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import ConversionModal from "./ConversionModal";
import { UserContext } from "../../Context/UserContext";
import styles from "./styles/CurConversion.module.css";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import { formatCurrency } from "../../Helper/AmountFormat";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import ExchangeCard from "../WalletsNew/Exchange/Exchange";

let timeout;

const QUOTE_TTL_MS = 2 * 60 * 1000;

const CurConversion = ({ extCurrency = "", extWallet = null, showHeading = true }) => {
  const { t } = useTranslation();
  const [enteredCurrency, setEnteredCurrency] = useState("");
  const [resultCurrency, setResultCurrency] = useState("");
  const [userCurrency, setUserCurrency] = useState("");
  const [exchangedCurrency, setExchangedCurrency] = useState("");
  const [exchangePrice, setExchangePrice] = useState("");
  const [exchangeFee, setExchangeFee] = useState("");
  const [loading, setLoading] = useState(false);
  const { userDetails, authHeader, userWallets } = useContext(UserContext);
  const [error, setError] = useState("");

  const [fxDet, setFxDet] = useState({});
  const [quoteExpiresAt, setQuoteExpiresAt] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);

  const clearQuote = () => {
    setFxDet({});
    setQuoteExpiresAt(null);
    setIsQuoteExpired(false);
  };

  const availableWallets = useMemo(
    () =>
      userWallets
        ?.filter((item) => item?.status === "active" && !item?.blocked && !item?.admin_blocked)
        ?.filter(
          (item) =>
            item?.currency?.code?.toLowerCase() !== "btc" &&
            item?.currency?.code?.toLowerCase() !== "eth",
        ) ?? [],
    [userWallets],
  );

  useEffect(() => {
    if (!availableWallets.length) return;

    const hasSendingWallet = availableWallets.some((item) => item?.currency?.code === userCurrency);
    const fallbackWallet =
      availableWallets.find((item) => item?.currency?.code === extCurrency) || availableWallets[0];
    const sendingCode = hasSendingWallet ? userCurrency : fallbackWallet?.currency?.code;

    if (sendingCode !== userCurrency) {
      setUserCurrency(sendingCode);
    }

    const others = availableWallets.filter((item) => item?.currency?.code !== sendingCode);
    const isReceivable = others.some((item) => item?.currency?.code === exchangedCurrency);
    if (!isReceivable) {
      const preferred = others.find((item) => item?.currency?.code === "USD") || others?.[0];
      setExchangedCurrency(preferred?.currency?.code ?? "");
    }
  }, [availableWallets, userCurrency, exchangedCurrency]);

  // modal
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);

  const senderWallet = useMemo(() => {
    if (extWallet?._id && extWallet?.currency?.code === userCurrency) return extWallet;
    return availableWallets.find((item) => item?.currency?.code === userCurrency);
  }, [availableWallets, extWallet, userCurrency]);

  const receiverWallet = useMemo(
    () =>
      availableWallets.find(
        (item) => item?.currency?.code === exchangedCurrency && item?._id !== senderWallet?._id,
      ),
    [availableWallets, exchangedCurrency, senderWallet],
  );

  const balance = useMemo(() => Number(senderWallet?.balance?.available ?? 0), [senderWallet]);

  const invalid = useMemo(() => balance < Number(enteredCurrency || 0), [balance, enteredCurrency]);

  const convertCurrency = async () => {
    setError("");
    setLoading(false);
    const getRates = () => {
      const userWallet = senderWallet;

      if (!userWallet?._id || !receiverWallet?._id) {
        clearQuote();
        setLoading(false);
        return;
      }
      if (Number(enteredCurrency) <= 0) {
        clearQuote();
        setLoading(false);
        return;
      }
      if (invalid) {
        setError("Insufficient balance");
        clearQuote();
        setLoading(false);
        return;
      } else {
        setLoading(true);

        const isCryptoConversion =
          userWallet?.wallet_type === "crypto" || receiverWallet?.wallet_type === "crypto";

        const conversionPayload = {
          sender_wallet_id: userWallet?._id,
          receiver_wallet_id: receiverWallet?._id,
          amount: +enteredCurrency,
          crypto_to_fiat: userWallet?.wallet_type === "crypto",
        };

        const url = isCryptoConversion
          ? `${import.meta.env.VITE_IP_DEV_API}/api/wallet/insta-wallet-conversion/fee`
          : `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${userCurrency}&to=${exchangedCurrency}&amount=${enteredCurrency}&type=conversion&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=wallet&receiver_wallet_id=${receiverWallet?._id}&sender_wallet_id=${userWallet?._id}&payment_method=instant`;
        const res = isCryptoConversion
          ? axios.post(url, { data: encryptData(conversionPayload) }, { headers: authHeader })
          : axios.get(url, { headers: authHeader });

        res
          .then((res) => {
            const decrypted = decryptData(res.data.data);
            setExchangePrice(
              (
                decrypted?.data?.exchanged_rate?.value || decrypted?.data?.rate?.value
              )?.toLocaleString("en-us", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              }),
            );
            setResultCurrency(
              Number(
                decrypted?.data?.recipient?.value || decrypted?.data?.recipientReceives?.value,
              )?.toLocaleString("en-us", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            );
            setExchangeFee(
              `${decrypted?.data?.fee?.value?.toFixed(2)} ${decrypted?.data?.fee?.currency}`,
            );

            const exchange_rate_details = {
              exchange_rate: decrypted?.data?.exchanged_rate?.value || decrypted?.data?.rate?.value,
              receiver: {
                currency:
                  decrypted?.data?.recipient?.currency ||
                  decrypted?.data?.recipientReceives?.currency,
                amount:
                  decrypted?.data?.recipient?.value || decrypted?.data?.recipientReceives?.value,
              },
              fee: {
                amount: decrypted?.data?.fee?.value ?? 0.0,
                currency: decrypted?.data?.fee?.currency,
              },
              sending: {
                amount: decrypted?.data?.sending?.value || decrypted?.data?.total?.value,
                currency: decrypted?.data?.sending?.currency || decrypted?.data?.total?.value,
              },
              total: decrypted?.data?.total?.value,
              token: decrypted?.data?.token,
            };

            setFxDet(exchange_rate_details);
            setQuoteExpiresAt(Date.now() + QUOTE_TTL_MS);
            setIsQuoteExpired(false);
            setLoading(false);

            // if (+enteredCurrency > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
            //     setError("Daily Limit Exceeds")
            // }
            // else if (+enteredCurrency > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
            //     setError("Monthly limit Exceeds")
            // }
            // else if (+enteredCurrency > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
            //     setError("Yearly Limit Exceeds")
            // }
          })
          .catch((err) => {
            const dec = decryptData(err.response.data.data);
            setError(dec?.message);
            clearQuote();
            setLoading(false);
            const error = LimitsErrorMessage(dec?.code ?? dec?.message);
            if (error) {
              setError(error);
            }
          });
      }
    };
    if (invalid) {
      setResultCurrency("Insufficient Balance");
      clearQuote();
      setLoading(false);
    } else {
      if (enteredCurrency && userCurrency && exchangedCurrency) {
        getRates();
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!quoteExpiresAt) return undefined;

    const remaining = quoteExpiresAt - Date.now();
    if (remaining <= 0) {
      setIsQuoteExpired(true);
      return undefined;
    }

    const expiryTimer = setTimeout(() => setIsQuoteExpired(true), remaining);
    return () => clearTimeout(expiryTimer);
  }, [quoteExpiresAt]);

  const refreshQuote = () => {
    setIsQuoteExpired(false);
    convertCurrency();
  };

  useEffect(() => {
    if (isQuoteExpired && !isOpen) {
      refreshQuote();
    }
  }, [isQuoteExpired, isOpen]);

  useEffect(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      if (!enteredCurrency || enteredCurrency === "undefined") {
        setResultCurrency("");
        clearQuote();
      } else {
        convertCurrency();
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [enteredCurrency, userCurrency, exchangedCurrency]);

  // const handleChangeNumber = (event) => {
  //     const charCode = event.charCode;
  //     if (!/\d/.test(String.fromCharCode(charCode))) {
  //         event.preventDefault();
  //     }
  // }

  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter((item) => !item?.blocked && !item?.admin_blocked && item?.status === "active")
      ?.filter(
        (item) =>
          item?.currency?.code?.toLowerCase() !== "btc" &&
          item?.currency?.code?.toLowerCase() !== "eth",
      )
      ?.sort((a, b) => (b?.default === true ? 1 : -1))
      ?.map((item) => ({ name: item?.currency?.code, ...item }));
  }, [userWallets]);

  const [formattedAmount, setFormattedAmount] = useState("1.00");
  const handleKeyUp = (e) => {
    const cursor = e.target.selectionStart;
    const prevLen = e.target.value.length;
    formatCurrency(e.target.value, false, setFormattedAmount);
    requestAnimationFrame(() => {
      const newLen = e.target.value.length;
      const pos = cursor + (newLen - prevLen);
      e.target.setSelectionRange(pos, pos);
    });
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, setFormattedAmount);
  };
  const errorCode = error?.split("Error Code: ")[1];
  useEffect(() => {
    const cleaned = String(formattedAmount)?.replaceAll(",", "");
    if (cleaned && cleaned !== "undefined") {
      setEnteredCurrency(cleaned);
    }
  }, [formattedAmount]);
  return (
    <>
      {filteredWallets.length > 1 ? (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            toggleModal();
          }}
          className={styles.form}
        >
          <ExchangeCard
            fromCode={userCurrency}
            fromOptions={filteredWallets
              .filter((w) => w.currency.code !== exchangedCurrency)
              .map((w) => w.currency.code)}
            onFromChange={setUserCurrency}
            amountValue={formattedAmount}
            onAmountChange={setFormattedAmount}
            onAmountKeyUp={handleKeyUp}
            onAmountBlur={handleBlur}
            fromBalance={`${Number(balance).toFixed(2)} ${userCurrency}`}
            toCode={exchangedCurrency}
            toOptions={filteredWallets
              .filter((w) => w.currency.code !== userCurrency)
              .map((w) => w.currency.code)}
            onToChange={setExchangedCurrency}
            receiveValue={
              fxDet?.receiver?.amount?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              }) ?? ""
            }
            toBalance={
              receiverWallet
                ? `${Number(receiverWallet?.balance?.available ?? 0).toFixed(2)} ${exchangedCurrency}`
                : ""
            }
            rateText={
              fxDet?.exchange_rate
                ? `1 ${userCurrency} = ${Number(fxDet.exchange_rate).toFixed(4)} ${exchangedCurrency}`
                : "—"
            }
            feeText={
              fxDet?.fee?.amount != null
                ? `${Number(fxDet.fee.amount).toFixed(2)} ${userCurrency}`
                : "—"
            }
            errorText={
              error
                ? t(
                    "We are unable to process your request at the moment, please try again later! Error Code: {{code}}",
                    { code: errorCode },
                  )
                : null
            }
            onSwap={() => {
              const oldUser = userCurrency;
              setUserCurrency(exchangedCurrency);
              setExchangedCurrency(oldUser);
            }}
            submitLabel={
              balance < Number(enteredCurrency || 0)
                ? t("Insufficient Balance")
                : loading
                  ? t("Fetching Rates...")
                  : t("Convert")
            }
            submitDisabled={
              !enteredCurrency ||
              !resultCurrency ||
              !userCurrency ||
              !exchangedCurrency ||
              invalid ||
              exchangedCurrency === userCurrency ||
              loading
            }
            onSubmit={() => toggleModal()}
          >
            <ConversionModal
              isOpen={isOpen}
              toggleModal={toggleModal}
              amount={enteredCurrency}
              exchangeAmount={resultCurrency}
              currency={userCurrency}
              exchangeCurrency={exchangedCurrency}
              exchangePrice={exchangePrice}
              setEnteredCurrency={setEnteredCurrency}
              setResultCurrency={setResultCurrency}
              setUserCurrency={setUserCurrency}
              setExchangedCurrency={setExchangedCurrency}
              exchangeFee={exchangeFee}
              fxDet={fxDet}
              senderWallet={senderWallet}
              receiverWallet={receiverWallet}
              quoteExpiresAt={quoteExpiresAt}
              isQuoteExpired={isQuoteExpired}
              onRefreshQuote={refreshQuote}
              isRefreshing={loading}
            />
          </ExchangeCard>
        </Form>
      ) : (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>
            {t("You must have at least two currencies wallet for this feature!")}
          </p>
        </div>
      )}
    </>
  );
};

export default CurConversion;

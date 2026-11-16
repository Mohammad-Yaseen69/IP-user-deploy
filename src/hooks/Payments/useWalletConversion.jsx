import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";

export const CONVERSION_QUOTE_TTL_MS = 2 * 60 * 1000;

const isCryptoWallet = (wallet) => wallet?.wallet_type === "crypto";

const isUsable = (wallet) =>
  wallet?.status === "active" &&
  !wallet?.blocked &&
  !wallet?.admin_blocked &&
  !["btc", "eth"].includes(String(wallet?.currency?.code || "").toLowerCase());

/**
 * The wallet-to-wallet conversion quote, the way CurConversion computes it: the same
 * endpoints, the same 2-minute quote, the same limit messages. This one only ever
 * pairs a crypto wallet with a fiat one, which is what the crypto hub converts.
 *
 * `initialWallet` is the wallet the sender starts on; the receiver defaults to USD or
 * the first wallet on the other side of the line.
 */
export const useWalletConversion = (initialWallet) => {
  const { userDetails, authHeader, userWallets } = useContext(UserContext);

  const [senderId, setSenderId] = useState(initialWallet?._id || "");
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteExpiresAt, setQuoteExpiresAt] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const wallets = useMemo(() => (userWallets || []).filter(isUsable), [userWallets]);

  const senderWallet = useMemo(
    () => wallets.find((w) => w?._id === senderId) || null,
    [wallets, senderId],
  );

  /* Only wallets across the line from the sender can receive. */
  const receiverOptions = useMemo(
    () =>
      wallets.filter(
        (w) => w?._id !== senderWallet?._id && isCryptoWallet(w) !== isCryptoWallet(senderWallet),
      ),
    [wallets, senderWallet],
  );

  const receiverWallet = useMemo(
    () => receiverOptions.find((w) => w?._id === receiverId) || null,
    [receiverOptions, receiverId],
  );

  useEffect(() => {
    if (initialWallet?._id) setSenderId(initialWallet._id);
  }, [initialWallet?._id]);

  useEffect(() => {
    if (!wallets.length) return;
    if (!senderWallet) setSenderId(wallets.find(isCryptoWallet)?._id || wallets[0]?._id || "");
  }, [wallets, senderWallet]);

  useEffect(() => {
    if (receiverWallet) return;
    const preferred =
      receiverOptions.find((w) => w?.currency?.code === "USD") || receiverOptions[0];
    setReceiverId(preferred?._id || "");
  }, [receiverOptions, receiverWallet]);

  const clearQuote = () => {
    setQuote(null);
    setQuoteExpiresAt(null);
    setIsQuoteExpired(false);
  };

  const balance = Number(senderWallet?.balance?.available ?? 0);
  const numericAmount = Number(String(amount || "").replace(/,/g, "")) || 0;
  const insufficient = numericAmount > balance;
  const canConvert = wallets.some(isCryptoWallet) && wallets.some((w) => !isCryptoWallet(w));

  const fetchQuote = async () => {
    setError("");

    if (!senderWallet?._id || !receiverWallet?._id || numericAmount <= 0) {
      clearQuote();
      setLoading(false);
      return;
    }
    if (insufficient) {
      setError("Insufficient balance");
      clearQuote();
      setLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);

    const isCryptoConversion = isCryptoWallet(senderWallet) || isCryptoWallet(receiverWallet);
    const base = import.meta.env.VITE_IP_DEV_API;

    try {
      const res = isCryptoConversion
        ? await axios.post(
            `${base}/api/wallet/insta-wallet-conversion/fee`,
            {
              data: encryptData({
                sender_wallet_id: senderWallet._id,
                receiver_wallet_id: receiverWallet._id,
                amount: numericAmount,
                crypto_to_fiat: isCryptoWallet(senderWallet),
              }),
            },
            { headers: authHeader },
          )
        : await axios.get(
            `${base}/api/wallet/get-new-exchange-rate?from=${senderWallet.currency.code}&to=${receiverWallet.currency.code}&amount=${numericAmount}&type=conversion&level_id=${userDetails?.level?._id}&account_id=${userDetails?._id}&payment_type=wallet&receiver_wallet_id=${receiverWallet._id}&sender_wallet_id=${senderWallet._id}&payment_method=instant`,
            { headers: authHeader },
          );

      if (requestId !== requestRef.current) return;

      const data = decryptData(res.data.data)?.data || {};
      const rate = data?.exchanged_rate?.value ?? data?.rate?.value;
      const received = data?.recipient ?? data?.recipientReceives;

      /* The shape ConversionModal confirms and sends with. */
      setQuote({
        exchange_rate: rate,
        receiver: { currency: received?.currency, amount: received?.value },
        fee: { amount: data?.fee?.value ?? 0, currency: data?.fee?.currency },
        sending: {
          amount: data?.sending?.value ?? data?.total?.value,
          currency: data?.sending?.currency ?? senderWallet.currency.code,
        },
        total: data?.total?.value,
        token: data?.token,
      });
      setQuoteExpiresAt(Date.now() + CONVERSION_QUOTE_TTL_MS);
      setIsQuoteExpired(false);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      const dec = decryptData(err?.response?.data?.data);
      setError(
        LimitsErrorMessage(dec?.code ?? dec?.message) ||
          dec?.message ||
          "We are unable to process your request at the moment, please try again later!",
      );
      clearQuote();
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  /* Typed amounts settle for a second before the rate is asked for. */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (numericAmount > 0) fetchQuote();
      else {
        clearQuote();
        setError("");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [numericAmount, senderWallet?._id, receiverWallet?._id]);

  useEffect(() => {
    if (!quoteExpiresAt) return undefined;
    const remaining = quoteExpiresAt - Date.now();
    if (remaining <= 0) {
      setIsQuoteExpired(true);
      return undefined;
    }
    const timer = setTimeout(() => setIsQuoteExpired(true), remaining);
    return () => clearTimeout(timer);
  }, [quoteExpiresAt]);

  const swap = () => {
    if (!receiverWallet) return;
    const from = senderWallet?._id;
    setSenderId(receiverWallet._id);
    setReceiverId(from || "");
  };

  const reset = () => {
    setAmount("");
    setError("");
    clearQuote();
  };

  return {
    wallets,
    senderWallet,
    receiverWallet,
    receiverOptions,
    selectSender: setSenderId,
    selectReceiver: setReceiverId,
    swap,
    amount,
    setAmount,
    numericAmount,
    balance,
    insufficient,
    canConvert,
    quote,
    quoteExpiresAt,
    isQuoteExpired,
    loading,
    error,
    refreshQuote: fetchQuote,
    reset,
    isReady:
      !!quote?.exchange_rate && !isQuoteExpired && !loading && !insufficient && numericAmount > 0,
  };
};

export default useWalletConversion;

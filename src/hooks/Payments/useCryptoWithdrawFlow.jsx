import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { useDebounce } from "../useDebounce/useDebounce";
import useSendOtp from "../GeneralUse/useSendOtp";
import { useIdempotency } from "./useIdempotency";
import {
  toPayoutResult,
  useCryptoWithdrawal,
  useCryptoWithdrawalFee,
  useValidateCryptoAddress,
} from "./useCryptoPayout";
import { QUOTE_TTL_MS, SEND_STEPS, isQuoteError } from "./useCryptoSendFlow";
import { handlePaymentApiError } from "../../utils/Functions/handlePaymentApiError";
import { getAmountError, getAmountNumber } from "../../stateMachines/cryptoPayout";
import {
  getChannelAddress,
  getChannelAsset,
  getChannelProtocol,
  getInitialProtocol,
  getProtocolsForAddress,
} from "../../Components/WalletsNew/SendCryptoModal/cryptoProtocols";
import { findCountry } from "../../Components/Settings/WithdrawalsNew/withdrawalAccounts";
import { getCryptoList } from "../../Components/Settings/WithdrawalsNew/withdrawalPayload";

export const WITHDRAW_STEPS = SEND_STEPS;

const getRecordIso = (record) => String(record?.iso_code || "").toUpperCase();

export const getDestinationKey = (destination) => destination?.key || "";

export const useCryptoWithdrawFlow = (wallet, { active = true } = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails, userWithdrawals, cryptoWithdrawals, getWithdrawals, setProfileLockTime } =
    useContext(UserContext);

  const walletId = wallet?._id;
  const cryptoCurrency = String(wallet?.currency?.code || "").toUpperCase();
  const availableBalance = wallet?.balance?.available ?? 0;

  const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms");

  const [step, setStep] = useState(SEND_STEPS.FORM);
  const [countryIso, setCountryIso] = useState("");
  const [destinationKey, setDestinationKey] = useState("");
  const [protocol, setProtocol] = useState("");
  const [amount, setAmount] = useState("");
  const [feeDetails, setFeeDetails] = useState(null);
  const [quoteExpiresAt, setQuoteExpiresAt] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);
  const [confirmedNetwork, setConfirmedNetwork] = useState(false);
  const [addressStatus, setAddressStatus] = useState("");
  const [destinationError, setDestinationError] = useState("");
  const [authType, setAuthType] = useState(getDefaultAuthType);
  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);

  const feeMutation = useCryptoWithdrawalFee();
  const withdrawalMutation = useCryptoWithdrawal();
  const validateAddress = useValidateCryptoAddress();
  const { getKey, reset: resetIdempotencyKey } = useIdempotency();

  const { sendOtp, isSendingOtp } = useSendOtp({
    onSuccess: (token, response) => {
      setOtpToken(token);
      setOtpMethods(response || null);
      resetIdempotencyKey();
      setStep(SEND_STEPS.OTP);
    },
    onError: (error) => {
      toast.error(error?.message || t("Unable to send OTP"));
    },
  });

  const countries = useMemo(() => {
    const records = [...(userWithdrawals || []), ...(cryptoWithdrawals || [])];
    const seen = new Set();

    return records.reduce((list, record) => {
      const iso = getRecordIso(record);
      if (!iso || seen.has(iso)) return list;
      seen.add(iso);
      list.push({ iso, name: findCountry(iso)?.name || iso });
      return list;
    }, []);
  }, [userWithdrawals, cryptoWithdrawals]);

  const destinations = useMemo(
    () =>
      (cryptoWithdrawals || []).flatMap((record) =>
        getCryptoList(record)
          .filter((entry) => {
            if (!getChannelAddress(entry)) return false;
            const asset = getChannelAsset(entry);
            return !asset || asset === cryptoCurrency;
          })
          .map((entry, index) => ({
            key: `${record?._id}-${entry?._id || index}`,
            record,
            entry,
            iso: getRecordIso(record),
          })),
      ),
    [cryptoWithdrawals, cryptoCurrency],
  );

  const countryDestinations = useMemo(
    () => destinations.filter((destination) => destination.iso === countryIso),
    [destinations, countryIso],
  );

  const selectedDestination = useMemo(
    () => countryDestinations.find((destination) => destination.key === destinationKey) || null,
    [countryDestinations, destinationKey],
  );

  const selectedEntry = selectedDestination?.entry || null;
  const address = getChannelAddress(selectedEntry);
  const savedProtocol = useMemo(() => getChannelProtocol(selectedEntry), [selectedEntry]);

  const protocolOptions = useMemo(() => {
    if (!address) return [];
    if (savedProtocol) return [savedProtocol];
    const fromAddress = getProtocolsForAddress(address);
    if (fromAddress.length) return fromAddress;
    const initial = getInitialProtocol(selectedEntry);
    return initial ? [initial] : [];
  }, [address, selectedEntry, savedProtocol]);

  const amountError = getAmountError(amount, availableBalance, cryptoCurrency);

  useEffect(() => {
    if (active && userDetails?._id) getWithdrawals?.();
  }, [active, userDetails?._id]);

  useEffect(() => {
    if (userDetails?.tfa) setAuthType("authenticator");
  }, [userDetails?.tfa]);

  useEffect(() => {
    if (!countryIso && countries.length === 1) setCountryIso(countries[0].iso);
    if (countryIso && !countries.some((country) => country.iso === countryIso)) setCountryIso("");
  }, [countries, countryIso]);

  useEffect(() => {
    if (
      destinationKey &&
      countryDestinations.some((destination) => destination.key === destinationKey)
    )
      return;
    setDestinationKey(countryDestinations.length === 1 ? countryDestinations[0].key : "");
  }, [countryDestinations, destinationKey]);

  useEffect(() => {
    setProtocol(getInitialProtocol(selectedEntry) || "");
  }, [selectedEntry]);

  useEffect(() => {
    if (protocolOptions.length && !protocolOptions.includes(protocol)) {
      setProtocol(protocolOptions[0]);
    }
  }, [protocolOptions, protocol]);

  useEffect(() => {
    setFeeDetails(null);
    setQuoteExpiresAt(null);
    setIsQuoteExpired(false);
    setConfirmedNetwork(false);
    setOtpToken("");
    setDestinationError("");
  }, [address, protocol, amount, walletId]);

  const debouncedAddress = useDebounce(address, 500);
  const debouncedProtocol = useDebounce(protocol, 500);

  useEffect(() => {
    let cancelled = false;

    if (!debouncedAddress || !debouncedProtocol || !cryptoCurrency) {
      setAddressStatus("");
      return undefined;
    }

    setAddressStatus("checking");
    validateAddress
      .mutateAsync({
        crypto_currency: cryptoCurrency,
        protocol: debouncedProtocol,
        address: debouncedAddress,
      })
      .then((res) => {
        if (cancelled) return;
        const valid = res?.data?.valid ?? res?.valid;
        setAddressStatus(valid ? "valid" : "invalid");
      })
      .catch(() => {
        if (!cancelled) setAddressStatus("");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedAddress, debouncedProtocol, cryptoCurrency]);

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

  const reset = () => {
    setStep(SEND_STEPS.FORM);
    setCountryIso(countries.length === 1 ? countries[0].iso : "");
    setDestinationKey("");
    setProtocol("");
    setAmount("");
    setFeeDetails(null);
    setQuoteExpiresAt(null);
    setIsQuoteExpired(false);
    setConfirmedNetwork(false);
    setAddressStatus("");
    setDestinationError("");
    setAuthType(getDefaultAuthType());
    setOtpToken("");
    setOtpMethods(null);
    setPayoutResult(null);
    resetIdempotencyKey();
  };

  const selectCountry = (iso) => {
    setDestinationError("");
    setCountryIso(iso);
    setDestinationKey("");
  };

  const selectDestination = (key) => {
    setDestinationError("");
    setDestinationKey(key);
  };

  const buildFeePayload = () => ({
    wallet_id: walletId,
    withdrawal_id: selectedDestination?.record?._id,
    amount: getAmountNumber(amount),
    crypto_currency: cryptoCurrency,
    protocol,
    address,
  });

  const buildWithdrawalPayload = () => ({
    wallet_id: walletId,
    token: feeDetails?.token,
    address,
    amount: getAmountNumber(amount),
  });

  const requestQuote = async () => {
    setDestinationError("");

    const res = await feeMutation.mutateAsync(buildFeePayload());
    const data = res?.data || res;

    setFeeDetails(data || null);
    setQuoteExpiresAt(Date.now() + QUOTE_TTL_MS);
    setIsQuoteExpired(false);
    setConfirmedNetwork(false);

    return data;
  };

  const handleQuoteError = (error, { onDetails } = {}) => {
    handlePaymentApiError({
      error,
      navigate,
      setProfileLockTime,
      setError: (message) => {
        if (isQuoteError(message)) {
          setIsQuoteExpired(true);
          return;
        }
        if (onDetails) onDetails(message);
        else toast.error(message);
      },
    });
  };

  const getQuote = async () => {
    try {
      await requestQuote();
      setStep(SEND_STEPS.REVIEW);
    } catch (error) {
      handleQuoteError(error, {
        onDetails: (message) => {
          setDestinationError(message);
          toast.error(message);
        },
      });
    }
  };

  const refreshQuote = async () => {
    try {
      await requestQuote();
    } catch (error) {
      handleQuoteError(error);
    }
  };

  const requestOtp = async (otpCodeType) => {
    const nextAuthType = otpCodeType || authType;
    setAuthType(nextAuthType);
    await sendOtp(buildWithdrawalPayload(), nextAuthType);
  };

  const confirmWithdrawal = async (setVerified, type, otp, setOtpError) => {
    try {
      const res = await withdrawalMutation.mutateAsync({
        token: otpToken,
        otp,
        type: type || authType,
        idempotencyKey: getKey(),
      });

      setPayoutResult(toPayoutResult(res));
      setVerified(true);
    } catch (error) {
      resetIdempotencyKey();
      handlePaymentApiError({
        error,
        navigate,
        setProfileLockTime,
        setError: (message) => {
          if (isQuoteError(message)) {
            setIsQuoteExpired(true);
            setStep(SEND_STEPS.REVIEW);
            toast.error(message);
            return;
          }
          setOtpError(message);
        },
      });
    }
  };

  const back = () => {
    if (step === SEND_STEPS.REVIEW) setStep(SEND_STEPS.FORM);
    else if (step === SEND_STEPS.OTP) setStep(SEND_STEPS.REVIEW);
  };

  const canGetQuote =
    getAmountNumber(amount) > 0 &&
    !amountError &&
    !!selectedDestination?.record?._id &&
    !!address &&
    !!protocol &&
    addressStatus !== "invalid" &&
    !feeMutation.isPending;

  const canConfirm = !!feeDetails?.token && confirmedNetwork && !isQuoteExpired && !isSendingOtp;

  return {
    step,
    setStep,
    cryptoCurrency,
    availableBalance,
    amount,
    setAmount,
    amountError,
    countries,
    countryIso,
    selectCountry,
    countryDestinations,
    hasAnyDestination: destinations.length > 0,
    destinationKey,
    selectedDestination,
    selectDestination,
    address,
    protocol,
    setProtocol,
    protocolOptions,
    isProtocolLocked: !!savedProtocol,
    addressStatus,
    destinationError,
    feeDetails,
    quoteExpiresAt,
    isQuoteExpired: isQuoteExpired || !feeDetails?.token,
    confirmedNetwork,
    setConfirmedNetwork,
    isFetchingQuote: feeMutation.isPending,
    isSendingOtp,
    isSending: withdrawalMutation.isPending,
    authType,
    setAuthType,
    otpMethods,
    payoutResult,
    canGetQuote,
    canConfirm,
    getQuote,
    refreshQuote,
    requestOtp,
    confirmWithdrawal,
    back,
    reset,
  };
};

export default useCryptoWithdrawFlow;

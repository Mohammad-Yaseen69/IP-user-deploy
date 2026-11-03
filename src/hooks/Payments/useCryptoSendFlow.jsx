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
  useCryptoPayout,
  useCryptoPayoutFee,
  useValidateCryptoAddress,
} from "./useCryptoPayout";
import { handlePaymentApiError } from "../../utils/Functions/handlePaymentApiError";
import { getAmountError, getAmountNumber } from "../../stateMachines/cryptoPayout";
import {
  filterProtocolsForAddress,
  getBeneficiaryCryptoChannels,
  getChannelAddress,
  getChannelAsset,
  getChannelProtocol,
  getInitialProtocol,
  getProtocolsForAddress,
  hasCryptoChannel,
} from "../../Components/WalletsNew/SendCryptoModal/cryptoProtocols";

export const SEND_STEPS = {
  FORM: "FORM",
  REVIEW: "REVIEW",
  OTP: "OTP",
  DONE: "DONE",
};

export const QUOTE_TTL_MS = 2 * 60 * 1000;

const QUOTE_ERROR_HINTS = [
  "quote expired",
  "quote has already been used",
  "quote is invalid",
  "token_expired",
  "invalid_token",
  "waited too long",
];

export const isQuoteError = (message) => {
  const text = String(message || "").toLowerCase();
  return QUOTE_ERROR_HINTS.some((hint) => text.includes(hint));
};

const isMissingBeneficiaryDetailsError = (message) =>
  String(message || "")
    .toLowerCase()
    .includes("missing details required for crypto payouts");

export const getBeneficiaryId = (beneficiary) => beneficiary?._id || beneficiary?.id;

export const getBeneficiaryName = (beneficiary) => {
  const name = [beneficiary?.first_name, beneficiary?.last_name].filter(Boolean).join(" ");
  return name || beneficiary?.company_name || beneficiary?.legalName || beneficiary?.name || "-";
};

export const useCryptoSendFlow = (wallet, { active = true } = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails, beneficiaries, getUserBeneficiaries, setProfileLockTime } =
    useContext(UserContext);

  const walletId = wallet?._id;
  const cryptoCurrency = String(wallet?.currency?.code || "").toUpperCase();
  const availableBalance = wallet?.balance?.available ?? 0;

  const getDefaultAuthType = () => (userDetails?.tfa ? "authenticator" : "sms");

  const [step, setStep] = useState(SEND_STEPS.FORM);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [protocol, setProtocol] = useState("");
  const [apiProtocols, setApiProtocols] = useState([]);
  const [amount, setAmount] = useState("");
  const [feeDetails, setFeeDetails] = useState(null);
  const [quoteExpiresAt, setQuoteExpiresAt] = useState(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);
  const [confirmedNetwork, setConfirmedNetwork] = useState(false);
  const [addressStatus, setAddressStatus] = useState("");
  const [beneficiaryError, setBeneficiaryError] = useState("");
  const [authType, setAuthType] = useState(getDefaultAuthType);
  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);
  const [savedBeneficiaryId, setSavedBeneficiaryId] = useState("");

  const feeMutation = useCryptoPayoutFee();
  const payoutMutation = useCryptoPayout();
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

  const cryptoBeneficiaries = useMemo(
    () =>
      (beneficiaries || []).filter((beneficiary) => hasCryptoChannel(beneficiary, cryptoCurrency)),
    [beneficiaries, cryptoCurrency],
  );

  const cryptoChannels = useMemo(() => {
    const channels = getBeneficiaryCryptoChannels(selectedBeneficiary);
    const matching = channels.filter((channel) => {
      const asset = getChannelAsset(channel);
      return !asset || asset === cryptoCurrency;
    });
    return matching.length ? matching : channels;
  }, [selectedBeneficiary, cryptoCurrency]);

  const address = getChannelAddress(selectedChannel);

  const savedProtocol = useMemo(() => getChannelProtocol(selectedChannel), [selectedChannel]);

  const protocolOptions = useMemo(() => {
    if (!address) return [];
    if (savedProtocol) return [savedProtocol];
    if (apiProtocols.length) return filterProtocolsForAddress(apiProtocols, address);
    const fromAddress = getProtocolsForAddress(address);
    if (fromAddress.length) return fromAddress;
    const initial = getInitialProtocol(selectedChannel);
    return initial ? [initial] : [];
  }, [address, apiProtocols, selectedChannel, savedProtocol]);

  const amountError = getAmountError(amount, availableBalance, cryptoCurrency);

  useEffect(() => {
    if (active && userDetails?._id) getUserBeneficiaries?.();
  }, [active, userDetails?._id]);

  useEffect(() => {
    if (userDetails?.tfa) setAuthType("authenticator");
  }, [userDetails?.tfa]);

  useEffect(() => {
    if (!selectedBeneficiary) return;
    const stillListed = cryptoBeneficiaries.some(
      (beneficiary) => getBeneficiaryId(beneficiary) === getBeneficiaryId(selectedBeneficiary),
    );
    if (!stillListed) setSelectedBeneficiary(null);
  }, [cryptoBeneficiaries, selectedBeneficiary]);

  useEffect(() => {
    setSelectedChannel(cryptoChannels[0] || null);
  }, [cryptoChannels]);

  useEffect(() => {
    setApiProtocols([]);
    setProtocol(
      getInitialProtocol(selectedChannel) ||
        getProtocolsForAddress(getChannelAddress(selectedChannel))[0] ||
        "",
    );
  }, [selectedChannel]);

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
    if (!savedBeneficiaryId) return;

    const saved = cryptoBeneficiaries.find(
      (beneficiary) => getBeneficiaryId(beneficiary) === savedBeneficiaryId,
    );
    if (!saved) return;

    setBeneficiaryError("");
    setSelectedBeneficiary(saved);
    setSavedBeneficiaryId("");
  }, [cryptoBeneficiaries, savedBeneficiaryId]);

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
    setSelectedBeneficiary(null);
    setSelectedChannel(null);
    setProtocol("");
    setApiProtocols([]);
    setAmount("");
    setFeeDetails(null);
    setQuoteExpiresAt(null);
    setIsQuoteExpired(false);
    setConfirmedNetwork(false);
    setAddressStatus("");
    setBeneficiaryError("");
    setAuthType(getDefaultAuthType());
    setOtpToken("");
    setOtpMethods(null);
    setPayoutResult(null);
    setSavedBeneficiaryId("");
    resetIdempotencyKey();
  };

  const selectBeneficiary = (beneficiary) => {
    setBeneficiaryError("");
    setSelectedBeneficiary(beneficiary);
  };

  const onBeneficiarySaved = async (savedBeneficiary) => {
    setSavedBeneficiaryId(getBeneficiaryId(savedBeneficiary) || "");
    await getUserBeneficiaries?.();
  };

  const buildFeePayload = () => ({
    wallet_id: walletId,
    beneficiary_id: getBeneficiaryId(selectedBeneficiary),
    amount: getAmountNumber(amount),
    crypto_currency: cryptoCurrency,
    protocol,
    address,
  });

  const buildPayoutPayload = () => ({
    wallet_id: walletId,
    token: feeDetails?.token,
    address,
    amount: getAmountNumber(amount),
  });

  const requestQuote = async () => {
    setBeneficiaryError("");

    const res = await feeMutation.mutateAsync(buildFeePayload());
    const data = res?.data || res;

    if (Array.isArray(data?.protocols)) setApiProtocols(data.protocols);

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
          setBeneficiaryError(message);
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
    await sendOtp(buildPayoutPayload(), nextAuthType);
  };

  const confirmPayout = async (setVerified, type, otp, setOtpError) => {
    try {
      const res = await payoutMutation.mutateAsync({
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

  const editBeneficiary = () => {
    if (!selectedBeneficiary) return;
    navigate(
      `/beneficiaries/edit${selectedBeneficiary?.beneficiary_type === "business" ? "/business" : ""}?user_id=${getBeneficiaryId(selectedBeneficiary)}&edit=true`,
    );
  };

  const canEditBeneficiary =
    !!selectedBeneficiary &&
    (isMissingBeneficiaryDetailsError(beneficiaryError) || addressStatus === "invalid");

  const canGetQuote =
    getAmountNumber(amount) >= 0 &&
    !amountError &&
    !!selectedBeneficiary &&
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
    cryptoBeneficiaries,
    selectedBeneficiary,
    selectBeneficiary,
    cryptoChannels,
    selectedChannel,
    selectChannel: setSelectedChannel,
    address,
    protocol,
    setProtocol,
    protocolOptions,
    isProtocolLocked: !!savedProtocol,
    addressStatus,
    beneficiaryError,
    canEditBeneficiary,
    editBeneficiary,
    onBeneficiarySaved,
    feeDetails,
    quoteExpiresAt,
    isQuoteExpired: isQuoteExpired || !feeDetails?.token,
    confirmedNetwork,
    setConfirmedNetwork,
    isFetchingQuote: feeMutation.isPending,
    isSendingOtp,
    isSending: payoutMutation.isPending,
    authType,
    setAuthType,
    otpMethods,
    payoutResult,
    canGetQuote,
    canConfirm,
    getQuote,
    refreshQuote,
    requestOtp,
    confirmPayout,
    back,
    reset,
  };
};

export default useCryptoSendFlow;

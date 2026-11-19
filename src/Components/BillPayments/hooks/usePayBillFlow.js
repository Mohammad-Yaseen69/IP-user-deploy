import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import useSendOtp from "../../../hooks/GeneralUse/useSendOtp";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import { useDebounce } from "../../../hooks/useDebounce/useDebounce";
import { getWalletAvailable } from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import { getPaymentMethod } from "../data/paymentMethods";
import {
  useAddSavedBill,
  useBillProducts,
  useBillQuote,
  useBillQuotePreview,
  useBillStatements,
  useConfirmBillPayment,
} from "./useBillPaymentQueries";

export const PAY_STEPS = { BILLER: "biller", PAYMENT: "payment", CONFIRM: "confirm", DONE: "done" };

const SUPPORTED_FIELDS = ["account_number", "mobile_number", "account_qualifier"];
const EMPTY_IDENTIFIERS = {
  account_number: "",
  mobile_number: "",
  account_qualifier: "",
  statement_reference: "",
  statement_due_date: "",
};

export const getAmountLimits = (product, statement) => {
  const range = product?.amount_range;
  if (!range) return null;

  const balance = statement?.balance?.value;
  const modes = product.payment_modes || [];
  if (balance == null || !modes.length) return range;

  return {
    ...range,
    min: modes.includes("PARTIAL") ? range.min : balance,
    max: modes.includes("EXCESS") ? range.max : balance,
  };
};

export const getRequiredFields = (product) => {
  const fields = (product?.required_fields?.[0] || []).filter((field) =>
    SUPPORTED_FIELDS.includes(field),
  );
  return fields.length ? fields : ["account_number"];
};

// mobile_number holds dial code + number as digits; E.164 allows at most 15
export const isFieldValid = (field, value) =>
  field === "mobile_number" ? /^\d{9,15}$/.test(value || "") : !!value?.trim();

const identifiersOf = (savedBill) => ({
  ...EMPTY_IDENTIFIERS,
  ...savedBill?.identifiers,
  mobile_number: (savedBill?.identifiers?.mobile_number || "").replace("+", ""),
});

export const usePayBillFlow = ({
  initialCountry,
  initialBiller,
  initialWallet,
  savedBill: initialSavedBill,
  onSaved,
}) => {
  const navigate = useNavigate();
  const { userDetails, setProfileLockTime, getUserWallets } = useContext(UserContext);

  const [step, setStep] = useState(
    initialBiller || initialSavedBill ? PAY_STEPS.PAYMENT : PAY_STEPS.BILLER,
  );
  const [savedBill, setSavedBill] = useState(initialSavedBill || null);
  const [country, setCountry] = useState(initialCountry || null);
  const [biller, setBiller] = useState(initialBiller || initialSavedBill?.biller || null);
  const [product, setProduct] = useState(null);
  const [identifiers, setIdentifiers] = useState(() => identifiersOf(initialSavedBill));
  const [nickname, setNickname] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [amount, setAmount] = useState("");
  const [statement, setStatement] = useState(null);
  const [paymentMethodId, setPaymentMethodId] = useState("wallet");
  const [wallet, setWallet] = useState(initialWallet || null);
  const [quote, setQuote] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  const [authType, setAuthType] = useState(userDetails?.tfa ? "authenticator" : "sms");
  const [otpToken, setOtpToken] = useState("");
  const [otpMethods, setOtpMethods] = useState(null);

  const products = useBillProducts({
    countryAlpha3: country?.alpha3,
    billerId: biller?.id,
    walletId: wallet?._id,
  });
  const statementsMutation = useBillStatements();
  const addBillMutation = useAddSavedBill();
  const quoteMutation = useBillQuote();
  const confirmMutation = useConfirmBillPayment();
  const { getKey, reset: resetIdempotencyKey } = useIdempotency();

  const { sendOtp, isSendingOtp } = useSendOtp({
    onSuccess: (token, response) => {
      setOtpToken(token);
      setOtpMethods(response || null);
      resetIdempotencyKey();
    },
  });

  const showError = (apiError, onMessage = setError) =>
    handlePaymentApiError({
      error: apiError,
      navigate,
      setProfileLockTime,
      setError: onMessage,
    });

  const requiredFields = getRequiredFields(product);
  const statementFields = (product?.statement_fields || []).map((field) => `statement_${field}`);
  const amountLimits = getAmountLimits(product, statement);
  const isAmountValid =
    !amountLimits ||
    (Number(amount) > 0 &&
      (amountLimits.min == null || Number(amount) >= amountLimits.min) &&
      (amountLimits.max == null || Number(amount) <= amountLimits.max));

  const hasIdentifiers =
    !!product && requiredFields.every((field) => isFieldValid(field, identifiers[field]));

  const debouncedAmount = useDebounce(amount, 500);
  const previewParams = {
    productId: product?.id,
    walletId: wallet?._id,
    paymentMethod: paymentMethodId,
    amount: amountLimits ? Number(debouncedAmount) : undefined,
  };
  const preview = useBillQuotePreview(
    previewParams,
    !!product &&
      !!wallet &&
      !!getPaymentMethod(paymentMethodId)?.confirmEndpoint &&
      isAmountValid &&
      (!amountLimits || debouncedAmount === amount),
  );

  // The total is only known for the selected wallet, from the live quote.
  const previewTotal = preview.data?.total?.value;
  const hasEnoughFunds = previewTotal == null || previewTotal <= getWalletAvailable(wallet);

  const canReview =
    hasIdentifiers &&
    hasEnoughFunds &&
    !!wallet &&
    !!getPaymentMethod(paymentMethodId)?.confirmEndpoint &&
    statementFields.every((field) => !!identifiers[field]) &&
    isAmountValid;

  const selectStatement = (nextStatement) => {
    setStatement(nextStatement);
    setIdentifiers((current) => ({
      ...current,
      statement_reference: nextStatement?.reference || "",
      statement_due_date: nextStatement?.due_date || "",
    }));
    if (nextStatement?.balance?.value != null) setAmount(String(nextStatement.balance.value));
  };

  const savedProduct =
    savedBill && products.data?.find((item) => item.id === savedBill.product?.id);
  useEffect(() => {
    if (!savedProduct) return;
    setProduct(savedProduct);
    if (savedBill.status === "due") selectStatement(savedBill.statement);
  }, [savedProduct?.id, savedBill?.id]);

  const pickSavedBill = (bill, billCountry) => {
    setError("");
    setSavedBill(bill);
    setCountry(billCountry || country);
    setBiller(bill.biller);
    setProduct(null);
    setAmount("");
    setStatement(null);
    statementsMutation.reset();
    setIdentifiers(identifiersOf(bill));
    setStep(PAY_STEPS.PAYMENT);
  };

  const selectProduct = (nextProduct) => {
    if (savedBill && nextProduct?.id !== savedBill.product?.id) setSavedBill(null);
    setProduct(nextProduct);
    setAmount("");
    selectStatement(null);
    statementsMutation.reset();
  };

  const selectCountry = (nextCountry) => {
    setSavedBill(null);
    setCountry(nextCountry);
    setBiller(null);
    selectProduct(null);
  };

  const selectBiller = (nextBiller) => {
    setSavedBill(null);
    setBiller(nextBiller);
    selectProduct(null);
  };

  const selectWallet = (nextWallet) => setWallet(nextWallet);

  // Prices depend on the wallet currency, so the chosen bill is swapped for its copy from the new list.
  useEffect(() => {
    const repriced = product && products.data?.find((item) => item.id === product.id);
    if (repriced && repriced !== product) setProduct(repriced);
  }, [products.data]);

  const setIdentifier = (field, value) =>
    setIdentifiers((current) => ({ ...current, [field]: value }));

  const checkBill = async () => {
    setError("");
    selectStatement(null);
    try {
      const found = await statementsMutation.mutateAsync({
        productId: product.id,
        accountNumber: identifiers.account_number.trim(),
        accountQualifier: identifiers.account_qualifier.trim() || undefined,
      });
      if (found.length === 1) selectStatement(found[0]);
    } catch (apiError) {
      showError(apiError);
    }
  };

  const identifierPayload = (fields) =>
    Object.fromEntries(
      fields
        .filter((field) => identifiers[field])
        .map((field) => [
          field,
          field === "mobile_number" ? `+${identifiers[field]}` : identifiers[field].trim(),
        ]),
    );

  // Only a payment to the saved account marks that saved bill as paid.
  const isPayingSavedBill =
    !!savedBill &&
    requiredFields.every(
      (field) =>
        identifierPayload([field])[field] === (savedBill.identifiers?.[field] || undefined),
    );

  const otpPayload = (token) => ({
    token,
    wallet_id: wallet._id,
    bill_id: isPayingSavedBill ? savedBill.id : undefined,
    ...identifierPayload([...requiredFields, ...statementFields]),
  });

  const saveBill = async () => {
    setError("");
    try {
      await addBillMutation.mutateAsync({
        productId: product.id,
        identifiers: identifierPayload(requiredFields),
        nickname: nickname.trim(),
        reminderEnabled,
      });
      toast.success("Bill saved");
      onSaved?.();
    } catch (apiError) {
      showError(apiError);
    }
  };

  const requestOtp = async (codeType) => {
    const nextAuthType = codeType || authType;
    setAuthType(nextAuthType);
    try {
      await sendOtp(otpPayload(quote.token), nextAuthType);
    } catch (apiError) {
      showError(apiError, (message) => toast.error(message));
    }
  };

  const reviewPayment = async () => {
    setError("");
    try {
      const nextQuote = await quoteMutation.mutateAsync({
        productId: product.id,
        walletId: wallet._id,
        paymentMethod: paymentMethodId,
        amount: amountLimits ? Number(amount) : undefined,
      });
      setQuote(nextQuote);
      await sendOtp(otpPayload(nextQuote.token), authType);
      setStep(PAY_STEPS.CONFIRM);
    } catch (apiError) {
      showError(apiError);
    }
  };

  const confirmPayment = async (setVerified, type, otp, setOtpError) => {
    try {
      const result = await confirmMutation.mutateAsync({
        endpoint: getPaymentMethod(paymentMethodId).confirmEndpoint,
        token: otpToken,
        otp,
        type: type || authType,
        idempotencyKey: getKey(),
      });
      setReceipt(result);
      getUserWallets?.();
      setVerified(true);
    } catch (apiError) {
      resetIdempotencyKey();
      showError(apiError, setOtpError);
    }
  };

  const back = () => {
    setError("");
    if (step === PAY_STEPS.CONFIRM) setStep(PAY_STEPS.PAYMENT);
    else if (step === PAY_STEPS.PAYMENT) setStep(PAY_STEPS.BILLER);
  };

  return {
    step,
    setStep,
    country,
    selectCountry,
    biller,
    selectBiller,
    products,
    product,
    setProduct: selectProduct,
    requiredFields,
    statementFields,
    amount,
    setAmount,
    amountLimits,
    statement,
    selectStatement,
    statements: statementsMutation,
    checkBill,
    savedBill,
    pickSavedBill,
    preview: preview.data,
    isPreviewing: preview.isFetching,
    nickname,
    setNickname,
    reminderEnabled,
    setReminderEnabled,
    canSave: hasIdentifiers,
    isSaving: addBillMutation.isPending,
    saveBill,
    identifiers,
    setIdentifier,
    paymentMethodId,
    setPaymentMethodId,
    wallet,
    selectWallet,
    quote,
    receipt,
    error,
    canReview,
    hasEnoughFunds,
    isReviewing: quoteMutation.isPending || isSendingOtp,
    isConfirming: confirmMutation.isPending,
    reviewPayment,
    requestOtp,
    confirmPayment,
    authType,
    setAuthType,
    otpMethods,
    back,
  };
};

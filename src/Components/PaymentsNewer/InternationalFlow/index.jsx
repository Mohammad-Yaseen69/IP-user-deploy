import { logger } from "@sentry/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import { createShambeToken } from "../../../Helper/CreateToken";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import useVendorBalance from "../../../hooks/Payments/useVendorBalance";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { initiatePaytentlyPayment, usePaytently } from "../../../utils/Functions/paytently";
import PaytentlyHostedModal from "../../AddFunds/PaytentlyHostedModal";
import AddBeneficiaryAddressModal from "../../AddBeneficiaryAddressModal";
import AddBeneficiaryRequiredFields from "../../AddBeneficiaryRequiredFields";
import errors from "../../AddFunds/TrustPaymentErrors.json";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import InstaPayLoader from "../../Loader";
import NotFoundModal from "../../NotFound/NotFoundModal";
import { formatDateTime } from "../../ReceiptInvoices/InvoiceTable";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";
import SendActionCard from "../Common/SendActionCard";
import int from "../files/int.svg";
import international from "../files/international.png";
import { LimitsErrorMessage } from "../../../utils/Functions/paymentLimits";
import RecentTransactions from "../WalletToWalletFlow/RecentTransactions";
import CreditCard from "./CreditCard";
import ErrorModal from "./ErrorModal";
import FeesComponent from "./FeesComponent";
import MobileWalletServices from "./MobileWalletServices";
import OtpConfirmation from "../../../Common/Component/OtpVerification";
import Receipt from "./Receipt";
import SelectedCard from "./SelectedCard";
import ServiceDetails from "./ServiceDetails";
import StepFive from "./StepFive";
import StepFour from "./StepFour";
import StepOne from "./StepOne";
import StepThree from "./StepThree";
import StepTwo from "./StepTwo";
import styles from "./styles/index.module.css";
import VendorBalanceModal from "./VendorBalanceModal";
import WalletsComponent from "./WalletsComponent";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import SelectSender from "./SelectSender";
import { getBeneficiaryDisplayName } from "./beneficiaryHelpers";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import {
  appendThunesDocuments,
  getThunesDocumentEntries,
  hasThunesRequiredDocuments,
  isThunesDocumentType,
} from "./thunesDocuments";
import { formatCurrency } from "../../../Helper/AmountFormat";
import PlaidBankTransfer from "../../AddFunds/WalletFundsFlow/PlaidBankTransfer";
import PlaidLinkHandler from "./PlaidLinkHandler";
import useEffectivePermission, {
  PERMISSIONS,
} from "../../../hooks/GeneralUse/useEffectivePermission";
import {
  isOnafriq,
  onafriqConfirmError,
  onafriqQuoteError,
  onafriqServiceId,
  onafriqServiceName,
} from "./onafriq";

const leftSideContent = [
  "Select Transaction Type",
  "Choose the beneficiary!",
  "Add Payment Purpose and Reference",
  "Select Payment Type",
  "Review transfer",
];

const apiErrors = {
  internal_server_error:
    "We are unable to process your request at the moment please try again later.",
  invalid_token:
    "You took too long to initiate the payment and for security reasons we have terminated the process. Please start again",
  token_expired:
    "You took too long to initiate the payment and for security reasons we have terminated the process. Please start again",
  invalid_card_details: "The card details you entered don't match your selected country.",
  incorrect_card: "This card does not belong to your account. Please use a valid card.",
  transaction_failed:
    "The transaction couldn't be completed. Please try again or use a different method.",
  feature_not_allowed:
    "This feature is currently disabled for your account. Contact support for assistance.",
  currency_not_supported:
    "Card top-up isn't available for this wallet's currency. Please use a different payment method.",
  amount_too_large:
    "This amount is too large for card payment. Please enter a smaller amount or use a different method.",
  beneficiary_details_missing:
    "It appears that some required beneficiary details are either missing or incorrect. Please review and update the beneficiary information, ensuring all fields are properly filled, and try again.",
  insufficient_funds: "You don't have enough funds for this transaction.",
  invoice_not_found_or_inactive:
    "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
  invoice_not_found:
    "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
  invoice_already_paid: "This invoice is already paid!",
  receiver_wallet_not_found: "Recipient wallet is either disabled, blocked or does not exists.",
  shipping_details_required:
    "Please fill all the required shipping details before proceeding with the transaction.",
  "Onafriq API failed":
    "Mobile wallet payment method is currently not available for your account. please select a different method.",
};

export const apiErrorMessage = (code) => {
  let error;
  // console.log(code, "lololo")
  for (const key in apiErrors) {
    if (code?.includes(key)) {
      error = apiErrors[key];
      break;
    }
  }

  return error ?? false;
};

// 502 arrives unencrypted
const decryptError = (err) => {
  const body = err?.response?.data;
  try {
    return decryptData(body?.data);
  } catch {
    if (body && typeof body === "object") return body;
    return { message: typeof body === "string" ? body : err?.message };
  }
};

const initialState = {
  formatted_amount: 1.0,
  amount: 1.0,
  new_amount: 0.0,
  receiving_amount: 0.0,
  currency: "",
  currency_wallet: {},
  country: {},
  payoutChannel: {},
  payer: {},
  services: [],
  payers: [],
  beneficiary: {},
  isAddingBeneficiary: false,
  pendingBeneficiary: null,
  reason: "",
  comment: "",
  files: [],
  payment_type: {},
  wallet: {},
  quotation_details: {},
  quoted_wallet_id: "",
  created_quotation: {},
  created_transaction: {},
  transaction_details: {},
  cardNumber: "",
  expiry: "",
  cvc: "",
  cardHolderName: "",
  saveCard: "",
  cardError: "",
  selectedSavedCard: {},
  cardTransactionDetails: {},
  codeType: "sms",
  exchange_rate: {},
  exchange_rate_error: "",
  exchange_rate_error_value: 0,
  error: "",
  showOtpModal: false,
  otpError: "",
  showCard: false,
  recipient_currency: "",
  mobile_wallet_merchant: "",
  mobile_wallet_channels: [],
  mobile_wallet_services: [],
  mobile_wallet_channel: {},
  mobile_wallet_service: {},
  ex_extra_error: "",
  conversion_in: "",
  payerRequiredFields: {},
  payerPurposes: null,
  requiredDocFiles: {},
  transactionStatus: false,
  transactionType: "",
  flow: "",
  transactionTypeSelected: false,
  isThirdPartyAllowed: false,
  isRecipientTypeSelected: false,
  isSendingTypeSelected: false,
  sendingType: "",
  showSenderSelection: false,
  selectedSender: null,
  senderType: "account", //"account" || "third-party"
  plaidLink: null,
};

const beneficiaryRequiredFields = [
  "lastname2",
  "middlename",
  "nativename",
  "nationality_country_iso_code",
  "date_of_birth",
  "country_of_birth_iso_code",
  "gender",
  "address",
  "postal_code",
  "country_iso_code",
  "email",
  "id_type",
  "id_country_iso_code",
  "id_number",
  "id_delivery_date",
  "id_expiration_date",
  "occupation",
  "bank_account_holder_name",
];

const beneficiaryExtrasRequiredFields = ["province_state"];

const vendorsRequiredFields = [
  "msisdn",
  "bank_account_number",
  "iban",
  "clabe",
  "cbu",
  "cbu_alias",
  "swift_bic_code",
  "bik_code",
  "ifs_code",
  "sort_code",
  "aba_routing_number",
  "bsb_number",
  "branch_number",
  "routing_code",
  "entity_tt_id",
  "account_type",
  "account_number",
  "email",
  "card_number",
];

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "RESET_FIRST_STEP_DATA":
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

const InternationFlow = ({
  sendPaymentType,
  setStep,
  setSendPaymentType,
  showRecent,
  setShowRecent,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails, authHeader, setProfileLockTime, getUserBeneficiaries, isAgentLogin } =
    useContext(UserContext);
  const [subStep, setSubStep] = useState(0);
  const [internationalData, dispatch] = useReducer(reducer, initialState);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getKey, reset } = useIdempotency();
  const can = usePermission();
  const isBankTransfer = internationalData?.payment_type?.value === "bank_transfer";
  const hasPermission = useEffectivePermission();
  const canInternationTransfer = hasPermission(PERMISSIONS.INTERNATIONAL_TRANSFER);

  const [requiredMissingFields, setRequiredMissingFields] = useState({
    beneficiary: {
      basic: [],
      extras: [],
    },
    vendors: {
      vendorType: "",
      fields: [],
    },
  });
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [requiredFields] = useState({
    basic: [],
    extras: [],
  });

  // eslint-disable-next-line no-unused-vars
  const neemaReasons = useQuery({
    queryKey: [
      "NeemaReasons",
      internationalData?.country?.alpha3,
      internationalData.payoutChannel?.vendor,
    ],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: `/api/payment/get-neema-reasons/${internationalData?.country?.alpha3}/${internationalData.flow}`,
      });
      updateInternationalData("neemaReasons", res.data);
    },
    enabled:
      !!internationalData.country?.alpha3 &&
      internationalData.payoutChannel?.vendor?.toLowerCase() === "neema",
    retry: 3,
  });

  const isThunesPayout = internationalData.payoutChannel?.vendor?.toLowerCase() === "thunes";

  // Documents (e.g. invoice) the selected Thunes payer requires for this transaction type
  const { data: payerRequiredDocuments = [] } = useQuery({
    queryKey: [
      "payerRequiredDocuments",
      internationalData.country?.alpha3,
      internationalData.payoutChannel?.id,
      internationalData.flow,
      internationalData.payer?.id,
    ],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: `/api/payment/get-required-fields/${internationalData.country?.alpha3}/${internationalData.payoutChannel?.id}/${internationalData.flow}?destinationType=${internationalData.payoutChannel?.id}&payer_id=${internationalData.payer?.id}`,
      });
      const documents = res?.data?.required_documents;
      // Only types Thunes accepts as upload field names; anything else would be rejected on confirm
      return Array.isArray(documents)
        ? documents.filter((doc) => isThunesDocumentType(doc?.name))
        : [];
    },
    enabled:
      isThunesPayout &&
      !!internationalData.country?.alpha3 &&
      !!internationalData.payoutChannel?.id &&
      !!internationalData.flow &&
      !!internationalData.payer?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    updateInternationalData("payerPurposes", null);
    updateInternationalData("requiredDocFiles", {});
    updateInternationalData("files", []);
  }, [internationalData.payer?.id, internationalData.flow]);

  const thunesDocumentEntries = isThunesPayout
    ? getThunesDocumentEntries({
        requiredDocuments: payerRequiredDocuments,
        requiredDocFiles: internationalData.requiredDocFiles,
        files: internationalData.files,
      })
    : [];

  // Card, PayPal and mobile wallet keep their JSON body; it only becomes multipart when
  // there are Thunes documents to attach.
  const withThunesDocuments = (encryptedPayload) => {
    if (!thunesDocumentEntries.length) return { data: encryptedPayload };
    const form = new FormData();
    form.append("data", encryptedPayload);
    return appendThunesDocuments(form, thunesDocumentEntries);
  };

  const { vendorBalance, vendorBalanceInUSD } = useVendorBalance(
    internationalData.currency,
    isOnafriq(internationalData.payoutChannel?.vendor)
      ? ""
      : internationalData.payoutChannel?.vendor?.toLowerCase(),
    (err) => updateInternationalData("error", err),
  );

  const checkVendorBalance = () => {
    // no float balance
    if (isOnafriq(internationalData.payoutChannel?.vendor)) return true;

    const amount = Number(String(internationalData.amount)?.replaceAll(",", ""));
    if (vendorBalanceInUSD < 4 || amount > vendorBalance) {
      return false;
    }
    return true;
  };

  const updateInternationalData = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  useEffect(() => {
    if (userDetails?.tfa) {
      updateInternationalData("codeType", "authenticator");
    } else if (userDetails?.email_verification) {
      updateInternationalData("codeType", "email");
    } else if (userDetails?.whatsapp_verification) {
      updateInternationalData("codeType", "whatsapp");
    }
    if (userDetails?.account_type && !internationalData.sendingType) {
      const defaultSendingType = userDetails.account_type === "individual" ? "C" : "B";
      updateInternationalData("sendingType", defaultSendingType);
    }
  }, [userDetails, internationalData.sendingType]);

  useEffect(() => {
    if (userDetails?.isThirdPartyAllowed) {
      if (isAgentLogin) {
        updateInternationalData("isThirdPartyAllowed", can("payments.send-as-third-party.send"));
      } else {
        updateInternationalData("isThirdPartyAllowed", true);
      }
    }
    console.log(userDetails?.isThirdPartyAllowed, "is third party");
  }, [userDetails, isAgentLogin]);

  const disabledButton = useMemo(() => {
    switch (subStep) {
      case 1:
        if (!internationalData.transactionTypeSelected) {
          if (!internationalData.isRecipientTypeSelected) {
            return !internationalData.transactionType;
          }
          if (internationalData.isThirdPartyAllowed && !internationalData.isSendingTypeSelected) {
            return !internationalData.sendingType;
          }
        }

        if (
          userDetails?.account_type === "individual"
            ? userDetails?.user?.kyc_status !== "approved"
            : userDetails?.company?.kyb_status !== "approved"
        ) {
          return false;
        }

        return (
          !internationalData.amount ||
          Number(String(internationalData.amount)?.replaceAll(",", "")) < 1 ||
          !internationalData.currency ||
          !internationalData.currency_wallet?.currency?.code ||
          !internationalData.country?.name ||
          !internationalData?.payoutChannel?.name ||
          !internationalData?.payer?.name ||
          internationalData.error ||
          internationalData.exchange_rate_error ||
          !internationalData.exchange_rate?.receiver?.amount > 0
        );

      case 2:
        if (internationalData.isAddingBeneficiary) {
          return !internationalData.pendingBeneficiary;
        }
        if (internationalData.showSenderSelection) {
          if (internationalData.senderType !== "account") {
            return !internationalData.selectedSender?._id;
          }
        }
        return !internationalData.beneficiary?._id && !internationalData.beneficiary?.isNew;

      case 3:
        return (
          internationalData.reason.length < 1 ||
          !internationalData.reason ||
          !hasThunesRequiredDocuments({
            requiredDocuments: payerRequiredDocuments,
            requiredDocFiles: internationalData.requiredDocFiles,
            files: internationalData.files,
          })
        );

      case 4:
        return (
          !internationalData.payment_type?.value ||
          (internationalData.payment_type.value !== "wallet"
            ? false
            : !internationalData?.wallet?._id) ||
          internationalData.ex_extra_error
        );

      case 5:
        // Paytently collects the card on its own page, so there is nothing to validate here.
        if (internationalData.payment_type?.value === "card" && !usePaytently) {
          const [contentMonth, contentYear] = internationalData.expiry.split("/").map(Number);
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear() % 100;

          const isValidExpiry =
            contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
          return (
            !internationalData.selectedSavedCard?._id &&
            (!internationalData.cardNumber ||
              !internationalData.expiry ||
              !isValidExpiry ||
              !internationalData.cvc ||
              internationalData.cvc?.length < 3 ||
              !internationalData.cardHolderName)
          );
        }
        return false;
      case 6:
        return !!internationalData.plaidLink;
      default:
        return false;
    }
  }, [internationalData, subStep, payerRequiredDocuments]);

  const getCurrency = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/payment/get-payer-details?payerId=${internationalData.payer?.id}&vendor=${internationalData.payoutChannel?.vendor}&transaction_type=${internationalData.flow}`,
        {
          headers: authHeader,
        },
      );
      const dec = await decryptData(res.data.data);
      updateInternationalData("recipient_currency", dec?.data?.destination_currency);
      updateInternationalData("payerRequiredFields", dec?.data?.payer_required_fields);
      const purposes = dec?.data?.purpose_of_remittance_values_accepted;
      updateInternationalData(
        "payerPurposes",
        isThunesPayout && Array.isArray(purposes) && purposes.length > 0 ? purposes : null,
      );
      return dec?.data?.destination_currency;
    } catch {
      // payer carries currency
      if (isOnafriq(internationalData.payoutChannel?.vendor) && internationalData.payer?.currency) {
        updateInternationalData("recipient_currency", internationalData.payer.currency);
        return internationalData.payer.currency;
      }
      updateInternationalData("exchange_rate_error", "sww");
    }
  };
  // eslint-disable-next-line no-unused-vars
  const getConversionRate = async (
    amount = internationalData.amount,
    setLimitType,
    wallet_id = "",
    currency_code = "",
    avoid_balance = true,
    setLoading,
    fromOrTo = "from",
  ) => {
    if (internationalData.payer?.id && internationalData.payoutChannel?.id && amount) {
      setLoading(true);
      const destinationCurrency = await getCurrency();
      try {
        const service_name =
          internationalData?.payoutChannel?.value === "bank"
            ? "international_bank_transfer"
            : internationalData?.payoutChannel?.value === "mobile"
              ? "international_mobile_wallet"
              : internationalData?.payoutChannel?.value === "card"
                ? "international_card_payment"
                : internationalData?.payoutChannel?.value === "cash"
                  ? "international_cash_pickup"
                  : "";

        const onafriq = isOnafriq(internationalData.payoutChannel?.vendor);
        const service_id = onafriq
          ? onafriqServiceId(internationalData.payoutChannel)
          : internationalData.payoutChannel?.id;

        const url = `${import.meta.env.VITE_IP_DEV_API}/api/payment/markup-rates?from=${internationalData.currency_wallet?.currency?.code}&to=${destinationCurrency}&amount=${+String(amount)?.replaceAll(",", "")}&fromOrTo=${fromOrTo}&service_name=${service_name}&account_id=${userDetails?._id}&payer_id=${encodeURIComponent(internationalData.payer?.id ?? "")}&service_id=${service_id}&vendor=${internationalData.payoutChannel?.vendor}&transaction_type=${internationalData.flow}${onafriq ? `&country_iso_code=${internationalData?.country?.alpha3}` : ""}`;

        const res = await axios.get(url, { headers: authHeader });

        const decrypted = decryptData(res.data.data);
        const exchange_rate_details = {
          exchange_rate: decrypted?.data?.exchangeRate,
          markupValue: decrypted?.data?.markupValue,
          receiver: { currency: destinationCurrency, amount: decrypted?.data?.recipientAmount },
          fee: { amount: decrypted?.data?.result?.fee?.value },
          total: decrypted?.data?.result?.total?.value,
          limits_used: {
            daily_receiving_limit_used:
              decrypted?.data?.limits?.daily_receiving_limit -
              decrypted?.data?.limits_used?.daily_receiving_limit_used,
            daily_sending_limit_used:
              decrypted?.data?.limits?.daily_sending_limit -
              decrypted?.data?.limits_used?.daily_sending_limit_used,
            monthly_receiving_limit_used:
              decrypted?.data?.limits?.monthly_receiving_limit -
              decrypted?.data?.limits_used?.monthly_receiving_limit_used,
            monthly_sending_limit_used:
              decrypted?.data?.limits?.monthly_sending_limit -
              decrypted?.data?.limits_used?.monthly_sending_limit_used,
            yearly_receiving_limit_used:
              decrypted?.data?.limits?.yearly_receiving_limit -
              decrypted?.data?.limits_used?.yearly_receiving_limit_used,
            yearly_sending_limit_used:
              decrypted?.data?.limits?.yearly_sending_limit -
              decrypted?.data?.limits_used?.yearly_sending_limit_used,
          },
          limits: {
            daily_receiving_limit: {
              limits_used: decrypted?.data?.limits_used?.daily_receiving_limit_used,
              total_limits: decrypted?.data?.limits?.daily_receiving_limit,
            },
            daily_sending_limit: {
              limits_used: decrypted?.data?.limits_used?.daily_sending_limit_used,
              total_limits: decrypted?.data?.limits?.daily_sending_limit,
            },
            monthly_receiving_limit: {
              limits_used: decrypted?.data?.limits_used?.monthly_receiving_limit_used,
              total_limits: decrypted?.data?.limits?.monthly_receiving_limit,
            },
            monthly_sending_limit: {
              limits_used: decrypted?.data?.limits_used?.monthly_sending_limit_used,
              total_limits: decrypted?.data?.limits?.monthly_sending_limit,
            },
            yearly_receiving_limit: {
              limits_used: decrypted?.data?.limits_used?.yearly_receiving_limit_used,
              total_limits: decrypted?.data?.limits?.yearly_receiving_limit,
            },
            yearly_sending_limit: {
              limits_used: decrypted?.data?.limits_used?.yearly_sending_limit_used,
              total_limits: decrypted?.data?.limits?.yearly_sending_limit,
            },
          },
          min_amount: decrypted?.data?.minimumValue,
          max_amount: decrypted?.data?.maximumValue,
          token: decrypted?.data?.token,
        };
        console.log("root_token", exchange_rate_details);

        updateInternationalData("exchange_rate", exchange_rate_details);
        updateInternationalData("quotation_details", decrypted?.data);
        // console.log(decrypted)
        if (fromOrTo === "from") {
          updateInternationalData("receiving_amount", exchange_rate_details?.receiver?.amount);
          updateInternationalData(
            "conversion_in",
            internationalData.currency_wallet?.currency?.code,
          );
        } else {
          updateInternationalData("amount", exchange_rate_details?.receiver?.amount);
          updateInternationalData("conversion_in", destinationCurrency);
        }

        // if (+amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
        //     updateInternationalData("exchange_rate_error", "exceed send")
        //     setLimitType("daily")
        // }
        // else if (+amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
        //     updateInternationalData("exchange_rate_error", "exceed send")
        //     setLimitType("monthly")
        // }
        // else if (+amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
        //     updateInternationalData("exchange_rate_error", "exceed send")
        //     setLimitType("yearly")
        // }
        // else {
        //     if (amount <= exchange_rate_details?.fee?.amount) {
        //         updateInternationalData("exchange_rate_error", "Invalid Amount Fee")
        //     } else {
        //         updateInternationalData("exchange_rate_error", "")
        //     }
        // }
      } catch (err) {
        const dec = decryptError(err);
        if (fromOrTo === "from") {
          updateInternationalData("receiving_amount", 0);
          updateInternationalData(
            "conversion_in",
            internationalData.currency_wallet?.currency?.code,
          );
        } else {
          updateInternationalData("conversion_in", destinationCurrency);
          updateInternationalData("amount", 0);
        }

        const onafriqError =
          isOnafriq(internationalData.payoutChannel?.vendor) && onafriqQuoteError(dec?.message);
        if (onafriqError) {
          updateInternationalData("exchange_rate_error", onafriqError);
          updateInternationalData(
            "exchange_rate_error_value",
            Number(dec?.value ?? 0)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
          return;
        }

        if (typeof dec?.message == "object") {
          if (dec?.message?.[0]?.code === "1003007") {
            updateInternationalData("exchange_rate_error", "payer_unavailable");
          } else {
            updateInternationalData("exchange_rate_error", "sww");
          }
        } else {
          const error = LimitsErrorMessage(dec?.code ?? dec?.message);
          if (error) {
            updateInternationalData("exchange_rate_error", error);
          } else if (dec?.message?.toLowerCase()?.includes("insufficient")) {
            updateInternationalData("exchange_rate_error", "insufficient balance payer");
          } else if (dec?.message?.toLowerCase()?.includes("above the max")) {
            updateInternationalData("exchange_rate_error", "max payer");
            updateInternationalData(
              "exchange_rate_error_value",
              formatCurrency(dec?.value ?? 0, true),
            );
          } else if (dec?.message?.toLowerCase()?.includes("below the min")) {
            updateInternationalData("exchange_rate_error", "min payer");
            updateInternationalData(
              "exchange_rate_error_value",
              formatCurrency(dec?.value ?? 0, true),
            );
          } else {
            updateInternationalData("exchange_rate_error", "sww");
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getExchangeRateNew = async (
    amount,
    setLimitType,
    wallet_id = "",
    currency_code = "",
    avoid_balance = true,
    setLoading = () => {},
  ) => {
    setLoading(true);
    updateInternationalData("exchange_rate_error", "");
    if (!amount) return;
    try {
      const dataa = {
        wallet_id: wallet_id,
        transaction_type: internationalData.flow,
        amount: amount,
        service_name:
          internationalData?.payoutChannel?.value === "bank"
            ? "international_bank_transfer"
            : internationalData?.payoutChannel?.value === "mobile"
              ? "international_mobile_wallet"
              : internationalData?.payoutChannel?.value === "card"
                ? "international_card_payment"
                : internationalData?.payoutChannel?.value === "cash"
                  ? "international_cash_pickup"
                  : "",
        service_id: internationalData?.payoutChannel?.id,
        channel_name:
          internationalData?.payoutChannel?.value === "bank"
            ? "bank_account"
            : internationalData?.payoutChannel?.value === "mobile"
              ? "mobile_money"
              : internationalData?.payoutChannel?.value === "card"
                ? "card_payment"
                : internationalData?.payoutChannel?.value === "cash"
                  ? "cash_pickup"
                  : "",
        iso_code: internationalData?.country?.alpha3,
        account_id: userDetails?._id,
        currency_code: currency_code,
        avoid_balance: avoid_balance,
        avoid_top_up_fee: internationalData.payment_type?.value === "card",
        payment_method: internationalData.payment_type?.value,
        vendor: internationalData.payoutChannel?.vendor,
        token: internationalData?.exchange_rate?.token,
        transaction_type: internationalData.flow,
      };

      if (isOnafriq(internationalData.payoutChannel?.vendor)) {
        // channel_name mirrors service_name
        dataa.mode = "SOURCE";
        dataa.service_id = onafriqServiceId(internationalData.payoutChannel);
        dataa.service_name = onafriqServiceName(internationalData.payoutChannel);
        dataa.channel_name = dataa.service_name;
      }

      const encrypted = encryptData(dataa);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/payment/rates/${internationalData?.payer.id}`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const decrypted = decryptData(res.data.data);
      console.log(decrypted);
      const exchange_rate_details = {
        exchange_rate: decrypted?.data?.result?.exchanged_rate?.value,
        receiver: {
          currency: decrypted?.data?.result?.recipient?.currency,
          amount: decrypted?.data?.result?.recipient?.value,
        },
        fee: { amount: decrypted?.data?.result?.fee?.value },
        sending: {
          amount: decrypted?.data?.result?.sending?.value,
          currency: decrypted?.data?.result?.sending?.currency,
        },
        total: decrypted?.data?.result?.total?.value,
        token: internationalData?.exchange_rate?.token,
        min_amount:
          decrypted?.data?.result?.min_amount ?? internationalData?.exchange_rate?.min_amount,
        max_amount: internationalData?.exchange_rate?.max_amount,
        external_transaction_data: decrypted?.data?.result?.external_transaction_data,
      };

      if (decrypted?.data?.result?.paypal)
        exchange_rate_details.paypal = decrypted?.data?.result?.paypal;
      updateInternationalData("exchange_rate", exchange_rate_details);
      updateInternationalData("quotation_details", decrypted?.data);
      updateInternationalData("quoted_wallet_id", wallet_id);

      logger.info(
        `Exchange rate api called for user ${userDetails?.username} at ${formatDateTime(Date.now())} `,
        {
          data: decrypted?.data,
          currentState: internationalData,
          userDetails: userDetails,
        },
      );
      if (+amount > exchange_rate_details?.limits_used?.daily_sending_limit_used) {
        updateInternationalData("exchange_rate_error", "exceed send");
        setLimitType("daily");
      } else if (+amount > exchange_rate_details?.limits_used?.monthly_sending_limit_used) {
        updateInternationalData("exchange_rate_error", "exceed send");
        setLimitType("monthly");
      } else if (+amount > exchange_rate_details?.limits_used?.yearly_sending_limit_used) {
        updateInternationalData("exchange_rate_error", "exceed send");
        setLimitType("yearly");
      } else {
        if (amount <= exchange_rate_details?.fee?.amount) {
          updateInternationalData("exchange_rate_error", "Invalid Amount Fee");
        } else {
          updateInternationalData("exchange_rate_error", "");
        }
      }
    } catch (err) {
      const dec = decryptError(err);
      updateInternationalData(
        "ex_extra_error",
        typeof dec?.message === "string"
          ? dec?.message
          : dec?.message?.[0]?.message
            ? "We were unable to process your request at the moment please try again later."
            : "",
      );

      logger.error(
        `Exchange rate api failed for user ${userDetails?.username} at ${formatDateTime(Date.now())} with error message: ${dec?.message || dec?.code}`,
        {
          errorData: dec,
          currentState: internationalData,
          userDetails: userDetails,
        },
      );

      const onafriqError =
        isOnafriq(internationalData.payoutChannel?.vendor) && onafriqQuoteError(dec?.message);
      if (onafriqError) {
        updateInternationalData("exchange_rate_error", onafriqError);
        updateInternationalData(
          "exchange_rate_error_value",
          Number(dec?.value ?? 0)?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
        return;
      }

      if (typeof dec?.message == "object") {
        if (dec?.message?.[0]?.code === "1003007") {
          updateInternationalData("exchange_rate_error", "payer_unavailable");
        } else {
          updateInternationalData("exchange_rate_error", "sww");
        }
      } else {
        const error = LimitsErrorMessage(dec?.code ?? dec?.message);
        if (error) {
          updateInternationalData("exchange_rate_error", error);
          updateInternationalData("ex_extra_error", error);
        } else if (
          typeof dec?.message === "string"
            ? dec?.message?.toLowerCase()?.includes("insufficient")
            : dec?.message?.[0]?.message?.toLowerCase()?.includes("insufficient")
        ) {
          updateInternationalData("exchange_rate_error", "insufficient balance payer");
        } else if (
          typeof dec?.message === "string"
            ? dec?.message?.toLowerCase()?.includes("above the max")
            : dec?.message?.[0]?.message?.toLowerCase()?.includes("above the max")
        ) {
          updateInternationalData("exchange_rate_error", "max payer");
          updateInternationalData(
            "exchange_rate_error_value",
            Number(dec?.value ?? 0)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
        } else if (
          typeof dec?.message === "string"
            ? dec?.message?.toLowerCase()?.includes("below the min")
            : dec?.message?.[0]?.message?.toLowerCase()?.includes("below the min")
        ) {
          updateInternationalData("exchange_rate_error", "min payer");
          updateInternationalData(
            "exchange_rate_error_value",
            Number(dec?.value ?? 0)?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
        } else if (
          typeof dec?.message === "string"
            ? dec?.message?.toLowerCase()?.includes("payer is currently unavailable")
            : dec?.message?.[0]?.message?.toLowerCase()?.includes("payer is currently unavailable")
        ) {
          updateInternationalData("exchange_rate_error", "unavailable payer");
          updateInternationalData("error", "Payer is currently unavailable.");
        } else {
          updateInternationalData("exchange_rate_error", "sww");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlainExchangeRate = async (from, to, amount, markup = false) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}&markupValue=${markup}`,
        {
          headers: authHeader,
        },
      );
      const dec = decryptData(res?.data?.data);
      updateInternationalData("new_amount", dec?.exchangeRate?.exchanged_amount);
      return dec?.exchangeRate?.exchanged_amount ?? 0;
    } catch {
      updateInternationalData(
        "error",
        "We cannot process your request at the moment, please try again later..",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMobileWalletChannels = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/collection/get-services/${userDetails?.country_iso_code}`,
        {
          headers: authHeader,
        },
      );
      const dec = decryptData(res.data.data);
      updateInternationalData("mobile_wallet_channels", dec?.data?.services ?? []);
      updateInternationalData("mobile_wallet_merchant", dec?.data?.merchant_id ?? "");
    } catch {
      // updateInternationalData("error", "Something went wrong while getting mobile wallet channels.")
    } finally {
      setLoading(false);
    }
  };

  const getMobileWalletServices = async (
    service_name = internationalData.payment_type?.sub_name,
  ) => {
    const res = await axios.get(
      `${import.meta.env.VITE_IP_DEV_API}/api/collection/get-payers/${userDetails?.country_iso_code}/${service_name}`,
      {
        headers: authHeader,
      },
    );
    const dec = decryptData(res.data.data);
    console.log(dec);
    updateInternationalData("mobile_wallet_services", dec?.data?.payers ?? []);
  };

  useEffect(() => {
    if (userDetails?.country_iso_code) {
      getMobileWalletChannels().then(() => getMobileWalletServices("wallet"));
    }
  }, [userDetails]);

  useEffect(() => {
    if (internationalData.payment_type?.sub_name) {
      getMobileWalletServices();
    }
  }, [internationalData.payment_type]);

  console.log(
    internationalData?.exchange_rate,
    "exchange rate for check",
    internationalData.amount,
  );
  useEffect(() => {
    let timeout;
    if (internationalData.payment_type?.value && subStep === 4) {
      if (internationalData.payment_type?.value !== "card")
        updateInternationalData("showCard", false);
      if (internationalData.payment_type?.value === "wallet" && !internationalData?.wallet?._id)
        return;
      if (internationalData?.payment_type?.value !== "wallet") {
        updateInternationalData("wallet", {});
      }

      const getAmount = async () => {
        try {
          let amount;
          const receivingCurrency =
            internationalData?.recipient_currency ||
            internationalData?.exchange_rate?.receiver?.currency;
          const walletCurrency = internationalData?.wallet?.currency?.code;

          if (
            internationalData.payment_type?.value === "wallet" &&
            internationalData?.wallet?.currency &&
            internationalData?.currency_wallet?.currency?.code
          ) {
            if (receivingCurrency && walletCurrency && receivingCurrency === walletCurrency) {
              amount = Number(String(internationalData.receiving_amount)?.replaceAll(",", ""));
            } else {
              amount = await getPlainExchangeRate(
                internationalData?.currency_wallet?.currency?.code,
                walletCurrency,
                Number(String(internationalData.amount)?.replaceAll(",", "")),
                internationalData?.exchange_rate?.markupValue,
              );
            }
          } else {
            amount = Number(String(internationalData.amount)?.replaceAll(",", ""));
          }
          return amount;
        } catch (error) {
          console.log("Error :", error);
        }
      };

      timeout = setTimeout(() => {
        const wallet_id =
          internationalData.payment_type?.value === "wallet"
            ? (internationalData.wallet?._id ?? internationalData?.currency_wallet?._id)
            : internationalData?.currency_wallet?._id;

        const receivingCurrency =
          internationalData?.recipient_currency ||
          internationalData?.exchange_rate?.receiver?.currency;
        const walletCurrency = internationalData?.wallet?.currency?.code;
        const isSameCurrency =
          receivingCurrency && walletCurrency && receivingCurrency === walletCurrency;

        const currency_code =
          internationalData.payment_type?.value === "wallet"
            ? isSameCurrency
              ? receivingCurrency
              : (walletCurrency ?? internationalData?.currency)
            : internationalData?.currency;

        getAmount().then((res) => {
          if (wallet_id) {
            getExchangeRateNew(res, () => {}, wallet_id, currency_code, false, setLoading);
          }
        });
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [internationalData.payment_type?.value, internationalData.wallet?._id, subStep]);

  const createQuotation = async () => {
    setLoading(true);
    try {
      const data = {
        token: internationalData.quotation_details?.token,
        payerId: internationalData.payer?.id,
        wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
        transaction_type: internationalData.flow,
        payment_method: internationalData.payment_type?.value,
      };
      console.log(data);
      const encrypted = encryptData(data);

      const res = await axios.post(
        `${import.meta.env.VITE_THUNES_API}/create-quotation`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      updateInternationalData("created_quotation", dec);
      setSubStep((prev) => prev + 1);
    } catch (error) {
      const dec = decryptError(error);
      toast.error(internationalData);
      updateInternationalData(
        "error",
        typeof dec === "string"
          ? dec
          : (dec?.message ??
              "We cannot process your request at the moment, please try again later.!"),
      );
    } finally {
      setLoading(false);
    }
  };

  const getTransactionData = () => ({
    additional_information: internationalData.comment,
    purpose_of_remittance: internationalData.reason,
    user_id:
      userDetails?.account_type === "business" ? userDetails?.company?._id : userDetails?.user?._id,
    ...(internationalData.beneficiary?.isNew
      ? { beneficiaryDetails: internationalData.beneficiary.draftDetails }
      : { beneficiary_id: internationalData.beneficiary?._id }),
    ...(internationalData.senderType === "third-party" && internationalData.selectedSender?._id
      ? {
          sender_id: internationalData.selectedSender._id,
        }
      : {}),
    ...(internationalData?.recipient_iban
      ? {
          recipient_iban: internationalData.recipient_iban,
        }
      : {}),
    ...(internationalData?.recipient_bank_id
      ? {
          savedBankId: internationalData.recipient_bank_id,
          isSaveBank: true,
        }
      : {}),
    service: { id: internationalData.payoutChannel?.id },
    transaction_type: internationalData.flow,
    wallet_id: internationalData.wallet?._id ?? internationalData.currency_wallet?._id,
    token: internationalData.quotation_details?.token,
    vendor: internationalData.payoutChannel?.vendor,
  });

  const createTransaction = async (codeType = "", isResend = true) => {
    setLoading(true);
    try {
      let payload = {};
      const isNewBeneficiary = !!internationalData.beneficiary?.isNew;
      const transaction_data = getTransactionData();

      if (isOnafriq(internationalData.payoutChannel?.vendor)) {
        // must match quote
        transaction_data.wallet_id =
          internationalData.quoted_wallet_id || transaction_data.wallet_id;
        transaction_data.payment_type = internationalData.payment_type?.value;
      }

      if (internationalData.payoutChannel?.vendor === "thunes") {
        if (isResend) {
          payload = {
            data: {
              token: internationalData.thunesCreateTransactionToken,
            },
            type: codeType || internationalData.codeType,
          };
        } else {
          payload = {
            ...transaction_data,
            type: codeType || internationalData.codeType,
          };
        }

        if (!isNewBeneficiary) {
          internationalData.payoutChannel?.value?.toLowerCase()?.includes("bank")
            ? (payload.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id)
            : (payload.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id);
        }
      } else {
        payload = {
          data: {
            ...transaction_data,
          },
          type: codeType || internationalData.codeType,
        };
        const channel = internationalData.payoutChannel?.value?.toLowerCase();

        if (!isNewBeneficiary) {
          if (channel?.includes("bank")) {
            payload.data.bank_id = internationalData.beneficiary?.bank_details?.[0]?._id;
          } else if (!(isOnafriq(internationalData.payoutChannel?.vendor) && channel === "cash")) {
            // voucher, no account
            payload.data.mobile_wallet_id = internationalData.beneficiary?.mobile_wallet?.[0]?._id;
          }
        }
      }
      const enc = encryptData(payload);
      const thunesUrl = isResend
        ? `${import.meta.env.VITE_IP_DEV_API}/api/wallet/otp-send`
        : `${import.meta.env.VITE_THUNES_API}/createTransaction/${internationalData.created_quotation?.QuotationID}`;
      const url =
        internationalData.payoutChannel?.vendor === "thunes"
          ? thunesUrl
          : `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`;

      const res = await axios.post(
        url,
        {
          data: enc,
        },
        {
          headers: authHeader,
          timeout: 50000,
        },
      );

      const dec = decryptData(res.data.data);
      console.log(dec);
      if (!isResend) {
        updateInternationalData("thunesCreateTransactionToken", dec?.token);
      }
      if (dec?.otp_sent_on || dec?.available_methods) {
        updateInternationalData("otpMethods", dec);
        if (!internationalData.showOtpModal) {
          updateInternationalData("codeType", dec?.otp_sent_on || "sms");
        }
      }
      updateInternationalData("created_transaction", dec);
      updateInternationalData("showOtpModal", true);
    } catch (error) {
      const dec = decryptError(error);
      console.log(dec);
      const error2 = apiErrorMessage(dec?.message);

      if (error2) {
        updateInternationalData(
          "error",
          `${t(error2) ?? "We cannot process your request at the moment, please try again later.!"} Quotation ID: ${internationalData.created_quotation?.QuotationID}`,
        );
      } else {
        updateInternationalData(
          "error",
          typeof dec === "string"
            ? `${dec} Quotation ID:${internationalData.created_quotation?.QuotationID}`
            : `${dec?.message ?? "We cannot process your request at the moment, please try again later.!"} Quotation ID: ${internationalData.created_quotation?.QuotationID}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const [showCardModal, setShowCardModal] = useState(false);
  const [paytentlyHosted, setPaytentlyHosted] = useState(null);

  const initiateCardPayment = async (otp) => {
    setLoading(true);
    try {
      const balanceOk = checkVendorBalance();
      if (!balanceOk) {
        setShowBalanceModal(true);
        setLoading(false);
        reset();
        updateInternationalData("showOtpModal", false);
        return;
      }

      const otpFields = {
        token: internationalData.created_transaction?.token,
        otp: otp,
        type: internationalData.codeType,
      };

      // Paytently collects the card itself, so no card data is built here. The intl
      // payload rides inside the OTP token, so only the wallet is sent.
      if (usePaytently) {
        const dec = await initiatePaytentlyPayment({
          walletId: internationalData.currency_wallet?._id,
          flow: "international",
          otp: otpFields,
          idempotencyKey: getKey(),
        });

        if (!dec?.hosted_forms_url) {
          updateInternationalData(
            "otpError",
            apiErrorMessage(dec?.message)
              ? t(apiErrorMessage(dec?.message))
              : (dec?.message ??
                  "We cannot process your request at the moment, please try again later."),
          );
          return;
        }

        setPaytentlyHosted({ hostedUrl: dec.hosted_forms_url, authorizeUrl: dec.authorize_url });
        updateInternationalData("showOtpModal", false);
        return;
      }

      const data = {
        ...otpFields,
        panData: {
          wallet_id: internationalData.currency_wallet?._id,
          amount: internationalData.exchange_rate?.total * 100,
          payment_type: internationalData.payment_type?.value ?? "card",
          sender_id:
            internationalData.senderType === "third-party"
              ? internationalData.selectedSender?._id
              : undefined,
        },
      };

      internationalData.selectedSavedCard?._id
        ? (data.panData.pan = internationalData.selectedSavedCard?._id)
        : (data.panData.is_card_save = internationalData.saveCard);
      internationalData.selectedSavedCard?._id
        ? console.log("")
        : (data.panData.se_shambey = createShambeToken(internationalData));

      console.log(data);
      const enc = encryptData(data);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/initiat-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction`,
        withThunesDocuments(enc),
        {
          headers: { ...authHeader, "idempotency-key": getKey() },
          timeout: 50000,
        },
      );
      const dec = decryptData(res.data.data);
      console.log(dec);
      updateInternationalData("cardTransactionDetails", dec);
      updateInternationalData("showOtpModal", false);
    } catch (err) {
      const decrypted = decryptError(err);
      if (decrypted?.message === "invalid_card_details") {
        setShowCardModal(true);
      } else {
        const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message);
        const error2 = apiErrorMessage(decrypted?.message);

        if (error2) {
          updateInternationalData("otpError", t(error2));
        } else if (error) {
          updateInternationalData("otpError", error);
        } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
          const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
          const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
          setProfileLockTime(timeInSec);
          const coun = localStorage.getItem("ip_country");
          localStorage.clear();
          localStorage.setItem("ip_country", coun);
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const initiatePaypalPayment = async (otp) => {
    setLoading(true);
    try {
      const balanceOk = checkVendorBalance();
      if (!balanceOk) {
        setShowBalanceModal(true);
        setLoading(false);
        reset();
        updateInternationalData("showOtpModal", false);
        return;
      }

      const data = {
        token: internationalData.created_transaction?.token,
        otp: otp,
        type: internationalData.codeType,
      };
      console.log(data);
      const enc = encryptData(data);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/paypal/initiate-international-${internationalData.payoutChannel?.vendor === "thunes" ? "payment" : "payout"}`,
        withThunesDocuments(enc),
        { headers: { ...authHeader, "idempotency-key": getKey() } },
      );
      const dec = decryptData(res.data.data);
      window.location.href = dec?.url;
    } catch (err) {
      const decrypted = decryptError(err);
      console.log(decrypted);
      const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message);
      updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.");
      const error2 = apiErrorMessage(decrypted?.message);

      if (error2) {
        updateInternationalData("otpError", t(error2));
      } else if (error) {
        updateInternationalData("otpError", error);
      } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
        const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
        setProfileLockTime(timeInSec);
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const initiateMobileWalletPayment = async (otp) => {
    setLoading(true);
    try {
      const balanceOk = checkVendorBalance();
      if (!balanceOk) {
        setShowBalanceModal(true);
        setLoading(false);
        reset();
        updateInternationalData("showOtpModal", false);
        return;
      }

      const data = {
        token: internationalData.created_transaction?.token,
        otp: otp,
        type: internationalData.codeType,
      };
      console.log(data);
      const enc = encryptData(data);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/collection/international`,
        withThunesDocuments(enc),
        { headers: { ...authHeader, "idempotency-key": getKey() } },
      );
      const decrypted = decryptData(res.data.data);

      console.log(decrypted);
      updateInternationalData("transaction_details", {
        ...(decrypted?.data ?? decrypted),
        pending: true,
      });
      updateInternationalData("transactionStatus", true);
      updateInternationalData("otpError", "");
      setSubStep((prev) => prev + 1);
      updateInternationalData("showOtpModal", false);
    } catch (err) {
      const decrypted = decryptError(err);
      console.log(decrypted);
      const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message);
      updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.");
      const error2 = apiErrorMessage(decrypted?.message);

      if (error2) {
        updateInternationalData("otpError", t(error2));
      } else if (error) {
        updateInternationalData("otpError", error);
      } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
        const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
        setProfileLockTime(timeInSec);
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    console.log(
      Number(String(internationalData.amount)?.replaceAll(",", "")),
      internationalData.vendorBalance,
    );
    switch (subStep) {
      case 1: {
        if (!internationalData.isRecipientTypeSelected) {
          updateInternationalData("isRecipientTypeSelected", true);
          if (!internationalData.isThirdPartyAllowed) {
            updateInternationalData("transactionTypeSelected", true);
          }
          return;
        }

        if (internationalData.isThirdPartyAllowed && !internationalData.isSendingTypeSelected) {
          updateInternationalData("isSendingTypeSelected", true);
          updateInternationalData("transactionTypeSelected", true);
          return;
        }

        if (
          userDetails?.account_type === "individual"
            ? userDetails.user?.kyc_status !== "approved"
            : userDetails.company?.kyb_status !== "approved"
        ) {
          navigate("/settings?tab=verification");
          return;
        }

        setSubStep((prev) => prev + 1);
        break;
      }
      case 2:
        console.log(
          internationalData.payerRequiredFields,
          internationalData?.payoutChannel.value,
          internationalData?.beneficiary,
        );

        if (internationalData.showSenderSelection) {
          setSubStep((prev) => prev + 1);
          return;
        }

        if (internationalData.isAddingBeneficiary) {
          if (!internationalData.pendingBeneficiary) return;
          updateInternationalData("beneficiary", internationalData.pendingBeneficiary);
        }

        if (internationalData.isAddingBeneficiary || internationalData.beneficiary?.isNew) {
          if (
            internationalData.isThirdPartyAllowed &&
            internationalData.senderType === "third-party"
          ) {
            updateInternationalData("showSenderSelection", true);
          } else {
            setSubStep((prev) => prev + 1);
          }
          return;
        }

        // if (!internationalData.beneficiary?.address) {
        //     return setShowAddressModal(true)
        // }
        setRequiredMissingFields({
          beneficiary: { basic: [], extras: [] },
          vendors: {
            fields: [],
            vendorType: internationalData?.payoutChannel.value,
          },
        });
        internationalData.payerRequiredFields?.[0]?.forEach((field) => {
          field = field === "firstname" ? "first_name" : field === "lastname" ? "last_name" : field;

          if (field === "country_iso_code") return;
          // if(field === "")

          if (beneficiaryRequiredFields.includes(field)) {
            if (field === "postal_code" && internationalData.beneficiary?.zip_code === "") {
              setRequiredMissingFields((prev) => ({
                ...prev,
                beneficiary: {
                  ...prev.beneficiary,
                  basic: [...prev.beneficiary.basic, "postal_code"],
                },
              }));
            }
            if (
              (internationalData.beneficiary?.[field] === "" ||
                !internationalData.beneficiary?.[field]) &&
              !internationalData.beneficiary?.extras?.[field]
            ) {
              if (field === "postal_code") return;
              setRequiredMissingFields((prev) => ({
                ...prev,
                beneficiary: {
                  ...prev.beneficiary,
                  basic: [...prev.beneficiary.basic, field],
                },
              }));
            } else if (
              (internationalData.beneficiary?.extras?.[field] === "" ||
                !internationalData.beneficiary?.extras?.[field]) &&
              !internationalData.beneficiary?.[field]
            ) {
              setRequiredMissingFields((prev) => ({
                ...prev,
                beneficiary: {
                  ...prev.beneficiary,
                  extras: [...prev.beneficiary.extras, field],
                },
              }));
            }
          } else if (beneficiaryExtrasRequiredFields.includes(field)) {
            if (
              (internationalData.beneficiary?.extras?.[field] === "" ||
                !internationalData.beneficiary?.extras?.[field]) &&
              !internationalData.beneficiary?.[field]
            ) {
              setRequiredMissingFields((prev) => ({
                ...prev,
                beneficiary: {
                  ...prev.beneficiary,
                  extras: [...prev.beneficiary.extras, field],
                },
              }));
            }
          } else if (vendorsRequiredFields.includes(field)) {
            setRequiredMissingFields((prev) => ({
              ...prev,
              vendors: {
                ...prev.vendors,
                fields: [...prev.vendors.fields, field],
              },
            }));
          }
        });
        break;
      case 3:
        setSubStep((prev) => prev + 1);
        break;
      case 4:
        if (internationalData.payment_type?.value === "card") {
          // Paytently collects the card on its own hosted form, so our card step is skipped.
          if (!usePaytently) updateInternationalData("showCard", true);

          if (internationalData.payoutChannel?.vendor === "thunes") {
            createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")));
          } else {
            setSubStep((prev) => prev + 1);
          }
        } else if (internationalData.payment_type?.value === "mobile_wallet") {
          if (internationalData.payoutChannel?.vendor === "thunes") {
            createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")));
          } else {
            setSubStep((prev) => prev + 1);
          }
        } else if (internationalData.payment_type?.value === "paypal") {
          if (internationalData.payoutChannel?.vendor === "thunes") {
            createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")));
          } else {
            setSubStep((prev) => prev + 1);
          }
        }
        // })
        else {
          if (
            internationalData.payment_type?.value !== "wallet" ||
            internationalData?.wallet?._id
          ) {
            if (internationalData.payoutChannel?.vendor === "thunes") {
              createQuotation(Number(String(internationalData.amount)?.replaceAll(",", "")));
            } else {
              setSubStep((prev) => prev + 1);
            }
          }
        }
        break;
      case 5:
        if (internationalData.showCard) {
          updateInternationalData("showCard", false);
        } else {
          setSubStep((prev) => prev + 1);
        }
        break;
      case 6:
        if (internationalData.showCard) {
          updateInternationalData("showCard", false);
        } else {
          createTransaction("", false);
        }
        break;
      default:
        break;
    }

    console.log(subStep);
  };

  useEffect(() => {
    if (
      requiredMissingFields.beneficiary.basic?.length >= 1 ||
      requiredMissingFields.beneficiary.extras?.length >= 1
    ) {
      setShowDetailsModal(true);
    } else {
      if (subStep === 0) {
        setSubStep((prev) => prev + 1);
      } else {
        if (
          internationalData.isThirdPartyAllowed &&
          internationalData.senderType === "third-party"
        ) {
          updateInternationalData("showSenderSelection", true);
        } else {
          setSubStep((prev) => prev + 1);
        }
      }
    }
  }, [requiredMissingFields.beneficiary]);

  const verifyOtp = async (otp) => {
    setLoading(true);
    try {
      const balanceOk = checkVendorBalance();
      if (!balanceOk) {
        setShowBalanceModal(true);
        setLoading(false);
        reset();
        updateInternationalData("showOtpModal", false);
        return;
      }

      let data;

      if (internationalData.payoutChannel?.vendor === "thunes") {
        data = new FormData();
        data.append("token", internationalData.created_transaction?.token);
        data.append("otp", otp);
        // required documents go under their type (invoice, contract, ...); optional ones as "files"
        // (one required type: every attached file goes under that type)
        appendThunesDocuments(data, thunesDocumentEntries);
        data.append("type", internationalData.codeType);
        data.append("description", internationalData.comment);
      } else {
        data = {
          token: internationalData.created_transaction?.token,
          otp: otp,
          type: internationalData.codeType,
        };
      }

      let res;

      if (isBankTransfer) {
        res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/plaid/initiate-international-payment`,
          data,
          {
            headers: { ...authHeader, "idempotency-key": getKey() },
            timeout: 50000,
          },
        );
      } else if (internationalData.payoutChannel?.vendor === "thunes") {
        res = await axios.post(`${import.meta.env.VITE_THUNES_API}/confirmTransaction`, data, {
          headers: { ...authHeader, "idempotency-key": getKey() },
          timeout: 50000,
        });
      } else {
        const confirmPath = isOnafriq(internationalData.payoutChannel?.vendor)
          ? "confirm-onafriq-transaction"
          : "confirm-transaction";
        res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/payment/${confirmPath}`,
          { data: encryptData(data) },
          {
            headers: { ...authHeader, "idempotency-key": getKey() },
            timeout: 50000,
          },
        );
      }
      const decrypted = decryptData(res.data.data);
      console.log(decrypted);
      const details = decrypted?.data ?? decrypted;
      if (isBankTransfer && details?.linkToken) {
        updateInternationalData("plaidLink", details);
        updateInternationalData("otpError", "");
        updateInternationalData("showOtpModal", false);
        return;
      }
      updateInternationalData("transaction_details", details);
      updateInternationalData("transactionStatus", true);
      updateInternationalData("otpError", "");
      setSubStep((prev) => prev + 1);
      updateInternationalData("showOtpModal", false);
    } catch (err) {
      const decrypted = decryptError(err);
      console.log(decrypted);
      const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message);
      updateInternationalData("otpError", decrypted?.message ?? "You have entered wrong OTP.");

      const error2 = apiErrorMessage(decrypted?.message);
      // lockout wins
      const onafriqError =
        isOnafriq(internationalData.payoutChannel?.vendor) &&
        onafriqConfirmError(decrypted?.message);

      if (error2) {
        updateInternationalData("otpError", t(error2));
      } else if (error) {
        updateInternationalData("otpError", error);
      } else if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
        const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
        const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
        setProfileLockTime(timeInSec);
        const coun = localStorage.getItem("ip_country");
        localStorage.clear();
        localStorage.setItem("ip_country", coun);
        navigate("/login");
      } else if (onafriqError) {
        updateInternationalData("otpError", t(onafriqError));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidAuthorized = () => {
    updateInternationalData("transaction_details", internationalData.plaidLink);
    updateInternationalData("transactionStatus", true);
    updateInternationalData("plaidLink", null);
    setLoading(false);
    setSubStep((prev) => prev + 1);
  };

  const handlePlaidCancelled = () => {
    reset();
    updateInternationalData("plaidLink", null);
    updateInternationalData("showSummary", false);
    setLoading(false);
    setSubStep(5);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transaction_status = queryParams.get("transaction_status");
  const transaction_token = queryParams.get("transaction_token");
  const error_in_funds = queryParams.get("error_in_funds");
  const code = queryParams.get("code");
  const amount = queryParams.get("amount");

  useEffect(() => {
    if (amount) {
      updateInternationalData("amount", amount);
    }
  }, [amount]);

  useEffect(() => {
    const confirmMobileWalletTransaction = async () => {
      setLoading(true);
      try {
        const payload = {
          token: transaction_token,
        };
        const res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/thunes/confirm-transaction-topup`,
          {
            data: payload,
          },
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data.data);
        updateInternationalData("transaction_details", dec?.data ?? dec);
        updateInternationalData("transactionStatus", true);
      } catch {
        updateInternationalData(
          "error",
          "Something went wrong while completing the transactions, But don't worry your funds have been added to your InstaPay Wallet.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (transaction_token) {
      confirmMobileWalletTransaction();
    }
  }, [transaction_token]);

  useEffect(() => {
    const error_message = () => {
      return errors.find((item) => item?.code === code)?.message;
    };

    if (transaction_status === "error") {
      updateInternationalData(
        "error",
        code
          ? error_message()
          : error_in_funds?.toLowerCase() === "true"
            ? "We encountered an issue processing your selected payment method. Please try again later."
            : "We encountered an issue processing your international transfer, but your funds have been securely added to your wallet. Kindly check your transaction record, and when ready, you may retry the transfer at your convenience.",
      );
    }
    if (transaction_status === "aborted") {
      updateInternationalData(
        "error",
        code
          ? error_message()
          : "It appears that the add funds request was canceled. Please try again later when you're ready.",
      );
    }
  }, [transaction_status, code]);

  // console.log("international.otpError",internationalData)
  return (
    <>
      {internationalData.plaidLink?.linkToken && (
        <PlaidLinkHandler
          link={internationalData.plaidLink}
          data={{ ...internationalData, wallet: internationalData.currency_wallet }}
          onProcessing={() => setLoading(true)}
          onAuthorized={handlePlaidAuthorized}
          onCancelled={handlePlaidCancelled}
        />
      )}
      <PaytentlyHostedModal
        isOpen={!!paytentlyHosted?.hostedUrl}
        hostedUrl={paytentlyHosted?.hostedUrl}
        authorizeUrl={paytentlyHosted?.authorizeUrl}
        onClose={() => setPaytentlyHosted(null)}
      />
      {showCardModal && (
        <NotFoundModal
          isOpen={showCardModal}
          toggle={() => setShowCardModal(false)}
          buttonText="Close"
          messages={[
            `Oops!p It looks like the card you entered isn’t recognized as being issued in ${userDetails?.country_name}.`,
            `For security and compatibility, we currently accept only cards issued in the same country as your InstaPay account. Please use a card issued in ${userDetails?.country_name} to complete your transaction.`,
            `Thank you for your understanding!`,
          ]}
          title="International Transfer Failed"
          reEnter={() => {
            updateInternationalData("showCard", true);
          }}
        />
      )}
      {<VendorBalanceModal isOpen={showBalanceModal} toggle={() => setShowBalanceModal(false)} />}
      {showDetailsModal && (
        <AddBeneficiaryRequiredFields
          isOpen={showDetailsModal}
          beneficiary={internationalData?.beneficiary}
          close={() => setShowDetailsModal(false)}
          requiredFields={requiredMissingFields}
          dataHandler={updateInternationalData}
        />
      )}
      {showAddressModal && (
        <AddBeneficiaryAddressModal
          close={() => setShowAddressModal(false)}
          dataHandler={updateInternationalData}
          isOpen={showAddressModal}
          toggle={() => {
            setShowAddressModal(false);
            getUserBeneficiaries();
          }}
          beneficiaries={[internationalData.beneficiary]}
        />
      )}
      {internationalData.cardTransactionDetails?.intlToken ||
      internationalData.cardTransactionDetails?.w2w_data ? (
        <TrustpaymentPage
          amount={Number(String(internationalData.amount)?.replaceAll(",", ""))}
          card_cvc={internationalData.cvc}
          card_expiry={internationalData.expiry}
          card_number={internationalData.cardNumber}
          currency={internationalData.currency_wallet?.currency?.code}
          transaction={internationalData.cardTransactionDetails}
          paymentWithSavedCard={internationalData.selectedSavedCard?._id ? true : false}
          url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
          tokenUrl={() =>
            `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`
          }
        />
      ) : (
        <></>
      )}
      {window.innerWidth > 1000 ? (
        <div
          style={{
            display: "flex",
            width: sendPaymentType === "international" ? "100%" : "fit-content",
            transition: "500ms",
            position: "relative",
            order: sendPaymentType === "international" ? 1 : 8,
          }}
        >
          {sendPaymentType === "international" ? <ServiceDetails data={internationalData} /> : ""}
          {internationalData.error && (
            <ErrorModal
              isOpen={internationalData.error}
              toggle={() => {
                updateInternationalData("error", "");

                if (transaction_status === "error") {
                  navigate("/payments");
                }
                // setSendPaymentType("")
                // setStep(1)
              }}
              message={internationalData.error}
            />
          )}
          {internationalData.exchange_rate_error === "payer_unavailable" && subStep === 4 && (
            <ErrorModal
              isOpen={internationalData.exchange_rate_error}
              toggle={() => {
                updateInternationalData("exchange_rate_error", "");
                // setSendPaymentType("")
                // setStep(1)
              }}
              message={`Unfortunately, we can not send to "${internationalData.payer?.name}" at the moment. Please try again later.`}
              heading="Unsupported Transaction"
            />
          )}
          {canInternationTransfer && (
            <SendActionCard
              bg={international}
              title={t("International Transfer")}
              icon={int}
              desc={t(
                "Send money across borders with ease. Transfer funds internationally \nto friends, family, or businesses in just a few clicks. Choose from \na wide range of payment channels including bank account, \nmobile money/mobile wallet, cash pick-up location, or payment card \nfor convenient and secure transactions.",
              )}
              setter={setSendPaymentType}
              setterValue="international"
              setStep={setStep}
              showDesc={sendPaymentType === "international"}
              active={sendPaymentType === "international"}
              sendPaymentType={sendPaymentType}
            />
          )}
          {sendPaymentType === "international" &&
            (internationalData?.transaction_details?.beneficiary ||
            transaction_status ||
            internationalData?.transactionStatus ? (
              loading ? (
                <div
                  style={{
                    height: "300px",
                    width: "300px",
                    margin: "1rem auto",
                  }}
                >
                  <InstaPayLoader />
                </div>
              ) : (
                <Receipt data={internationalData} transactionStatus={transaction_status} />
              )
            ) : (
              <div
                className={styles.body}
                style={{
                  width: sendPaymentType === "international" ? "100%" : "0px",
                  transition: "500ms",
                  "--min-width":
                    subStep === 4 && internationalData.payment_type?.value === "wallet"
                      ? "65vw"
                      : "55vw",
                }}
              >
                <div className={styles.left}>
                  <div className={styles.l_top}>
                    <h1>{t("Send Money")}</h1>
                    <h2>
                      {subStep === 5 && internationalData.showCard
                        ? t("Select Or Add Payment Card")
                        : t(leftSideContent?.[subStep - 1])}
                    </h2>
                    {subStep === 1 && (
                      <RecentTransactions
                        dataHandler={updateInternationalData}
                        setSubStep={setSubStep}
                        type={"international"}
                      />
                    )}
                  </div>
                  {subStep !== 4 ? (
                    <div className={styles.l_bottom}>
                      {subStep > 1 ? (
                        <>
                          {internationalData.country?.name && (
                            <SelectedCard
                              title="Name"
                              list={[
                                {
                                  text: internationalData.country?.name,
                                  url: internationalData.country?.file_url,
                                  flag: true,
                                },
                              ]}
                              changeHandler={() => {
                                setSubStep(1);
                              }}
                            />
                          )}
                          {internationalData.payer?.name && (
                            <SelectedCard
                              title="Receive Method"
                              list={[
                                {
                                  text: t(internationalData.payoutChannel?.name),
                                  url: internationalData.payoutChannel?.icon,
                                },
                                {
                                  text: internationalData.payer?.name,
                                  url: internationalData.payer?.icon,
                                },
                              ]}
                              changeHandler={() => setSubStep(1)}
                            />
                          )}
                          {subStep > 2 ? (
                            <SelectedCard
                              title="Name"
                              list={[
                                { text: getBeneficiaryDisplayName(internationalData.beneficiary) },
                              ]}
                              changeHandler={() => setSubStep(2)}
                            />
                          ) : (
                            ""
                          )}
                          {subStep > 3 ? (
                            <SelectedCard
                              title="Reason for sending"
                              list={[
                                {
                                  text: service_name_formatter(internationalData.reason),
                                },
                              ]}
                              changeHandler={() => setSubStep(3)}
                            />
                          ) : (
                            ""
                          )}
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : loading ? (
                    <div
                      style={{
                        height: "100px",
                        width: "100px",
                        margin: "0 auto",
                      }}
                    >
                      <InstaPayLoader />
                    </div>
                  ) : (
                      internationalData.payment_type?.value === "wallet"
                        ? internationalData.wallet?._id
                        : true
                    ) ? (
                    <>
                      <FeesComponent
                        error={internationalData.ex_extra_error}
                        data={internationalData}
                        paypalValues
                      />
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div
                  className={styles.right}
                  style={{
                    "--color-white":
                      subStep === 1 ||
                      (subStep === 4 && internationalData.payment_type?.value !== "card") ||
                      subStep === 5 ||
                      subStep === 6
                        ? "#fff"
                        : "#fafafa",
                  }}
                >
                  {subStep === 1 && (
                    <StepOne
                      data={internationalData}
                      dataHandler={updateInternationalData}
                      // getExchangeRate={getExchangeRate}
                      getExchangeRate={getConversionRate}
                    />
                  )}
                  {subStep === 2 &&
                    (!internationalData.showSenderSelection ? (
                      <StepTwo data={internationalData} dataHandler={updateInternationalData} />
                    ) : (
                      <SelectSender
                        data={internationalData}
                        dataHandler={updateInternationalData}
                      />
                    ))}
                  {subStep === 3 && (
                    <StepThree
                      data={internationalData}
                      dataHandler={updateInternationalData}
                      purposeCodes={internationalData.payerPurposes}
                      requiredDocuments={payerRequiredDocuments}
                      thunesDocuments={isThunesPayout}
                    />
                  )}
                  {subStep === 4 && (
                    <StepFour
                      error={internationalData.ex_extra_error}
                      loading={loading}
                      data={internationalData}
                      dataHandler={updateInternationalData}
                    />
                  )}
                  {subStep === 5 && (
                    <>
                      {isBankTransfer && !internationalData?.showSummary ? (
                        <PlaidBankTransfer
                          data={{}}
                          dataHandler={updateInternationalData}
                          type="international"
                          handleBackClick={() => setSubStep(4)}
                        />
                      ) : !internationalData.showCard ? (
                        <StepFive data={internationalData} dataHandler={updateInternationalData} />
                      ) : (
                        <CreditCard
                          url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                          tokenUrl={() =>
                            `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`
                          }
                          data={internationalData}
                          dataHandler={updateInternationalData}
                        />
                      )}
                    </>
                  )}
                  {subStep === 6 && (
                    <div>
                      <div className={styles.noticeDiv}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="49"
                            height="48"
                            viewBox="0 0 49 48"
                            fill="none"
                          >
                            <path
                              d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z"
                              stroke="#6039CD"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className={styles.noticeHead}>{t("Notice!")}</span>
                        </div>

                        <div>
                          <p>
                            {t(
                              "By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.",
                            )}
                          </p>
                          <p style={{ marginTop: "8px" }}>
                            {t(
                              "I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.",
                            )}
                          </p>
                        </div>
                      </div>

                      {internationalData.showOtpModal && (
                        <OtpConfirmation
                          variant="modal"
                          callback={
                            internationalData.payment_type?.value === "card"
                              ? initiateCardPayment
                              : internationalData.payment_type?.value === "paypal"
                                ? initiatePaypalPayment
                                : internationalData?.payment_type?.value === "mobile_wallet"
                                  ? initiateMobileWalletPayment
                                  : verifyOtp
                          }
                          data={internationalData}
                          dataHandler={updateInternationalData}
                          isLoading={loading}
                          isOpen={internationalData.showOtpModal}
                          toggle={() => {
                            reset();
                            updateInternationalData("showOtpModal", false);
                          }}
                          resendHandler={createTransaction}
                          methods={internationalData.otpMethods}
                          error={internationalData.otpError}
                          resetIdempotency={reset}
                        />
                      )}
                    </div>
                  )}
                  {isBankTransfer && subStep === 5 && !internationalData?.showSummary ? null : (
                    <div className={styles.bottom}>
                      <Link
                        to={"https://insta-pay.ch/faqs"}
                        target="_blank"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".7rem",
                        }}
                      >
                        <HelpCircle size={16} />
                        {t("Trouble Sending Money")}
                      </Link>
                      <div className={styles?.buttons}>
                        {(internationalData.transactionTypeSelected ||
                          (internationalData.isThirdPartyAllowed &&
                            internationalData.isRecipientTypeSelected)) && (
                          <button
                            className={styles.transparent}
                            disabled={loading}
                            onClick={() => {
                              reset();
                              if (subStep === 4 && internationalData.payment_type?.value) {
                                updateInternationalData("payment_type", {});
                              } else if (
                                subStep === 4 &&
                                internationalData.payment_type?.value === "card"
                              ) {
                                updateInternationalData("payment_type", {});
                                updateInternationalData("showCard", false);
                                setSubStep((prev) => prev - 1);
                              } else if (
                                subStep === 5 &&
                                internationalData.payment_type?.value === "card" &&
                                !internationalData.showCard
                              ) {
                                updateInternationalData("showCard", true);
                              } else if (
                                internationalData.transactionTypeSelected &&
                                subStep === 1
                              ) {
                                if (internationalData.isThirdPartyAllowed) {
                                  updateInternationalData("transactionTypeSelected", false);
                                  updateInternationalData("isSendingTypeSelected", false);
                                } else {
                                  dispatch({ type: "RESET_FIRST_STEP_DATA" });
                                }
                              } else if (
                                !internationalData.transactionTypeSelected &&
                                internationalData.isThirdPartyAllowed &&
                                internationalData.isRecipientTypeSelected
                              ) {
                                updateInternationalData("isRecipientTypeSelected", false);
                              } else if (internationalData.showSenderSelection && subStep === 2) {
                                updateInternationalData("showSenderSelection", false);
                              } else if (internationalData.showSummary && subStep === 5) {
                                updateInternationalData("showSummary", false);
                              } else {
                                setSubStep((prev) => prev - 1);
                              }
                            }}
                          >
                            {t("Back")}
                          </button>
                        )}
                        <button disabled={disabledButton || loading} onClick={handleClick}>
                          {!internationalData.transactionTypeSelected ||
                          (userDetails?.account_type === "individual"
                            ? userDetails?.user?.kyc_status === "approved"
                            : userDetails?.company?.kyb_status === "approved")
                            ? subStep === 5
                              ? t("Confirm")
                              : subStep === 6
                                ? t("Confirm and Proceed")
                                : t("Next")
                            : t(
                                `${userDetails?.account_type === "individual" ? "Identity" : "Business"} verification required`,
                              )}
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {subStep === 4 && internationalData.payment_type?.value === "wallet" ? (
                  <WalletsComponent
                    loading={loading}
                    data={internationalData}
                    dataHandler={updateInternationalData}
                    markupValue={internationalData?.exchange_rate?.markupValue}
                    skipSameCurrencyConversion
                  />
                ) : (
                  ""
                )}
                {subStep === 4 && internationalData.payment_type?.sub_name ? (
                  <MobileWalletServices
                    loading={loading}
                    data={internationalData}
                    error={internationalData.ex_extra_error}
                    dataHandler={updateInternationalData}
                  />
                ) : (
                  ""
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className={styles.mobile}>
          {internationalData.error && (
            <ErrorModal
              isOpen={internationalData.error}
              toggle={() => {
                updateInternationalData("error", "");
                // setSendPaymentType("")
                // setStep(1)
              }}
              message={internationalData.error}
            />
          )}
          {showRecent && subStep === 1 ? (
            <RecentTransactions
              setShowRecent={setShowRecent}
              type={"international"}
              dataHandler={updateInternationalData}
              setSubStep={setSubStep}
            />
          ) : (
            <>
              <div className={styles.m_top}>
                <h1>{t("SEND MONEY")}</h1>
                <h2>
                  {internationalData.payment_type?.value === "card"
                    ? t("Select Or Add Payment Card")
                    : t(leftSideContent?.[subStep - 1])}
                </h2>
              </div>
              <div className={styles.flow}>
                {internationalData?.transaction_details?.beneficiary ||
                transaction_status ||
                internationalData?.transactionStatus ? (
                  loading ? (
                    <div
                      style={{
                        height: "300px",
                        width: "300px",
                        margin: "1rem auto",
                      }}
                    >
                      <InstaPayLoader />
                    </div>
                  ) : (
                    <Receipt data={internationalData} />
                  )
                ) : (
                  <>
                    <div className={styles.flow_com} style={{ minHeight: "50vh" }}>
                      {subStep === 4 &&
                      (internationalData.payment_type?.value === "wallet" ||
                        internationalData.payment_type?.sub_name) ? (
                        internationalData.payment_type?.value === "wallet" ? (
                          <WalletsComponent
                            loading={loading}
                            data={internationalData}
                            dataHandler={updateInternationalData}
                            skipSameCurrencyConversion
                          />
                        ) : internationalData.payment_type?.sub_name ? (
                          <MobileWalletServices
                            loading={loading}
                            data={internationalData}
                            error={internationalData.ex_extra_error}
                            dataHandler={updateInternationalData}
                          />
                        ) : (
                          ""
                        )
                      ) : (
                        <>
                          {subStep === 1 && (
                            <StepOne
                              data={internationalData}
                              dataHandler={updateInternationalData}
                              // getExchangeRate={getExchangeRate}
                              getExchangeRate={getConversionRate}
                            />
                          )}
                          {subStep === 2 &&
                            (!internationalData.showSenderSelection ? (
                              <StepTwo
                                data={internationalData}
                                dataHandler={updateInternationalData}
                              />
                            ) : (
                              <SelectSender
                                data={internationalData}
                                dataHandler={updateInternationalData}
                              />
                            ))}
                          {subStep === 3 && (
                            <StepThree
                              data={internationalData}
                              dataHandler={updateInternationalData}
                              purposeCodes={internationalData.payerPurposes}
                              requiredDocuments={payerRequiredDocuments}
                              thunesDocuments={isThunesPayout}
                            />
                          )}
                          {subStep === 4 && (
                            <StepFour
                              error={internationalData.ex_extra_error}
                              loading={loading}
                              data={internationalData}
                              dataHandler={updateInternationalData}
                            />
                          )}
                          {subStep === 5 && (
                            <>
                              {isBankTransfer && !internationalData?.showSummary ? (
                                <PlaidBankTransfer
                                  data={{}}
                                  handleBackClick={() => setSubStep(4)}
                                  dataHandler={updateInternationalData}
                                  type="international"
                                />
                              ) : !internationalData.showCard ? (
                                <StepFive
                                  data={internationalData}
                                  dataHandler={updateInternationalData}
                                />
                              ) : (
                                <CreditCard
                                  url={`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`}
                                  tokenUrl={() =>
                                    `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-international${internationalData.selectedSavedCard?._id ? "-pan" : ""}-transaction/${internationalData.cardTransactionDetails?.transaction_id}/${internationalData.cardTransactionDetails?.intlToken}`
                                  }
                                  data={internationalData}
                                  dataHandler={updateInternationalData}
                                />
                              )}
                            </>
                          )}

                          {subStep === 6 && (
                            <div>
                              <div className={styles.noticeDiv}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="49"
                                    height="48"
                                    viewBox="0 0 49 48"
                                    fill="none"
                                  >
                                    <path
                                      d="M24.1519 18V26M24.1519 34H24.1719M21.3825 7.78342L4.93272 36.1967C4.02031 37.7726 3.5641 38.5606 3.63153 39.2074C3.69034 39.7715 3.98588 40.2841 4.4446 40.6176C4.97051 41 5.88104 41 7.70209 41H40.6016C42.4227 41 43.3332 41 43.8591 40.6176C44.3178 40.2841 44.6134 39.7715 44.6722 39.2074C44.7396 38.5606 44.2834 37.7726 43.371 36.1967L26.9212 7.78341C26.0121 6.21309 25.5575 5.42793 24.9645 5.16422C24.4471 4.93419 23.8566 4.93419 23.3393 5.16422C22.7462 5.42793 22.2916 6.21309 21.3825 7.78342Z"
                                      stroke="#6039CD"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <span className={styles.noticeHead}>{t("Notice!")}</span>
                                </div>

                                <div>
                                  <p>
                                    {t(
                                      "By proceeding with this transaction, I hereby confirm that I am acting independently and of my own free will. I affirm that I have not been influenced, coached, coerced, or persuaded by any third party to carry out this transaction for investment purposes or any other reason.",
                                    )}
                                  </p>
                                  <p style={{ marginTop: "8px" }}>
                                    {t(
                                      "I understand that this confirmation is required to ensure compliance and to safeguard my account and transactions.",
                                    )}
                                  </p>
                                </div>
                              </div>

                              {internationalData.showOtpModal && (
                                <OtpConfirmation
                                  variant="modal"
                                  callback={
                                    internationalData.payment_type?.value === "card"
                                      ? initiateCardPayment
                                      : internationalData.payment_type?.value === "paypal"
                                        ? initiatePaypalPayment
                                        : internationalData?.payment_type?.value === "mobile_wallet"
                                          ? initiateMobileWalletPayment
                                          : verifyOtp
                                  }
                                  data={internationalData}
                                  dataHandler={updateInternationalData}
                                  isLoading={loading}
                                  isOpen={internationalData.showOtpModal}
                                  toggle={() => {
                                    reset();
                                    updateInternationalData("showOtpModal", false);
                                  }}
                                  resendHandler={createTransaction}
                                  methods={internationalData.otpMethods}
                                  error={internationalData.otpError}
                                  resetIdempotency={reset}
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {isBankTransfer && subStep === 5 && !internationalData?.showSummary ? null : (
                      <div className={styles.bottom}>
                        <Link
                          to={"https://insta-pay.ch/faqs"}
                          target="_blank"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".7rem",
                          }}
                        >
                          <HelpCircle size={16} />
                          {t("Trouble Sending Money")}
                        </Link>
                        <div className={styles?.buttons}>
                          {(internationalData.transactionTypeSelected ||
                            (internationalData.isThirdPartyAllowed &&
                              internationalData.isRecipientTypeSelected)) && (
                            <button
                              className={styles.transparent}
                              disabled={loading}
                              onClick={() => {
                                reset();
                                if (subStep === 4 && internationalData.payment_type?.value) {
                                  updateInternationalData("payment_type", {});
                                } else if (
                                  subStep === 4 &&
                                  internationalData.payment_type?.value === "card"
                                ) {
                                  updateInternationalData("payment_type", {});
                                  updateInternationalData("showCard", false);
                                  setSubStep((prev) => prev - 1);
                                } else if (
                                  subStep === 5 &&
                                  internationalData.payment_type?.value === "card" &&
                                  !internationalData.showCard
                                ) {
                                  updateInternationalData("showCard", true);
                                } else if (
                                  internationalData.transactionTypeSelected &&
                                  subStep === 1
                                ) {
                                  if (internationalData.isThirdPartyAllowed) {
                                    updateInternationalData("isSendingTypeSelected", false);
                                    updateInternationalData("transactionTypeSelected", false);
                                  } else {
                                    dispatch({ type: "RESET_FIRST_STEP_DATA" });
                                    updateInternationalData("transactionTypeSelected", false);
                                  }
                                } else if (
                                  !internationalData.transactionTypeSelected &&
                                  internationalData.isThirdPartyAllowed &&
                                  internationalData.isRecipientTypeSelected
                                ) {
                                  updateInternationalData("isRecipientTypeSelected", false);
                                } else if (internationalData.showSenderSelection && subStep === 2) {
                                  updateInternationalData("showSenderSelection", false);
                                } else if (internationalData.showSummary && subStep === 5) {
                                  updateInternationalData("showSummary", false);
                                } else {
                                  setSubStep((prev) => prev - 1);
                                }
                              }}
                            >
                              <ChevronLeft />
                            </button>
                          )}
                          <button
                            disabled={disabledButton || loading}
                            className={styles.full}
                            onClick={handleClick}
                          >
                            {!internationalData.transactionTypeSelected ||
                            (userDetails?.account_type === "individual"
                              ? userDetails?.user?.kyc_status === "approved"
                              : userDetails?.company?.kyb_status === "approved")
                              ? subStep === 5
                                ? t("Confirm")
                                : subStep === 6
                                  ? t("Confirm and Proceed")
                                  : t("Continue")
                              : t(
                                  `${userDetails?.account_type === "individual" ? "Identity" : "Business"} verification required`,
                                )}
                          </button>
                        </div>
                      </div>
                    )}
                    {sendPaymentType === "international" ? (
                      // internationalData.payer?.id
                      // &&
                      <ServiceDetails data={internationalData} />
                    ) : (
                      ""
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <AddBeneficiaryRequiredFields
        isOpen={showRequiredFieldsModal}
        toggle={() => setShowRequiredFieldsModal(!showRequiredFieldsModal)}
        beneficiary={internationalData.beneficiary}
        close={() => setShowRequiredFieldsModal(false)}
        requiredFields={requiredFields}
        dataHandler={updateInternationalData}
      />
    </>
  );
};

export default InternationFlow;

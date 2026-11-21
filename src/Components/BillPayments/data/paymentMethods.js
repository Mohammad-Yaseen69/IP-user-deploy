import { Briefcase, CreditCard, DollarSign, Hexagon } from "react-feather";
import WalletIcon from "../components/WalletIcon";

export const PAYMENT_METHODS = [
  {
    id: "wallet",
    title: "InstaPay wallet",
    subtitle: "No additional wallet-method fee",
    Icon: WalletIcon,
    confirmEndpoint: "/api/bill-payment/confirm/wallet",
  },
  {
    id: "card",
    title: "Card",
    subtitle: "Visa or Mastercard · fee shown at review",
    Icon: CreditCard,
    comingSoon: true,
  },
  {
    id: "viban",
    title: "vIBAN",
    subtitle: "Pay from your virtual IBAN balance",
    Icon: Briefcase,
    isNew: true,
    comingSoon: true,
  },
  {
    id: "crypto",
    title: "Crypto",
    subtitle: "USDT and more · converted at today's rate",
    Icon: Hexagon,
    isNew: true,
    comingSoon: true,
  },
  {
    id: "paypal",
    title: "PayPal",
    subtitle: "You'll log in to PayPal after review",
    Icon: DollarSign,
    comingSoon: true,
  },
];

export const getPaymentMethod = (id) => PAYMENT_METHODS.find((method) => method.id === id);

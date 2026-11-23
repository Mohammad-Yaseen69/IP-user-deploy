import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";

// Same wording the Transactions page uses for the kind of payment.
export const paymentLabel = (item) => {
  if (item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin") {
    return "Admin Funds";
  }
  if (item?.payment_type?.includes("bank")) return "Bank Transfer";
  if (item?.payment_type?.includes("mobile")) return "Mobile Money";
  return service_name_formatter(item?.payment_type) || "Other";
};

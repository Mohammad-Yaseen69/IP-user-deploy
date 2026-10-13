export const renderAccountName = (item, internationalReceiver) => {
  if (item?.guest_details?.name && item?.guest_details) {
    return item?.guest_details?.name ?? "";
  }

  if (item?.service_type === "airtime") {
    return item?.airtime_number ?? "";
  }

  if (item?.payment_type === "conversion") {
    return item?.wallet_id ?? "";
  }

  const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit";
  if (isDebit) {
    if (item?.service_type === "withdraw_by_admin") return "Admin";
    if (item?.service_type === "kyc_verification") return "InstaPay";
    if (item?.service_type === "withdrawal") {
      const first =
        item?.sender?.user?.first_name ?? item?.sender?.company?.company_name;
      const last = item?.sender?.user?.last_name ?? "";
      return [first, last].filter(Boolean).join(" ");
    }
    if (item?.receiver?.user) {
      const first =
        item?.receiver?.user?.first_name ??
        item?.receiver?.company?.company_name;
      const last = item?.receiver?.user?.last_name ?? "";
      return [first, last].filter(Boolean).join(" ");
    }

    const first =
      internationalReceiver?.first_name ??
      item?.account?.user?.first_name ??
      internationalReceiver?.company_name ??
      item?.account?.company?.company_name;
    const last =
      internationalReceiver?.last_name ?? item?.account?.user?.last_name ?? "";
    return [first, last].filter(Boolean).join(" ");
  }

  if (item?.service_type === "topup") {
    const first = item?.receiver?.user?.first_name;
    const last = item?.receiver?.user?.last_name;
    return [first, last].filter(Boolean).join(" ");
  }

  const first =
    item?.sender?.user?.first_name ??
    item?.mastercard?.account?.first_name ??
    item?.sender?.company?.company_name;
  const last =
    item?.sender?.user?.last_name ?? item?.mastercard?.account?.last_name ?? "";
  return [first, last].filter(Boolean).join(" ");
};

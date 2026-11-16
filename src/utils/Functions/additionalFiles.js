const PENDING_STATUSES = ["requested", "decline", "declined"];

export const MASTERCARD_PURPOSE = "mastercard_kyc";

export const isPendingAdditionalFile = (item) =>
  PENDING_STATUSES.includes(String(item?.status || "").toLowerCase());

export const getAdditionalFiles = (userDetails) =>
  (userDetails?.account_type === "individual"
    ? userDetails?.user?.kyc_additional_file
    : userDetails?.company?.kyb_additional_file) || [];

/**
 * Splits the user's pending additional files into the groups the UI cares about.
 * - required: admin marked isRequired, user is blocked until these are submitted
 * - optional: shown in the dismissible reminder modal only
 * - requiredVerification / requiredMastercard: required items split by where
 *   they are submitted (settings verification tab vs. the Mastercard page)
 */
export const getPendingAdditionalFiles = (userDetails) => {
  const pending = getAdditionalFiles(userDetails).filter(isPendingAdditionalFile);
  const required = pending.filter((item) => item?.isRequired);
  return {
    pending,
    required,
    optional: pending.filter((item) => !item?.isRequired),
    requiredVerification: required.filter((item) => item?.purpose !== MASTERCARD_PURPOSE),
    requiredMastercard: required.filter((item) => item?.purpose === MASTERCARD_PURPOSE),
  };
};

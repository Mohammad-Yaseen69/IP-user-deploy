import { useCallback, useContext } from "react";
import { UserContext } from "../../Context/UserContext";

export const PERMISSIONS = {
  CRYPTO_WALLET_TOPUP: "CRYPTO_WALLET_TOPUP",
  CRYPTO_PAYOUT: "CRYPTO_PAYOUT",
  CRYPTO_WITHDRAWAL: "CRYPTO_WITHDRAWAL",
  CRYPTO_GUEST_PAY: "CRYPTO_GUEST_PAY",
  WALLET_TO_CRYPTO_CONVERSION: "WALLET_TO_CRYPTO_CONVERSION",
  AGENT_COMMISION_PAYOUT: "AGENT_COMMISION_PAYOUT",
  INTERNATIONAL_TRANSFER: "INTERNATIONAL_TRANSFER",
};

const useEffectivePermission = () => {
  const { userDetails } = useContext(UserContext);

  const hasPermission = useCallback(
    (permission) => {
      if (!userDetails || !permission) return false;
      const permissions =
        userDetails?.check_external_limit === true
          ? userDetails?.permissions
          : userDetails?.level?.permissions;

      return permissions?.[permission] === true;
    },
    [userDetails],
  );

  return hasPermission;
};

export default useEffectivePermission;

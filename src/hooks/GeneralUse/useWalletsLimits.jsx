import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { formatLimit } from "../../Components/WalletsNew/getLimits";

export const WALLETS_LIMITS_QUERY_KEY = ["wallet", "get-limits"];

export const useWalletsLimits = () =>
  useQuery({
    queryKey: WALLETS_LIMITS_QUERY_KEY,
    queryFn: async () => {
      const dec = await apiWrapper({
        endpoint: "/api/wallet/get-limits",
        method: "GET",
        isDecrypted: true,
      });
      return dec?.data ?? [];
    },
    refetchOnMount: true,
    staleTime: 30_000,
  });

const formatWalletLimits = (entry, wallet) => {
  try {
    return formatLimit(entry, wallet);
  } catch {
    return {};
  }
};

export const useWalletLimits = (wallet) => {
  const { data, isLoading } = useWalletsLimits();
  const entry = data?.find((item) => item?.wallet_id === wallet?.wallet_id);
  const limits = entry ? formatWalletLimits(entry, wallet) : {};
  return { limits, isLoading };
};

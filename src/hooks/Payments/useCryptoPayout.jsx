import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { apiWrapper } from "../../utils/Functions/apiWrapper";

export const cryptoPayoutQueryKeys = {
  all: ["crypto-payout"],
  validateAddress: (payload) => [...cryptoPayoutQueryKeys.all, "validate-address", payload],
};

/* A compliance hold is still a success: funds are held and the row shows INITIATED. */
export const toPayoutResult = (res) =>
  res?.under_review
    ? { ...res.data, under_review: true, review_message: res.message }
    : res?.data || res || null;

export const useCryptoPayoutFee = () =>
  useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/crypto/payout/fee",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      }),
  });

export const useValidateCryptoAddress = () =>
  useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/crypto/payout/validate-address",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      }),
  });

export const useCryptoWithdrawalFee = () =>
  useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/crypto/withdrawal/fee",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      }),
  });

export const useCryptoWithdrawal = () => {
  const queryClient = useQueryClient();
  const { getUserWallets } = useContext(UserContext);

  return useMutation({
    mutationFn: ({ idempotencyKey, ...payload }) =>
      apiWrapper({
        endpoint: "/api/crypto/withdrawal",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
        idempotencyKey,
      }),
    onSuccess: () => {
      getUserWallets?.(true);
      queryClient.invalidateQueries({ queryKey: cryptoPayoutQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["crypto", "portfolio"] });
    },
  });
};

export const useCryptoPayout = () => {
  const queryClient = useQueryClient();
  const { getUserWallets } = useContext(UserContext);

  return useMutation({
    mutationFn: ({ idempotencyKey, ...payload }) =>
      apiWrapper({
        endpoint: "/api/crypto/payout",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
        idempotencyKey,
      }),
    onSuccess: () => {
      getUserWallets?.(true);
      queryClient.invalidateQueries({ queryKey: cryptoPayoutQueryKeys.all });
      /* The hub's portfolio total is read separately from the wallet list. */
      queryClient.invalidateQueries({ queryKey: ["crypto", "portfolio"] });
    },
  });
};

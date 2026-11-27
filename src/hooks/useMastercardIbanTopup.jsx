import { useMutation, useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../utils/Functions/apiWrapper";

export const useIbanTopupQuote = ({ cardId, ibanId, amount, enabled }) =>
  useQuery({
    queryKey: ["mastercard-iban-topup-fee", cardId, ibanId, amount],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: "/api/mastercard/get-card-topup-fee",
        method: "POST",
        payload: { cardId, amount, type: "iban", iban_id: ibanId },
        isEncrypted: true,
      });
      return res?.data ?? {};
    },
    enabled: enabled && !!cardId && !!ibanId && amount > 0,
    retry: false,
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const useIbanTopup = () =>
  useMutation({
    mutationFn: ({ otp, token, type }) =>
      apiWrapper({
        endpoint: "/api/mastercard/topup-by-iban",
        method: "POST",
        payload: { otp, token, type },
        isEncrypted: true,
      }),
  });

const toNumber = (value) => Number(String(value ?? "").replace(/,/g, ""));

export const isIbanShort = (iban, feeDetails) => {
  const total = feeDetails?.feeDetails?.totalAmount;
  return Boolean(iban?._id) && total != null && toNumber(total) > toNumber(iban.balance);
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";

export const FEE_REQUEST_EDIT_HISTORY_KEY = ["agentFeeRequestEditHistory"];

export const useFeeRequestEditHistory = () =>
  useQuery({
    queryKey: FEE_REQUEST_EDIT_HISTORY_KEY,
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: "/api/iban-fees/agent-requests?type=edit",
        method: "GET",
        isDecrypted: false,
      });
      const raw = res?.data || res;
      const dec = typeof raw === "string" ? decryptData(raw) : raw;
      return Array.isArray(dec)
        ? dec
        : Array.isArray(dec?.data)
          ? dec.data
          : Array.isArray(dec?.requests)
            ? dec.requests
            : [];
    },
  });

export const useEditFeeRequest = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload, idempotencyKey }) =>
      apiWrapper({
        endpoint: `/api/iban-fees/edit-request-pack/${requestId}`,
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
        idempotencyKey,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FEE_REQUEST_EDIT_HISTORY_KEY });
      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(decryptData(err?.response?.data?.data));
    },
  });
};

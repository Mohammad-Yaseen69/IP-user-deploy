import { useMutation } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const useSendOtp = ({ onSuccess, onError }) => {
  const mutation = useMutation({
    mutationFn: ({ payload, type }) =>
      apiWrapper({
        endpoint: "/api/wallet/send-otp",
        method: "POST",
        isEncrypted: true,
        isDecrypted: false,
        payload: { data: payload, type },
      }),
    onSuccess: (res) => {
      const dec = decryptData(res?.data);
      onSuccess?.(dec?.token, dec);
    },
    onError: (error) => {
      const err = decryptData(error?.response?.data?.data);
      onError?.(err);
    },
  });

  const sendOtp = useCallback(
    (payload, codeType) => mutation.mutateAsync({ payload, type: codeType }),
    [mutation],
  );

  return {
    sendOtp,
    isSendingOtp: mutation.isPending,
  };
};

export default useSendOtp;

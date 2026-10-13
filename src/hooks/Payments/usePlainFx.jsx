import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiWrapper } from "../../utils/Functions/apiWrapper";

const usePlainFx = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: `/api/wallet/get-plain-exchange-rate?from=${payload.from}&to=${payload.to}&amount=${payload.amount}`,
      }).then((dec) => dec?.exchangeRate?.result ?? dec?.exchangeRate?.exchanged_amount),
  });

  const getExchangeRate = useCallback(
    async (from, to, amount) => {
      try {
        const data = await mutateAsync({ from, to, amount });
        return data;
      } catch (error) {
        console.error("FX Error:", error);
        throw error;
      }
    },
    [mutateAsync],
  );

  return { getExchangeRate, isPending };
};

export default usePlainFx;

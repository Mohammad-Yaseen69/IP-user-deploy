import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import { getFeeDetails } from "../../Components/QrQuickerPay/queries";

const useFXNew = (data, dataHandler) => {
  const { mutateAsync: getFeeDetailsMutation, isPending: feeLoading } = useMutation({
    mutationFn: (payload) => getFeeDetails(payload),
  });

  const handleGetFeeDetails = async (sender_wallet_id, from, tokenApi, account_id, level) => {
    dataHandler("feeData", {});

    try {
      const payload = {
        sender_wallet_id,
        from,
        tokenApi,
        account_id,
        level,
        amount: data.amount,
        recipientDets: data.recipientDets,
        userDetails: data.userDetails,
      };
      const exchange_rate_details = await getFeeDetailsMutation(payload);
      dataHandler("feeData", exchange_rate_details);
      return exchange_rate_details;
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      if (typeof dec?.message === "object") {
        if (dec?.message?.[0]?.code === "1003007") {
          toast.error("Payer unavailable");
          return;
        }
        toast.error("Something went wrong");
        return;
      }
      const err = LimitsErrorMessage(dec.code);

      if (err) {
        dataHandler("error", err);
        dataHandler("showModal", true);
        return;
      }
      if (dec?.message?.toLowerCase()?.includes("insufficient")) {
        toast.error("Insufficient balance");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("exceeds max") ||
        dec?.message?.toLowerCase()?.includes("above the max")
      ) {
        toast.error("Amount exceeds maximum allowed");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("below the min") ||
        dec?.message?.toLowerCase()?.includes("below the max")
      ) {
        toast.error("Amount below minimum allowed");
        return;
      }
      toast.error(dec?.message || "Something went wrong");
      dataHandler("feeData", null);
      return;
    }
  };

  return {
    handleGetFeeDetails,
    feeLoading,
  };
};

export default useFXNew;

import { useContext, useEffect, useState } from "react";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";

const useVendorBalance = (currency, vendor, setError) => {
  const { authHeader } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [vendorBalance, setVendorBalance] = useState(0);
  const [vendorBalanceInUSD, setVendorBalanceInUSD] = useState(0);

  useEffect(() => {
    const getVendorBalance = async (retryCount = 0) => {
      if (!currency || !vendor) return;

      setLoading(true);

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/payment/balance?vendor=${vendor}&currency=${currency}`,
          {
            headers: authHeader,
          },
        );

        const dec = decryptData(res.data.data);
        console.log(dec);
        setVendorBalance(dec?.data?.balance);
        setVendorBalanceInUSD(dec?.data?.balanceInUSD);
      } catch (error) {
        let errorMessage = "Unable to retrieve balance information";
        const dec = decryptData(error?.response?.data?.data);
        errorMessage =
          dec?.message || "Balance service temporarily unavailable";

        if (retryCount < 2) {
          setTimeout(
            () => {
              getVendorBalance(retryCount + 1);
            },
            1000 * (retryCount + 1),
          );
          return;
        }

        setError(`${errorMessage}. Please try refreshing the page.`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    getVendorBalance();
  }, [currency, vendor]);

  return {
    vendorBalance,
    vendorBalanceInUSD,
    vendorBalanceLoading: loading,
  };
};

export default useVendorBalance;

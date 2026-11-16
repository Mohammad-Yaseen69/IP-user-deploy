import { toast } from "react-toastify";
import { decryptData } from "./EssentilaMethods/Decryption";
import { encryptData } from "./EssentilaMethods/Encryption";
import axios from "axios";

export const resendHandler = async (
  data,
  setToken,
  setter,
  authHeader,
  isThunes = false,
  onSuccess = () => {},
) => {
  try {
    const encrypted = encryptData(data);
    const res = await axios.post(
      `${import.meta.env.VITE_IP_DEV_API}/api/wallet/${isThunes ? "otp-send" : "send-otp"}`,
      {
        data: encrypted,
      },
      {
        headers: authHeader,
      },
    );

    const dec = decryptData(res.data.data);
    // console.log(dec)
    setter(true);
    setToken(dec?.token);
    onSuccess(dec);
  } catch (error) {
    toast.error("Something went wrong while confirming the transaction!");
    // console.log(decryptData(error?.response?.data?.data))
  }
};

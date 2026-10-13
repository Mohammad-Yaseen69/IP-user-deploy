import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import countriesData from "../PaymentsNewer/CountriesData.json";
import localforage from "localforage";

export const confirmTransaction = async (apiHeaders, payload) => {
  const res = await axios.post(
    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/insta-wallet-to-wallet`,
    { data: encryptData(payload) },
    {
      headers: apiHeaders,
    },
  );

  const dec = decryptData(res.data.data);
  return dec;
};

export const getWalletDetails = async ({ wallet_id }) => {
  const requestData = {
    wallet_id: wallet_id,
  };

  const res = await axios.post(
    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-details-wallet-public`,
    { data: encryptData(requestData) },
  );
  const dec = decryptData(res.data.data);
  const file = countriesData.find(
    (item) => item.name.toLowerCase() === dec?.walletDetails?.country?.toLowerCase(),
  )?.file_url;
  return { ...dec.walletDetails, file };
};

export const sendOtpSkip = async (token, payload) => {
  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    source: "user",
  };
  const encrypted = encryptData(payload);
  const res = await axios.post(
    `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
    {
      data: encrypted,
    },
    {
      headers: apiHeaders,
    },
  );

  const dec = decryptData(res.data.data);

  return dec;
};

export const getFeeDetails = async (payload) => {
  const {
    sender_wallet_id,
    from,
    tokenApi,
    account_id,
    level,
    amount,
    recipientDets,
    userDetails,
  } = payload;
  const apiHeaders = {
    Authorization: `Bearer ${tokenApi}`,
    source: "user",
  };

  const url = `${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-new-exchange-rate?from=${from || userDetails?.walletDetails?.currency?.code}&to=${recipientDets?.currency?.code}&amount=${Number(amount?.toString()?.replaceAll(",", ""))}&payment_method=request&account_id=${account_id || userDetails?._id}&type=qr_pay&receiver_wallet_id=${recipientDets._id}&sender_wallet_id=${sender_wallet_id || userDetails?.walletDetails?._id}&payment_type=wallet&level_id=${level || userDetails?.level_id}`;
  const res = await axios.get(url, { headers: apiHeaders });
  const dec = decryptData(res.data.data);

  const exchange_rate_details = {
    exchange_rate: dec?.data?.exchanged_rate?.value,
    receiver: {
      currency: dec?.data?.recipient?.currency,
      amount: dec?.data?.recipient?.value,
    },
    fee: {
      amount: dec?.data?.fee?.value ?? 0.0,
      currency: dec?.data?.fee?.currency,
    },
    sending: {
      amount: dec?.data?.sending?.value,
      currency: dec?.data?.sending?.currency,
    },
    total: dec?.data?.total?.value,
    min_amount: dec?.data?.min_amount,
    max_amount: dec?.data?.max_amount,
    token: dec?.data?.token ?? "",
  };

  if (dec?.localStorage === false) {
    await localforage.setItem("phone", dec.phone);
  }

  return exchange_rate_details;
};

export const biometricVerification1 = async (payload) => {
  console.log("biometricVerification1 payload:", payload);

  const response1 = await axios.post(
    `${import.meta.env.VITE_IP_DEV_API}/api/account/login-biometric-challenge`,
    {
      data: encryptData(payload),
    },
  );

  const dec1 = await decryptData(response1.data.data);
  return dec1;
};

export const biometricVerification2 = async (payload) => {
  const getDetails = await axios.post(
    `${import.meta.env.VITE_IP_DEV_API}/api/account/get-biometric-details`,
    { data: encryptData({ credentials: payload }) },
  );
  const dec2 = decryptData(getDetails.data.data);
  return dec2;
};

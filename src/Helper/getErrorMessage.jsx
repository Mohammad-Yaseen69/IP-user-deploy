import { decryptData } from "./EssentilaMethods/Decryption";

export const getErrorMessage = (error, fallback) => {
  try {
    const encryptedData = error?.response?.data?.data;

    if (encryptedData) {
      const decryptedData = decryptData(encryptedData);

      if (decryptedData?.errors?.length > 0) {
        return decryptedData.errors
          .map((item) => item?.message)
          .filter(Boolean)
          .join(", ");
      }

      return decryptedData?.message || fallback;
    }

    return error?.response?.data?.message || error?.message || fallback;
  } catch (decryptError) {
    console.error("Error decrypting API error:", decryptError);

    return error?.message || fallback;
  }
};

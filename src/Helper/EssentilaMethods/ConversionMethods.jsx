import CryptoJS from "crypto-js";

export const stringToBase64 = (str) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}

export const base64ToString = (base64) => {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(base64));
} 
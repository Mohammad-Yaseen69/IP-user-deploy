import { stringToBase64 } from "./ConversionMethods";
import { generateRandomIv } from "./GenerateRandomIV";
import CryptoJS from "crypto-js";
import { KEY } from "./Key";

export const encryptData = (obj) => {
    const msg = JSON.stringify(obj)
    const i = generateRandomIv(16)
    const iv = CryptoJS.enc.Utf8.parse(i);


    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(msg), KEY, { iv: iv, mode: CryptoJS.mode.CBC })
    let transitmessage = JSON.stringify({ iv: stringToBase64(i), value: encrypted.toString() });
    transitmessage = stringToBase64(transitmessage)

    return transitmessage
}
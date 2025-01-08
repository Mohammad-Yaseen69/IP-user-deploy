import { base64ToString } from "./ConversionMethods";
import { KEY } from "./Key";
import CryptoJS from "crypto-js";

export const decryptData = (obj) => {
    let res = base64ToString(obj)
    let jsn = JSON.parse(res)
    const decrypted = CryptoJS.AES.decrypt(jsn.value, KEY, {
        mode: CryptoJS.mode.CBC,
        iv: CryptoJS.enc.Utf8.parse(base64ToString(jsn.iv)),
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
}
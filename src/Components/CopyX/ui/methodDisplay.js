import bankIcon from "../assets/figma/fund-bank.svg"
import cardIcon from "../assets/figma/fund-card.svg"
import globeMutedIcon from "../assets/figma/fund-globe-muted.svg"
import mobileIcon from "../assets/figma/fund-mobile.svg"
import mobileMutedIcon from "../assets/figma/fund-mobile-muted.svg"
import coinsIcon from "../assets/figma/coins.svg"
import walletIcon from "../assets/figma/wallet.svg"

/* Icon keys come from the capability service; unavailable rows use the greyed variants where Figma has them. */
const METHOD_ICONS = { wallet: walletIcon, phone: mobileIcon, card: cardIcon, crypto: coinsIcon, bank: bankIcon, globe: globeMutedIcon }
const MUTED_ICONS = { phone: mobileMutedIcon, globe: globeMutedIcon }

export const methodIconSrc = (key, muted) => (muted && MUTED_ICONS[key]) || METHOD_ICONS[key] || walletIcon

/* Wallet rows are named after the funding wallet's currency, e.g. "EUR Wallet". */
export const methodTitle = (method, iban, t, currency = method?.currency) => {
    if (!method) return ""
    if ((method.family || method.id) === "instapay_wallet") {
        if (!currency) return t(method.label)
        return iban
            ? t("{{currency}} Wallet · IBAN ending {{last4}}", { currency, last4: iban.masked.slice(-4) })
            : t("{{currency}} Wallet", { currency })
    }
    return t(method.label)
}

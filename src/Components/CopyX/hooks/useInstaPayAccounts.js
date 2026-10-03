import { useContext, useMemo } from "react"
import { UserContext } from "../../../Context/UserContext"
import { useVirtualIbans } from "../../../hooks/useVirtualIban"
import { maskIban } from "../../Settings/WithdrawalsNew/withdrawalAccounts"
import { getActiveInstaWallets, getWalletAvailableBalance, getWalletCurrencyCode } from "../../VirtualIBAN/utils/virtualIbanPreflight"
import { normalizeVirtualIban } from "../../VirtualIBAN/utils/virtualIban"

const realName = (userDetails) => (
    userDetails?.account_type?.toLowerCase() === "business"
        ? userDetails?.company?.company_name
        : [userDetails?.user?.first_name, userDetails?.user?.last_name].filter(Boolean).join(" ")
)

/* Read-only view of the signed-in user's real InstaPay wallets and IBAN. Nothing here moves money. */
const useInstaPayAccounts = () => {
    const { userDetails, userWallets } = useContext(UserContext) || {}
    const { data: rawIbans = [] } = useVirtualIbans(userDetails?._id)

    const wallets = useMemo(() => getActiveInstaWallets(userWallets || []).map(wallet => ({
        id: wallet?._id,
        currency: getWalletCurrencyCode(wallet),
        balance: getWalletAvailableBalance(wallet),
        isDefault: !!wallet?.default,
    })), [userWallets])

    const ibans = useMemo(() => (rawIbans || [])
        .map(normalizeVirtualIban)
        .filter(Boolean)
        .map(iban => ({
            id: iban._id,
            masked: maskIban(iban.iban),
            bankName: iban.bank?.name,
            holder: iban.account_holder_name,
            currency: iban.currency || iban.currency_code || "EUR",
            active: String(iban.status || "active").toLowerCase() === "active",
        })), [rawIbans])

    return {
        customerName: realName(userDetails) || "",
        countryName: userDetails?.country?.name || "",
        wallets,
        ibans,
    }
}

export default useInstaPayAccounts

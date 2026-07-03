import { apiWrapper } from "../../../utils/Functions/apiWrapper"
import countries from "../../CitiesDropDown/CitiesData.json"
import {
    VIRTUAL_IBAN_ACTIVATION_FEE,
    VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
} from "../../../stateMachines/virtualIbanPayment"

export const parseAmount = (value) => {
    const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""))
    return Number.isFinite(amount) ? amount : 0
}

export const getWalletAvailableBalance = (wallet) =>
    parseAmount(
        wallet?.balance?.available ??
        wallet?.balance?.available_balance ??
        wallet?.available_balance ??
        wallet?.availableBalance ??
        wallet?.available
    )

export const getWalletCurrencyCode = (wallet) =>
    wallet?.currency?.code || wallet?.currency_code || wallet?.name || ""

export const getActiveInstaWallets = (wallets = []) =>
    wallets
        ?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && String(item?.status || "").toLowerCase() === "active")
        ?.sort((a, b) => (b?.default === true ? 1 : -1)) ?? []

export const normalizeWalletState = (wallet) => wallet ? ({ name: getWalletCurrencyCode(wallet), ...wallet }) : {}

export const getIbanFeeConfig = (fee) => {
    const data = fee?.data ?? fee
    return Array.isArray(data) ? data[0] ?? {} : data ?? {}
}

export const getActivationFeeConfig = (fee) => {
    const feeType = String(fee?.fee_type || "flat").toLowerCase()
    const rawAmount = feeType === "percentage" ? fee?.percentage_fee : fee?.flat_fee
    const amount = parseAmount(rawAmount)

    return {
        amount: amount || VIRTUAL_IBAN_ACTIVATION_FEE,
        currency: fee?.fee_currency || VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
    }
}

export const getLocalOrDefaultWallet = (wallets = [], userDetails) => {
    if (!wallets?.length) return null

    const localCurrency = countries?.find(c => c?.iso3 === userDetails?.country_iso_code)?.currency

    if (localCurrency) {
        const wallet = wallets?.find(item => getWalletCurrencyCode(item) === localCurrency)

        if (wallet && !wallet?.blocked && !wallet?.admin_blocked && String(wallet?.status || "").toLowerCase() === "active") {
            return wallet
        }
    }

    const activeWallets = getActiveInstaWallets(wallets)
    return wallets?.find(item => item?.default) || activeWallets?.[0] || wallets?.[0] || null
}

export const fetchVirtualIbanActivationFee = async (accountLevelId) => {
    const res = await apiWrapper({
        endpoint: `/api/account-settings/fee-details?service_name=iban_activation&account_level=${accountLevelId}`,
        method: "GET",
        isDecrypted: true,
    })

    return getIbanFeeConfig(res?.data)
}

export const getVirtualIbanPreflight = async ({
    userWallets = [],
    userDetails,
    getPlainExchangeRate,
    skipPaymentWhenNoWalletFunds = true,
}) => {
    const feeConfig = await fetchVirtualIbanActivationFee(userDetails?.level?._id)
    const activationFee = getActivationFeeConfig(feeConfig)
    const activeWallets = getActiveInstaWallets(userWallets)
    let hasFundedWallet = false

    if (skipPaymentWhenNoWalletFunds) {
        for (const wallet of activeWallets) {
            const walletCurrency = getWalletCurrencyCode(wallet)
            let requiredAmount = activationFee.amount

            if (walletCurrency && walletCurrency !== activationFee.currency) {
                try {
                    requiredAmount = parseAmount(
                        await getPlainExchangeRate(activationFee.currency, walletCurrency, activationFee.amount)
                    )
                } catch {
                    requiredAmount = 0
                }
            }

            if (requiredAmount && getWalletAvailableBalance(wallet) >= requiredAmount) {
                hasFundedWallet = true
                break
            }
        }
    }

    return {
        activationFeeConfig: feeConfig,
        skipPaymentStep: skipPaymentWhenNoWalletFunds && !hasFundedWallet,
        preselectedWallet: getLocalOrDefaultWallet(userWallets, userDetails),
    }
}

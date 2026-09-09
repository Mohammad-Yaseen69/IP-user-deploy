import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { getCryptoWalletBalance } from "../api/cryptoWallets"

/**
 * Live balance for one crypto wallet, kept above the wallet detail so the
 * value header can show it too.
 */
export const useWalletBalance = (wallet) => {
    const { t } = useTranslation()
    const [liveBalance, setLiveBalance] = useState(null)
    const [isStale, setIsStale] = useState(false)
    const [syncing, setSyncing] = useState(false)

    const walletId = wallet?._id
    const isActive = wallet?.status === "active"

    const refresh = useCallback(async ({ silent = false } = {}) => {
        if (!walletId || !isActive) return
        setSyncing(true)
        try {
            const data = await getCryptoWalletBalance(walletId)
            if (data?.status && data?.balance) {
                setLiveBalance(data.balance)
                setIsStale(data.stale || false)
                if (!silent) toast.success(t("Crypto balance synced with provider."))
            }
        } catch {
            if (!silent) toast.error(t("Failed to sync live balance."))
        } finally {
            setSyncing(false)
        }
    }, [walletId, isActive, t])

    useEffect(() => {
        setLiveBalance(null)
        setIsStale(false)
        refresh({ silent: true })
    }, [walletId, refresh])

    return {
        available: liveBalance?.available ?? wallet?.balance?.available ?? 0,
        pending: liveBalance?.pending ?? wallet?.balance?.pending ?? 0,
        isStale,
        syncing,
        refresh,
    }
}

export default useWalletBalance

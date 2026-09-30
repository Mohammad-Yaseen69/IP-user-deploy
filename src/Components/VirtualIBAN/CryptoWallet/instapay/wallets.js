/* InstaPay's own crypto balances: the wallet rows My Wallets already knows how to
   top up, block and statement. BVNK custodial wallets are a different product and
   keep their own page. */
export const isInstapayCryptoWallet = (wallet) =>
    wallet?.wallet_type === "crypto" && wallet?.provider !== "bvnk"

/* The assets the page offers today; the rest are listed as coming soon. */
export const LIVE_CRYPTO_CODES = ["USDT"]

export const isLiveCryptoWallet = (wallet) =>
    isInstapayCryptoWallet(wallet) && LIVE_CRYPTO_CODES.includes(String(wallet?.currency?.code || "").toUpperCase())

export const isWalletBlocked = (wallet) =>
    !!wallet?.blocked || !!wallet?.admin_blocked || wallet?.status !== "active"

export const getWalletStatus = (wallet) => {
    if (wallet?.admin_blocked) return { key: "adminBlocked", label: "Blocked by admin" }
    if (wallet?.blocked) return { key: "blocked", label: "Blocked" }
    if (wallet?.status !== "active") return { key: "inactive", label: "Inactive" }
    return { key: "active", label: "Active" }
}

export const getWalletAvailable = (wallet) => Number(wallet?.balance?.available || 0)

export const formatWalletAmount = (value) =>
    Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })

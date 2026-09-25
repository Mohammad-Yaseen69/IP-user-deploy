import { apiWrapper } from "../../../../utils/Functions/apiWrapper"

/** Kick off provisioning of a custodial crypto wallet. */
export const initiateCryptoWallet = ({ walletId, currencyCode }) =>
    apiWrapper({
        endpoint: "/api/crypto-wallets/initiate",
        method: "POST",
        payload: { wallet_id: walletId, currencyCode },
        isDecrypted: true,
    })

/** Live balance for one crypto wallet. */
export const getCryptoWalletBalance = (cryptoWalletId) =>
    apiWrapper({
        endpoint: `/api/crypto-wallets/${cryptoWalletId}/balance`,
        method: "GET",
        isDecrypted: true,
    })

/** Generate a deposit channel (address) when none exists yet. */
export const createCryptoWalletChannel = (cryptoWalletId) =>
    apiWrapper({
        endpoint: `/api/crypto-wallets/${cryptoWalletId}/channels`,
        method: "POST",
        isDecrypted: true,
    })

export const isCryptoWallet = (wallet) =>
    wallet?.provider === "bvnk" || wallet?.wallet_type === "crypto"

/** Flatten the BVNK channel + its alternatives into a network list. */
export const getWalletNetworks = (wallet) => {
    const channel = wallet?.provider_data?.bvnk?.channels?.[0]
    if (!channel) return []

    return [
        {
            network: channel.network || "Primary",
            protocol: channel.protocol || "",
            address: channel.address || "",
            isPrimary: true,
        },
        ...(Array.isArray(channel.alternatives)
            ? channel.alternatives.map((alt) => ({
                network: alt.network || "",
                protocol: alt.protocol || "",
                address: alt.address || "",
                isPrimary: false,
            }))
            : []),
    ]
}

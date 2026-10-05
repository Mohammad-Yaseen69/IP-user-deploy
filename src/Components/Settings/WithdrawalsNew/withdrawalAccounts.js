import allCountries from "../../PaymentsNewer/CountriesData.json"
import { FIAT_CHANNEL_KEYS, METHOD_BY_CHANNEL_KEY, getCryptoList, normalizeNetwork } from "./withdrawalPayload"

export const METHOD_LABELS = {
    bank_account: "Bank account",
    mobile_wallet: "Mobile wallet",
    cash_pickup: "Cash pickup",
    card_payment: "Payment card",
    crypto_wallet: "Crypto wallet",
}

export const METHOD_ICONS = {
    bank_account: "bank",
    mobile_wallet: "device-mobile",
    cash_pickup: "money",
    card_payment: "coins",
    crypto_wallet: "coins",
}

const tail = (value, count = 4) => String(value ?? "").replace(/\s/g, "").slice(-count)

/* "FR76 •••• •••• 7890": enough to recognise the account, never the whole number. */
export const maskIban = (value) => {
    const clean = String(value ?? "").replace(/\s/g, "")
    if (clean.length < 8) return clean
    return `${clean.slice(0, 4)} •••• •••• ${tail(clean)}`
}

export const maskNumber = (value) => {
    const clean = String(value ?? "").replace(/\s/g, "")
    if (!clean) return ""
    return clean.length <= 4 ? clean : `•••• ${tail(clean)}`
}

export const maskPhone = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "")
    if (digits.length < 6) return digits ? `+${digits}` : ""
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ••• ${digits.slice(-4, -2)} ${digits.slice(-2)}`
}

export const maskAddress = (value) => {
    const clean = String(value ?? "").trim()
    if (clean.length <= 12) return clean
    return `${clean.slice(0, 6)}…${clean.slice(-4)}`
}

export const findCountry = (iso3) => allCountries.find(item => item.alpha3 === iso3)

const describeEntry = (method, entry) => {
    switch (method) {
        case "bank_account":
            return {
                title: entry?.name || METHOD_LABELS.bank_account,
                detail: entry?.iban ? maskIban(entry.iban) : maskNumber(entry?.account_number || entry?.swift_code),
            }
        case "mobile_wallet":
            return {
                title: entry?.wallet_name || METHOD_LABELS.mobile_wallet,
                detail: maskPhone(entry?.wallet_account_number),
            }
        case "cash_pickup":
            return {
                title: METHOD_LABELS.cash_pickup,
                detail: [entry?.document_type?.replace(/_/g, " ")?.toLowerCase(), maskNumber(entry?.document_number)].filter(Boolean).join(" · "),
            }
        case "card_payment":
            return {
                title: entry?.card_name || METHOD_LABELS.card_payment,
                detail: maskNumber(entry?.card_number),
            }
        default:
            return { title: "", detail: "" }
    }
}

/* One group per country record, one row per method configured on it. */
export const buildCountryGroups = (records = []) => (
    (records || []).map(record => {
        const channelKeys = FIAT_CHANNEL_KEYS.filter(key => Array.isArray(record?.[key]) && record[key].length > 0)

        const rows = channelKeys.map(channelKey => {
            const entry = record[channelKey][0]
            const method = METHOD_BY_CHANNEL_KEY[channelKey]
            const { title, detail } = describeEntry(method, entry)

            return {
                key: `${record._id}-${channelKey}`,
                record,
                entry,
                method,
                channelKey,
                channelId: entry?._id,
                isDefault: !!entry?.default,
                isLastInRecord: channelKeys.length === 1,
                title,
                subtitle: [METHOD_LABELS[method], detail].filter(Boolean).join(" · "),
                icon: METHOD_ICONS[method],
                countryName: findCountry(record?.iso_code)?.name ?? record?.iso_code,
            }
        })

        return {
            record,
            iso3: record?.iso_code,
            country: findCountry(record?.iso_code),
            usedMethods: channelKeys.map(key => METHOD_BY_CHANNEL_KEY[key]),
            rows,
        }
    })
)

export const buildCryptoRows = (records = []) => (
    (records || []).flatMap(record => {
        const list = getCryptoList(record)
        const channelKey = Array.isArray(record?.crypto) && record.crypto.length > 0 ? "crypto" : "crypto_wallet"

        return list.map((crypto, index) => {
            const network = normalizeNetwork(crypto?.network, crypto?.wallet_address)
            return {
                key: `${record?._id || "crypto"}-${crypto?._id || index}`,
                record,
                entry: crypto,
                method: "crypto_wallet",
                channelKey,
                channelId: crypto?._id,
                cryptoIndex: index,
                isCrypto: true,
                network,
                title: `${crypto?.currency || "USDT"} wallet`,
                subtitle: `${network} · ${maskAddress(crypto?.wallet_address)}`,
                icon: METHOD_ICONS.crypto_wallet,
            }
        })
    }).filter(row => row.entry?.wallet_address)
)

import { useEffect, useMemo } from "react"
import ibanLib from "iban"
import { useTranslation } from "react-i18next"
import { Fields, SelectField, TextField } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components"
import { THUNES_IDENTIFIER_FIELDS } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/vendorFields"
import { bankExtrasInitial } from "../../../../../utils/Data"
import { checkIdentifier, isCheckedIdentifier, parseIban } from "../../../../../utils/Functions/bankIdentifiers"

/* The provider may ask for routing_code; the form always stores it as aba_routing_number. */
const toExtraKey = (name) => (name === "routing_code" ? "aba_routing_number" : name)

/* Used only when the provider's required fields could not be read. */
const FALLBACK_IDENTIFIERS = ["bank_account_number"]

const clean = (value) => String(value ?? "").replace(/[^a-zA-Z0-9]/g, "")

/* ISO 7064 mod-97, the checksum every IBAN carries whatever its country. */
const passesMod97 = (iban) => {
    const digits = `${iban.slice(4)}${iban.slice(0, 4)}`.replace(/[A-Z]/g, (letter) => letter.charCodeAt(0) - 55)
    let remainder = 0
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97
    return remainder === 1
}

/* The iban library only knows the registry countries, and many payout countries (Niger,
   Senegal, ...) are not in it, so those fall back to the format and checksum alone. */
const checkIban = (value) => {
    const iban = clean(value).toUpperCase()
    if (!iban) return { state: "", message: "" }
    if (ibanLib.countries[iban.slice(0, 2)]) return checkIdentifier("iban", iban)

    const valid = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) && passesMod97(iban)
    return valid
        ? { state: "valid", message: "Valid IBAN" }
        : { state: "invalid", message: "This IBAN is not valid. Check it for a typo." }
}

/*
 * Only what the provider asks for. The IBAN, or the SWIFT code when there is no IBAN,
 * fills the channel's own iban/swift_code; account numbers fill account_number; the
 * rest go to extras, as the old form sent them. The bank name is the chosen payer.
 */
const BankDetails = ({ channel, setChannel, payers, identifiers, onValidChange }) => {
    const { t } = useTranslation()

    const fields = useMemo(() => {
        const names = [...new Set((identifiers?.length ? identifiers : FALLBACK_IDENTIFIERS).map(toExtraKey))]
        const hasIban = names.includes("iban")

        return names
            .map((name) => {
                if (name === "iban") return { name, target: "iban" }
                if (name === "swift_bic_code" && !hasIban) return { name, target: "swift" }
                if (name === "bank_account_number" || name === "account_number") return { name, target: "account" }
                if (name in bankExtrasInitial) return { name, target: "extra" }
                return null
            })
            .filter(Boolean)
            /* Two names for the same account number are one question. */
            .filter((field, index, list) => field.target !== "account" || list.findIndex(item => item.target === "account") === index)
    }, [identifiers])

    const valueOf = (field) => {
        if (field.target === "iban" || field.target === "swift") return channel.bank_iban ?? ""
        if (field.target === "account") return channel.bank_account_number ?? ""
        return channel.extras?.[field.name] ?? ""
    }

    const setValue = (field, value) => {
        if (field.target === "iban") {
            /* A valid IBAN carries the account number, so the account field is filled from it,
               unless the user has typed a different one themselves. */
            setChannel(prev => {
                const previous = parseIban(prev.bank_iban)?.accountNumber
                const typedByUser = prev.bank_account_number && prev.bank_account_number !== previous
                const accountNumber = parseIban(value)?.accountNumber
                return {
                    ...prev,
                    bank_iban: value,
                    accNumType: "IBAN",
                    ...(accountNumber && !typedByUser ? { bank_account_number: accountNumber } : {}),
                }
            })
        } else if (field.target === "swift") {
            setChannel(prev => ({ ...prev, bank_iban: value, accNumType: "Swift" }))
        } else if (field.target === "account") {
            setChannel(prev => ({ ...prev, bank_account_number: value }))
        } else {
            setChannel(prev => ({ ...prev, extras: { ...prev.extras, [field.name]: value } }))
        }
    }

    /* The bank is the payer the user picked, so its name is never typed. */
    useEffect(() => {
        const payer = payers.find(item => String(item.id) === String(channel.payer_id))
        if (payer && channel.bank_name !== payer.name) {
            setChannel(prev => ({ ...prev, bank_name: payer.name }))
        }
    }, [channel.payer_id, payers])

    const defOf = (field) => (field.target === "account"
        ? THUNES_IDENTIFIER_FIELDS.bank_account_number
        : THUNES_IDENTIFIER_FIELDS[field.name] || { label: field.name, type: "text" })

    /* IBAN, SWIFT/BIC and routing numbers are checked the same way beneficiaries check them. */
    const checkOf = (field) => {
        if (field.target === "iban") return checkIban(valueOf(field))
        return isCheckedIdentifier(defOf(field).type)
            ? checkIdentifier(defOf(field).type, valueOf(field))
            : { state: "", message: "" }
    }

    const valid = !!channel.payer_id && fields.every(field => (
        String(valueOf(field)).trim() && checkOf(field).state !== "invalid"
    ))
    useEffect(() => { onValidChange(valid) }, [valid, onValidChange])

    return (
        <Fields>
            {payers.length > 1 && (
                <SelectField
                    id="wd-bank-payer"
                    label={t("Bank")}
                    value={String(channel.payer_id ?? "")}
                    placeholder={t("Select your bank")}
                    options={payers.map(payer => ({ value: String(payer.id), label: payer.name }))}
                    onChange={(value) => setChannel(prev => ({ ...prev, payer_id: value }))}
                />
            )}

            {fields.map(field => {
                const def = defOf(field)
                const check = checkOf(field)

                if (def.type === "select") {
                    return (
                        <SelectField
                            key={field.name}
                            id={`wd-bank-${field.name}`}
                            label={t(def.label)}
                            value={valueOf(field)}
                            options={def.options}
                            onChange={(next) => setValue(field, next)}
                        />
                    )
                }

                return (
                    <TextField
                        key={field.name}
                        id={`wd-bank-${field.name}`}
                        label={t(def.label)}
                        value={valueOf(field)}
                        placeholder={def.placeholder}
                        error={check.state === "invalid" ? t(check.message) : undefined}
                        hint={check.state === "valid" ? t(check.message) : undefined}
                        trailingIcon={check.state === "valid" ? "check" : undefined}
                        onChange={(next) => {
                            const normalised = def.alphanumeric ? clean(next) : next
                            setValue(field, def.uppercase ? normalised.toUpperCase() : normalised)
                        }}
                    />
                )
            })}
        </Fields>
    )
}

export default BankDetails

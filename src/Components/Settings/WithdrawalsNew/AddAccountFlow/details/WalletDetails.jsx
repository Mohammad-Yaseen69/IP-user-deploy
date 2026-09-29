import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FieldLabel, Fields, Hint } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components"
import abf from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css"
import CountryBasedPhone from "../../../../PhoneInput/PhoneNumberBasedOnCountry.json"
import styles from "../../styles/WithdrawalsNew.module.css"
import { getDialCode } from "../../withdrawalPayload"

const WalletDetails = ({ channel, setChannel, payers, country, takenNumbers, error, onValidChange }) => {
    const { t } = useTranslation()
    const dialCode = getDialCode(CountryBasedPhone, country?.alpha3)
    const maxLength = CountryBasedPhone[country?.alpha3]?.maxLength
    const stored = channel.wallet_account_number ?? ""
    const digits = dialCode && stored.startsWith(dialCode) ? stored.slice(dialCode.length) : stored

    const provider = payers.find(payer => String(payer.id) === String(channel.payer_id))
    const duplicate = !!digits && takenNumbers.includes(`${dialCode}${digits}`)

    const valid = !!(channel.payer_id && digits && !duplicate)
    useEffect(() => { onValidChange(valid) }, [valid, onValidChange])

    const selectProvider = (payer) => setChannel(prev => ({ ...prev, payer_id: payer.id, wallet_name: payer.name }))

    const setNumber = (value) => {
        const next = value.replace(/\D/g, "").slice(0, maxLength || undefined)
        setChannel(prev => ({ ...prev, wallet_account_number: `${dialCode}${next}` }))
    }

    return (
        <Fields>
            <div className={abf.field}>
                <FieldLabel>{t("Wallet provider")}</FieldLabel>
                <div className={styles.chips}>
                    {payers.map(payer => (
                        <button
                            key={payer.id}
                            type="button"
                            className={`${styles.chip} ${String(payer.id) === String(channel.payer_id) ? styles.chipActive : ""}`}
                            onClick={() => selectProvider(payer)}
                        >
                            {payer.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={abf.field}>
                <FieldLabel htmlFor="wd-wallet-number">{t("Wallet phone number")}</FieldLabel>
                <div className={`${abf.inputShell} ${styles.phoneShell} ${duplicate || error ? abf.inputShellError : ""}`}>
                    <span className={styles.phonePrefix}>
                        {country?.file_url && <img src={country.file_url} alt="" draggable="false" />}
                        +{dialCode}
                    </span>
                    <input
                        id="wd-wallet-number"
                        className={abf.input}
                        type="tel"
                        inputMode="numeric"
                        value={digits}
                        onChange={(event) => setNumber(event.target.value)}
                    />
                </div>
                <Hint error={duplicate || !!error}>
                    {duplicate
                        ? t("You can't add same withdrawal twice.")
                        : error || (provider
                            ? t("The number registered with {{provider}}, in your name.", { provider: provider.name })
                            : t("The number registered with your wallet, in your name."))}
                </Hint>
            </div>
        </Fields>
    )
}

export default WalletDetails

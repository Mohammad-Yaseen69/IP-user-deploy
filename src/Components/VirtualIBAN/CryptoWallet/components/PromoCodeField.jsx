import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "../cryptoWallet.module.scss"

/** Promo code input + Apply. Validates against the hardcoded PROMO_CODES map. */
const PromoCodeField = ({ appliedCode, onApply, codes = {} }) => {
    const { t } = useTranslation()
    const [value, setValue] = useState("")
    const [error, setError] = useState("")

    const apply = () => {
        const code = value.trim().toUpperCase()
        if (!code) return

        if (codes[code]) {
            setError("")
            onApply?.(code, codes[code])
            return
        }
        setError(t("That code is not valid or has expired."))
    }

    return (
        <div>
            <label className={styles.fieldLabel} htmlFor="cw-promo">
                {t("Promo code")}
            </label>
            <div className={styles.promoRow}>
                <input
                    id="cw-promo"
                    className={styles.input}
                    placeholder={t("Enter a code")}
                    value={value}
                    disabled={!!appliedCode}
                    onChange={(e) => {
                        setValue(e.target.value)
                        if (error) setError("")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && apply()}
                />
                <button
                    type="button"
                    className={styles.btnSecondary}
                    disabled={!value.trim() || !!appliedCode}
                    onClick={apply}
                >
                    {appliedCode ? t("Applied") : t("Apply")}
                </button>
            </div>
            <p className={`${styles.fieldHint} ${error ? styles.fieldHintError : ""}`}>
                {error || t("Optional. A code cannot be added after the wallet is activated.")}
            </p>
        </div>
    )
}

export default PromoCodeField

import { useState } from "react"
import { MoreHorizontal, Copy, Check, AlertCircle } from "react-feather"
import { useVirtualIbanDetails } from "../hooks/useVirtualIban"
import styles from "../styles/IBANDetails.module.css"

function useCopy() {
    const [copiedKey, setCopiedKey] = useState(null)
    const copy = (text, key) => {
        if (!text) return
        navigator.clipboard.writeText(text).then(() => {
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 2000)
        })
    }
    return { copiedKey, copy }
}

const joinAddress = (address) => {
    if (!address) return ""
    return [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.region,
        address.country,
        address.postCode,
    ].filter(Boolean).join(", ")
}

const DetailRow = ({ label, value, copyKey, copiedKey, onCopy, mono }) => (
    <div className={styles.detailRow}>
        <span className={styles.label}>{label}</span>
        <div className={styles.valueGroup}>
            <span className={`${styles.value} ${mono ? styles.mono : ""}`}>{value || "-"}</span>
            {onCopy && value && (
                <button
                    className={styles.inlineCopyBtn}
                    onClick={() => onCopy(value, copyKey)}
                    title="Copy"
                >
                    {copiedKey === copyKey
                        ? <Check size={13} className={styles.copiedIcon} />
                        : <Copy size={13} />}
                </button>
            )}
        </div>
    </div>
)

const IBANDetails = ({ ibanId, fallbackIban }) => {
    const [depositing, setDepositing] = useState("eu")
    const { data, isFetching } = useVirtualIbanDetails(ibanId)
    const { copiedKey, copy } = useCopy()
    const iban = data || fallbackIban || {}
    const bankAddress = joinAddress(iban?.bank?.address)
    const allText = [
        `Account holder name: ${iban?.account_holder_name || ""}`,
        `IBAN: ${iban?.iban || ""}`,
        `BIC / Bank Code: ${iban?.bank?.bic || ""}`,
        `Bank name: ${iban?.bank?.name || ""}`,
        `Bank address: ${bankAddress}`,
    ].filter((line) => !line.endsWith(": ")).join("\n")

    return (
        <div className={styles.ibanWrapper}>
            <div className={styles.box1}>
                <div className={styles.boxheader}>
                    <span>Depositing from</span>
                    <button className={styles.moreBtn}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>

                <div className={styles.BoxItems}>
                    <div
                        className={`${styles.boxItem} ${depositing === "eu" ? styles.active : ""}`}
                        onClick={() => setDepositing("eu")}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === "eu" && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>Countries in European Union</span>
                    </div>

                    <div
                        className={`${styles.boxItem} ${depositing === "international" ? styles.active : ""}`}
                        onClick={() => setDepositing("international")}
                    >
                        <div className={styles.radioOuter}>
                            {depositing === "international" && <div className={styles.radioInner} />}
                        </div>
                        <span className={styles.itemText}>Countries out of EU</span>
                    </div>
                </div>
            </div>

            <div className={styles.box2}>
                <div className={styles.detailsContainer}>
                    {isFetching && <span className={styles.label}>Refreshing details...</span>}
                    <DetailRow label="Account holder name" value={iban?.account_holder_name} copyKey="holder" copiedKey={copiedKey} onCopy={copy} />
                    <DetailRow label="IBAN" value={iban?.iban} copyKey="iban" copiedKey={copiedKey} onCopy={copy} mono />
                    <DetailRow label="BIC / Bank Code" value={iban?.bank?.bic} copyKey="bic" copiedKey={copiedKey} onCopy={copy} mono />
                    <DetailRow label="Bank name" value={iban?.bank?.name} copyKey="bank" copiedKey={copiedKey} onCopy={copy} />
                    <DetailRow label="Bank address" value={bankAddress} copyKey="bank-address" copiedKey={copiedKey} onCopy={copy} />
                    {depositing === "international" && (
                        <DetailRow label="Payment reference" value={iban?.wallet_id} copyKey="reference" copiedKey={copiedKey} onCopy={copy} mono />
                    )}
                </div>

                {depositing === "international" && (
                    <div className={styles.warningNotice}>
                        <AlertCircle size={15} className={styles.warningIcon} />
                        <p className={styles.warningText}>
                            Please ensure correct reference number is quoted in payment instruction else we will
                            not be able to automatically credit funds to your account, which may cause additional delays.
                        </p>
                    </div>
                )}

                <button className={styles.copyButton} onClick={() => copy(allText, "all-details")}>
                    {copiedKey === "all-details"
                        ? <><Check size={15} /><span>Copied!</span></>
                        : <><Copy size={15} /><span>Copy all details</span></>}
                </button>
            </div>
        </div>
    )
}

export default IBANDetails

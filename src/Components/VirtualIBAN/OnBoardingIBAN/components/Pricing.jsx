import { Alert, Checkbox } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { Activity, ArrowDownCircle, ArrowLeft, ArrowUpCircle, DollarSign, RefreshCw, Repeat, TrendingUp } from "react-feather"
import axios from "axios"
import styles from "../style/Pricing.module.css"
import { UserContext } from "../../../../Context/UserContext"
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption"

const ICON_MAP = {
    opening_fee: DollarSign,
    iban_activation: DollarSign,
    monthly_iban_fee: Repeat,
    sepa_inward: ArrowDownCircle,
    sepa_outward: ArrowUpCircle,
    swift_inward: ArrowDownCircle,
    swift_outward: ArrowUpCircle,
    crypto_ramp: RefreshCw,
    fx_margin: TrendingUp,
}

const Pricing = ({ onBack, t, onNext }) => {
    const { authHeader } = useContext(UserContext)
    const [feeSchedule, setFeeSchedule] = useState([])
    const [packName, setPackName] = useState("")
    const [loading, setLoading] = useState(true)
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    useEffect(() => {
        const fetchModel = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/get-payment-model`,
                    { headers: authHeader }
                )
                const dec = decryptData(res.data?.data)
                if (dec?.data) {
                    setFeeSchedule(dec.data.fee_schedule || [])
                    setPackName(dec.data.name || "")
                }
            } catch {
            } finally {
                setLoading(false)
            }
        }
        fetchModel()
    }, [])

    const getIcon = (id) => {
        const Icon = ICON_MAP[id] || Activity
        return <Icon size={15} />
    }

    const formatFee = (item) => {
        const parts = []
        if (item.flatEuro > 0) parts.push(`€${item.flatEuro} flat`)
        if (item.percentAmount > 0) parts.push(`${item.percentAmount}%`)
        if (parts.length === 0) return "Free"
        return parts.join(" + ")
    }

    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.mainArea}>

                <div className={styles.onboardingFormOwnership}>
                    <div className={styles.pricingWrapper}>
                        <div className={styles.header}>
                            <div className={styles.planIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M4.25 6.25C4.25 6.04167 4.32292 5.86458 4.46875 5.71875C4.61458 5.57292 4.79167 5.5 5 5.5H11C11.2083 5.5 11.3854 5.57292 11.5312 5.71875C11.6771 5.86458 11.75 6.04167 11.75 6.25C11.75 6.45833 11.6771 6.63542 11.5312 6.78125C11.3854 6.92708 11.2083 7 11 7H5C4.79167 7 4.61458 6.92708 4.46875 6.78125C4.32292 6.63542 4.25 6.45833 4.25 6.25ZM5 9.5H11C11.2083 9.5 11.3854 9.42708 11.5312 9.28125C11.6771 9.13542 11.75 8.95833 11.75 8.75C11.75 8.54167 11.6771 8.36458 11.5312 8.21875C11.3854 8.07292 11.2083 8 11 8H5C4.79167 8 4.61458 8.07292 4.46875 8.21875C4.32292 8.36458 4.25 8.54167 4.25 8.75C4.25 8.95833 4.32292 9.13542 4.46875 9.28125C4.61458 9.42708 4.79167 9.5 5 9.5ZM14.75 3.5V13C14.75 13.2083 14.6771 13.3854 14.5312 13.5312C14.3854 13.6771 14.2083 13.75 14 13.75C13.9375 13.75 13.8776 13.7422 13.8203 13.7266C13.763 13.7109 13.7083 13.6927 13.6562 13.6719H13.6719L12 12.8438L10.3281 13.6719C10.2865 13.6927 10.237 13.7109 10.1797 13.7266C10.1224 13.7422 10.0625 13.75 10 13.75C9.9375 13.75 9.8776 13.7422 9.82031 13.7266C9.76302 13.7109 9.70833 13.6927 9.65625 13.6719H9.67188L8 12.8438L6.32812 13.6719C6.28646 13.6927 6.23698 13.7109 6.17969 13.7266C6.1224 13.7422 6.0625 13.75 6 13.75C5.9375 13.75 5.8776 13.7422 5.82031 13.7266C5.76302 13.7109 5.70833 13.6927 5.65625 13.6719H5.67188L4 12.8438L2.32812 13.6719C2.28646 13.6927 2.23698 13.7109 2.17969 13.7266C2.1224 13.7422 2.0625 13.75 2 13.75C1.79167 13.75 1.61458 13.6771 1.46875 13.5312C1.32292 13.3854 1.25 13.2083 1.25 13V3.5C1.25 3.15625 1.3724 2.86198 1.61719 2.61719C1.86198 2.3724 2.15625 2.25 2.5 2.25H13.5C13.8438 2.25 14.138 2.3724 14.3828 2.61719C14.6276 2.86198 14.75 3.15625 14.75 3.5ZM13.25 3.75H2.75V11.7812L3.67188 11.3281C3.71354 11.3073 3.76302 11.2891 3.82031 11.2734C3.8776 11.2578 3.9375 11.25 4 11.25C4.0625 11.25 4.1224 11.2578 4.17969 11.2734C4.23698 11.2891 4.29167 11.3073 4.34375 11.3281H4.32812L6 12.1562L7.67188 11.3281C7.71354 11.3073 7.76302 11.2891 7.82031 11.2734C7.8776 11.2578 7.9375 11.25 8 11.25C8.0625 11.25 8.1224 11.2578 8.17969 11.2734C8.23698 11.2891 8.29167 11.3073 8.34375 11.3281H8.32812L10 12.1562L11.6719 11.3281C11.7135 11.3073 11.763 11.2891 11.8203 11.2734C11.8776 11.2578 11.9375 11.25 12 11.25C12.0625 11.25 12.1224 11.2578 12.1797 11.2734C12.237 11.2891 12.2917 11.3073 12.3438 11.3281H12.3281L13.25 11.7812V3.75Z" fill="white" />
                                </svg>                            </div>
                            <div className={styles.cont}>
                                <h3>Your pricing</h3>
                                <p>
                                    Transparent, personalized pricing, no hidden fees. This VAT isn't
                                    applicable for your account and won't change without notice.
                                </p>
                            </div>
                        </div>
                        <div className={styles.planHeader}>
                            <div className={styles.planIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M14.9746 4.16699L9.13086 0.962891C9.04232 0.907552 8.94548 0.866048 8.84033 0.838379C8.73519 0.81071 8.62174 0.796875 8.5 0.796875C8.37826 0.796875 8.26481 0.81071 8.15967 0.838379C8.05452 0.866048 7.95215 0.907552 7.85254 0.962891H7.86914L2.02539 4.16699C1.8151 4.27767 1.64632 4.43538 1.51904 4.64014C1.39176 4.84489 1.32812 5.07454 1.32812 5.3291V11.6709C1.32812 11.9255 1.39176 12.1551 1.51904 12.3599C1.64632 12.5646 1.80957 12.7223 2.00879 12.833H2.02539L7.86914 16.0371C7.95768 16.0924 8.05452 16.134 8.15967 16.1616C8.26481 16.1893 8.37826 16.2031 8.5 16.2031C8.62174 16.2031 8.73519 16.1893 8.84033 16.1616C8.94548 16.134 9.04785 16.0924 9.14746 16.0371H9.13086L14.9746 12.833C15.1849 12.7223 15.3537 12.5646 15.481 12.3599C15.6082 12.1551 15.6719 11.9255 15.6719 11.6709V5.3291C15.6719 5.07454 15.6082 4.84489 15.481 4.64014C15.3537 4.43538 15.1904 4.27767 14.9912 4.16699H14.9746ZM8.5 2.42383L13.2812 5.04688L11.8535 5.82715L7.07227 3.2041L8.5 2.42383ZM8.5 7.66992L3.71875 5.04688L5.41211 4.11719L10.1934 6.74023L8.5 7.66992ZM2.92188 6.4248L7.70312 9.04785V14.1279L2.92188 11.5215V6.4248ZM9.29688 14.1279V9.04785L10.8906 8.16797V10.0938C10.8906 10.3151 10.9681 10.5033 11.123 10.6582C11.278 10.8132 11.4661 10.8906 11.6875 10.8906C11.9089 10.8906 12.097 10.8132 12.252 10.6582C12.4069 10.5033 12.4844 10.3151 12.4844 10.0938V7.30469L14.0781 6.4248V11.5215L9.29688 14.1279Z" fill="white" />
                                </svg>
                            </div>

                            <div>
                                <h4>{loading ? "Loading..." : (packName || "Growth Pack")}</h4>
                                <p>We'll verify, update after your compliance review.</p>
                            </div>
                        </div>
                        <div className={styles.planCard}>
                            <div className={styles.pricingGrid}>
                                {loading ? (
                                    <div className={styles.item}>
                                        <span>Loading pricing details...</span>
                                    </div>
                                ) : feeSchedule.length > 0 ? (
                                    feeSchedule.map((item) => (
                                        <div className={styles.item} key={item.id}>
                                            <div className={styles.left}>
                                                {getIcon(item.id)}
                                                <span>{item.name}</span>
                                            </div>
                                            <strong>{formatFee(item)}</strong>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.item}>
                                        <span>No pricing model assigned yet</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Alert severity="info" className={styles.info}>
                            This pricing reflects your risk profile, expected volumes and
                            negotiated terms. If your usage changes significantly, our team may
                            propose an updated package.
                        </Alert>


                        <div className={styles.term}>
                            <Checkbox
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                            <p>{t(
                                "I accept this pricing and InstaPay's terms of service."
                            )}</p>
                        </div>

                    </div>
                </div>
            </div>
            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button
                    onClick={onNext}
                    disabled={!acceptedTerms}
                    className={styles.continueButton}
                    style={{ opacity: !acceptedTerms ? 0.5 : 1, cursor: !acceptedTerms ? 'not-allowed' : 'pointer' }}
                >
                    {t("Request IBAN activation")}
                </button>
            </div>
        </div>
    )
}

export default Pricing

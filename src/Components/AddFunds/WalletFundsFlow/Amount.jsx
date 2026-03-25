import { useTranslation } from "react-i18next"
import styles from "./Amount.module.css"
import { Info } from "react-feather"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import { formatCurrency } from "../../../Helper/AmountFormat"
import { useLocation } from "react-router"
import { getLimits } from "../../WalletsNew"
import InstaPayLoader from "../../Loader"

export function formatCurrencyLocal(value) {
    return value ? parseFloat(value?.replace(/,/g, ''))?.toFixed(2) : value;
}

const Amount = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)

    const _wallet = (data && typeof data.wallet === "object" && data.wallet !== null) ? data.wallet : {};
    const [formattedAmount, setFormattedAmount] = useState(data?.amount)
    const handleKeyUp = (e) => {
        const cursor = e.target.selectionStart;
        const prevLen = e.target.value.length;
        formatCurrency(e.target.value, false, setFormattedAmount);
        requestAnimationFrame(() => {
            const newLen = e.target.value.length;
            const pos = cursor + (newLen - prevLen);
            e.target.setSelectionRange(pos, pos);
        });
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };

    useEffect(() => {
        dataHandler("amount", String(formattedAmount ?? "")?.replaceAll(",", ""))
    }, [formattedAmount])

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_address = queryParams.get("wallet_address") || 'something'
    const [walletData, setWalletData] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (wallet_address && _wallet?._id) {
            setLoading(true)
            getLimits(_wallet, setWalletData, authHeader, () => { }, () => { })
        }
    }, [wallet_address, _wallet])


    useEffect(() => {
        if (walletData?.min_topup_amount && wallet_address) {
            dataHandler("limits", {
                min: walletData?.min_topup_amount ?? data?.limits?.min,
                max: walletData?.max_topup_amount ?? data?.limits?.max
            })
            // dataHandler("amount", walletData?.min_topup_amount ?? data?.limits?.min)
            formatCurrency(formatCurrencyLocal(walletData?.min_topup_amount) ?? formatCurrencyLocal(data?.limits?.min), true, setFormattedAmount)
            setLoading(false)
        }
    }, [wallet_address, walletData])

    const limits = data?.limits || { min: 0, max: 0 };

    console.log(data?.limits, _wallet)
    useEffect(() => {
        let errorMsg = '';
        if (!data.amount || +String(data.amount ?? "")?.replaceAll(",", "") < +formatCurrencyLocal(limits.min)) {
            errorMsg = `Minimum transactional amount is ${limits.min}`;
        } else if (+String(data.amount ?? "")?.replaceAll(",", "") > +formatCurrencyLocal(limits.max)) {
            errorMsg = `Maximum transactional amount is ${limits.max}`;
        } else if (userDetails?.user?.kyc_status !== "approved" && +String(data.amount ?? "").replaceAll(",", "") > +formatCurrencyLocal(limits.max)) {
            console.log('SNAPSHOT FOR LIMIT ERROR', +String(data.amount ?? "").replaceAll(",", "") > +formatCurrencyLocal(limits.max), +String(data.amount ?? "").replaceAll(",", ""), +formatCurrencyLocal(limits.max), userDetails?.user?.kyc_status)
            errorMsg = "Invalid Amount: Your current identity verification level limits the maximum amount you can add. Please upgrade your identity verification to benefit from higher limits";
        }
        dataHandler && dataHandler('exchangeRateError', errorMsg);
    }, [data.amount, limits, userDetails?.user?.kyc_status]);

    console.log('SNAPSHOT FOR LIMIT ERROR', +String(data.amount ?? "").replaceAll(",", "") > +formatCurrencyLocal(limits.max), +String(data.amount ?? "").replaceAll(",", ""), +formatCurrencyLocal(limits.max), userDetails?.user?.kyc_status)

    return (
        loading
            ?
            <div style={{ height: "200px", width: "200px", margin: "1rem auto" }}>
                <InstaPayLoader />
            </div>
            :
            <div className={styles.container}>
                <div className={styles.amount}>
                    <label>{t("Enter Amount")}</label>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <span style={{ width: "fit-content" }}>{_wallet?.currency?.code} </span>
                        <input
                            type="text"
                            value={formattedAmount}
                            maxLength={12}
                            onChange={(e) => setFormattedAmount(e.target.value)}
                            onKeyUp={handleKeyUp}
                            onBlur={handleBlur}
                            placeholder="0.00"
                            data-type="currency"
                        />
                    </div>
                </div>
                <div className={styles.warning}>
                    <Info size={19} color="#EB8C1D" />
                    <span>
                        {
                            t(`⚠️ The transactional value should be between[Currency ISO code & Amount] - [Currency ISO code & Amount] `)
                                .replace("[Currency ISO code & Amount] - [Currency ISO code & Amount]", ` ${limits.min} - ${limits.max} `)
                                .replace("⚠️ ", "")
                        }
                    </span>
                </div>
                {
                    !data.amount || +String(data.amount ?? "")?.replaceAll(",", "") < +formatCurrencyLocal(limits.min) || +String(data.amount ?? "")?.replaceAll(",", "") > +formatCurrencyLocal(limits.max)
                        ?
                        <div style={{
                            height: "100px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "red"
                        }}>{
                                userDetails?.user?.kyc_status !== "approved" && +String(data.amount ?? "")?.replaceAll(",", "") > +formatCurrencyLocal(limits.max)
                                    ?
                                    t("⚠️ Invalid Amount: Your current  identity verification level limits the  maximum amount you can add. Please upgrade your identity verification to benefit from higher limits")
                                        .replace("⚠️ ", "")
                                    :
                                    +String(data.amount ?? "")?.replaceAll(",", "") < +formatCurrencyLocal(limits.min)
                                        ?
                                        "Minimum transactional amount is " + limits.min
                                        :
                                        +String(data.amount ?? "")?.replaceAll(",", "") > +formatCurrencyLocal(limits.max)
                                            ?
                                            "Maximum transactional amount is " + limits.max
                                            :
                                            formattedAmount ? t("Invalid Amount") : ""
                            }
                        </div>
                        :
                        ""
                }

            </div>
    )
}

export default Amount
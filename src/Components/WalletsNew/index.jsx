// import styles from "./styles/index.module.css"
import { useTranslation } from "react-i18next"
import TopRight from "../topRight"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import Top from "./Top"
import CenterContainer from "./Center"
import styles from "../TransactionsNewApi/styles/index.module.scss"
import TransactionsTable from "./TransactionTable"
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem"
import AccountLimits from "./AccountLimits"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { UserContext } from "../../Context/UserContext"
import QrGenerate from "../Settings/QrGenerate"
// import { useLocation } from "react-router"


export const getLimits = async (currentWallet, setData, authHeader, setLoading, setError, cancelToken) => {
    setLoading(true)
    setData({})
    try {
        const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-account-limits/${currentWallet?._id}`, { headers: authHeader, cancelToken })
        const dec = decryptData(res?.data?.data)
        const { topup_values, limits, limits_used } = dec.data;

        setData({
            min_topup_amount: `${topup_values.topup_min_amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
            max_topup_amount: `${topup_values.topup_max_amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
            transaction_amount_limit: `${limits?.transaction_amount_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
            balance_limits: {
                total: `${limits.account_balance_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                used: `${limits_used.account_balance_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                remaining: `${(limits.account_balance_limit - limits_used.account_balance_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
            },
            others: [
                {
                    title: "Incoming Limit",
                    color_dark: "#A1BAFF",
                    color_light: "#DCE5FF",
                    limits: {
                        daily: {
                            total: `${limits.daily_receiving_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.daily_receiving_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.daily_receiving_limit - limits_used.daily_receiving_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                        monthly: {
                            total: `${limits.monthly_receiving_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.monthly_receiving_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.monthly_receiving_limit - limits_used.monthly_receiving_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                        yearly: {
                            total: `${limits.yearly_receiving_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.yearly_receiving_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.yearly_receiving_limit - limits_used.yearly_receiving_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                    }
                },
                {
                    title: "Sending Limit",
                    color_dark: "#FFCA9C",
                    color_light: "#FFE8D4",
                    limits: {
                        daily: {
                            total: `${limits.daily_sending_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.daily_sending_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.daily_sending_limit - limits_used.daily_sending_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                        monthly: {
                            total: `${limits.monthly_sending_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.monthly_sending_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.monthly_sending_limit - limits_used.monthly_sending_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                        yearly: {
                            total: `${limits.yearly_sending_limit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            used: `${limits_used.yearly_sending_limit_used?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `,
                            remaining: `${(limits.yearly_sending_limit - limits_used.yearly_sending_limit_used)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentWallet?.currency?.code} `
                        },
                    }
                },
                {
                    title: "Allowed Number Of Transactions",
                    color_dark: "#FFA9F6",
                    color_light: "#FFDDFC",
                    limits: {
                        daily: {
                            total: limits.daily_transaction_count,
                            used: limits_used.daily_transaction_count_used,
                            remaining: limits.daily_transaction_count - limits_used.daily_transaction_count_used
                        },
                        monthly: {
                            total: limits.monthly_transaction_count,
                            used: limits_used.monthly_transaction_count_used,
                            remaining: limits.monthly_transaction_count - limits_used.monthly_transaction_count_used
                        },
                        yearly: {
                            total: limits.yearly_transaction_count,
                            used: limits_used.yearly_transaction_count_used,
                            remaining: limits.yearly_transaction_count - limits_used.yearly_transaction_count_used
                        },
                    }
                },
            ]
        })
    }
    catch (error) {
        if (error.response?.data?.data) {
            const dec = decryptData(error.response?.data?.data)
            if (axios.isCancel(error)) {
                return;
            }
            setError(dec?.message ?? "Something went wrong while fetching account limits.")
        }
    }
    finally {
        setLoading(false)
    }
}

const WalletsNew = () => {
    const { t } = useTranslation()
    const [currentWallet, setCurrentWallet] = useState(null)
    const cancelTokenRef = useRef()
    const [currentType, setCurrentType] = useState("")
    const [filtered, setFiltered] = useState([])
    const [categories, setCategories] = useState([
        {
            _id: "uncategorized",
            name: "Uncategorized",
            value: 0,
            color: "#5926f0"
        }
    ])
    useEffect(() => {
        const updatedCategories = categories.map(category => {
            const filteredTransactions = filtered.filter(trx => {
                return trx?.status?.toLowerCase() == "completed" && trx?.categories?.some(trxCat => trxCat === category._id) && trx?.transaction_type === currentType;
            });

            const totalAmount = filteredTransactions.reduce((acc, trx) => acc + trx.amount, 0);

            return {
                ...category,
                value: totalAmount
            };
        });

        // Check for uncategorized transactions
        const uncategorizedTransactions = filtered.filter(trx => trx?.status?.toLowerCase() == "completed" && (!trx.categories || trx.categories?.length === 0) && trx?.transaction_type === currentType);
        const totalUncategorizedAmount = uncategorizedTransactions.reduce((acc, trx) => acc + trx.amount, 0);

        // Check if the "uncategorized" category already exists
        const uncategorizedIndex = updatedCategories.findIndex(category => category._id === "uncategorized");

        if (uncategorizedIndex !== -1) {
            // Update the existing "uncategorized" category
            updatedCategories[uncategorizedIndex].value = totalUncategorizedAmount;
        } else {
            // Create a new category for uncategorized transactions
            const uncategorizedCategory = {
                _id: "uncategorized",
                name: "Uncategorized",
                value: totalUncategorizedAmount,
                color: "#5926f0"
            };

            // Add the uncategorized category to the updatedCategories array
            updatedCategories.push(uncategorizedCategory);
        }

        setCategories(updatedCategories);
    }, [currentType]);


    useEffect(() => {
        let timeeout;
        setCurrentType("debit")
        timeeout = setTimeout(() => {
            setCurrentType("credit")
        }, 500)
        return () => clearTimeout(timeeout)
    }, [filtered])

    const [data, setData] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const { authHeader, userWallets } = useContext(UserContext)

    useEffect(() => {
        if (currentWallet?._id) {
            if (cancelTokenRef.current) {
                cancelTokenRef.current?.cancel()
            }

            cancelTokenRef.current = axios.CancelToken.source()
            getLimits(currentWallet, setData, authHeader, setLoading, setError, cancelTokenRef.current.token)
        }

        return () => {
            if (cancelTokenRef?.current) {
                cancelTokenRef.current?.cancel();
            }
        };
    }, [currentWallet])

    const nonQrWallets = useMemo(() => {
        return userWallets?.filter(item => !item?.qrCode?.url) ?? []
    }, [userWallets])

    return (
        <>
            {
                nonQrWallets?.length > 0
                &&
                <QrGenerate
                    wallets={userWallets?.filter(item => !item?.qrCode?.url)}
                />
            }
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "1rem"
                            }}>
                                <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
                            </div>
                            <TopRight />
                        </div>
                        <div className={styles.bottom} style={{ display: "flex", flexDirection: "column", gap: "36px", marginBottom: "1rem" }}>
                            <Top
                                currentWallet={currentWallet}
                                setCurrentWallet={setCurrentWallet}
                                data={data}
                            />
                            <AccountLimits
                                data={data}
                                error={error}
                                loading={loading}
                                currentWallet={currentWallet}
                            />
                            <CenterContainer categories={categories} setCategories={setCategories} currentType={currentType} setCurrentType={setCurrentType} currentWallet={currentWallet} />
                            <TransactionsTable
                                currentWallet={currentWallet}
                                filtered={filtered}
                                setFiltered={setFiltered}
                            />
                        </div>
                    </div>
                    :
                    <div className={styles.mobile}>
                        <div className={styles.top}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "1rem"
                            }}>
                                <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
                            </div>
                            <p style={{ margin: "1rem 0 1.5rem" }}>{t("manage my Wallets and see the transaction details").split(" ").map(item => service_name_formatter(item)).join(" ")}</p>
                        </div>
                        <div className={styles.bottom} style={{ display: "flex", flexDirection: "column", gap: "36px", marginBottom: "1rem" }}>
                            <Top
                                currentWallet={currentWallet}
                                setCurrentWallet={setCurrentWallet}
                                data={data}
                            />
                            <AccountLimits
                                data={data}
                                error={error}
                                loading={loading}
                                currentWallet={currentWallet}
                            />
                            <CenterContainer categories={categories} setCategories={setCategories} currentType={currentType} setCurrentType={setCurrentType} currentWallet={currentWallet} />
                            <TransactionsTable
                                currentWallet={currentWallet}
                                filtered={filtered}
                                setFiltered={setFiltered}
                            />
                        </div>
                    </div>
            }
        </>
    )
}

export default WalletsNew
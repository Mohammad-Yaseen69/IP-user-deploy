import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { UserContext } from '../../Context/UserContext';
import InstaPayLoader from '../Loader';
import styles from "./styles/TransDetails.module.css"
import { Link } from 'react-router-dom';
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem';

const TransDetails = ({ selectedWallet }) => {
    const { t } = useTranslation()
    // const data = [
    //     {
    //         name: "No. of Txns",
    //         value: 78
    //     },
    //     {
    //         name: "Total Sent",
    //         value: "$10 K"
    //     },
    //     {
    //         name: "Total Rec.",
    //         value: "$78 K"
    //     },
    //     {
    //         name: "Refunds",
    //         value: 23
    //     },
    //     {
    //         name: "Others",
    //         value: 78
    //     },
    // ]

    const { userDetails, userWallets, authHeader, totalReferralAmount } = useContext(UserContext)
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        const getDetails = async () => {
            setIsLoading(true)
            try {
                const encrypted = encryptData({
                    from: "2023-01-01",
                    to: new Date().toISOString().split('T')[0].toString(),
                    account_id: userDetails?._id
                })
                const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-transactions-report-user/0/0`, {
                    data: encrypted
                }, {
                    headers: authHeader
                })

                const decrypted = decryptData(response.data.data)
                const defaultWalletCurrency = userWallets?.filter(item => item?._id === selectedWallet?._id)?.[0]?.currency
                const currentData = decrypted?.transactionSummary?.[defaultWalletCurrency?.code]?.total
                setData([
                    {
                        name: "Number of Transactions",
                        value: Number(currentData?.totalTransactions)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00
                    },
                    {
                        name: "Total Transaction Amount",
                        value: `${defaultWalletCurrency?.symbol ?? ""}${currentData?.totalAmounts?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00}`
                    },
                    {
                        name: "Total Sent",
                        value: `${defaultWalletCurrency?.symbol ?? ""}${currentData?.debitAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00}`
                    },
                    {
                        name: "Total Received",
                        value: `${defaultWalletCurrency?.symbol ?? ""}${currentData?.creditAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00}`
                    },
                    {
                        name: "Referral Rewards",
                        value: `${defaultWalletCurrency?.symbol ?? ""}${totalReferralAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00}`
                    }
                ])
                console.log(data)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            } finally {
                setIsLoading(false)
            }

        }
        if (userDetails) {
            getDetails()
        }
    }, [userDetails, userWallets, selectedWallet])

    return (
        <>
            <Card className={styles.pc} style={{ marginBottom: 0, flex: 2, overflowX: "auto", minWidth: "250px", scrollbarWidth: "none", borderRadius: "16px" }}>
                <CardBody className="b_card d-flex align-items-center" style={{ overflowX: "scroll", gap: "1rem", scrollbarWidth: "none" }}>
                    {
                        isLoading
                            ?
                            <div style={{ height: "70px", width: "70px", margin: "0 auto" }}>
                                <InstaPayLoader />
                            </div>
                            :
                            data.map(item => (
                                <div key={item.name} style={{ background: "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF", borderRadius: 14, padding: "1rem 1.5rem", minWidth: "fit-content", width: "123px" }}>
                                    <p style={{ marginBottom: 0, fontSize: window.innerWidth > 1500 ? ".8rem" : ".7rem", fontWeight: 500, whiteSpace: "nowrap" }}>{t(item.name)}</p>
                                    <h5 style={{ marginBottom: 0, fontSize: window.innerWidth > 1500 ? "1.5rem" : "1.1rem", fontWeight: 700, whiteSpace: "nowrap" }}>{item.value}</h5>
                                </div>
                            ))
                    }
                </CardBody>
            </Card>
            <Card className={styles.mobile} style={{ marginBottom: 0 }}>
                <div className={styles.top}>
                    <h6>{t("Analytics")}</h6>
                    <Link to={"/analytics"}>{t("see more").split(" ").map(item => service_name_formatter(item)).join(" ")}</Link>
                </div>
                <div className={styles.bottom}>
                    {
                        isLoading
                            ?
                            <div style={{ height: "70px", width: "70px", margin: "0 auto" }}>
                                <InstaPayLoader />
                            </div>
                            :
                            data.map(item => (
                                <div key={item.name}>
                                    <p style={{ marginBottom: 0 }}>{t(item.name)}</p>
                                    <h5 style={{ marginBottom: 0 }}>{item.value}</h5>
                                </div>
                            ))
                    }
                </div>

            </Card>
        </>
    );
};

export default TransDetails;

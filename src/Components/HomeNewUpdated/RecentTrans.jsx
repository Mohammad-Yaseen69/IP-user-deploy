import React, { useContext, useEffect, useState } from 'react';
import { Card, CardHeader } from 'reactstrap';
import { MoreHorizontal } from 'react-feather';
import styles from "./styles/Recents.module.css"
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import InstaPayLoader from '../Loader';
import RecentTransItem from './RecentTransItem';

const RecentTrans = ({ currentWallet }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [transactions, setTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [windowWidth, setWindowWidth] = useState(window?.innerWidth);
    const resizeHandler = () => setWindowWidth(window?.innerWidth)

    useEffect(() => {
        window.addEventListener("resize", resizeHandler)

        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setTransactions([])
            try {
                if (currentWallet) {
                    const res = await axios.get(
                        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-transactions-by-wallet/${currentWallet?.wallet_id}/0/10`,
                        {
                            headers: authHeader,
                        }
                    );

                    const decrypted = decryptData(res.data.data);
                    setIsLoading(false)


                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    console.log(decrypted);

                    decrypted.transactionList = decrypted.transactionList.map((item) => {
                        const transactionDate = new Date(item.createdAt);
                        transactionDate.setHours(0, 0, 0, 0);

                        const diffInDays = Math.floor(
                            (today.getTime() - transactionDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );

                        let headerText;

                        if (diffInDays === 0) {
                            headerText = "Today";
                        } else if (diffInDays > 0 && diffInDays <= 7) {
                            headerText = "Last Week";
                        } else if (diffInDays > 7) {
                            headerText = "Older Transaction";
                        } else {
                            headerText = "Today";
                        }
                        return {
                            ...item,
                            headerText,
                        };
                    });

                    setTransactions(decrypted.transactionList);
                }
            } catch (err) {
                return err
            } finally {
                setIsLoading(false)
            }
        };

        fetchData();
    }, [currentWallet?.wallet_id]);
    return (
        <Card style={{ marginBottom: 0, flex: 1, scrollbarWidth: "none", borderRadius: "30px", minWidth: "265px" }}>
            <CardHeader className="d-flex justify-content-between align-items-center c_h_pb">
                <h4 style={{ marginBottom: "0" }}>{t("Recent Transactions ")}</h4>
                {/* <MoreHorizontal /> */}
            </CardHeader>
            <div style={{ padding: "1rem" }} className={styles.body}>
                {/* {
                    transactions.length > 0 &&
                    <CardText className="text-muted">{t("Today")}:</CardText>
                } */}
                {
                    isLoading
                        ?
                        <InstaPayLoader />
                        :
                        <>
                            {
                                transactions.length > 0
                                    ?
                                    transactions.map((transaction, i) => (
                                        <RecentTransItem
                                            i={i}
                                            transaction={transaction}
                                            transactions={transactions}
                                            key={i}
                                            windowWidth={windowWidth}
                                        />
                                    ))
                                    :
                                    <div style={{ margin: "1rem auto", textAlign: "center" }}>{t("No Transactions")}</div>
                            }
                        </>
                }
            </div>
        </Card>
    );
};

export default RecentTrans;
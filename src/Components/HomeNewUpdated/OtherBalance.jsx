import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import styles from "./styles/OtherBalances.module.css"
import { UserContext } from '../../Context/UserContext';

const OtherBalance = () => {
    const { t } = useTranslation()
    const [blocked, setBlocked] = useState(0)
    const [available, setAvailable] = useState(0)
    const { userWallets, authHeader } = useContext(UserContext)

    const getExchangedAmounts = async (from, to, amount) => {
        if(amount == undefined) return
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                headers: authHeader
            });
            const dec = decryptData(res?.data?.data);
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
            return 0;
        } finally {
        }
    };

    useEffect(() => {
        if (userWallets?.length > 0) {
            const calculateTotal = async () => {
                const promises = userWallets.filter(item => item?.wallet_type === "insta").map(item => getExchangedAmounts(item?.currency?.code, "USD", item?.balance?.available));
                const balances = await Promise.all(promises);
                const total = balances.reduce((acc, balance) => acc + balance, 0);
                setAvailable(total ?? 0);
            };
            const calculateBlocked = async () => {
                const promises = userWallets.filter(item => item?.wallet_type === "insta").map(item => getExchangedAmounts(item?.currency?.code, "USD", item?.balance?.reserved));
                const balances = await Promise.all(promises);
                const total = balances.reduce((acc, balance) => acc + balance, 0);
                setBlocked(total ?? 0);
            };

            calculateBlocked()
            calculateTotal()
        }
    }, [userWallets]);

    return (
        <div className={styles.container}>
            <div className={styles.sub}>
                <span>{t("Blocked balance")}</span>
                <p>${blocked?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className={styles.sub}>
                <span>{t("Available balance")}</span>
                <p>${available?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </div>
    )
}

export default OtherBalance
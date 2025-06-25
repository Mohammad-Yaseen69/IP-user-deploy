import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from "./styles/OtherBalances.module.css"
import { UserContext } from '../../Context/UserContext';

const OtherBalance = () => {
    const { t } = useTranslation()
    const [blocked, setBlocked] = useState(0)
    const [available, setAvailable] = useState(0)
    const { available: availableBalance, blocked: blockedBalance } = useContext(UserContext)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (availableBalance && blockedBalance) {
            const calculateTotal = async () => {
                const total = availableBalance.reduce((acc, balance) => acc + balance, 0);
                setAvailable(total ?? 0);
            };
            const calculateBlocked = async () => {
                const total = blockedBalance.reduce((acc, balance) => acc + balance, 0);
                setBlocked(total ?? 0);
            };

            const calculate = async () => {
                setLoading(true);
                await calculateBlocked();
                await calculateTotal();
                setLoading(false);
            }
            calculate()
        }
    }, [availableBalance, blockedBalance]);

    return (
        <div className={styles.container}>
            <div className={styles.sub}>
                <span>{t("Blocked balance")}</span>
                {loading ?

                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" color='primary' role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    :
                    <p>${blocked?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                }
            </div>
            <div className={styles.sub}>
                <span>{t("Available balance")}</span>
                {loading ?

                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" color='primary' role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    :
                    <p>${(available - blocked)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                }
            </div>
        </div>
    )
}

export default OtherBalance
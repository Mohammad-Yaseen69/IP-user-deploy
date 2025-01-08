import React from 'react'
import styles from "./styles/Right.module.scss"
import TransactionsTable from './TransactionsTable'
import { useTranslation } from 'react-i18next'

const RightContainer = ({ rightContainerRef, currentWallet, filtered, setFiltered }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container} ref={rightContainerRef}>
            <h5>{t("Recent Transactions")}</h5>
            <TransactionsTable currentWallet={currentWallet} filtered={filtered} setFiltered={setFiltered} />
        </div>
    )
}

export default RightContainer
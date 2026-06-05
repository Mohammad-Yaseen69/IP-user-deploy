import React from 'react'
import styles from "./styles/index.module.css"
import { useTranslation } from 'react-i18next'
import TopRight from '../topRight'
import useWindowWidth from '../../utils/useWindowWidth'
const VirtualBank = () => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>
                        {t("My virtual bank")}
                    </h1>
                    <p>{t("Manage and monitor your InstaPay Virtual Bank Account.")}</p>
                </div>

                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>
        </div>
    )
}

export default VirtualBank

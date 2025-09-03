import React from 'react'
import styles from "../styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import bg from "../files/creation-bg.png"

const NoInvoiceScreen = ({setShowModal}) => {
    const { t } = useTranslation()
    return (
        <div className={styles.noReceiptCont}>
            <div className={styles.left}>
                <div>
                    <h3>
                        {t("You haven’t created any invoices yet.")}
                    </h3>
                    <p>
                        {t("Start by generating your first invoice in just a few steps.")}
                    </p>
                </div>


                <button onClick={() => setShowModal(true)}>
                    {t("Generate Your Invoice")}
                </button>
            </div>

            <div className={styles.right}>
                <img src={bg} alt="" />
            </div>
        </div>
    )
}

export default NoInvoiceScreen

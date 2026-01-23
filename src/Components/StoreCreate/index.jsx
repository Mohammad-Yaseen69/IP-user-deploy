import React, { useContext, useEffect } from 'react'
import styles from "../ReceiptInvoices/styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import bg from "../ReceiptInvoices/files/creation-bg.png"
import useWindowWidth from '../../utils/useWindowWidth'
import { openInNewTab } from '../../utils/Functions'
import TopRight from '../topRight'
import { useQuery } from "@tanstack/react-query"
import { apiWrapper } from "../../utils/Functions/apiWrapper"
import { UserContext } from "../../Context/UserContext"
import InstaPayLoader from '../Loader'

const StoreCreate = () => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const { userDetails } = useContext(UserContext)

    const { data, isError, isLoading } = useQuery({
        queryKey: ['UserStore'],
        enabled: !!userDetails?._id,
        queryFn: () => apiWrapper({
            server: "ecommerce",
            endpoint: `/api/store/get-account-store/${userDetails?._id}`
        }),
        retry: 1
    })

    useEffect(() => {
        if (data?.data && !isError) {
            openInNewTab("https://instapay-ecommerce.vercel.app/?showStore=true")
        }
    }, [data, isError])

    const handleCreateStore = () => {
        const eShopUrl = "https://instapay-ecommerce.vercel.app/?showStore=true"
        openInNewTab(eShopUrl)
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div style={{ width: "70%", margin: "auto" }}>
                    <InstaPayLoader />
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>
                    {t("My Store")}
                </h1>

                {width > 1000 && <TopRight />}
            </div>

            <div style={{ gridTemplateColumns: width < 800 && "1fr" }} className={styles.noReceiptCont}>
                <div className={styles.left}>
                    <div>
                        <h3>
                            {t("You haven't created any store yet.")}
                        </h3>
                        <p>
                            {t("Start by creating your first store in just a few steps.")}
                        </p>
                    </div>

                    <button onClick={handleCreateStore}>
                        {t("Create Your Store")}
                    </button>
                </div>

                <div className={styles.right}>
                    <img src={bg} alt="" />
                </div>
            </div>
        </div>
    )
}

export default StoreCreate

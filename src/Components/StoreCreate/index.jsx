import { useQuery } from "@tanstack/react-query"
import { useContext, useEffect, useState } from 'react'
import {
    Search,
    Shield,
    ShoppingBag,
    Zap
} from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from "../../Context/UserContext"
import { openInNewTab } from '../../utils/Functions'
import { apiWrapper } from "../../utils/Functions/apiWrapper"
import useWindowWidth from '../../utils/useWindowWidth'
import InstaPayLoader from '../Loader'
import bg from "../ReceiptInvoices/files/Footer Section.png"
import styles from "./index.module.scss"
import TopRight from '../topRight'
import TermsModal from "./TermsModal"
const StoreCreate = () => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const { userDetails } = useContext(UserContext)
    const [showModal, setShowModal] = useState(false);

    const StepData = [
        {
            icon: <Zap />,
            title: "Instant payments via InstaPay"
        },
        {
            icon: <ShoppingBag />,
            title: "Simple shop & order management"
        },
        {
            icon: <Shield />,
            title: "Secure and compliant transactions"
        },
        {
            icon: <Search />,
            title: "Transparent fees"
        }
    ]
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
            openInNewTab(`${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`)
        }
    }, [data, isError])

    const handleCreateStore = () => {
        const eShopUrl = `${import.meta.env.VITE_IP_ECOM_URL}/dashboard/seller?fromMain=true`
        openInNewTab(eShopUrl)
        setShowModal(false)

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
                {width > 1000 && <TopRight />}
            </div>

            <div className={styles.mainContent} style={{ gridTemplateColumns: width < 800 ? '1fr' : '1fr 1fr' }}>
                <span className={styles.MyeShop}>
                    {t("My e-Shop")}
                </span>
                <div className={styles.left}>
                    <h1>
                        {t("Welcome to")} <br />
                        <span className={styles.instaPay}>{t("InstaPay")}</span>
                        {t("-eShop")}
                    </h1>

                    <p className={styles.message}>
                        {t("Create and manage your online shop powered by InstaPay. Accept payments, manage orders, and grow your business — all from one place.")}
                    </p>

                    <div className={styles.features}>
                        {StepData.map((item, index) => (
                            <div key={index} className={styles.featureItem}>
                                <span className={styles.icon}>{item.icon}</span>
                                <span className={styles.title}>{t(item.title)}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setShowModal(true)}>{t("Get Started / Create Shop")}</button>
                    <p className={styles.links}>
                        <span className={styles.link}>
                            {t("eShop Guide")}
                        </span>

                        <span className={styles.link}>
                            · {t("FAQS")}
                        </span>

                    </p>
                </div>
                <div className={styles.right}>
                    <img src={bg} alt="Store Illustration" />
                </div>
            </div>
            {showModal && <TermsModal setShowModal={setShowModal} handleCreateStore={handleCreateStore} />}

        </div>
    );
}

export default StoreCreate

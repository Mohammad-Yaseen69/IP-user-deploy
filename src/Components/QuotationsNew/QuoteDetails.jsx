import { useMemo, useState } from 'react'
import ImageSwiperView from '../ImageSwiperView'
import arrow from "../TransactionsNewApi/files/arrow.svg"
import file from "../TransactionsNewApi/files/file.svg"
import location from "../TransactionsNewApi/files/location.svg"
import styles from "../TransactionsNewApi/styles/TransactionItemDetails.module.css"
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

const QuoteDetails = ({ item, type = "receive" }) => {
    console.log(item)
    const { t } = useTranslation()
    const [showImgPreview, setShowImgPreview] = useState(false)

    const badgeColor = useMemo(() => {
        switch (item?.status?.toLowerCase()) {
            case "initiated":
            case "bargain":
                return "#ADD8E6"
            case "completed":
                return "#28A745"
            case "rejected":
                return "#DC3545"
            case "cancelled":
                return "#C82333"
            case "submitted":
                return "#FFA500"
            case "available":
                return "#007BFF"
            case "confirmed":
                return "#218838"
            case "reversed":
                return "#FFC107"
            case "declined":
                return "#C82333"
            default:
                return "#FFA500"
                break;
        }
    }, [item])

    const navigate = useNavigate()
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.amount}>
                    <div className={styles.top}>
                        <span>
                            {t("Amount")}
                        </span>
                        <div className={styles.badge} style={{ background: badgeColor }}>
                            {t(item?.status)}
                        </div>
                    </div>
                    <h5>
                        {Number(item?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.amount_reciever_currency?.currency?.code}
                    </h5>
                </div>
                {
                    item?.revised_amount
                    &&
                    <div className={styles.er_item}>
                        <span>{t("Revised Amount").replace("Revised", type === "receive" ? "Revised" : "Bargained")}: {Number(item?.revised_amount ?? 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item?.amount_reciever_currency?.currency?.code} </span>
                    </div>
                }
                <div className={styles.er_item}>
                    <span>{t("Bargainable")}: {item?.bargain ? "Yes" : "No"} </span>
                </div>
            </div>
            <div className={styles.right}>
                <div className={styles.row}>
                    <div className={styles.row_left}>
                        <div className={styles.r_item}>
                            <span>{t("Recipient")}: </span>
                            <div className={styles.recipient} onClick={() => navigate(`/profile/${item?.[type === "receive" ? "sender" : "reciever"]?.username}`)}>
                                <div className={styles.dp}>
                                    {
                                        item?.[type === "receive" ? "sender" : "reciever"]?.account_type === "individual"
                                            ?
                                            item?.[type === "receive" ? "sender" : "reciever"]?.user?.first_name[0]
                                            :
                                            item?.[type === "receive" ? "sender" : "reciever"]?.company?.company_name[0]
                                    }
                                </div>
                                <div className={styles.r_details}>
                                    <h5>
                                        {
                                            item?.[type === "receive" ? "sender" : "reciever"]?.account_type === "individual"
                                                ?
                                                `${item?.[type === "receive" ? "sender" : "reciever"]?.user?.first_name} ${item?.[type === "receive" ? "sender" : "reciever"]?.user?.last_name}`
                                                :
                                                item?.[type === "receive" ? "sender" : "reciever"]?.company?.company_name
                                        }
                                    </h5>
                                    {
                                        item?.[type === "receive" ? "sender" : "reciever"]?.username
                                        &&
                                        <p>@{item?.[type === "receive" ? "sender" : "reciever"]?.username}</p>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            item?.title
                            &&
                            <div className={styles.r_item}>
                                <span>{t("Title")}: </span>
                                <p className={styles.p_type}>{item?.title}</p>
                            </div>
                        }
                        {
                            item?.desc
                            &&
                            <div className={styles.r_item}>
                                <span>{t("Description")}: </span>
                                <p className={styles.p_type}>{item?.desc}</p>
                            </div>
                        }
                    </div>
                    {
                        item?.map?.url
                        &&
                        <div className={styles.row_right}>
                            <div className={styles.map}>
                                <div className={styles.top}>
                                    <span>{t("Transaction Map")}:</span>
                                    <img src={arrow} alt="" />
                                </div>
                                <div className={styles.address}>
                                    <img src={location} alt="" />
                                    <span>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quo molestiae laboriosam perspiciatis</span>
                                </div>
                                <img src={"https://www.pakimag.com/files/2013/02/Map-Sukkur-District.jpg"} alt="" className={styles.map_img} />
                            </div>
                        </div>
                    }
                </div>
                <div className={styles.files}>
                    <span>{t("Attached Files")}</span>
                    <div className={styles.files_count}>
                        <img src={file} alt="" />
                        <span>{item?.images?.length} File</span>
                    </div>
                    {
                        item?.images && item?.images?.length > 0
                            ?
                            <>
                                <span className={styles.open_btn} onClick={() => setShowImgPreview(true)}>
                                    {t("Open")}
                                </span>
                                {
                                    showImgPreview
                                    &&
                                    <ImageSwiperView
                                        isOpen={showImgPreview}
                                        toggle={() => setShowImgPreview(false)}
                                        images={item?.images}
                                    />
                                }
                            </>
                            :
                            ""
                    }
                </div>
            </div>
        </div >
    )
}

export default QuoteDetails
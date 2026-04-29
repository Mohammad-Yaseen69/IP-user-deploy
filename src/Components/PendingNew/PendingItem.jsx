import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Check, ChevronDown, ChevronRight, X } from "react-feather"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router"
import { Button } from "reactstrap"
import { UserContext } from "../../Context/UserContext"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import countries from "../PaymentsNewer/CountriesData.json"
import styles from "../TransactionsNewApi/styles/index.module.scss"
import more_info from "./more_info.module.scss"
import PendingItemDetails from "./PendingItemDetails.jsx"
import ReviewModal from "./ReviewModal"


const PendingItem = ({ color, item, activeItem, setActiveItem, index, type = "received", authHeader }) => {
    const { t } = useTranslation()
    const [status, setStatus] = useState(item?.status)
    const [step, setStep] = useState(1)
    const [country, setCountry] = useState(null)
    const navigate = useNavigate("")
    const { verifyToken, userWallets, userDetails } = useContext(UserContext)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [allRating, setAllRating] = useState(0)
    const [allReviews, setAllReviews] = useState([])
    const [currentImage, setCurrentImage] = useState("")
    const queryClient = useQueryClient()

    console.log(item)

    useEffect(() => setStatus(item?.status), [item])
    useEffect(() => setStep(item?.status?.toLowerCase() === "completed" ? 3 : 1), [item, activeItem])
    useEffect(() => {
        const filtered = countries.filter(coun => coun.name.toLowerCase() === item?.sender?.country_name?.toLowerCase())[0]
        setCountry(filtered)
    }, [item])

    const currentWallet = userWallets.filter(it => it.wallet_id === item?.wallet_id)[0]


    const rejectRequest = async () => {
        try {
            verifyToken()
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/decline-payment-request/${item.reference_id}`, {
                headers: authHeader
            })
            const decrypted = decryptData(res.data.data)
            // console.log(decrypted)
            navigate("/payment-requests")
            setStatus("cancelled")
            await queryClient.invalidateQueries({ queryKey: ['receivedPaymentRequests', userDetails?._id] })
            await queryClient.invalidateQueries({ queryKey: ['sentPaymentRequests', userDetails?._id] })

        } catch (error) {
            console.log(error)
        }
    }
    const service_name_formatter = (itemName) => {
        if (itemName) {
            const nameArr = itemName.split("_")
            const newName = nameArr.map(item => item = `${item[0].toUpperCase()}${item?.slice(1)}`).join(" ")
            return newName;
        }
        return "abc"
    }

    useEffect(() => {
        if (activeItem === index + 1) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-seller-reviews/${item?.sender?._id}/0/0`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted)
                    if (decrypted?.reviews?.length > 0) {
                        const overAllRating = decrypted.reviews?.reduce((acc, rat) => acc += rat.rating, 0)
                        setAllRating(overAllRating / decrypted?.reviewsCount)
                        // console.log(decrypted)
                        setAllReviews(decrypted?.reviews)
                    }
                })
                .catch(err => {
                    // console.log(err)
                    // console.log(decryptData(err.response.data.data))
                })
        }
    }, [activeItem])



    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const id = queryParams.get("id")
    const link_type = queryParams.get("type")

    const itemRef = useRef(null)

    useLayoutEffect(() => {
        if (id && id === item?._id) {
            itemRef.current.scrollIntoView({ behavior: "smooth" })
        }
        if (link_type && id) {
            if (link_type.toLowerCase() === "reply") {
                if (id === item?.seller_comment || id === item?.buyer_comment) {
                    itemRef.current.scrollIntoView({ behavior: "smooth" })
                    setShowReviewModal(true)
                    setActiveItem(index + 1)
                }
            }
            if (link_type.toLowerCase() === "review") {
                if (id === item?._id) {
                    itemRef.current.scrollIntoView({ behavior: "smooth" })
                    setShowReviewModal(true)
                    setActiveItem(index + 1)
                }
            }
        }
    }, [id])

    function capitalizeStatus(str) {
        return str.toLowerCase() === "bargain-accepted" ? "Bargain-Accepted" : str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    return (
        <div ref={itemRef}>
            <div className={styles.body_item} onClick={() => {
                if (!activeItem || activeItem !== index + 1) {
                    setActiveItem(index + 1)
                } else {
                    setActiveItem(0)
                }
            }}>
                {/* <div>{date_to_string(item?.createdAt)}</div> */}
                <div>{new Date(item?.createdAt)?.toLocaleString()}</div>
                <div>{item?.reference_id}</div>
                <div>{service_name_formatter(item?.service_type)}</div>
                <div>
                    {
                        type === "received"
                            ?
                            <>
                                {/* {`${item?.sender?.user?.first_name || item?.sender?.user?.company_name} ${item?.sender?.user?.last_name}`.length > 15 ? `${item?.sender?.user?.first_name || item?.sender?.user?.company_name} ${item?.sender?.user?.last_name}`?.slice(0, 15) + ".." : `${item?.sender?.user?.first_name || item?.sender?.user?.company_name} ${item?.sender?.user?.last_name}`} */}
                                {`${item?.sender?.user?.first_name || item?.sender?.company?.company_name || item?.sender?.company_name} ${item?.sender?.user?.last_name ?? ""}`.slice(0, 24)}
                            </>
                            :
                            <>
                                {`${item?.receiver?.user?.first_name || item?.receiver?.company?.company_name || item?.receiver?.company_name} ${item?.receiver?.user?.last_name ?? ""}`.slice(0, 24)}
                                {/* {`${item?.receiver?.user?.first_name || item?.receiver?.user?.company_name} ${item?.receiver?.user?.last_name}`?.length > 15 ? `${item?.receiver?.user?.first_name || item?.receiver?.user?.company_name} ${item?.receiver?.user?.last_name}`?.slice(0, 15) + ".." : `${item?.receiver?.user?.first_name || item?.receiver?.user?.company_name} ${item?.receiver?.user?.last_name}`} */}
                            </>
                    }
                </div>
                <div>{item?.currency?.code} {item?.amount ? item?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}</div>
                <div>
                    <div style={{
                        background: color,
                        fontSize: "12px",
                        color: "white",
                        width: "100px",
                        margin: "0 auto",
                        padding: "5px",
                        borderRadius: "30px"
                    }}>{t(capitalizeStatus(status))}</div>
                </div>
                {
                    type === "received" && status.toLowerCase() === "pending"
                        ?
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
                            <div style={{
                                flex: "none",
                                borderRadius: "9.938px",
                                background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                boxShadow: "0px 3.3125px 5.79688px 0px rgba(172, 53, 159, 0.31)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "34px",
                                width: "34px",
                                minHeight: "34px",
                                minWidth: "34px",
                                aspectRatio: 1
                            }} onClick={() => setActiveItem(index + 1)}>
                                <Check color="white" />
                            </div>
                            <div style={{
                                borderRadius: "9.938px",
                                flex: "none",
                                background: "linear-gradient(to top left,#e1e1e1,#e2e2e2,#b5b5b5)",
                                boxShadow: "0px 3.3125px 5.79688px 0px rgba(172, 53, 159, 0.31)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: "34px",
                                minWidth: "34px",
                                aspectRatio: 1
                            }} onClick={(e) => {
                                e.stopPropagation()
                                rejectRequest()
                            }}>
                                <X color="#fff" />
                            </div>
                        </div>
                        :
                        <div>{t("No Actions")}</div>
                }
                <div style={{ maxWidth: "15px" }}>{
                    activeItem === index + 1
                        ?
                        <ChevronDown />
                        :
                        <ChevronRight />
                }</div>
            </div>
            {
                activeItem === index + 1 && type === "received"
                    ?
                    <PendingItemDetails
                        item={item}
                        key={item?._id}
                        allRating={allRating}
                        allReviews={allReviews}
                        badgeColor={color}
                        type={type}
                    />
                    :
                    ""
            }
            {
                activeItem === index + 1 && type === "send"
                &&
                <div className={more_info.sent_more}>
                    <div className={more_info.sm_left}>
                        <span>
                            {t("You Requested")}
                        </span>
                        <h4>
                            {item?.currency?.code} {item?.amount ? item?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                        </h4>
                    </div>
                    <div className={more_info.sm_right}>
                        <div className={more_info.smr_left}>
                            <span>{t("Via:")} </span>
                            <div>
                                <p>{currentWallet?.currency?.code} </p>
                                <span>{currentWallet?.currency?.code} {currentWallet?.balance?.available?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        {
                            item?.status.toLowerCase().includes("complete")
                            &&
                            <div className={more_info.smr_right} style={{ justifyContent: "space-between" }}>
                                <span>
                                    {
                                        item?.seller_comment
                                            ?
                                            t("You Left A Review")
                                            :
                                            t("How Was Your Experience?")
                                    }
                                </span>
                                <Button onClick={() => setShowReviewModal(!showReviewModal)}>
                                    {
                                        item?.seller_comment || item?.seller_reply
                                            ?
                                            t("Check Now")
                                            :
                                            t("Leave A Review")
                                    }
                                </Button>
                            </div>
                        }
                    </div>
                    <ReviewModal isOpen={showReviewModal} toggle={() => setShowReviewModal(!showReviewModal)} item={item} type="Send" />
                </div>
            }
            {/* {
                activeItem === index + 1
                &&
                <div style={{
                    display: "flex",
                    padding: "1rem",
                    flexDirection: "column",
                    gap: "1rem",
                    background: "white"
                }}>
                    {
                        item?.description
                        &&
                        <div className={t_styles.t_item}>
                            <span>{t("Note")}:</span>
                            <div>
                                <h5 style={{ marginBottom: 0 }}>{item?.description}</h5>
                            </div>
                        </div>
                    }
                    {
                        item?.attachments?.length > 0
                        &&
                        <div className={t_styles.t_item}>
                            <span>{t("Attachments")}:</span>
                            <div style={{
                                display: "flex",
                                gap: ".75rem",
                                maxWidth: "100%",
                                overflowX: "auto"
                            }}>
                                {
                                    item?.attachments?.map(it => (
                                        <img key={it?.key} src={it?.url} alt="" style={{
                                            height: "60px",
                                            width: "60px",
                                            objectFit: "cover",
                                            borderRadius: "16px"
                                        }}
                                            onClick={() => setCurrentImage({
                                                src: it?.url,
                                                index: it?.key
                                            })}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    }
                    {
                        currentImage
                        &&
                        <ImagePreviewModal
                            currentImage={currentImage}
                            isOpen={currentImage}
                            toggle={() => setCurrentImage("")}
                        />
                    }
                </div>
            } */}
        </div>
    )
}

export default PendingItem

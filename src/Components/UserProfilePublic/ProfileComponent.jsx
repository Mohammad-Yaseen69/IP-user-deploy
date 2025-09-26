import { Card, CardBody, CardText, Input, Modal, ModalBody, ModalHeader } from "reactstrap"
// import cover from "./files/cover.png"
import cover_1 from "./files/cover_1.png"
import cover_2 from "./files/cover_2.png"
import cover_3 from "./files/cover_3.png"
import styles from "./styles/index.module.scss"
import countries from "../PaymentsNewer/CountriesData.json"
import copy from "./files/copy.svg"
import download from "./files/download.svg"
import Rating from "react-rating"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import ReportModal from "./ReportModal"
// import PortfolioItem from "../UserProfile/PortfolioItem"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { getCroppedImg, UserContext } from "../../Context/UserContext"
import InstaPayLoader from "../Loader"
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem"
import verified from "../../assets/verified.png"
import PortfolioItem from "../Profile/PortfolioItem"
import NotFound from "../NotFound"
import Linkify from "linkify-react"
import "linkify-plugin-hashtag";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'

export const reviews = [
    {
        name: "John Doe",
        relation: "Friend",
        rating: 4.5,
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente fugiat ullam, tempora labore minima natus quod magnam nam iste! Optio repudiandae exercitationem tenetur est voluptatem necessitatibus expedita error eum quam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam beatae voluptatibus nobis nostrum perferendis at laboriosam tempora velit. Iure consectetur nesciunt praesentium corrupti facilis quasi minus magni necessitatibus dignissimos accusantium quos sapiente impedit eligendi odit incidunt ipsa, rerum deserunt suscipit iusto illum repellat inventore velit. Dolorem perferendis atque modi possimus!"
    },
    {
        name: "John Doe",
        relation: "Friend",
        rating: 4.5,
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente fugiat ullam, tempora labore minima natus quod magnam nam iste! Optio repudiandae exercitationem tenetur est voluptatem necessitatibus expedita error eum quam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam beatae voluptatibus nobis nostrum perferendis at laboriosam tempora velit. Iure consectetur nesciunt praesentium corrupti facilis quasi minus magni necessitatibus dignissimos accusantium quos sapiente impedit eligendi odit incidunt ipsa, rerum deserunt suscipit iusto illum repellat inventore velit. Dolorem perferendis atque modi possimus!"
    },
]

const ProfileComponent = () => {
    const [winWidth, setWinWidth] = useState(window?.innerWidth)
    const { t } = useTranslation()
    const resizeHandler = () => setWinWidth(window?.innerWidth);
    useEffect(() => {
        window.addEventListener("resize", resizeHandler)
        return () => window.removeEventListener("resize", resizeHandler)
    }, [])

    const [socials_data, setSocialData] = useState([
        {
            name: "Instagram",
            followers: "0" + t("Followers"),
        },
        {
            name: "Facebook",
            followers: "0" + t("Followers"),
        },
        {
            name: "Whatsapp",
            followers: null,
        },
    ])
    const [showMore, setShowMore] = useState(false)

    // get user name from params
    const { user_name } = useParams()

    // covers
    const covers = [cover_1, cover_2, cover_3]

    // user details
    const [userCover, setUserCover] = useState(covers[Math.trunc(Math.random() * 3)])
    const [userDp, setUserDp] = useState("")
    const [userDetails, setUserDetails] = useState("")
    const [userCountry, setUserCountry] = useState({})
    const [userWallet, setUserWallet] = useState({})
    const [currentRevTab, setCurrentRevTab] = useState("Seller");
    const [userReviewsAsSeller, setUserReviewsAsSeller] = useState([])
    const [userReviewsAsBuyer, setUserReviewsAsBuyer] = useState([])
    const [userPortfolio, setUserPortfolio] = useState([]);
    const [averageRatingAsSeller, setAverageRatingAsSeller] = useState(0)
    const [averageRatingAsBuyer, setAverageRatingAsBuyer] = useState(0)
    const [totalReviewsAsSeller, setTotalReviewsAsSeller] = useState(0)
    const [totalReviewsAsBuyer, setTotalReviewsAsBuyer] = useState(0)
    const [loading, setLoading] = useState(true)
    const [croppedDp, setCroppedDp] = useState("")
    const [croppedCover, setCroppedCover] = useState("")
    const [portfolioSwiper, setPortfolioSwiper] = useState(null)

    useEffect(() => {
        const getFollowers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/get-social-media-details-public/${user_name?.toLowerCase()}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log(dec)
                const data = Object.keys(dec?.data)?.map(item => {
                    return {
                        name: `${service_name_formatter(item)}: `,
                        followers: typeof dec?.data?.[item] === "number" ? dec?.data?.[item] + " " + t("Followers") : dec?.data?.[item]
                    }
                })
                setSocialData(data)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
            }
        }
        if (user_name) {

            getFollowers()

            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-cover/${user_name?.toLowerCase()}`)
                .then(async (res) => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted, "cover-picture")
                    setUserCover(decrypted?.coverPicture?.coverImage ?? covers[Math.trunc(Math.random() * 3)])
                    const img = await getCroppedImg(decrypted?.coverPicture?.coverImage, decrypted?.coverPicture?.coordinates)
                    const imageUrl = URL.createObjectURL(img)
                    setCroppedCover(imageUrl)
                })
                .catch(err => {
                })

            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-profile/${user_name?.toLowerCase()}`)
                .then(async (res) => {
                    const decrypted = decryptData(res.data.data)
                    console.log(decrypted.profilePicture, "profile-picture")
                    setUserDp(decrypted?.profilePicture?.profileImage ?? "")
                    const img = await getCroppedImg(decrypted?.profilePicture?.profileImage, decrypted?.profilePicture?.coordinates)
                    const imageUrl = URL.createObjectURL(img)
                    setCroppedDp(imageUrl)
                })
                .catch(err => {
                })

            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-details/${user_name?.toLowerCase()}`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserDetails(decrypted?.userProfileInfo)
                    const filtered = countries.find(item => item.alpha3 === decrypted?.userProfileInfo?.country_iso_code)
                    setUserCountry(filtered)
                })
                .catch(err => {
                })
                .finally(() => setLoading(false))

            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-default-wallet/${user_name?.toLowerCase()}`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserWallet(decrypted.defaultWallet)
                })
                .catch(err => {
                })

            // reviews
            // seller
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-reviews/${user_name?.toLowerCase()}/seller/0/0`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserReviewsAsSeller(decrypted?.userReviews?.reviews)
                    setAverageRatingAsSeller(decrypted?.userReviews?.averageRating)
                    setTotalReviewsAsSeller(decrypted?.userReviews?.totalNumberOfReviews)
                })
                .catch(err => {
                })

            // buyer
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-reviews/${user_name?.toLowerCase()}/buyer/0/0`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserReviewsAsBuyer(decrypted?.userReviews?.reviews)
                    setAverageRatingAsBuyer(decrypted?.userReviews?.averageRating)
                    setTotalReviewsAsBuyer(decrypted?.userReviews?.totalNumberOfReviews)
                })
                .catch(err => {
                })

            // portfolio
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-documents/${user_name?.toLowerCase()}/0/0/portfolio`)
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setUserPortfolio(decrypted?.result)
                })
                .catch(err => {
                })

        }
    }, [user_name])

    console.log(userDp, "  adfaf", userCover, "niglet ")

    const [showAboutModal, setShowAboutModal] = useState(false)

    // report 
    const [showReportModal, setShowReportModal] = useState(false)
    const [reported, setReported] = useState(false)
    const { userDetails: loggedInUser, authHeader } = useContext(UserContext)

    useEffect(() => {
        const getReportStatus = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/report/get-report-status/${loggedInUser?._id}/${user_name?.toLowerCase()}`, {
                    headers: authHeader
                })
                const data = decryptData(res.data.data)
                setReported(data?.isReported)
            } catch (error) {
                const decrypted = decryptData(error?.response?.data?.data)
                // console.log(decrypted)
            }
        }

        if (loggedInUser && user_name) {
            getReportStatus()
        }
    }, [loggedInUser, user_name])

    const [showVerTT, setShowVerTT] = useState(false)

    return (
        <>
            {
                loading
                    ?
                    <div style={{ width: "100%" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    userDetails
                        ?
                        <div className={styles.container}>
                            <img src={croppedCover || userCover || covers[Math.trunc(Math.random() * 3)]} alt="cover" className={styles.cover} style={{ height: "300px", width: "100%", objectFit: "cover", borderRadius: "30px 30px 0 0" }} />
                            <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
                                <CardBody className={styles.sc_body}>


                                    {/* basic info */}
                                    <div className={styles.top}>
                                        <div className={styles.left}>
                                            {
                                                userDp
                                                    ?
                                                    <img src={croppedDp || userDp} className={styles.dp} alt="profile" style={{ background: "transparent" }} />
                                                    :
                                                    <div className={styles.dp} style={{ overflow: "hidden" }}>{userDetails?.first_name?.[0] || userDetails?.company_name?.[0]}</div>
                                            }
                                            <div className={styles.basic_dets}>
                                                <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal") : t("Business")} {t("Account")}</div>
                                                {/* <div className={styles.badge} style={{ background: userDetails?.kyc_status === "approved" ? "green" : "grey" }}>{userDetails?.kyc_status === "approved" ? "Verified" : "Unverified"}</div> */}
                                                <div style={{ /*display: "flex", gap: ".5rem", alignItems: "center",*/ position: "relative" }}>
                                                    <h4 style={{ marginBottom: 0, display: "inline", marginRight: ".3rem" }}>{userDetails?.first_name || userDetails?.company_name} {userDetails?.last_name || ''}</h4>
                                                    {
                                                        userDetails?.kyc_status === "approved"
                                                        &&
                                                        <>
                                                            <img onMouseEnter={() => setShowVerTT(true)} onMouseLeave={() => setShowVerTT(false)} src={verified} alt="" style={{ height: window.innerWidth > 780 ? "25px" : "17px", width: window.innerWidth > 780 ? "25px" : "17px", objectFit: "contain", transform: "translateY(-2px)" }} />
                                                            {
                                                                showVerTT
                                                                &&
                                                                <div style={{
                                                                    position: "absolute",
                                                                    top: "100%",
                                                                    right: "0",
                                                                    background: "#5926f0",
                                                                    color: "white",
                                                                    fontSize: window.innerWidth > 780 ? ".8rem" : ".65rem",
                                                                    fontWeight: 500,
                                                                    padding: window.innerWidth > 780 ? "6px 18px" : "3px 10px",
                                                                    borderRadius: window.innerWidth > 780 ? "8px" : "4px",
                                                                    whiteSpace: "nowrap"
                                                                }}>{t("User Identity Verified")}</div>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                                <div style={{ fontSize: ".8rem" }}>@{user_name?.toLowerCase()}</div>
                                                <div className={styles.country}>
                                                    <img src={userCountry?.file_url} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                                                    <span>{userCountry?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.top_right}>
                                            {
                                                userDetails?.about_me
                                                &&
                                                <div className={styles.about}>
                                                    <h5>{t("About Me:")}</h5>
                                                    <p>{userDetails?.about_me?.length > 150 ? userDetails?.about_me + ".." : userDetails?.about_me}</p>
                                                    {
                                                        userDetails?.about_me?.length > 150
                                                        &&
                                                        <p style={{ fontSize: "12px", color: "black", cursor: "pointer" }} onClick={() => setShowAboutModal(!showAboutModal)}>{t("Read more")} {">"}</p>
                                                    }
                                                    <Modal isOpen={showAboutModal} toggle={() => setShowAboutModal(!showAboutModal)}>
                                                        <ModalHeader toggle={() => setShowAboutModal(!showAboutModal)}>
                                                            {t("About")}
                                                        </ModalHeader>
                                                        <ModalBody>
                                                            <Linkify
                                                                options={{
                                                                    target: "_blank",
                                                                    formatHref: {
                                                                        hashtag: (href) => `https://www.google.com/search?q=${encodeURIComponent(href?.replace("#", ""))}`,
                                                                    },
                                                                }}
                                                                as={"p"}
                                                            >
                                                                {userDetails?.about_me}
                                                            </Linkify>
                                                        </ModalBody>
                                                    </Modal>
                                                </div>
                                            }
                                        </div>
                                    </div>


                                    {/* social info */}
                                    <div className={styles.social_info} style={{ flexWrap: "wrap" }}>
                                        {
                                            socials_data.slice(0, showMore ? socials_data.length - 1 : 3).map(item => (
                                                <div className={styles.item} key={item.name}>
                                                    <div className={styles.left}>
                                                        <span>{item.name}</span>
                                                        {
                                                            item?.name?.toLowerCase()?.includes("instagram") && userDetails?.insta_username
                                                                ?
                                                                <a target='_blank' href={`https://www.instagram.com/${userDetails?.insta_username}`} style={{ cursor: "pointer", color: "#5926f0", fontSize: ".65rem" }} rel="noreferrer">@{userDetails?.insta_username}</a>
                                                                : ""

                                                        }
                                                    </div>
                                                    <div className={styles.right}>
                                                        {
                                                            item.followers !== null
                                                            &&
                                                            <span>{item.followers}</span>
                                                        }
                                                        <div>{">"}</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        <div className={styles.item} style={{ cursor: "pointer" }} onClick={() => setShowMore(!showMore)}>
                                            <div className={styles.left}>
                                                <span>{
                                                    showMore ? t("Less") : t("More")}</span>
                                            </div>
                                            <div className={styles.right}>
                                                <div>{">"}</div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* qr and rating */}
                                    <div className={styles.qr_rating}>
                                        <Card style={{ marginBottom: 0 }} className={styles.qr_container}>
                                            <CardBody className={styles.qr_body}>
                                                <div style={{
                                                    padding: "1px",
                                                    borderRadius: "15px",
                                                    background: "linear-gradient(155deg, #e64067, #5926f0), #fff",
                                                    // width: winWidth > 1780 ? "194px" : "160px",
                                                    width: "fit-content"
                                                }}>
                                                    <img src={userWallet?.qrCode?.url} alt="QR Code" className={styles.qr_code}
                                                        style={{
                                                            width: "100% !important",
                                                            height: "100%",
                                                            objectFit: "fill",
                                                            borderRadius: "15px",
                                                            alignSelf: "center"
                                                        }}
                                                    />
                                                </div>
                                                <div className={styles.qr_info}>
                                                    <h5>{t("InstaPay ID:")}</h5>
                                                    <div className={`${styles.qri_box} ${styles.qri_box_p}`}>
                                                        <span>INSTA-{userWallet?.wallet_id}</span>
                                                        <img src={copy} alt="c" style={{ cursor: "pointer" }} onClick={() => {
                                                            navigator.clipboard.writeText(userWallet?.wallet_id)
                                                            toast.success(userWallet?.wallet_id + " copied to clipboard.")
                                                        }} />
                                                    </div>
                                                    <div className={`${styles.qri_box} ${styles.qri_box_g}`}>
                                                        <span>{t("Download QR Code")}</span>
                                                        <a href={userWallet?.qrCode?.url} download={true}>
                                                            <img src={download} alt="d" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className={styles.rating_actions}>
                                            <div className={styles.rating}>
                                                <p>{t("Overall Ratings")}</p>
                                                <h4>{currentRevTab === "Seller" ? averageRatingAsSeller?.toFixed(1) : averageRatingAsBuyer?.toFixed(1)}/5.0</h4>
                                                <div>
                                                    <Rating initialRating={currentRevTab === "Seller" ? averageRatingAsSeller : averageRatingAsBuyer} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                                </div>
                                                <span>{currentRevTab === "Seller" ? totalReviewsAsSeller : totalReviewsAsBuyer} {t("ratings")}</span>
                                            </div>
                                            <div className={styles.actions}>
                                                <Link to={`/payments?payment_action=req_money&username=${user_name?.toLowerCase()}`} className={styles.action}>
                                                    <span>{t("Request Payment")}</span>
                                                </Link>
                                                <Link to={`/payments?payment_action=send_money&send_type=wallet&wallet_id=${userWallet?.wallet_id}`} className={styles.action}>
                                                    <span>{t("Initiate A Payment")}</span>
                                                </Link>
                                                <button className={styles.action} style={{
                                                    background: "rgba(230, 64, 103, 0.16)"
                                                }}
                                                    disabled={reported}
                                                    onClick={() => reported ? "" : setShowReportModal(true)}
                                                >
                                                    <span>{reported ? t("Reported") : t("Report this person")}</span>
                                                </button>
                                                <ReportModal user={userDetails} isOpen={showReportModal} toggle={() => setShowReportModal(!showReportModal)} setReported={setReported} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.feed_reviews}>
                                        <div className={styles.feed}>
                                            <h5>{t("Portfolio")}:</h5>
                                            <div className={styles.posts}>
                                                {winWidth < 600 ? (
                                                    <>
                                                        <Swiper
                                                            modules={[Pagination]}
                                                            pagination={{ clickable: true, el: '.portfolio-swiper-pagination' }}
                                                            spaceBetween={10}
                                                            slidesPerView={1}
                                                            style={{ width: '100%' }}
                                                            onSwiper={setPortfolioSwiper}
                                                        >
                                                            {userPortfolio && userPortfolio.length > 0 ?
                                                                userPortfolio.filter(item => item?.file_type?.includes("video") ? item?.jw_media?.status === "ready" : item).map((item, ind) => (
                                                                    <SwiperSlide key={ind}>
                                                                        <PortfolioItem item={item} />
                                                                    </SwiperSlide>
                                                                ))
                                                                :
                                                                <div className="text-center my-4 align-self-center" style={{ flex: 1 }}>{t("No Portfolio Items")}</div>
                                                            }
                                                        </Swiper>
                                                        <div className="portfolio-swiper-pagination" style={{ marginTop: 12, textAlign: 'center' }} />
                                                    </>
                                                ) : (
                                                    userPortfolio && userPortfolio.length > 0 ?
                                                        userPortfolio.filter(item => item?.file_type?.includes("video") ? item?.jw_media?.status === "ready" : item).map((item, ind) => (
                                                            <PortfolioItem item={item} key={ind} />
                                                        ))
                                                        :
                                                        <div className="text-center my-4 align-self-center" style={{ flex: 1 }}>{t("No Portfolio Items")}</div>
                                                )}
                                            </div>
                                            <div className={styles.see_more}>
                                                {t("See More")} {">"}
                                            </div>
                                        </div>
                                        <div className={styles.reviews}>
                                            <h5>{t("Recent Reviews")}:</h5>
                                            <div className={styles.tabs}>
                                                <div style={{
                                                    background: currentRevTab === "Seller" ? "rgba(109, 41, 220, 0.1)" : "#fff",
                                                }} onClick={() => setCurrentRevTab("Seller")}>
                                                    {t("Reviews As Buyer")}
                                                </div>
                                                <div style={{
                                                    background: currentRevTab === "Buyer" ? "rgba(109, 41, 220, 0.1)" : "#fff",
                                                }} onClick={() => setCurrentRevTab("Buyer")}>
                                                    {t("Reviews As Seller")}
                                                </div>
                                            </div>
                                            <div className={styles.reviews_body}>
                                                {
                                                    currentRevTab === "Buyer" && (
                                                        userReviewsAsBuyer.length > 0
                                                            ? userReviewsAsBuyer
                                                                .sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt))
                                                                .map((item) => (
                                                                    <div key={item._id} className={styles.review_card}>
                                                                        <div className={styles.rc_top}>
                                                                            <div className={styles.rct_left}>
                                                                                {
                                                                                    item?.buyer?.profileImage?.url
                                                                                        ? <img src={item?.buyer?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                                                        : <div className={styles.rctl_dp}>{item?.buyer?.user?.first_name?.[0] || item?.buyer?.user?.company_name?.[0]}</div>
                                                                                }
                                                                                <div className={styles.rctl_dets}>
                                                                                    <h5>{item?.buyer?.user?.first_name || item?.buyer?.user?.company_name} {item?.buyer?.user?.last_name || ''}</h5>
                                                                                    <span>{item?.buyer?.account_type}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles.rc_rating}>
                                                                            <Rating initialRating={item?.rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                                                        </div>
                                                                        <p>{item?.comment}</p>
                                                                        {
                                                                            item?.reply && (
                                                                                <div className={styles.reply_review_card}>
                                                                                    <div className={styles.rc_top}>
                                                                                        <div className={styles.rct_left}>
                                                                                            <div className={styles.rctl_top}>
                                                                                                <span>{t("Replied to ")}</span>
                                                                                                <div>{item?.buyer?.user?.first_name || item?.buyer?.user?.company_name} {item?.buyer?.user?.last_name || ''}</div>
                                                                                            </div>
                                                                                            <div className={styles.rctl_bottom}>
                                                                                                {
                                                                                                    userDp
                                                                                                        ? <img src={userDp} alt="dp" className={styles.rctl_dp} style={{ boxShadow: "0 0 3px #1111111e" }} />
                                                                                                        : <div className={styles.rctl_dp}>{userDetails?.first_name?.[0] || userDetails?.company_name?.[0]}</div>
                                                                                                }
                                                                                                <div className={styles.rctl_dets}>
                                                                                                    <div className={styles.seller_res_badge}>{t("Seller Response")}</div>
                                                                                                    <h5>{userDetails?.first_name || userDetails?.company_name} {userDetails?.last_name || ''}</h5>
                                                                                                    <span>{userDetails?.account_type}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p>{item?.reply}</p>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                ))
                                                            : <div className="text-center my-3" style={{ color: "#666" }}>{t("No Buyer Reviews Found")}</div>
                                                    )
                                                }
                                                {
                                                    currentRevTab === "Seller" && (
                                                        userReviewsAsSeller.length > 0
                                                            ? userReviewsAsSeller
                                                                .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
                                                                .map((item) => (
                                                                    <div key={item._id} className={styles.review_card}>
                                                                        <div className={styles.rc_top}>
                                                                            <div className={styles.rct_left}>
                                                                                {
                                                                                    item?.seller?.profileImage?.url
                                                                                        ? <img src={item?.seller?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                                                        : <div className={styles.rctl_dp}>{item?.seller?.user?.first_name?.[0] || item?.seller?.user?.company_name?.[0]}</div>
                                                                                }
                                                                                <div className={styles.rctl_dets}>
                                                                                    <h5>{item?.seller?.user?.first_name || item?.seller?.user?.company_name} {item?.seller?.user?.last_name || ''}</h5>
                                                                                    <span>{item?.seller?.account_type}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles.rc_rating}>
                                                                            <Rating initialRating={item?.rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                                                        </div>
                                                                        <p>{item?.comment}</p>
                                                                    </div>
                                                                ))
                                                            : <div className="text-center my-3" style={{ color: "#666" }}>{t("No Seller Reviews Found")}</div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        :
                        <NotFound />
                // <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                //     <CardBody>
                //         <CardText>No User Found. <Link to={"/"} onClick={verifyToken} style={{ textDecoration: "underline", fontWeight: 600 }}>Go back to Dashboard</Link></CardText>
                //     </CardBody>
                // </Card>
            }
        </>
    )
}

export default ProfileComponent
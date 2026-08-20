import { Card, CardBody, Input, Modal, ModalBody, ModalHeader } from "reactstrap"
import cover from "../UserProfilePublic/files/cover_1.png"
import styles from "./styles/index.module.scss"
import countries from "../PaymentsNewer/CountriesData.json"
import ig from "./files/ig.svg"
import wa from "./files/wa.svg"
import x from "./files/x.svg"
import more from "./files/more.svg"
import QRCode from 'qrcode.react';
import copy from "./files/copy.svg"
import download from "./files/download.svg"
import Rating from "react-rating"
import { useContext, useEffect, useState } from "react"
import { Heart, MoreHorizontal, Share2 } from "react-feather"
import init from "./files/init.svg"
import req from "./files/req.svg"
import report from "./files/report.svg"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import AddPortfolioItem from "../Portfolio/AddPortfolioItem"
import PortfolioItem from "./PortfolioItem"
import InstaPayLoader from "../Loader"
import { useTranslation } from "react-i18next"

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
    const { userPortfolio, userDetails, getUserDocuments } = useContext(UserContext)
    const [userCountry, setUserCountry] = useState({})
    const [userWallet, setUserWallet] = useState({})
    const [currentRevTab, setCurrentRevTab] = useState("Seller");
    const [userReviewsAsSeller, setUserReviewsAsSeller] = useState([])
    const [userReviewsAsBuyer, setUserReviewsAsBuyer] = useState([])
    const [showAddPortfolio, setShowAddPortfolio] = useState(false)
    const [averageRatingAsSeller, setAverageRatingAsSeller] = useState(0)
    const [averageRatingAsBuyer, setAverageRatingAsBuyer] = useState(0)
    const [totalReviewsAsSeller, setTotalReviewsAsSeller] = useState(0)
    const [totalReviewsAsBuyer, setTotalReviewsAsBuyer] = useState(0)
    const toggleAddPortfolio = () => setShowAddPortfolio(!showAddPortfolio)
    const [isLoading, setIsLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userDetails) {
                    const { country_name, username } = userDetails;

                    // Fetch user country
                    const filteredCountry = countries.find(item => item.name.toLowerCase().includes(country_name.toLowerCase()));
                    setUserCountry(filteredCountry);

                    if (username) {
                        // Fetch default wallet
                        const walletResponse = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-default-wallet/${username}`);
                        const decryptedWallet = decryptData(walletResponse.data.data);
                        setUserWallet(decryptedWallet?.defaultWallet);

                        // Fetch user reviews as seller
                        const sellerReviewsResponse = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-reviews/${username}/seller/0/5`);
                        const decryptedSellerReviews = decryptData(sellerReviewsResponse.data.data);
                        setUserReviewsAsSeller(decryptedSellerReviews?.userReviews?.reviews);
                        setAverageRatingAsSeller(decryptedSellerReviews?.userReviews?.averageRating)
                        setTotalReviewsAsSeller(decryptedSellerReviews?.userReviews?.totalNumberOfReviews)

                        // Fetch user reviews as buyer
                        const buyerReviewsResponse = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/user/get-user-reviews/${username}/buyer/0/5`);
                        const decryptedBuyerReviews = decryptData(buyerReviewsResponse.data.data);
                        setUserReviewsAsBuyer(decryptedBuyerReviews?.userReviews?.reviews);
                        setAverageRatingAsBuyer(decryptedBuyerReviews?.userReviews?.averageRating)
                        setTotalReviewsAsBuyer(decryptedBuyerReviews?.userReviews?.totalNumberOfReviews)
                    }
                }
                setIsLoading(false)
            } catch (error) {
                const decryptedError = decryptData(error.response?.data?.data);
                // console.log(decryptedError);
                setIsLoading(false)
            }
        };
        if (userDetails) {
            fetchData();
            getUserDocuments()
        }
    }, [userDetails]);

    const resizeHandler = () => setWinWidth(window?.innerWidth);
    useEffect(() => {
        window.addEventListener("resize", resizeHandler)
        return () => window.removeEventListener("resize", resizeHandler)
    }, [])

    const socials_data = [
        {
            name: "Instagram",
            followers: "10K Followers",
            icon: ig
        },
        {
            name: "X",
            followers: "1K Followers",
            icon: x
        },
        {
            name: "Whatsapp",
            followers: null,
            icon: wa
        },
        {
            name: "More",
            followers: null,
            icon: more
        },
    ]


    const [showAboutModal, setShowAboutModal] = useState(false)

    return (
        <div className={styles.container}>
            <AddPortfolioItem isOpen={showAddPortfolio} toggle={toggleAddPortfolio} />
            <img src={userDetails?.coverImage?.url ?? cover} alt="cover" className={styles.cover} style={{ height: "300px", width: "100%", objectFit: "cover", borderRadius: "30px 30px 0 0" }} />
            <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
                <CardBody className={styles.sc_body}>


                    {/* basic info */}
                    <div className={styles.top}>
                        <div className={styles.left}>
                            {
                                userDetails?.profileImage?.url
                                    ?
                                    <img src={userDetails?.profileImage?.url} className={styles.dp} alt="profile picture" />
                                    :
                                    <div className={styles.dp}>{userDetails?.user?.first_name?.[0] || userDetails?.company?.company_name?.[0]}</div>
                            }
                            <div className={styles.basic_dets}>
                                <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal") : t("Business")} {t("Account")}</div>
                                <h4>{userDetails?.user?.first_name || userDetails?.company?.company_name} {userDetails?.user?.last_name || ''}</h4>
                                <div className={styles.country}>
                                    <img src={userCountry?.file_url} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                                    <span>{t(userCountry?.name)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.top_right}>
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
                                    <ModalBody>{userDetails?.about_me}</ModalBody>
                                </Modal>
                            </div>
                            <div className={styles.tr_icons}>
                                <div className={styles.tri_icon}><Heart /></div>
                                <div className={styles.tri_icon}><Share2 /></div>
                            </div>
                        </div>
                    </div>


                    {/* social info */}
                    <div className={styles.social_info}>
                        {
                            socials_data.map(item => (
                                <div className={styles.item} key={item.name}>
                                    <div className={styles.left}>
                                        <img src={item.icon} alt={item.name} />
                                        <span>{t(item.name)}</span>
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
                    </div>


                    {/* qr and rating */}
                    <div className={styles.qr_rating}>
                        <Card style={{ marginBottom: 0 }} className={styles.qr_container}>
                            <CardBody className={styles.qr_body}>
                                <img src={userWallet?.qrCode?.url} alt="QR Code" className={styles.qr_code}
                                    style={{
                                        height: winWidth > 1780 ? "194px" : "160px",
                                        width: winWidth > 1780 ? "194px" : "160px",
                                        alignSelf: "center"
                                    }}
                                />
                                <div className={styles.qr_info}>
                                    <h5>{t("InstaPay ID:")}</h5>
                                    <div className={`${styles.qri_box} ${styles.qri_box_p}`}>
                                        <span>{t("INSTA-")}{userWallet?.wallet_id}</span>
                                        <img src={copy} alt="c" />
                                    </div>
                                    <div className={`${styles.qri_box} ${styles.qri_box_g}`}>
                                        <span>{t("Download QR Code")}</span>
                                        <img src={download} alt="d" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <div className={styles.rating_actions}>
                            <div className={styles.rating}>
                                <p>{t("Overall Ratings")}</p>
                                <h4>{currentRevTab === "Seller" ? averageRatingAsSeller : averageRatingAsBuyer}/5</h4>
                                <div>
                                    <Rating initialRating={currentRevTab === "Seller" ? averageRatingAsSeller : averageRatingAsBuyer} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                </div>
                                <span>{currentRevTab === "Seller" ? totalReviewsAsSeller : totalReviewsAsBuyer} {t("ratings")}</span>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.action}>
                                    <div>
                                        <img src={req} alt="req" />
                                    </div>
                                    <span>{t("Request A Quote")}</span>
                                </button>
                                <button className={styles.action}>
                                    <div>
                                        <img src={init} alt="init" />
                                    </div>
                                    <span>{t("Initiate A Payment")}</span>
                                </button>
                                <button className={styles.action} style={{
                                    background: "rgba(230, 64, 103, 0.16)"
                                }}>
                                    <img src={report} alt="report" />
                                    <span>{t("Report this person")}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.feed_reviews}>
                        <div className={styles.feed}>
                            <h5>{t("My Portfolio:")}</h5>
                            <div className={styles.posts}>
                                <div style={{
                                    height: "231px",
                                    width: "231px",
                                    minWidth: "231px",
                                    background: "rgba(0,0,0,.6)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "20px",
                                }}>
                                    <button style={{
                                        padding: "7px 14px",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "50px",
                                        background: "#FFF",
                                        color: "black"
                                    }} onClick={toggleAddPortfolio}>{t("Add Now")}</button>
                                </div>
                                {
                                    userPortfolio && userPortfolio.length > 0
                                        ?
                                        userPortfolio.map((item, ind) => (
                                            <>
                                                {
                                                    item
                                                    &&
                                                    <PortfolioItem item={item} key={ind} />
                                                }
                                            </>
                                        ))
                                        :
                                        <div className="text-center my-4">{t("No Portfolio Items")}</div>
                                }
                            </div>
                            <div className={styles.see_more}>
                                {t("See More")} {">"}
                            </div>
                        </div>
                        <div className={styles.reviews}>
                            <h5>{t("Recent Reviews:")}</h5>
                            <div style={{ display: "flex", width: "100%", marginBottom: "1rem", gap: ".25rem" }}>
                                <div style={{
                                    padding: "16px",
                                    textAlign: "center",
                                    flex: 1,
                                    background: currentRevTab === "Seller" ? "rgba(109, 41, 220, 0.1)" : "#fff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    border: "2px solid rgba(17, 17, 17, 0.05)",
                                    transition: ".25s",
                                    borderRadius: "20px",
                                    cursor: "pointer"
                                }} onClick={() => setCurrentRevTab("Seller")}>
                                    {t("Reviews As Seller")}
                                </div>
                                <div style={{
                                    padding: "16px",
                                    textAlign: "center",
                                    flex: 1,
                                    background: currentRevTab === "Buyer" ? "rgba(109, 41, 220, 0.1)" : "#fff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    border: "2px solid rgba(17, 17, 17, 0.05)",
                                    transition: ".25s",
                                    borderRadius: "20px",
                                    cursor: "pointer"
                                }} onClick={() => setCurrentRevTab("Buyer")}>
                                    {t("Reviews As Buyer")}
                                </div>
                            </div>
                            <div className={styles.reviews_body}>
                                {
                                    isLoading
                                        ?
                                        <div style={{ height: "300px" }}>
                                            <InstaPayLoader />
                                        </div>
                                        :
                                        <>
                                            {
                                                currentRevTab === "Buyer" && userReviewsAsBuyer.length > 0
                                                    ?
                                                    userReviewsAsBuyer.map((item) => (
                                                        <div key={item._id} className={styles.review_card}>
                                                            <div className={styles.rc_top}>
                                                                <div className={styles.rct_left}>
                                                                    {
                                                                        userDetails?.profileImage?.url
                                                                            ?
                                                                            <img src={userDetails?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                                            :
                                                                            <div className={styles.rctl_dp}>{userDetails?.user?.first_name?.[0] || userDetails?.company?.company_name?.[0]}</div>
                                                                    }
                                                                    <div className={styles.rctl_dets}>
                                                                        <h5>{userDetails?.user?.first_name || userDetails?.company?.company_name} {userDetails?.user?.last_name || ''}</h5>
                                                                        <span>{userDetails?.account_type}</span>
                                                                    </div>
                                                                </div>
                                                                {/* <MoreHorizontal size={30} /> */}
                                                            </div>
                                                            <div className={styles.rc_rating}>
                                                                <Rating initialRating={item?.rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                                            </div>
                                                            <p>{item?.comment}</p>
                                                        </div>
                                                    ))
                                                    : ""

                                            }
                                            {
                                                currentRevTab === "Seller" && userReviewsAsSeller.length > 0
                                                    ?
                                                    userReviewsAsSeller.map((item) => (
                                                        <div key={item._id} className={styles.review_card}>
                                                            <div className={styles.rc_top}>
                                                                <div className={styles.rct_left}>
                                                                    {
                                                                        userDetails?.profileImage?.url
                                                                            ?
                                                                            <img src={userDetails?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                                            :
                                                                            <div className={styles.rctl_dp}>{userDetails?.user?.first_name?.[0] || userDetails?.company?.company_name?.[0]}</div>
                                                                    }
                                                                    <div className={styles.rctl_dets}>
                                                                        <h5>{userDetails?.user?.first_name || userDetails?.company?.company_name} {userDetails?.user?.last_name || ''}</h5>
                                                                        <span>{userDetails?.account_type}</span>
                                                                    </div>
                                                                </div>
                                                                {/* <MoreHorizontal size={30} /> */}
                                                            </div>
                                                            <div className={styles.rc_rating}>
                                                                <Rating initialRating={item?.rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                                            </div>
                                                            <p>{item?.comment}</p>
                                                        </div>
                                                    ))
                                                    : ""

                                            }</>
                                }
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default ProfileComponent
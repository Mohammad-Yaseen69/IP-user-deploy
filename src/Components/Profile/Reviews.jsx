import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/index.module.scss"
import InstaPayLoader from '../Loader'
import { UserContext } from '../../Context/UserContext'
import { MoreHorizontal } from 'react-feather'
import Rating from 'react-rating'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'


const Reviews = ({ currentRevTab, setCurrentRevTab, userReviewsAsBuyer, userReviewsAsSeller, setUserReviewsAsBuyer, setAverageRatingAsBuyer, setTotalReviewsAsBuyer, setUserReviewsAsSeller, setAverageRatingAsSeller, setTotalReviewsAsSeller }) => {
    const { userDetails } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)
    const { t } = useTranslation()

    useEffect(() => {
        const getUserReviewsAsBuyer = async () => {
            setIsLoading(true)
            try {
                const buyerReviewsResponse = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user/get-user-reviews/${userDetails?.username}/buyer/0/0`);
                const decryptedBuyerReviews = decryptData(buyerReviewsResponse.data.data);
                setUserReviewsAsBuyer(decryptedBuyerReviews?.userReviews?.reviews);
                setAverageRatingAsBuyer(decryptedBuyerReviews?.userReviews?.averageRating)
                setTotalReviewsAsBuyer(decryptedBuyerReviews?.userReviews?.totalNumberOfReviews)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            } finally {
                setIsLoading(false)
            }
        }

        const getUserReviewsAsSeller = async () => {
            setIsLoading(true)
            try {
                const sellerReviewsResponse = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user/get-user-reviews/${userDetails?.username}/seller/0/0`);
                const decryptedSellerReviews = decryptData(sellerReviewsResponse.data.data);
                setUserReviewsAsSeller(decryptedSellerReviews?.userReviews?.reviews);
                setAverageRatingAsSeller(decryptedSellerReviews?.userReviews?.averageRating)
                setTotalReviewsAsSeller(decryptedSellerReviews?.userReviews?.totalNumberOfReviews)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            } finally {
                setIsLoading(false)
            }
        }

        if (userDetails) {
            currentRevTab === "Buyer" ? getUserReviewsAsBuyer() : getUserReviewsAsSeller()
        }
    }, [currentRevTab, userDetails])
    const navigate = useNavigate()

    return (
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
                                    userReviewsAsBuyer.sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt)).map((item) => (
                                        <div key={item._id} className={styles.review_card}>
                                            <div className={styles.rc_top}>
                                                <div className={styles.rct_left} style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${item?.buyer?.username}`)}>
                                                    {
                                                        item?.buyer?.profileImage?.url
                                                            ?
                                                            <img src={item?.buyer?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                            :
                                                            <div className={styles.rctl_dp}>{item?.buyer?.user?.first_name?.[0]}</div>
                                                    }
                                                    <div className={styles.rctl_dets}>
                                                        <h5>{item?.buyer?.user?.first_name} {item?.buyer?.user?.last_name}</h5>
                                                        <span>{item?.buyer?.account_type}</span>
                                                    </div>
                                                </div>
                                                {/* <MoreHorizontal size={30} /> */}
                                            </div>
                                            <div className={styles.rc_rating}>
                                                <Rating initialRating={item?.rating} emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" readonly></Rating>
                                            </div>
                                            <p>{item?.comment}</p>
                                            {
                                                item?.reply
                                                &&
                                                <div className={styles.reply_review_card}>
                                                    <div className={styles.rc_top}>
                                                        <div className={styles.rct_left}>
                                                            <div className={styles.rctl_top}>
                                                                <span>Replied to </span>
                                                                <div style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${item?.buyer?.username}`)}>{item?.buyer?.user?.first_name} {item?.buyer?.user?.last_name}</div>
                                                            </div>
                                                            <div className={styles.rctl_bottom} style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${userDetails?.username}`)}>
                                                                {
                                                                    userDetails?.profileImage?.url
                                                                        ?
                                                                        <img src={userDetails?.profileImage?.url} alt="dp" className={styles.rctl_dp} style={{ boxShadow: "0 0 3px #1111111e" }} />
                                                                        :
                                                                        <div className={styles.rctl_dp}>{userDetails?.user?.first_name?.[0]}</div>
                                                                }
                                                                <div className={styles.rctl_dets}>
                                                                    <div className={styles.seller_res_badge}>
                                                                        Seller Response
                                                                    </div>
                                                                    <h5 style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${userDetails?.username}`)}>{userDetails?.user?.first_name} {userDetails?.user?.last_name}</h5>
                                                                    <span>{userDetails?.account_type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <MoreHorizontal size={30} /> */}
                                                    </div>
                                                    <p>{item?.reply}</p>
                                                </div>
                                            }
                                        </div>
                                    ))
                                    : ""

                            }
                            {
                                currentRevTab === "Seller" && userReviewsAsSeller.length > 0
                                    ?
                                    userReviewsAsSeller.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)).map((item) => (
                                        <div key={item._id} className={styles.review_card}>
                                            <div className={styles.rc_top}>
                                                <div className={styles.rct_left} style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${item?.seller?.username}`)}>
                                                    {
                                                        item?.seller?.profileImage?.url
                                                            ?
                                                            <img src={item?.seller?.profileImage?.url} alt="dp" className={styles.rctl_dp} />
                                                            :
                                                            <div className={styles.rctl_dp}>{item?.seller?.user?.first_name?.[0]}</div>
                                                    }
                                                    <div className={styles.rctl_dets}>
                                                        <h5>{item?.seller?.user?.first_name} {item?.seller?.user?.last_name}</h5>
                                                        <span>{item?.seller?.account_type}</span>
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
    )
}

export default Reviews
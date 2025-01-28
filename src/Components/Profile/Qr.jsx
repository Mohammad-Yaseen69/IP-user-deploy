import React, { useContext, useEffect, useState } from 'react'
import Rating from 'react-rating'
import { Card, CardBody } from 'reactstrap'
import styles from "./styles/index.module.scss"
import copy from "./files/copy.svg"
import download from "./files/download.svg"
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const Qr = ({ currentRevTab, averageRatingAsBuyer, averageRatingAsSeller, totalReviewsAsBuyer, totalReviewsAsSeller }) => {
    const { t } = useTranslation()
    const [userWallet, setUserWallet] = useState({})
    const { userDetails, authHeader } = useContext(UserContext)
    const [profieInfo, setProfileInfo] = useState({})

    useEffect(() => {
        const getWalletDetails = async () => {
            try {
                const walletResponse = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/user/get-default-wallet/${userDetails?.username}`, { headers: authHeader });
                const decryptedWallet = decryptData(walletResponse.data.data);
                setUserWallet(decryptedWallet?.defaultWallet);
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            }
        }

        const getProfilePendings = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-pending-reports/${userDetails?._id}`, { headers: authHeader })
                const data = decryptData(res.data.data)
                setProfileInfo(data)
            } catch (error) {
                // console.log(decryptData(error?.response?.data?.data))
            }
        }

        if (userDetails) {
            getWalletDetails()
            getProfilePendings()
        }
    }, [userDetails])


    const [winWidth, setWinWidth] = useState(window?.innerWidth)

    useEffect(() => {
        const resizeHandler = () => setWinWidth(window?.innerWidth);
        window.addEventListener("resize", resizeHandler)
        return () => window.removeEventListener("resize", resizeHandler)
    }, [])
    return (
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
                                objectFit: "cover",
                                borderRadius: "15px",
                                alignSelf: "center"
                            }}
                        />
                    </div>
                    <div className={styles.qr_info}>
                        <h5>InstaPay ID:</h5>
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
                    <span>{currentRevTab === "Seller" ? totalReviewsAsSeller?.toFixed(1) : totalReviewsAsBuyer?.toFixed(1)} {t("ratings")}</span>
                </div>
                <div className={styles.actions}>
                    <Link to={"/quotations"} className={styles.action}>
                        <span>{t("Pending")} {t("Quotations")}: </span>
                        <span>{profieInfo?.quotationCounts ?? 0}</span>
                    </Link>
                    <Link to={"/payment-requests"} className={styles.action}>
                        <span>{t("Pending")} {t("Payments")}: </span>
                        <span>{profieInfo?.paymentCounts ?? 0}</span>
                    </Link>
                    <button className={styles.action} style={{
                        background: "rgba(230, 64, 103, 0.16)",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ textAlign: "left" }}>{t("Profile")} {t("Reports")}: </span>
                        <span>{profieInfo?.reportCounts ?? 0}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Qr
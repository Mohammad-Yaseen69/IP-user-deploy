import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/index.module.css"
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Badge } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'

function calculateDateDifference(inputDate) {
    const inputDateTime = new Date(inputDate);
    const currentDate = new Date();

    const differenceInMilliseconds = currentDate - inputDateTime;
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    if (differenceInSeconds < 60) {
        return `${differenceInSeconds}s ago`;
    }

    const differenceInMinutes = Math.floor(differenceInSeconds / 60);

    if (differenceInMinutes < 60) {
        return `${differenceInMinutes}m ago`;
    }

    const differenceInHours = Math.floor(differenceInMinutes / 60);

    if (differenceInHours < 24) {
        return `${differenceInHours}h ago`;
    }

    const differenceInDays = Math.floor(differenceInHours / 24);

    if (differenceInDays < 7) {
        return `${differenceInDays}d ago`;
    }

    const differenceInWeeks = Math.floor(differenceInDays / 7);

    if (differenceInWeeks < 4) {
        return `${differenceInWeeks}w ago`;
    }

    const differenceInMonths = Math.floor(differenceInDays / 30);

    return `${differenceInMonths}m ago`;
}

const Notification = ({ notification, currentUser }) => {
    const [status, setStatus] = useState(notification?.status)
    const [link, setLink] = useState("")
    const { userDetails } = useContext(UserContext)

    useEffect(() => {
        // console.log(notification)
        if (notification.type === "quotation") {
            if (notification.desc.toLowerCase().includes("create")) {
                setLink(`/quotations?tab=received&type=created&_id=${notification?.link_id}`)
            }
            else if (notification.desc.toLowerCase().includes("bargain")) {
                setLink(`/quotations?tab=sent&type=bargain&_id=${notification?.link_id}`)
            }
            else if (notification.desc.toLowerCase().includes("revise")) {
                setLink(`/quotations?tab=received&type=revise&_id=${notification?.link_id}`)
            }
            else {
                setLink(`/quotations?tab=received&type=completed&_id=${notification?.link_id}`)
            }
        }
        if (notification.type === "wallet_to_wallet") {
            if (notification.desc.toLowerCase().includes("subscribed transaction") || notification.desc.toLowerCase().includes("scheduled transaction")) {
                setLink("/other-transactions")
            }
            else {
                setLink(`/transactions`)
            }
        }
        if (notification.type === "payment_request") {
            if (notification.desc.toLowerCase().includes("accepted") || notification.desc.toLowerCase().includes("rejected")) {
                setLink(`/payment-requests?tab=sent&id=${notification.link_id}`)
            }
            else if (notification.desc.toLowerCase().includes("received")) {
                setLink(`/payment-requests?tab=received&id=${notification.link_id}`)
            }
            else {
                setLink("/payment-requests")
            }
        }
        if (notification.type === "request_review") {
            if (notification.desc.toLowerCase().includes("reply")) {
                setLink(`/payment-requests?tab=received&id=${notification.link_id}&type=reply`)
            }
            if (notification.desc.toLowerCase().includes("review")) {
                if (notification?.to === userDetails?._id) {
                    setLink(`/payment-requests?tab=received&id=${notification.link_id}&type=review`)
                } else {
                    setLink(`/payment-requests?tab=sent&id=${notification.link_id}&type=review`)
                }
            }
        }
        if (notification.type === "referral_signup") {
            setLink("/referrals")
        }
    }, [notification])


    const updateNotificationStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/notification/update-notification-status/${notification?._id}`)
            const data = await decryptData(response.data.data)
            setStatus(data?.notification?.status)
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
        }
    }

    return (
        <Link
            to={link}
            onClick={updateNotificationStatus}
            style={{ display: "flex", alignItems: "center", gap: ".5rem", justifyContent: "space-between", position: "relative" }}
            className={styles.notif}
        >
            <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: ".5rem" }}>
                {
                    currentUser?.profile_picture
                        ?
                        <img src={currentUser?.profile_picture} alt="n" style={{
                            width: "30px",
                            height: "30px",
                            objectFit: "cover",
                            borderRadius: "20px"
                        }} />
                        :
                        <div style={{
                            minWidth: "30px",
                            minHeight: "30px",
                            borderRadius: "25px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            color: "white",
                            fontSize: ".8rem",
                            fontWeight: 800
                        }}>
                            {
                                currentUser?.account_type?.toLowerCase() === "individual"
                                    ?
                                    currentUser?.first_name?.[0]?.toUpperCase()
                                    :
                                    currentUser?.company_name?.[0]?.toUpperCase()
                            }
                        </div>
                }
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".4rem", width: "100%" }}>
                        <h4 style={{ fontSize: ".8rem", fontWeight: 600, marginBottom: "-5px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {
                                currentUser?.account_type?.toLowerCase() === "individual"
                                    ?
                                    `${currentUser?.first_name} ${currentUser?.last_name}`
                                    :
                                    currentUser?.company_name
                            }
                        </h4>
                        <span style={{ fontSize: ".6rem", fontWeight: 500, color: "#8c8c8c", whiteSpace: "nowrap" }}>
                            {calculateDateDifference(notification?.createdAt)}
                        </span>
                    </div>
                    <Badge style={{ fontSize: ".45rem", borderRadius: "3px" }}>{currentUser?.account_type?.toUpperCase()}</Badge>
                    <h5 style={{ fontSize: ".7rem", fontWeight: 600, marginBottom: 0, color: "black", marginTop: "5px" }}>{notification?.title}</h5>
                    <p style={{ fontSize: ".6rem", color: "#a8a8a8", marginBottom: 0 }}>{notification?.desc}</p>
                </div>
            </div>
            {
                status === "unread"
                &&
                <div style={{
                    background: "rgb(109, 41, 220)",
                    minHeight: "10px",
                    minWidth: "10px",
                    borderRadius: "10px",
                    position: "absolute",
                    top: "50%",
                    right: "1rem",
                    transform: "translateY(-50%)"
                }} />
            }
        </Link>
    )
}

export default Notification
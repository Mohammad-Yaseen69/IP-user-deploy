import { useContext, useEffect, useRef, useState } from "react";
import notf from "../topRight/notf.svg"
import { Col } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { FaBell } from "react-icons/fa6";
import axios from "axios";
import Notification from "./Notification";
import { useTranslation } from "react-i18next";

const Notifications = () => {
    const [showDropDown, setShowDropDown] = useState(false)
    const { t } = useTranslation()
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Function to handle clicks outside the dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Click was outside the dropdown, hide it
                setShowDropDown(false);
            }
        };

        // Add a click event listener to the document
        document.addEventListener("click", handleClickOutside);

        return () => {
            // Remove the event listener when the component unmounts
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);


    const { userDetails, authHeader } = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const getNotifications = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/notification/get-notifications/${userDetails?._id}`, {
                    headers: authHeader
                });

                const decrypted = await decryptData(response?.data?.data);
                setNotifications(decrypted?.notification || []);
            } catch (error) {}
        };

        if (userDetails) {
            getNotifications();
        }
    }, [userDetails]);

    useEffect(() => {
        const handleNewNotification = (event) => {
            const newNotif = event.detail;
            if (newNotif) {
                setNotifications((prev) => [newNotif, ...(prev || [])]);
            }
        };

        window.addEventListener('instapay:new_notification', handleNewNotification);
        return () => {
            window.removeEventListener('instapay:new_notification', handleNewNotification);
        };
    }, []);

    return (
        <div ref={dropdownRef}>
            <Col xs="auto" style={{
                padding: ".5rem",
                boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "10px",
                border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                cursor: "pointer",
                position: "relative"
            }} onClick={() => setShowDropDown(!showDropDown)}>
                <FaBell size={23} />
                {
                    notifications.some(item => item?.status === "unread")
                    &&
                    <div style={{
                        background: "rgb(109, 41, 220)",
                        minHeight: "10px",
                        minWidth: "10px",
                        borderRadius: "10px",
                        position: "absolute",
                        top: "-5px",
                        right: "-5px"
                    }} />
                }
                {
                    showDropDown
                    &&
                    <div style={{
                        position: "absolute",
                        top: "110%",
                        right: "0",
                        display: "flex",
                        flexDirection: "column",
                        width: "300px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        background: "#fff",
                        padding: ".5rem",
                        boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                        border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                        borderTop: "none",
                        borderRadius: "10px",
                        zIndex: 10000,
                        gap: "10px"
                    }} onClick={() => setShowDropDown(!showDropDown)}>
                        {
                            notifications.length > 0
                                ?
                                notifications
                                    .sort((a, b) => {
                                        // if (a.status === "unread" && b.status === "read") return -1;
                                        // if (a.status === "read" && b.status === "unread") return 1;

                                        return new Date(b.createdAt) - new Date(a.createdAt);
                                    })
                                    .map(item => (
                                        <Notification
                                            notification={item}
                                            currentUser={item?.fromDetails?._id === userDetails?._id ? item?.toDetails : item?.fromDetails}
                                            key={item?._id}
                                        />
                                    ))
                                :
                                <div style={{ margin: "1rem auto" }}>{t("No notification")}</div>
                        }
                    </div>
                }
            </Col>
        </div>
    )
}

export default Notifications
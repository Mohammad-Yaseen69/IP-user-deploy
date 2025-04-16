import styles from "./styles/index.module.css"
import Home from "./files/Home.svg"
import Card from "./files/Card.svg"
import qr from "./files/qr.svg"
import sm from "./files/sm.svg"
import Filter from "./files/Filter.svg"
import Analytics from "./files/Analytics.svg"
import Home_a from "./files/Home_a.svg"
import Card_a from "./files/Card_a.svg"
import Filter_a from "./files/Filter_a.svg"
import Analytics_a from "./files/Analytics_a.svg"
import logo from "../../assets/images/logo/logo.png"
import { Link, useLocation } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { MobileSbContext } from "../Layout"
import { UserContext } from "../../Context/UserContext"
import signup from "../SidebarNew/files/signup.svg"
import login from "../SidebarNew/files/login.svg"
import { useTranslation } from "react-i18next"


const BottomNav = ({ setShowModal }) => {
    const { toggleSidebar } = useContext(MobileSbContext)
    const { userDetails, profileCompletedPercentage, verifyToken } = useContext(UserContext)
    const [dontShow, setDontShow] = useState(false)
    const location = useLocation()


    useEffect(() => {
        if (location.pathname.includes("pin")) {
            console.log("Dont show")
            setDontShow(true)
        } else {
            setDontShow(false)
        }
    }, [location.pathname])


    const navData = userDetails ? [
        {
            icon: Home,
            icon_active: Home_a,
            link: "/dashboard/default",
            type: "link",
            width: "29px",
            height: "28px"
        },
        {
            icon: Card,
            icon_active: Card_a,
            link: "/wallets",
            type: "link",
            width: "29px",
            height: "27px"
        },
        {
            icon: logo,
            link: "/",
            type: "button"
        },
        {
            icon: Analytics,
            icon_active: Analytics_a,
            link: "/analytics",
            type: "link",
            width: "29px",
            height: "22px"
        },
        {
            icon: Filter,
            icon_active: Filter_a,
            link: "",
            type: "text",
            width: "29px",
            height: "28px"
        },
    ] : [
        {
            icon: signup,
            icon_active: signup,
            link: "/signup",
            type: "link",
            width: "29px",
            height: "22px",
        },
        {
            icon: logo,
            link: "/",
            type: "button"
        },
        {
            icon: login,
            icon_active: login,
            link: "/login",
            type: "link",
            width: "29px",
            height: "22px",
        },
    ]

    const { t } = useTranslation()
    const [showFixed, setShowFixed] = useState(false)
    return !dontShow ? (
        <>
            <nav className={styles.bottom_nav} onClick={() => {
                if (profileCompletedPercentage < 100) {
                    setShowModal(true)
                }
            }}>
                <ul className={styles.bn_list}>
                    {
                        navData.map(item => (
                            <li key={item.icon} className={`${styles.bnl_item} ${window.location.pathname === item.link && styles.bnli_a}`}>
                                {
                                    item.type === "link"
                                        ?
                                        <Link to={item.link} onClick={verifyToken}>
                                            <img src={window.location.pathname === item.link ? item.icon_active : item.icon} alt="icon" height={item.height} width={item.width} />
                                            <div></div>
                                        </Link>
                                        :
                                        item.type === "button"
                                            ?
                                            <button onClick={() => {
                                                if (!userDetails?.username) return;
                                                setShowFixed(true)
                                            }}>
                                                <img src={item.icon} alt="icon" style={{ transform: "translateX(1px)" }} />
                                            </button>
                                            :
                                            <img src={window.location.pathname === item.link ? item.icon_active : item.icon} alt="icon" height={item.height} width={item.width} onClick={() => toggleSidebar()} />
                                }
                            </li>
                        ))
                    }
                </ul>
            </nav>
            {
                showFixed && userDetails?.username
                    ?
                    <div className={styles.fixed} onClick={() => setShowFixed(false)}>
                        <Link to={"/payments?payment_action=send_money"} onClick={verifyToken}>
                            <div className={`${styles.f_btn} ${styles.f_btn_w}`}>
                                <img src={sm} alt="" />
                                <span>{t("Send Payment")}</span>
                            </div>
                        </Link>
                        <Link to={"/payments?payment_action=send_money&send_type=qr_pay"} onClick={verifyToken}>
                            <div className={`${styles.f_btn}`}>
                                <img src={qr} alt="" />
                                <span>{t("Quick QR Pay")}</span>
                            </div>
                        </Link>
                    </div>
                    :
                    ""
            }
        </>
    ) : null
}

export default BottomNav;
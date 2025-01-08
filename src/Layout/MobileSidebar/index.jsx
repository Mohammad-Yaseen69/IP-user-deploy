import styles from "./styles/index.module.css"
import logo from "../../assets/images/logo/logo.svg"
import { X } from "react-feather";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { MENU } from "../SidebarNew/SbNMenu";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MobileSbContext } from "../Layout";


const greetMessage = () => {
    const date = new Date()
    const hour = date.getHours()
    return hour > 5 && hour < 12 ? "Good Morning!" : hour > 12 && hour < 17 ? "Good Afternoon!" : hour > 17 && hour < 20 ? "Good Evening!" : "Good Night!"
}

const MobileSidebar = ({ setShowModal }) => {
    const { userDetails, verifyToken, profileCompletedPercentage, clearData } = useContext(UserContext)
    const { t } = useTranslation()
    const { toggleSidebar, mobileSidebar } = useContext(MobileSbContext)

    return (
        <div className={`${styles.sidebar} ${mobileSidebar ? styles.sidebar_in_view : ""}`}>
            <div className={styles.content_wrapper}>
                <div className={styles.top}>
                    <img src={logo} alt="Instapay" width={140} />
                    <button onClick={toggleSidebar}>
                        <X />
                    </button>
                </div>
                <div className={styles.profile}>
                    <div>
                        <span>{greetMessage()}</span>
                        <h5>
                            {
                                userDetails?.account_type?.toLowerCase() === "individual"
                                    ?
                                    `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
                                    :
                                    userDetails?.company?.company_name
                            }
                        </h5>
                    </div>
                    {
                        userDetails?.profileImage?.url
                            ?
                            <img src={userDetails?.profileImage?.url} alt={userDetails?.user?.first_name} className={styles.dp} />
                            :
                            <div className={styles.dp}>
                                {
                                    userDetails?.account_type?.toLowerCase() === "individual"
                                        ?
                                        userDetails?.user?.first_name?.[0]?.toUpperCase()
                                        :
                                        userDetails?.company?.company_name?.[0]?.toUpperCase()
                                }
                            </div>
                    }
                </div>
                <nav className={styles.nav} onClick={() => {
                    if (profileCompletedPercentage < 100) {
                        setShowModal(true)
                    }
                }}>
                    <ul className={styles.nav_items}>
                        {
                            MENU[0].menu.map(item => (
                                // <li key={item.title} className={`${styles.nav_item} ${window.location.pathname === item.url && styles.nav_item_active} ${item.title === "Logout" && styles.ni_logout}`} onClick={verifyToken}>
                                <li key={item.title} className={`${styles.nav_item} ${window.location.pathname === item.url && styles.nav_item_active} ${item.title === "Logout" && styles.ni_logout}`}>
                                    {
                                        item.type === "text"
                                            ?
                                            <span>{t(item.title)}</span>
                                            :
                                            <Link to={item.url} onClick={() => {
                                                window.scrollTo({ top: 0, behavior: "smooth" })
                                                toggleSidebar()
                                                if (item.title === "Logout") {
                                                    const coun = localStorage.getItem("ip_country")
                                                    localStorage.clear()
                                                    localStorage.setItem("ip_country", coun)
                                                    clearData()
                                                }
                                            }}>
                                                {item.title === "Logout" ? item.activeIcon : window.location.pathname === item.url ? item.activeIcon : item.icon}
                                                <span>{t(item.title)}</span>
                                                {
                                                    window.location.pathname === item.url
                                                    &&
                                                    <div className={styles.dot}></div>
                                                }
                                            </Link>
                                    }
                                </li>
                            ))
                        }
                    </ul>
                    <div style={{ marginTop: "2rem", color: "#848484", fontSize: ".6rem" }}>
                        <span>{t("Powered By")} <Link style={{ color: "#848484", textDecoration: "underline", whiteSpace: "nowrap" }}>Kemit Kingdom SA</Link></span>
                        <p style={{ fontSize: ".6rem" }}>{t("A Swiss Company")}</p>
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default MobileSidebar;
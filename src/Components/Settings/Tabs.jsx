import React, { useContext, useEffect } from 'react'
import styles from "./styles/tabs.module.css"
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import { useLocation, useNavigate } from 'react-router'

// icons
import basic_active from "./tabs_icons/basic_a.svg"
import basic from "./tabs_icons/basic.svg"
import pass_active from "./tabs_icons/password_a.svg"
import pass from "./tabs_icons/password.svg"
import sec_active from "./tabs_icons/security_a.svg"
import sec from "./tabs_icons/security.svg"
import tfa_active from "./tabs_icons/tfa_a.svg"
import tfa from "./tabs_icons/tfa.svg"
import sa_active from "./tabs_icons/social_a.svg"
import sa from "./tabs_icons/social.svg"
import iv_active from "./tabs_icons/verification_a.svg"
import iv from "./tabs_icons/verification.svg"
import mwc_active from "./tabs_icons/receiving_a.svg"
import mwc from "./tabs_icons/receiving.svg"
import dwd_active from "./tabs_icons/download_a.svg"
import dwd from "./tabs_icons/download.svg"
import dyd_active from "./tabs_icons/delete_a.svg"
import dyd from "./tabs_icons/delete.svg"
import nominee_active from "./tabs_icons/nominee_a.svg"
import nominee from "./tabs_icons/nominee.svg"
import hocfy_active from "./tabs_icons/hocfy_a.svg"
import hocfy from "./tabs_icons/hocfy.svg"
import notif_active from "./tabs_icons/notifications_a.svg"
import notif from "./tabs_icons/notification.svg"
import login_active from "./tabs_icons/login_a.svg"
import login from "./tabs_icons/login.svg"
// icons


const Tabs = ({ currentTab, setCurrentTab, account_type = "individual" }) => {
    const { profileIncompleteReason, userDetails, verifyToken } = useContext(UserContext)
    const tabsData = [
        {
            name: "Basic Info",
            icon: basic,
            active_icon: basic_active,
        },
        {
            name: "Change Password",
            icon: pass,
            active_icon: pass_active,
        },
        {
            name: "Security Questions",
            icon: sec,
            active_icon: sec_active,
        },
        {
            name: "Nominee Information",
            icon: nominee,
            active_icon: nominee_active,
        },
        {
            name: "Verification Code Preferences",
            icon: tfa,
            active_icon: tfa_active,
        },
        {
            name: "How Others Can Find You",
            icon: hocfy,
            active_icon: hocfy_active,
        },
        {
            name: "My Social Network Accounts",
            icon: sa,
            active_icon: sa_active,
        },
        {
            name: "Notifications",
            icon: notif,
            active_icon: notif_active,
        },
        {
            name: account_type === "individual" ? "Identity Verification" : "",
            icon: iv,
            active_icon: iv_active,
        },
        {
            name: account_type === "business" ? "API Key" : "",
            icon: iv,
            active_icon: iv_active,
        },
        {
            name: account_type === "business" ? "Business Verification" : "",
            icon: iv,
            active_icon: iv_active,
        },
        {
            name: "Login Activity",
            icon: login,
            active_icon: login_active,
        },
        {
            name: "Receiving Accounts",
            icon: mwc,
            active_icon: mwc_active,
        },
        {
            name: "Download Your Data",
            icon: dwd,
            active_icon: dwd_active,
        },
        {
            name: "Delete Your Account",
            icon: dyd,
            active_icon: dyd_active,
        },
    ]
    const { t } = useTranslation()

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get("tab")
    const navigate = useNavigate()

    useEffect(() => {
        if (tab) {
            if (tab?.toLowerCase()?.includes("basic")) {
                setCurrentTab("Basic Info")
            }
            if (tab?.toLowerCase()?.includes("security")) {
                setCurrentTab("Security Questions")
            }
            if (tab?.toLowerCase()?.includes("withdrawal")) {
                setCurrentTab("Receiving Accounts")
            }
            if (tab?.toLowerCase()?.includes("social")) {
                setCurrentTab("My Social Network Accounts")
            }
            if (tab?.toLowerCase()?.includes("tfa")) {
                setCurrentTab("Verification Code Preferences")
            }
        }
    }, [tab])

    useEffect(() => {
        if (tab?.toLowerCase()?.includes("verification")) {
            setCurrentTab(account_type === "individual" ? "Identity Verification" : "Business Verification")
        }
    }, [tab, userDetails])
    return (
        <div className={styles.container}>
            {
                tabsData.filter(item => item.name.length > 0).map(item => (
                    <div
                        className={`${styles.tab} ${currentTab === item.name ? styles.active : ""} ${item.name !== "Basic Info" && profileIncompleteReason === "basic" ? styles.disabled : ""}`}
                        onClick={() => {
                            if (item.name !== "Basic Info" && profileIncompleteReason === "basic") return;
                            window.history.replaceState(null, null, "")
                            setCurrentTab(item.name)
                            verifyToken()
                        }}
                    >
                        <img src={item.name !== currentTab ? item.active_icon : item.icon} />
                        {t(item.name)}
                        {
                            item.name.toLowerCase().includes("basic")
                                &&
                                profileIncompleteReason === "basic"
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        }
                        {
                            item.name.toLowerCase().includes("security")
                                &&
                                profileIncompleteReason === "security"
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        }
                        {/* {
                            item.name.toLowerCase().includes("preferences")
                                &&
                                !userDetails?.tfa
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        } */}
                        {/* {
                            item.name.toLowerCase().includes("identity")
                                &&
                                userDetails?.user?.kyc_status !== "approved"
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        } */}
                    </div>
                ))
            }
        </div>
    )
}

export default Tabs
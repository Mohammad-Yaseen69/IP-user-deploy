import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/Tabs.module.scss"
import { UserContext } from '../../Context/UserContext'
import { useTranslation } from 'react-i18next'
import basic_active from "./files/basic_active.svg"
import basic from "./files/basic.svg"
import pass_active from "./files/pass_active.svg"
import pass from "./files/pass.svg"
import sec_active from "./files/sec_active.svg"
import sec from "./files/sec.svg"
import tfa_active from "./files/tfa_active.svg"
import tfa from "./files/tfa.svg"
import sa_active from "./files/sa_active.svg"
import sa from "./files/sa.svg"
import iv_active from "./files/iv_active.svg"
import iv from "./files/iv.svg"
import mwc_active from "./files/mwc_active.svg"
import mwc from "./files/mwc.svg"
import dwd_active from "./files/dwd_active.svg"
import dwd from "./files/dwd.svg"
import dyd_active from "./files/dyd_active.svg"
import dyd from "./files/dyd.svg"
import { useLocation } from 'react-router'

const Tabs = ({ /*setters*/ setActiveTab }) => {
    const [current, setCurrent] = useState("Basic Info")
    const { userDetails, verifyToken } = useContext(UserContext)
    const { t } = useTranslation()
    const data = [
        {
            icon: basic,
            active_icon: basic_active,
            name: t("Basic Info"),
            link: "#basic"
        },
        {
            icon: pass,
            active_icon: pass_active,
            name: t("Change Password"),
            link: "#password"
        },
        {
            icon: sec,
            active_icon: sec_active,
            name: t("Security Questions"),
            link: "#security"
        },
        {
            icon: tfa,
            active_icon: tfa_active,
            name: t("Nominee"),
            link: "#nominee"
        },
        {
            icon: tfa,
            active_icon: tfa_active,
            name: t("Two Factor Authentication"),
            link: "#two_factor"
        },
        userDetails?.account_type === "individual" ? {} : {
            icon: sa,
            active_icon: sa_active,
            name: t("API Key"),
            link: "#api_key"
        },
        userDetails?.account_type === "individual" ? {} : {
            icon: sa,
            active_icon: sa_active,
            name: t("Business Verification"),
            link: "#business"
        },
        {
            icon: sa,
            active_icon: sa_active,
            name: t("Social Accounts"),
            link: "#accounts"
        },
        {
            icon: sa,
            active_icon: sa_active,
            name: t("Notifications"),
            link: "#notifications"
        },
        {
            icon: sa,
            active_icon: sa_active,
            name: t("Sessions"),
            link: "#sessions"
        },
        userDetails?.account_type !== "individual" ? {} : {
            icon: iv,
            active_icon: iv_active,
            name: t("Identity Verification"),
            link: "#verification"
        },
        {
            icon: mwc,
            active_icon: mwc_active,
            name: t("My Withdrawal Channels"),
            link: "#withdrawal"
        },
        {
            icon: dwd,
            active_icon: dwd_active,
            name: t("Download Your Data"),
            link: "#download_data"
        },
        {
            icon: dyd,
            active_icon: dyd_active,
            name: t("Delete Your Account"),
            link: "#delete_account"
        },
    ]


    const scrollToHandler = (id) => {
        const element = document.getElementById(id)
        element?.scrollIntoView({ behavior: "smooth" })
    }

    const handleTabClick = (tab) => {
        verifyToken()
        setCurrent(tab?.name)
        const tabName = tab?.name?.toLowerCase() ?? ""

        if (tabName.includes("basic")) {
            setActiveTab("basic")
            setTimeout(() => {
                scrollToHandler("basic")
            }, 100)
        }
        if (tabName.includes("correct")) {
            setActiveTab("basic")
            setTimeout(() => {
                scrollToHandler("basic")
            }, 100)
        }
        if (tabName.includes("password")) {
            setActiveTab("password")
            setTimeout(() => {
                scrollToHandler("password")
            }, 100)
        }
        if (tabName.includes("security")) {
            setActiveTab("security")
            setTimeout(() => {
                scrollToHandler("security")
            }, 100)
        }
        if (tabName.includes("two factor")) {
            setActiveTab("two factor")
            setTimeout(() => {
                scrollToHandler("two_factor")
            }, 100)
        }
        if (tabName.includes("accounts")) {
            setActiveTab("accounts")
            setTimeout(() => {
                scrollToHandler("accounts")
            }, 100)
        }
        if (tabName.includes("notifications")) {
            setActiveTab("notifications")
            setTimeout(() => {
                scrollToHandler("notifications")
            }, 100)
        }
        if (tabName.includes("sessions")) {
            setActiveTab("sessions")
            setTimeout(() => {
                scrollToHandler("sessions")
            }, 100)
        }
        if (tabName.includes("verification")) {
            setActiveTab("verification")
            setTimeout(() => {
                scrollToHandler("verification")
            }, 100)
        }
        if (tabName.includes("delete")) {
            setActiveTab("delete")
            setTimeout(() => {
                scrollToHandler("delete_account")
            }, 100)
        }
        if (tabName.includes("download")) {
            setActiveTab("download")
            setTimeout(() => {
                scrollToHandler("download_data")
            }, 100)
        }
        if (tabName.includes("withdrawal")) {
            setActiveTab("withdrawal")
            setTimeout(() => {
                scrollToHandler("withdrawal")
            }, 100)
        }
        if (tabName.includes("api")) {
            setActiveTab("api")
            setTimeout(() => {
                scrollToHandler("api_key")
            }, 100)
        }
        if (tabName.includes("nominee")) {
            setActiveTab("nominee")
            setTimeout(() => {
                scrollToHandler("nominee")
            }, 100)
        }
        if (tabName.includes("business")) {
            setActiveTab("business")
            setTimeout(() => {
                scrollToHandler("business")
            }, 100)
        }
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get("tab")

    useEffect(() => {
        if (tab) {
            const currentTab = data.filter(it => it?.name?.toLowerCase()?.includes(tab?.toLowerCase()))?.[0]
            if (currentTab) {
                handleTabClick(currentTab)
            }
        }
    }, [tab])

    return (
        <div className={styles.container}>
            {
                data.map(item => {
                    if (!item.name) return;
                    return (
                        <div key={item.name} className={`${styles.item} ${current === item.name ? styles.active : ""}`} onClick={() => handleTabClick(item)}>
                            <div className={styles.icon}>
                                <img src={current === item.name ? item.active_icon : item.icon} alt={"ic"} style={{
                                    width: "46%",
                                    // height: "70%",
                                    objectFit: "contain"
                                }} />
                            </div>
                            <span className={styles.name}>{item.name}</span>
                            {
                                item.name.toLowerCase().includes("basic")
                                    &&
                                    (
                                        !userDetails?.user?.first_name
                                        ||
                                        !userDetails?.user?.last_name
                                        ||
                                        !userDetails?.email
                                        ||
                                        !userDetails?.phone
                                        ||
                                        !userDetails?.postal_code
                                        ||
                                        !userDetails?.city
                                        ||
                                        !userDetails?.country_name
                                        ||
                                        !userDetails?.address
                                        ||
                                        !userDetails?.about_me
                                    )
                                    ?
                                    <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px" }} />
                                    :
                                    ""
                            }
                            {
                                item.name.toLowerCase().includes("security")
                                    &&
                                    (
                                        !userDetails?.user?.answer1
                                        ||
                                        !userDetails?.user?.answer2
                                        ||
                                        !userDetails?.user?.answer3
                                    )
                                    ?
                                    <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px" }} />
                                    :
                                    ""
                            }
                            {
                                item.name.toLowerCase().includes("verify")
                                    &&
                                    userDetails &&
                                    (
                                        !("verified" in userDetails)
                                        ||
                                        userDetails?.verified == "false"
                                    )
                                    ?
                                    <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px" }} />
                                    :
                                    ""
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Tabs
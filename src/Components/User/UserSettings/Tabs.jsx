import React, { useContext } from 'react'
import styles from "./styles/Tabs.module.scss"
import { SecondaryTabsData, TabsData } from './TabsData'
import { UserContext } from '../../../Context/UserContext'
import { useTranslation } from 'react-i18next'

const Tabs = ({ setters }) => {
    const { userDetails } = useContext(UserContext)
    const { t } = useTranslation()


    const handleTabClick = (tab) => {
        const tabName = tab.name.toLowerCase()

        setters.forEach(set => set(true))

        const scrollOptions = {
            block: 'start',
            inline: 'nearest',
            behavior: 'smooth',
            top: 400,
        };

        if (tabName.includes("basic")) {
            document.querySelector("#basic")?.scrollIntoView(scrollOptions)
            setters[0](false)
        }
        if (tabName.includes("correct")) {
            document.querySelector("#basic")?.scrollIntoView(scrollOptions)
            setters[0](false)
        }
        if (tabName.includes("password")) {
            document.querySelector("#password")?.scrollIntoView(scrollOptions)
            setters[1](false)
        }
        if (tabName.includes("security")) {
            document.querySelector("#security")?.scrollIntoView(scrollOptions)
            setters[2](false)
        }
        if (tabName.includes("two factor")) {
            document.querySelector("#two_factor")?.scrollIntoView(scrollOptions)
            setters[3](false)
        }
        if (tabName.includes("accounts")) {
            document.querySelector("#accounts")?.scrollIntoView(scrollOptions)
            setters[4](false)
        }
        if (tabName.includes("notifications")) {
            document.querySelector("#notifications")?.scrollIntoView(scrollOptions)
            setters[5](false)
        }
        if (tabName.includes("sessions")) {
            document.querySelector("#sessions")?.scrollIntoView(scrollOptions)
            setters[6](false)
        }
        if (tabName.includes("verify")) {
            document.querySelector("#verification")?.scrollIntoView(scrollOptions)
            setters[9](false)
        }
        if (tabName.includes("delete")) {
            document.querySelector("#delete_account")?.scrollIntoView(scrollOptions)
            setters[8](false)
        }
        if (tabName.includes("download")) {
            document.querySelector("#download_data")?.scrollIntoView(scrollOptions)
            setters[7](false)
        }
        if (tabName.includes("withdrawal")) {
            document.querySelector("#withdrawal")?.scrollIntoView(scrollOptions)
            setters[10](false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: "column", position: "sticky", top: "1rem" }}>
            <ul className={`${styles.menu} card`}>
                {
                    TabsData.map(tab => {
                        return <li key={tab.id} onClick={() => handleTabClick(tab)}>
                            <span>{tab.icon} </span>
                            <span style={{ whiteSpace: "nowrap" }}>{t(tab.name)}</span>
                            {
                                tab.name.toLowerCase().includes("basic")
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
                                        !userDetails?.country
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
                                tab.name.toLowerCase().includes("security")
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
                                tab.name.toLowerCase().includes("verify")
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
                        </li>
                    })
                }
            </ul>
            <ul className={`${styles.menu} card`}>
                {
                    SecondaryTabsData.map(tab => {
                        return <li key={tab.id} onClick={() => handleTabClick(tab)}>
                            <span>{tab.icon} </span>
                            <span style={{ whiteSpace: "nowrap" }}>{t(tab.name)}</span>
                        </li>
                    })
                }
            </ul>
        </div>
    )
}

export default Tabs
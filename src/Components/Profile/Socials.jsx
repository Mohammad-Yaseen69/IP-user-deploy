import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem'
import styles from "./styles/index.module.scss"


const Socials = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [socials_data, setSocialData] = useState([
        {
            name: "Instagram",
            followers: "0" + t("Followers"),
        },
        {
            name: "Telegram",
            followers: "0" + t("Followers"),
        },
        {
            name: "Whatsapp",
            followers: null,
        },
    ])

    useEffect(() => {
        const getFollowers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account/get-social-media-details/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log(dec)
                const data = Object.keys(dec?.data)?.map(item => {
                    return {
                        name: `${service_name_formatter(item)}: `,
                        followers: typeof dec?.data?.[item] === "number" ? dec?.data?.[item] + " " + t("Followers") : dec?.data?.[item]
                    }
                })
                console.log(data)
                const arr = [...data];
                const index1 = arr.findIndex(social => social.name.trim() === "Facebook:");
                const index2 = arr.findIndex(social => social.name.trim() === "Telegram:");

                arr[index2].followers = userDetails?.telegram_bot ? "connected" : "not connected"
                const temp = arr[index1]

                arr[index1] = arr[index2]
                arr[index2] = temp


                setSocialData(arr)
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
            }
        }
        if (userDetails) {
            getFollowers()
        }
    }, [userDetails])


    const [showMore, setShowMore] = useState(false)
    return (
        <div className={styles.social_info} style={{ flexWrap: "wrap" }}>
            {
                window.innerWidth > 600 ?
                    socials_data.slice(0, showMore ? socials_data.length : 3).map(item => (
                        <div className={styles.item} key={item.name}>
                            <div className={styles.left}>
                                <span>{item.name}</span>
                                {
                                    item?.name?.toLowerCase()?.includes("instagram") && userDetails?.insta_username
                                        ?
                                        <a target='_blank' href={`https://www.instagram.com/${userDetails?.insta_username}`} style={{ cursor: "pointer", color: "#5926f0", fontSize: ".65rem" }}>@{userDetails?.insta_username}</a>
                                        : ""

                                }
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
                    :
                    socials_data.slice(0, showMore ? socials_data.length - 1 : 3).map(item => (
                        <div className={styles.item} style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "0" }} key={item.name}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%' }}>
                                <div className={styles.left}>
                                    <span>{item.name}</span>
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

                            {
                                item?.name?.toLowerCase()?.includes("instagram") && userDetails?.insta_username
                                    ?
                                    <a target='_blank' href={`https://www.instagram.com/${userDetails?.insta_username}`} style={{ cursor: "pointer", color: "#5926f0", fontSize: ".65rem" }}>@{userDetails?.insta_username}</a>
                                    : ""

                            }
                        </div>
                    ))
            }
            <div className={styles.item} style={{ cursor: "pointer" }} onClick={() => setShowMore(!showMore)}>
                <div className={styles.left}>
                    <span>{
                        showMore ? t("Less") : t("More")}</span>
                </div>
                <div className={styles.right}>
                    <div>{">"}</div>
                </div>
            </div>
        </div>
    )
}

export default Socials
import { useTranslation } from "react-i18next"
import styles from "./styles/stepone.module.css"
import { useContext, useEffect, useState } from "react"
import InviteFriendModal from "../InviteFriendModal"
import InstaPayLoader from "../../Loader"
import { ChevronDown, ChevronRight, Users, XCircle } from "react-feather"
import { UserContext } from "../../../Context/UserContext"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { useLocation } from "react-router"
import RecentBeneficiary from "./RecentBeneficiary"
import BulkPaymentModal from "./BulkPaymentModal"
const StepOne = ({ data, dataHandler, cardToWallet, style }) => {
    const { t } = useTranslation()
    const [search, setSearch] = useState("")
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [searchedUsers, setSearchedUsers] = useState([])
    const { authHeader, userDetails, benLoading } = useContext(UserContext)
    const [error, setError] = useState("")
    const [expandRecent, setExpandRecent] = useState(false)
    const performSearch = async (query) => {
        setExpandRecent(false)
        dataHandler("loading", true);
        dataHandler("beneficiary_wallet", {});
        dataHandler("beneficiary", {});
        setError("");
        try {
            const normalized = query.startsWith("@") ? query.slice(1).toLowerCase() : query.toLowerCase();
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallets/${normalized}`,
                { headers: authHeader }
            );
            const dec = decryptData(res.data.data);
            const isOwn = dec?.users?.find(item => item?._id === userDetails?._id);
            const users = dec?.users?.filter(item => item?._id !== userDetails?._id);


            if (isOwn && (invoiceId || payment_type === "payment_address" || planId || subscriptionId)) {
                dataHandler("error", "You can't send money to yourself.")
                throw new Error("Failed")
            }

            setSearchedUsers(users);
            dataHandler("beneficiary", users?.[0] ?? {});
            if (users?.length > 0) {
                const defaultWal = users?.[0]?.wallets?.find(it => it?.default) ?? users?.[0]?.wallets?.[0];
                dataHandler("beneficiary_wallet", defaultWal ?? {});
            } else {
                setError("No Results");
            }

        } catch (err) {
            const decrypted = decryptData(err?.response?.data?.data);
            setError(decrypted?.message ?? "No Results");
        } finally {
            dataHandler("loading", false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        performSearch(search);
    };




    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_id = queryParams.get("wallet_id")
    const invoiceId = queryParams.get("invoiceId")
    const payment_type = queryParams.get("payment_type")
    const phone = queryParams.get("phone")
    const planId = queryParams.get('planId')
    const subscriptionId = queryParams.get("subscriptionId")

    useEffect(() => {
        let timeout;
        if (wallet_id || phone) {
            const searchValue = wallet_id || phone
            if (search !== searchValue) {
                setSearch(searchValue)
            }
            performSearch(searchValue)
                .then(() => {
                    if (!error && data.first_time) {
                        dataHandler("first_time", false)
                        if (payment_type === "payment_address") {
                            dataHandler("step", data.step + 2)
                        }
                        else if (invoiceId || planId || subscriptionId) {
                            dataHandler("step", data.step + 3)
                        }
                        else {
                            dataHandler("step", data.step + 1)
                        }
                    }
                })
        }

        return () => {
            clearTimeout(timeout)
        }
    }, [wallet_id, search, data.first_time, invoiceId, payment_type, phone, planId, subscriptionId])


    if ((invoiceId || payment_type === "payment_address" || planId || subscriptionId) && !error) {
        return (
            <div style={{ width: "80%", margin: "auto" }}>
                <InstaPayLoader />
            </div>
        )
    }

    return (
        <div style={{ padding: cardToWallet && "0px", margin: cardToWallet && "15px 0", ...style }} className={styles.container}>
            <label>{t("Enter the Wallet ID, Username, Email, or Phone Number of the recipient.")}</label>
            <form onSubmit={handleSearch} className={styles.search}>
                <input type="search" onClick={() => setExpandRecent(false)} placeholder={t("Search")} value={search} onChange={e => setSearch(e.target.value)} />
                <button disabled={data.loading || search.length < 3}>
                    <div>
                        {t("lookup")}
                    </div>
                </button>
            </form>

            {!expandRecent &&
                <>
                    {!cardToWallet &&
                        <div className={styles.recipient_not}>
                            {!data.isBulkPayment && <>
                                <p>{t("Recipient Not on InstaPay?")}</p>
                                <button onClick={() => setShowInviteModal(true)}>
                                    <span>{t("Invite Them")}</span>
                                </button>
                                {
                                    showInviteModal
                                    &&
                                    <InviteFriendModal
                                        isOpen={showInviteModal}
                                        toggle={() => setShowInviteModal(false)}
                                    />
                                }
                            </>
                            }
                            <button
                                className={styles.bulk_btn}
                                onClick={() => setShowBulkModal(true)}
                            >
                                <div>
                                    <Users size={12} />
                                    {t("Bulk Recipients")}
                                </div>
                            </button>
                            {data.isBulkPayment && (
                                <button
                                    className={styles.bulk_btn}
                                    onClick={() => {
                                        dataHandler("isBulkPayment", false)
                                        dataHandler("bulkPaymentRecipients", [])
                                    }}
                                    style={{ background: "rgba(209, 36, 95, 0.08)", color: "#D1245F" }}
                                >
                                    <div style={{ background: "transparent" }}>
                                        <XCircle size={12} />
                                        {t("Cancel Bulk")}
                                    </div>
                                </button>
                            )}
                            <BulkPaymentModal
                                isOpen={showBulkModal}
                                onClose={() => setShowBulkModal(false)}
                                initialRecipients={data.bulkPaymentRecipients || []}
                                onNext={(recipients) => {
                                    dataHandler("bulkPaymentRecipients", recipients)
                                    dataHandler("isBulkPayment", true)
                                    dataHandler("step", 3)
                                }}
                            />
                        </div>
                    }
                    {
                        (searchedUsers.length === 0 && !error && (!data.loading && !benLoading))
                        &&
                        <div className={styles.guide}>
                            <p>{t("Please follow these examples:")}</p>
                            <p>{t("Wallet ID")}: <strong>{t("GY68J782")}</strong></p>
                            <p>{t("InstaPay/Instagram Username")}: <strong>{t("instauser")}</strong></p>
                            <p>{t("Email")}: <strong>{t("user@email.com")}</strong></p>
                            <p>{t("Phone Number")}: <strong>{t("44795396600 (")}{t("With Country code")})</strong></p>
                        </div>
                    }

                    <div className={styles.users}>
                        {
                            ((data.loading || benLoading))
                                ?
                                <div className={styles.loader}>
                                    <InstaPayLoader />
                                </div>
                                :
                                searchedUsers.length > 0
                                    ?
                                    searchedUsers.map(item => (
                                        <BeneficiaryCard
                                            data={data}
                                            dataHandler={dataHandler}
                                            item={item}
                                            key={item?._id}
                                        />
                                    ))
                                    :
                                    error &&
                                    (
                                        <div className={styles.no_r}>{t("No Results")}</div>
                                    )
                        }
                    </div>
                </>}

            {(!data.loading && !benLoading) &&
                <RecentBeneficiary expandRecent={expandRecent} data={data} dataHandler={dataHandler} setExpandRecent={setExpandRecent} />
            }
        </div>
    );
}

export default StepOne

export const BeneficiaryCard = ({ data, dataHandler, item, type, setBenWalletsFound }) => {
    const { t } = useTranslation()
    const [showMore, setShowMore] = useState(false)
    const { authHeader, userWallets } = useContext(UserContext)
    const [benWallets, setBenWallets] = useState()
    const [loading, setLoading] = useState()





    const findWallets = async (search) => {
        setLoading(true)
        const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallets/${search}`, {
            headers: authHeader
        });
        const dec = decryptData(res.data.data);
        setBenWallets(dec?.users[0]?.wallets)

        console.log(dec)
        const newBen = {
            ...item,
            wallets: dec?.users[0]?.wallets,
        }
        setBenWalletsFound(prev => [...prev, newBen]);
        setShowMore(true)
        setLoading(false)
    };
    useEffect(() => {
        if (type === "recent") {
            setShowMore(false)
        }
        else {
            setShowMore(true)
        }
    }, [type])


    const walletContStyles = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))"
    }


    return (
        <div className={`${styles.user} ${showMore ? styles.user_full : ""}`} >

            <div onClick={() => {
                if (type === "recent") {
                    if (!showMore) {
                        if (item?.wallets) {
                            if (item.existType === "wallet") {
                                const filteredWallets = item?.wallets?.filter(w => !userWallets.find(userW => userW.wallet_id === w?.wallet_id))
                                setBenWallets(filteredWallets)
                                setShowMore(true)
                            }
                            else {
                                setBenWallets(item?.wallets)
                                setShowMore(true)
                            }
                        }
                        else {
                            if (item?.existType === "phone") {
                                findWallets(item?.phone)
                            }
                            else if (item?.existType === "email") {
                                findWallets(item?.email)
                            }
                        }
                    } else {
                        setShowMore(false)
                    }
                }
            }}
                className={styles.user_details}
            >
                {
                    item?.profileImage
                        ?
                        <img src={item?.profileImage} alt="" className={styles.dp_img} style={{ background: "transparent" }} />
                        :
                        <div className={styles.dp}>{item?.first_name?.[0] || item?.company_name?.[0]}</div>
                }
                <div style={{ gap: type === "recent" && "0px" }} className={styles.name_un}>
                    <h5>
                        {
                            (item?.account_type === "individual" || type === "recent")
                                ?
                                `${item?.first_name} ${item?.last_name}`
                                :
                                `${item?.company_name}`
                        }
                    </h5>
                    {type === "recent" ?
                        <span>{item.existType === "phone" ? item.phone : item.existType === "email" ? item.email : item.phone}</span> :
                        <span>@{item?.username ?? t("No username")}</span>
                    }
                </div>
                <div className={styles.show_more}>

                    {
                        loading ?
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border" color='primary' role="status">
                                    <span className="sr-only">{t("Loading...")}</span>
                                </div>
                            </div> :
                            showMore
                                ?
                                <ChevronDown color="#7d7d7d" onClick={() => setShowMore(!showMore)} />
                                :
                                <ChevronRight
                                    color="#7d7d7d"
                                    onClick={() => {
                                        if (type === "recent") {
                                            if (item?.wallets) {
                                                if (item.existType === "wallet") {
                                                    const filteredWallets = item?.wallets?.filter(w => !userWallets.find(userW => userW.wallet_id === w?.wallet_id))
                                                    setBenWallets(filteredWallets)
                                                    setShowMore(true)
                                                }
                                                else {
                                                    setBenWallets(item?.wallets)
                                                    setShowMore(true)
                                                }
                                            }
                                            else {
                                                if (item?.existType === "phone") {
                                                    findWallets(item?.phone)
                                                }
                                                else if (item?.existType === "email") {
                                                    findWallets(item?.email)
                                                }
                                            }
                                        } else {
                                            setShowMore(!showMore)
                                        }
                                    }}
                                />
                    }
                </div>
            </div>
            {
                showMore
                &&
                <div className={styles.wallets_con}>
                    <span>{t("Available Currency")}</span>
                    <div style={type === "recent" ? walletContStyles : {}} className={styles.wallets}>
                        {
                            (type === "recent" ? benWallets?.length : item?.wallets?.length) > 0
                                ?
                                (type === "recent" ? benWallets : item?.wallets)?.map(wallet => (
                                    <div
                                        className={`${styles.wallet} ${data?.beneficiary_wallet?._id === wallet?._id ? styles.wallet_active : ""}`}
                                        key={wallet?._id}
                                        onClick={() => {
                                            dataHandler("beneficiary_wallet", wallet)
                                            dataHandler("beneficiary", item)
                                        }}
                                    >
                                        {wallet?.currency?.code}
                                    </div>
                                ))
                                :
                                <div className={styles.no_r}>{t("No Wallets")}</div>
                        }
                    </div>
                </div>
            }

        </div>
    );
}
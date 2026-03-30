import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InviteFriendModal from "../InviteFriendModal";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../../Context/UserContext";
import styles from "./styles/WalletDetails.module.css"
import WalletBeneficiaryCard from "../WalletBeneficiaryCard";
import { Check, HelpCircle } from "react-feather";
import { Button } from "reactstrap";
import { useLocation } from "react-router";

// let timeout;

const WalletDetails = ({ setWallet, setStep, wallet }) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen);
    const [walletError, setWalletError] = useState("")
    const { authHeader, beneficiaries } = useContext(UserContext)
    const [searchedBeneficiaries, setSearchedBeneficiaries] = useState([])
    const [searchUser, setSearchUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const { userDetails } = useContext(UserContext)

    const [searching, setSearching] = useState(false)

    const getUserWallets = (id = "") => {
        setSearching(true)
        setWalletError("")
        // axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-by-wallet-id/${searchQuery}`, {
        const query = searchQuery.startsWith("@") ? searchQuery.slice(1).toLowerCase() : searchQuery.toLowerCase()
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallets/${id || query}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const user = decrypted?.users?.[0]
                if (!user) {
                    setWalletError(`No user found for ${searchQuery}`)
                }
                if (user?._id === userDetails?._id) {
                    setSearchUser(null)
                    setWalletError("You cannot transfer funds to your own wallet.")
                } else {
                    setSearchUser(user)
                    if (user?.wallets?.length > 0) {
                        const defaultWal = user?.wallets?.find(it => it?.default)?.wallet_id
                        setWallet(defaultWal ?? user?.wallets?.[0]?.wallet_id)
                    }
                }
            })
            .catch(err => {
                const decrypted = decryptData(err?.response?.data?.data)
                setWalletError(`No user found for ${searchQuery}`)
                setSearchUser(null)
            })
            .finally(() => {
                setSearching(false)
            })
    }

    const searchBeneficiaries = () => {
        const wallet_ben = beneficiaries.filter(item => item.wallet.length > 0)
        if (wallet_ben.length > 0) {
            const filtered = wallet_ben.filter(item => {
                return item.first_name.includes(searchQuery) || item.company_name.includes(searchQuery) || item.last_name.includes(searchQuery) || item.wallet?.join("")?.includes(searchQuery)
            })

            setSearchedBeneficiaries(filtered)
        }
    }
    // useEffect(() => {

    //     if (timeout) {
    //         clearTimeout(timeout)
    //     }

    //     timeout = setTimeout(() => {
    //         if (searchQuery) {
    //             getUserWallets()
    //             searchBeneficiaries()
    //         }
    //     }, 1000)

    //     return () => clearTimeout(timeout)
    // }, [searchQuery])

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_id = queryParams.get("wallet_id")

    useEffect(() => {
        if (wallet_id) {
            setSearchQuery(wallet_id)
            getUserWallets(wallet_id)
        }
    }, [wallet_id])
    return (
        <div className={styles.container}>
            <h5>{t("Enter the Wallet ID, Email, or Phone Number of the recipient.")}</h5>
            <div className={styles.search} style={{ position: "relative" }}>
                <input placeholder={t("Wallet ID, Username, Email, or Phone Number")} onChange={e => {
                    setWalletError("")
                    setSearchQuery(e.target.value)
                    if (e.target.value.length === 0) {
                        setSearchUser(null)
                    }
                }} value={searchQuery} />
                {
                    searchQuery.length > 1
                    &&
                    <Button
                        color="primary"
                        onClick={() => {
                            getUserWallets()
                            searchBeneficiaries()
                        }}
                        disabled={searching}
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: ".75rem",
                            transform: "translateY(-50%)",
                            borderRadius: "7px",
                            padding: "6px 10px",
                            fontSize: ".7rem"
                        }}
                    >
                        {t("Search")}
                    </Button>
                }
            </div>
            <div style={{ color: "#a0a0a0", fontSize: ".6rem", display: "flex", justifyContent: "center", alignItems: "center", gap: ".5rem" }}>
                {t("Recipient not on InstaPay?")}
                <button style={{
                    all: "unset",
                    padding: ".3rem 1rem",
                    fontSize: ".6rem",
                    background: "white",
                    borderRadius: "40px",
                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                    cursor: "pointer"
                }} onClick={toggle}>
                    <span style={{
                        background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 500
                    }}>{t("Invite Them")}</span>
                </button>
                <InviteFriendModal isOpen={isOpen} toggle={toggle} />
            </div>
            {
                (
                    searchQuery.length > 0
                    && !searchUser
                )
                    ?
                    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                        <p style={{ marginBottom: 0, fontWeight: 600 }}>{t("Please follow these examples:")}</p>
                        <div>{t("Wallet ID")}: <strong>GY68J782</strong></div>
                        <div>{t("InstaPay/Instagram Username")}: <strong>instauser</strong></div>
                        <div>{t("Email")}: <strong>user@email.com</strong></div>
                        <div>{t("Phone Number")}: <strong>44795396600</strong> ({t("With Country Code")})</div>
                    </div>
                    : ""
            }
            <div className={styles.cards}>
                {
                    searchUser
                    &&
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 0 5px rgba(128, 128, 128, 0.2)",
                        borderRadius: "10px",
                        padding: "1rem",
                        gap: "12px",
                        cursor: "pointer",
                        minHeight: "70px",
                        border: searchUser?.wallets?.length > 0 && searchUser?.wallets?.some(item => item?.wallet_id === wallet) ? "2px solid rgba(89, 38, 240, .3)" : "none",
                        flexWrap: "wrap"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem"
                        }}>
                            {
                                searchUser?.profileImage
                                    ?
                                    <img
                                        src={searchUser?.profileImage}
                                        alt=""
                                        style={{
                                            height: "35px",
                                            width: "35px",
                                            objectFit: "cover",
                                            borderRadius: "30px"
                                        }}
                                    />
                                    :
                                    <div style={{
                                        minWidth: "35px",
                                        minHeight: "35px",
                                        borderRadius: "25px",
                                        display: "grid",
                                        placeItems: "center",
                                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                        color: "white",
                                        fontSize: "1rem",
                                        fontWeight: 800
                                    }}>{searchUser?.first_name?.[0] || searchUser?.company_name?.[0]}</div>
                            }
                            <div>
                                <h5 style={{ marginBottom: 0, fontSize: ".9rem", whiteSpace: "nowrap" }}>
                                    {
                                        searchUser?.account_type === "individual"
                                            ?
                                            `${searchUser?.first_name || searchUser?.company_name} ${searchUser?.last_name}`.slice(0, 24)
                                            :
                                            `${searchUser?.company_name}`.slice(0, 24)
                                    }
                                </h5>
                                <span style={{ paddingLeft: ".3rem" }}>@{searchUser?.username ?? "No username"}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".3rem", width: "fit-content" }}>
                            {
                                searchUser?.wallets?.length > 0
                                    ?
                                    searchUser?.wallets?.map(item => (
                                        <div style={{
                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                            padding: ".25rem .5rem",
                                            borderRadius: "100px",
                                            color: "white",
                                            fontSize: ".5rem",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: ".25rem",
                                            position: "relative",
                                            minWidth: "38px",
                                            justifyContent: "center"
                                        }}
                                            onClick={() => setWallet(item?.wallet_id)}
                                        >
                                            {wallet === item?.wallet_id && (
                                                <div style={{
                                                    position: "absolute",
                                                    top: "-4px",
                                                    left: "-4px",
                                                    height: "15px",
                                                    width: "15px",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    borderRadius: "10px",
                                                    background: "white",
                                                    border: "1px solid rgba(0,0,0,.1)"
                                                }}>
                                                    <Check size={13} color='green' />
                                                </div>
                                            )}
                                            {item?.currency?.code}
                                        </div>
                                    ))
                                    :
                                    <div>No wallets</div>
                            }
                        </div>
                    </div>
                }
                {
                    walletError
                    &&
                    <span style={{
                        fontSize: ".8rem",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "red"
                    }}>{walletError}</span>
                }
                {
                    walletError || searchUser
                        ?
                        <div style={{ borderBottom: "2px dashed rgba(0,0,0,.5)", width: "100%", margin: ".25rem 0" }}></div>
                        :
                        ""
                }
                {
                    searchedBeneficiaries.length > 0
                        ?
                        <h5>{t("My Beneficiaries")}</h5>
                        :
                        // <span style={{
                        //     fontSize: ".8rem",
                        //     textAlign: "center",
                        //     fontWeight: "600",
                        //     color: "red"
                        // }}>No Beneficiaries Found</span>
                        ""
                }
                {
                    searchedBeneficiaries.map(user => (
                        <WalletBeneficiaryCard key={user._id} user={user} authHeader={authHeader} decryptData={decryptData} setWallet={setWallet} wallet={wallet} />
                    ))
                }
            </div>
            <p style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: ".5rem",
                color: "#a6a6a6",
                fontSize: "9px",
                marginTop: "2rem"
            }} onClick={() => window.open("https://insta-pay.ch/faq", "_blank")}>
                <HelpCircle size={13} />
                {t("Trouble Sending money?")}
            </p>
            <Button className={styles.button} disabled={!wallet} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    )
}

export default WalletDetails
import { useContext, useEffect, useState } from "react";
import { Check, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Input } from "reactstrap";
import InviteFriendModal from "./InviteFriendModal";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";
import WalletBeneficiaryCard from "./WalletBeneficiaryCard";
import { useLocation } from "react-router";

// let timeout;

const WalletDetails = ({ setWallet, setSubStep, wallet }) => {
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
        const query = searchQuery.startsWith("@") ? searchQuery.slice(1).toLowerCase() : searchQuery.toLowerCase()
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallets/${id || query}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                const user = decrypted?.users?.[0]
                console.log(user)
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
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
        }}>
            <CardBody style={{
                background: "rgba(0,0,0,.03)",
                borderRadius: "20px",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "30px 20px",
                gap: "14px",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <p style={{ fontSize: "1rem", color: "#7d7d7d" }}>{t("Enter the Wallet ID, Username, Email, or Phone Number of the recipient.")}</p>
                <form onSubmit={e => {
                    e.preventDefault()
                    getUserWallets()
                    searchBeneficiaries()
                }} style={{ position: "relative" }}>
                    <Input placeholder={t("Wallet ID, Username, Email, or Phone Number")} onChange={e => {
                        setWalletError("")
                        setSearchQuery(e.target.value)
                        if (e.target.value.length === 0) {
                            setSearchUser(null)
                        }
                    }} style={{ fontSize: "18px", borderRadius: "10px", paddingRight: searchQuery.length > 1 ? "8rem" : "inherit" }} className="w_a_i" value={searchQuery} />
                    {
                        searchQuery.length > 1
                        &&
                        <Button
                            color="primary"
                            type="submit"
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
                </form>
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
                            <p style={{ marginBottom: 0, fontWeight: 600 }}>Please follow these examples: </p>
                            <div>Wallet ID: <strong>GY68J782</strong></div>
                            <div>InstaPay/Intagram Username: <strong>instauser</strong></div>
                            <div>Email: <strong>user@email.com</strong></div>
                            <div>Phone Number: <strong>44795396600</strong> (With Country Code)</div>
                        </div>
                        : ""
                }
                <div style={{
                    marginTop: ".5rem",
                    padding: ".5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                    overflowY: "auto"
                }} className="w_t_w_b_l">
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
                                                height: "30px",
                                                width: "30px",
                                                objectFit: "cover",
                                                borderRadius: "30px"
                                            }}
                                        />
                                        :
                                        <div style={{
                                            minWidth: "30px",
                                            minHeight: "30px",
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
                                    <h5 style={{ marginBottom: 0, whiteSpace: "nowrap" }}>
                                        {
                                            searchUser?.account_type === "individual"
                                                ?
                                                `${searchUser?.first_name} ${searchUser?.last_name}`.slice(0, 24)
                                                :
                                                `${searchUser?.company_name}`.slice(0, 24)
                                        }
                                    </h5>
                                    <span style={{ paddingLeft: ".3rem" }}>@{searchUser?.username ?? "No username"}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
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
                            ""
                    }
                    {
                        searchedBeneficiaries.map(user => (
                            <WalletBeneficiaryCard key={user._id} user={user} authHeader={authHeader} decryptData={decryptData} setWallet={setWallet} wallet={wallet} />
                        ))
                    }
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?")}</span>
                </a>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                }}
                    className="i_t_button"
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={wallet.length > 8 || !wallet || walletError}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default WalletDetails;
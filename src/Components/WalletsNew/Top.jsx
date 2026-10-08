import { Swiper, SwiperSlide } from "swiper/react"
import styles from "./styles/Top.module.css"
import cardsStyle from "../HomeNewUpdated/styles/CardsContainer.module.css"
import { EffectCards } from "swiper"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import { useTranslation } from "react-i18next"
import add_funds from "./files/top_up.svg"
import convert from "./files/conv.svg"
import withdraw from "./files/withdraw.svg"
import download from "./files/down_load.svg"
import block from "./files/block.svg"
import plus from "./files/plus.svg"
import Card from "./Card"
import DefaultWalletModal from "./DefaultWalletModal"
import AddCurrencyModal from "./AddCurrencyModal"
import { useLocation, useNavigate } from "react-router"
import Withdraw from "./Withdraw"
import DownloadStatement from "./DownloadStatement"
import axios from "axios"
import { toast } from "react-toastify"
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem"
import { Modal, ModalBody, ModalHeader, } from "reactstrap"
import CurConversion from "../HomeNewUpdated/CurConversion"
import AddWithdrawalsModal from "../AddWithdrawa;sModal"
import QrGenerate from "../Settings/QrGenerate"
import { usePermission } from "../../hooks/GeneralUse/usePermission"
import { Tooltip } from "@mui/material"
import SendCryptoModal from "./SendCryptoModal"

const Top = ({ currentWallet, setCurrentWallet, data }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const swiperRef = useRef(null)
    const { userWallets: allWallets, authHeader, getUserWallets, userDetails, getWithdrawals, userWithdrawals } = useContext(UserContext)
    const can = usePermission()
    // Crypto wallets live on the Crypto & Stablecoins page, not here.
    const userWallets = useMemo(
        () => (allWallets || []).filter((w) => w?.provider !== "bvnk"),
        [allWallets]
    ).filter(wallet => wallet?.wallet_type !== 'crypto')
    const [activeDot, setActiveDot] = useState(0)
    const [currentDefault, setCurrentDefault] = useState(false)
    const [currentActive, setCurrentActive] = useState(false)
    const [adminBlocked, setAdminBlocked] = useState(false)
    const [blocked, setBlocked] = useState(false)
    const [blocking, setBlocking] = useState(false)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const action = queryParams.get("action")
    const wallet_address = queryParams.get("wallet_address")

    useEffect(() => {
        if (userDetails) {
            getWithdrawals()
        }
    }, [userDetails])

    useEffect(() => {
        if (wallet_address && userWallets?.length > 0) {
            const wallet = userWallets?.find(item => item?.wallet_id === wallet_address)
            const index = userWallets?.findIndex(item => item?.wallet_id === wallet_address)
            if (wallet?.wallet_id && index !== -1) {
                setActiveDot(index)
                setCurrentWallet(wallet)
                if (swiperRef?.current?.swiper) {
                    swiperRef.current.swiper.slideTo(index)
                } else {
                    setTimeout(() => {
                        swiperRef?.current?.swiper?.slideTo(index)
                    }, 100)
                }
                if (action === "withdraw") {
                    if (wallet?.wallet_type === "crypto") openSendCryptoModal(wallet)
                    else setShowWithdrawalModal(true)
                } else if (action === "download") {
                    setShowDownloadStatementModal(true)
                }
            }
        }
    }, [action, wallet_address, userWallets])


    useEffect(() => {
        if (userWallets?.length > 0) {
            setCurrentWallet(userWallets?.[activeDot])
        }
    }, [userWallets, activeDot])

    useEffect(() => {
        setCurrentDefault(currentWallet?.default)
        setCurrentActive(currentWallet?.status === "active")
        setAdminBlocked(currentWallet?.admin_blocked)
        setBlocked(currentWallet?.blocked)
    }, [currentWallet])
    // modals
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false)
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
    const [showConversionModal, setShowConversionModal] = useState(false)
    const [showDownloadStatementModal, setShowDownloadStatementModal] = useState(false)
    const [showSendCryptoModal, setShowSendCryptoModal] = useState(false)
    const [sendCryptoWallet, setSendCryptoWallet] = useState(null)

    const openSendCryptoModal = (wallet) => {
        setSendCryptoWallet(wallet)
        setShowSendCryptoModal(true)
    }

    useEffect(() => {
        if (action === "convert") setShowConversionModal(true)
        else if (action === "withdraw") {
            if (currentWallet?.wallet_type === "crypto") openSendCryptoModal(currentWallet)
            else setShowWithdrawalModal(true)
        }
        else if (action === "add-currency") setShowAddCurrencyModal(true)
        else if (action === "statement") setShowDownloadStatementModal(true)

    }, [action])

    useEffect(() => {
        getUserWallets()
    }, [])

    const handleChangeStatus = () => {
        if (currentActive) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/deactivate-wallet/${currentWallet?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    getUserWallets(true)
                    setCurrentActive(false)
                })
                .catch(err => {
                    toast.error("We cannot process your request at the moment, please try again later.")
                })
        } else {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/activate-wallet/${currentWallet?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    setCurrentActive(true)
                })
                .catch(err => {
                    toast.error("We cannot process your request at the moment, please try again later.")
                })
        }
    }

    const handleBlockWallet = () => {
        setBlocking(true)
        if (blocked) {
            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/unblock-wallet-user/${currentWallet?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    setBlocked(false)
                    getUserWallets(true)
                })
                .catch(err => {
                    toast.error("We cannot process your request at the moment, please try again later.")
                }).finally(() => {
                    setBlocking(false)
                })
        } else {
            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/block-wallet-user/${currentWallet?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    setBlocked(true)
                    getUserWallets(true)
                })
                .catch(err => {
                    toast.error("We cannot process your request at the moment, please try again later.")
                }).finally(() => {
                    setBlocking(false)
                })
        }
    }
    const [savedWallet, setSavedWalelt] = useState({})

    const isCryptoWallet = useMemo(() => currentWallet?.wallet_type === "crypto", [currentWallet])

    const blockedWallet = useMemo(() => {
        return currentWallet?.blocked || currentWallet?.admin_blocked || currentWallet?.blocked || currentWallet?.admin_blocked || currentWallet?.status !== "active"
    }, [currentWallet])

    const [tooltips, setTooltips] = useState({
        add: false,
        convert: false,
        withdraw: false,
        downlaod: false,
        block: false,
        status: false,
    })

    const updateTooltip = (type) => {
        setTooltips(prev => ({
            ...prev,
            [type]: !tooltips[type]
        }))
    }

    const handleClose = () =>{
        setShowWithdrawalModal(false);
        queryParams.delete("action");
        queryParams.delete("wallet_address");
        navigate(
        {
            pathname: location.pathname,
            search: queryParams.toString() ? `?${queryParams.toString()}` : "",
        },
        { replace: true }
    );
    } 
    return (
        <div className={styles.container}>
            {
                savedWallet?._id && userDetails?.username
                    ?
                    <QrGenerate
                        wallets={[savedWallet]}
                        key={"LOLO"}
                    />
                    :
                    ""
            }
            <div className={styles.left} style={{ alignItems: "flex-start" }}>
                <div className={styles.top} >
                    <h2 >{currentWallet?.currency?.code}  {t("Wallet")}</h2>

                    {can("wallet.status.update") && (currentWallet?.wallet_type !== "crypto" && !(currentWallet?.blocked || currentWallet?.admin_blocked || currentWallet?.status !== "active")) ?

                        <div className={styles.default}>
                            <span style={{ textAlign: "right" }}>
                                {t("set as default Wallet").split(" ").map(item => service_name_formatter(item)).join(" ")}
                            </span>
                            <div
                                className={`${styles.switch} ${currentDefault ? styles.disabled : ""}`}
                                onClick={() => {
                                    if (!currentDefault) {
                                        setShowConfirmationModal(true)
                                    }
                                }}
                            >
                                <div className={`${styles.thumb} ${currentDefault ? styles.active : ""}`}></div>
                            </div>
                        </div> : null}
                </div>
                <div className={styles.cards}>
                    {can("wallet.list.view") && (
                        <Swiper
                            effect={"cards"}
                            grabCursor={true}
                            modules={[EffectCards]}
                            cardsEffect={{
                                rotate: false,
                                slideShadows: false,
                            }}
                            style={{
                                minWidth: userWallets?.length === 1 ? "22vw" : "250px",
                                width: userWallets?.length === 1 ? "100%" : "auto",
                                cursor: "none"
                            }} className={`mySwiper ${styles.swiper}`}
                            onSwiper={(swiper) => {
                                if (activeDot > 0) {
                                    swiper.slideTo(activeDot)
                                }
                            }}
                            onSlideChange={e => {
                                setActiveDot(e.activeIndex)
                            }}
                            ref={swiperRef}
                        >
                            {
                                userWallets?.length > 0
                                    ?
                                    userWallets.map((item, index) => (
                                        <SwiperSlide key={index} style={{
                                            cursor: "none",
                                            borderRadius: "10px",
                                        }}>
                                            <Card
                                                data={data}
                                                current={activeDot}
                                                index={index}
                                                key={index}
                                                wallet={item}
                                            />
                                        </SwiperSlide>
                                    ))
                                    : ""
                            }
                        </Swiper>
                    )}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: '10px',
                        marginTop: "20px",
                        marginBottom: 0
                    }} className={`d_r_act_dot ${cardsStyle.dots}`}>
                        {
                            userWallets.map((_, index) => <span
                                key={index * Date.now()}
                                style={{
                                    height: "7px",
                                    width: activeDot === index ? "30px" : "7px",
                                    borderRadius: "30px",
                                    background: activeDot === index ? "#5926f0" : "#666666",
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    setActiveDot(index)
                                    swiperRef?.current?.swiper?.slideTo(index)
                                }}
                            />)
                        }
                    </div>
                </div>
            </div>
            {can("wallet.currencies.add") && (
                <div className={styles.add_cur}>
                    <div onClick={() => setShowAddCurrencyModal(!showAddCurrencyModal)}>
                        <img src={plus} alt="" />
                        <span>{t("Add Currency")}</span>
                    </div>
                </div>
            )}
            <div className={styles.right} style={{ minWidth: window.innerWidth > 600 ? "500px" : "auto" }}>
                <div className={styles.top}>
                    <h2>
                        {t("Wallet Management")}
                    </h2>
                    <div className={styles.badge}>{currentWallet?.currency?.code}  {t("Wallet")}</div>
                </div>
                <div className={styles.actions}>
                    {can("wallet.payment.topup") ?
                        <button
                            disabled={blockedWallet}
                            style={{
                                opacity: blockedWallet ? .7 : 1,
                                cursor: blockedWallet ? "not-allowed" : "pointer",
                                backgroundColor: blockedWallet ? "grey" : "white",
                                color: blockedWallet ? "white" : "inherit",
                            }}
                            className={styles.action}
                            onClick={() => {
                                navigate(`/add-funds?type=${currentWallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${currentWallet?.wallet_id}`)
                            }}
                        >
                            <img src={add_funds} alt="" />
                            {t("Add Funds")}
                        </button>
                        : (
                            <Tooltip
                                title={t("This currency wallet is currently blocked/disabled and funds cannot be added.")}
                                arrow
                                disableHoverListener={!blockedWallet}
                            >
                                <button
                                    disabled={true}
                                    style={{
                                        opacity: .7,
                                        cursor: "not-allowed",
                                        backgroundColor: "grey",
                                        color: "white",
                                    }}
                                    className={styles.action}
                                    onClick={() => {
                                        navigate(`/add-funds?type=${currentWallet?.wallet_type === "crypto" ? "crypto" : "wallet"}&wallet_address=${currentWallet?.wallet_id}`)
                                    }}
                                >
                                    <img src={add_funds} alt="" />
                                    {t("Add Funds")}
                                </button>
                            </Tooltip>)}

                    {can("wallet.payment.conversion") ?
                        <button
                            disabled={blockedWallet}
                            style={{
                                opacity: blockedWallet ? .7 : 1,
                                cursor: blockedWallet ? "not-allowed" : "pointer",
                                backgroundColor: blockedWallet ? "grey" : "white",
                                color: blockedWallet ? "white" : "inherit",
                            }}
                            className={styles.action}
                            onClick={() => setShowConversionModal(!showConversionModal)}
                            id="convert_funds"
                        >
                            <img style={{ height: "20px" }} src={convert} alt="" />
                            {service_name_formatter(t("convert funds "))}
                        </button> : (
                            <Tooltip
                                title={t("This currency wallet is currently blocked/disabled and funds cannot be converted.")}
                                arrow
                                disableHoverListener={!blockedWallet}
                            >
                                <button
                                    disabled={true}
                                    style={{
                                        opacity: .7,
                                        cursor: "not-allowed",
                                        backgroundColor: "grey",
                                        color: "white",
                                    }}
                                    className={styles.action}
                                    onClick={() => setShowConversionModal(!showConversionModal)}
                                    id="convert_funds"
                                >
                                    <img style={{ height: "20px" }} src={convert} alt="" />
                                    {service_name_formatter(t("convert funds "))}
                                </button>
                            </Tooltip>
                        )}

                    {isCryptoWallet ? (
                        can("wallet.payment.withdraw") && (
                            <Tooltip
                                title={t("This currency wallet is currently blocked/disabled and you cannot send crypto.")}
                                arrow
                                disableHoverListener={!blockedWallet}
                            >
                                <button
                                    disabled={blockedWallet}
                                    style={{
                                        opacity: blockedWallet ? .7 : 1,
                                        cursor: blockedWallet ? "not-allowed" : "pointer",
                                        backgroundColor: blockedWallet ? "grey" : "white",
                                        color: blockedWallet ? "white" : "inherit",
                                        whiteSpace: "nowrap"
                                    }}
                                    className={styles.action}
                                    onClick={() => openSendCryptoModal(currentWallet)}
                                    id="send_crypto"
                                >
                                    <img style={{ height: "20px" }} src={withdraw} alt="" />
                                    {t("Send Crypto")}
                                </button>
                            </Tooltip>
                        )
                    ) : can("wallet.payment.withdraw") ? (
                        <button
                            disabled={blockedWallet}
                            style={{
                                opacity: blockedWallet ? .7 : 1,
                                cursor: blockedWallet ? "not-allowed" : "pointer",
                                backgroundColor: blockedWallet ? "grey" : "white",
                                color: blockedWallet ? "white" : "inherit",
                            }}
                            className={styles.action}
                            onClick={() => setShowWithdrawalModal(!showWithdrawalModal)}
                            id="withdraw_balance"
                        >
                            <img style={{ height: "20px" }} src={withdraw} alt="" />
                            {service_name_formatter(t("withdraw balance"))}
                        </button>
                    ) : (
                        <Tooltip
                            title={t("This currency wallet is currently blocked/disabled and you cannot withdraw balance.")}
                            arrow
                        >
                            <button
                                disabled={true}
                                style={{
                                    opacity: .7,
                                    cursor: "not-allowed",
                                    backgroundColor: "grey",
                                    color: "white",
                                }}
                                className={styles.action}
                                onClick={() => setShowWithdrawalModal(!showWithdrawalModal)}
                                id="withdraw_balance"
                            >
                                <img style={{ height: "20px" }} src={withdraw} alt="" />
                                {service_name_formatter(t("withdraw balance"))}
                            </button>
                        </Tooltip>
                    )}

                    {can("transactions.wallet.export") ?
                        <button
                            disabled={blockedWallet}
                            style={{
                                opacity: blockedWallet ? .7 : 1,
                                cursor: blockedWallet ? "not-allowed" : "pointer",
                                backgroundColor: blockedWallet ? "grey" : "white",
                                color: blockedWallet ? "white" : "inherit",
                                whiteSpace: "nowrap"
                            }}
                            className={styles.action}
                            onClick={() => setShowDownloadStatementModal(!showDownloadStatementModal)}
                            id={"download_statement"}
                        >
                            <img style={{ height: "20px" }} src={download} alt="" />
                            {t("Download Statement")}
                        </button>
                        : (
                            <Tooltip
                                title={t("This currency wallet is currently blocked/disabled and you cannot download the statement.")}
                                arrow
                                disableHoverListener={!blockedWallet}
                            >                       <button
                                disabled={true}
                                style={{
                                    opacity: .7,
                                    cursor: "not-allowed",
                                    backgroundColor: "grey",
                                    color: "white",
                                }}
                                className={styles.action}
                                onClick={() => setShowDownloadStatementModal(!showDownloadStatementModal)}
                                id={"download_statement"}
                            >
                                    <img style={{ height: "20px" }} src={download} alt="" />
                                    {t("Download Statement")}
                                </button>
                            </Tooltip>

                        )}

                    {can("wallet.status.update") && (
                        <Tooltip
                            title={t("This currency wallet is currently set as your default and cannot be blocked. To proceed, please set a different currency wallet as your default first.")}
                            arrow
                            disableHoverListener={!currentDefault}
                        >
                            <button
                                className={`${styles.action} ${styles.a_danger}`}
                                onClick={() => {
                                    currentDefault ? console.log("") : handleBlockWallet()
                                }}
                                disabled={currentDefault}
                                style={{
                                    opacity: currentDefault ? .7 : 1,
                                    cursor: currentDefault ? "not-allowed" : "pointer",
                                    backgroundColor: currentDefault ? "grey" : "rgba(230, 64, 103, 0.16)",
                                    color: currentDefault ? "white" : "#E64067",
                                }}
                                id={"block_the_wallet"}
                            >
                                <img style={{ height: "20px" }} src={block} alt="" />
                                {adminBlocked ? t("Blocked By Admin") : !blocked ? t("Block the Wallet") : t("Unblock The Wallet")}
                            </button>
                        </Tooltip>
                    )}

                    {can("wallet.status.update") && (
                        <Tooltip
                            title={t("This currency wallet is currently set as your default and cannot be disabled. To proceed, please set a different currency wallet as your default first.")}
                            arrow
                            disableHoverListener={!currentDefault}
                        >
                            <button
                                className={`${styles.action} ${styles.status}`}
                                onClick={currentDefault ? console.log("Lol") : handleChangeStatus}
                                disabled={currentDefault}
                                style={{
                                    opacity: currentDefault ? .7 : 1,
                                    cursor: currentDefault ? "not-allowed" : "pointer",
                                    backgroundColor: currentDefault ? "grey" : "white",
                                    color: currentDefault ? "white" : "inherit",
                                    whiteSpace: "nowrap"
                                }}
                                id={"status_of_wallet"}
                            >
                                {t("Wallet Status")}
                                <div className={`${styles.switch} ${currentDefault ? styles.disabled : ""}`}>
                                    <div className={`${styles.thumb} ${currentActive ? styles.active : ""}`}></div>
                                </div>
                            </button>
                        </Tooltip>
                    )}

                </div>
            </div>
            <DefaultWalletModal
                setShowConfirmationModal={setShowConfirmationModal}
                showConfirmationModal={showConfirmationModal}
                wallet={currentWallet}
                setActiveDot={setActiveDot}
            />
            <AddCurrencyModal
                isOpen={showAddCurrencyModal}
                toggle={() => setShowAddCurrencyModal(!showAddCurrencyModal)}
                setSavedWalelt={setSavedWalelt}
            />
            {
                userWithdrawals?.length > 0
                    ?
                    <Withdraw
                        wallet={currentWallet}
                        isOpen={showWithdrawalModal}
                        toggle={handleClose}
                    />
                    :
                    <>
                        {
                            showWithdrawalModal
                            &&
                            <AddWithdrawalsModal
                                isOpen={showWithdrawalModal}
                                toggle={() => {
                                    setShowWithdrawalModal(!showWithdrawalModal)
                                }}
                            />
                        }
                    </>
            }
            {showSendCryptoModal && sendCryptoWallet && (
                <SendCryptoModal
                    isOpen={showSendCryptoModal}
                    toggle={() => setShowSendCryptoModal(false)}
                    wallet={sendCryptoWallet}
                />
            )}
            <DownloadStatement
                showModal={showDownloadStatementModal}
                setShowModal={setShowDownloadStatementModal}
                wallet={currentWallet}
            />
            <Modal isOpen={showConversionModal}>
                <ModalHeader toggle={() => setShowConversionModal(!showConversionModal)}>
                    {t("convert funds ")}
                </ModalHeader>
                <ModalBody>
                    <CurConversion extCurrency={currentWallet?.currency?.code} extWallet={currentWallet} />
                </ModalBody>
            </Modal>
        </div>
    )
}

export default Top
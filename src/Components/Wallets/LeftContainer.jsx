import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styles from "./styles/Left.module.scss"
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Progress } from "reactstrap"
import { useTranslation } from 'react-i18next';
import top_up from "./files/top_up.svg"
import down_load from "./files/down_load.svg"
import block from "./files/block.svg"
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from 'swiper'
import jsPDF from 'jspdf'
import calendar from "./files/calendar.svg"
import { DateRangePicker } from 'react-date-range'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import img from "../../assets/images/logo/logo2.png"
import { UserContext } from '../../Context/UserContext'
import { Link, useLocation } from 'react-router-dom'
import cardsStyle from "../HomeNewUpdated/styles/CardsContainer.module.css"
import withdraw from "../UserSettingsNew/files/mwc_active.svg"
import Withdraw from './Withdraw'
import { toast } from 'react-toastify'
import Card from './Card'
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem';


const LeftContainer = ({ wallet, setCurrent, authHeader, userWallets, userDetails, verifyToken, current }) => {
    const { getUserWallets, beneficiaries } = useContext(UserContext)
    const { t } = useTranslation()
    const [active, setActive] = useState(wallet?.status?.toLowerCase() === "active" ? true : false)
    const [downlaoding, setDownloading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [fileType, setFileType] = useState("")
    const [dateString, setDateString] = useState("")
    const [blocking, setBlocking] = useState(false)
    const [adminBlocked, setAdminBlocked] = useState(wallet?.admin_blocked)
    const [blocked, setBlocked] = useState(wallet?.blocked)
    const [downloadError, setDownloadError] = useState("")

    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [apiDates, setApiDates] = useState(null)
    const handleChange = (ranges) => {
        if (ranges.selection) {
            const startDate = new Date(ranges.selection.startDate);
            startDate.setDate(startDate.getDate() + 1);

            const endDate = new Date(ranges.selection.endDate);
            endDate.setDate(endDate.getDate() + 1);

            const formattedDateRange = {
                from: startDate.toISOString().split('T')[0],
                to: endDate.toISOString().split('T')[0],
            };
            setDateString(`Selected from "${startDate.toDateString()}" to "${endDate.toDateString()}"`)
            setApiDates(formattedDateRange)
            setDateRange(ranges.selection);
        }
    };
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        if (wallet) {
            setActive(wallet?.status?.toLowerCase() === "active" ? true : false)
            setAdminBlocked(wallet?.admin_blocked ? true : false)
            setBlocked(wallet?.blocked ? true : false)
        }
    }, [wallet])

    const handleChangeStatus = () => {
        if (active) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/deactivate-wallet/${wallet._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    getUserWallets()
                    setActive(false)
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                })
        } else {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/activate-wallet/${wallet._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setActive(true)
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                })
        }
    }

    const handleBlockWallet = () => {
        setBlocking(true)
        if (blocked) {
            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/unblock-wallet-user/${wallet._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setBlocked(false)
                    getUserWallets()
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                }).finally(() => {
                    setBlocking(false)
                })
        } else {
            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/block-wallet-user/${wallet._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setBlocked(true)
                    getUserWallets()
                })
                .catch(err => {
                    // console.log(decryptData(err.response.data.data))
                }).finally(() => {
                    setBlocking(false)
                })
        }
    }


    const getTransactions = (callback) => {
        setDownloadError("")
        const data = {
            ...apiDates,
            query: ""
        }
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/0/0`,
            {
                data: encrypted
            }, {
            headers: authHeader,
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                callback(decrypted.transactionList.filter(item => item.wallet_id === wallet.wallet_id))
                setShowModal(false)
                setApiDates(null)
                setFileType("")
                setDateString("")
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                console.log(decrypted)
                setDownloadError("No transactions found within the date range!")
                toast.error(decrypted?.message)
            })
            .finally(() => {
                setDownloading(false)
            })
    }

    const generatePDF = () => {
        setDownloading(true);
        const tableStyles = {
            fontSize: 7,
        };
        const tableHeaderStyles = {
            fontSize: 7,
            fillColor: [89, 38, 240],
            textColor: [255, 255, 255],
        };

        const doc = new jsPDF();


        doc.addImage(img, "png", 14, 10, 46.5, 13)
        // doc.setFont("montserrat", "normal", "bolder");
        // doc.setFontSize(20);
        // doc.text("InstaPay", 14, 25);

        doc.setFont("montserrat", "normal");
        doc.setFontSize(10);
        doc.text(`Wallet ID: INSTA-${wallet.wallet_id}`, 14, 32);
        doc.text(`Name: ${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}`, 14, 38);
        doc.text(`Address: ${userDetails?.address ?? "N/A"}`, 14, 44);
        doc.text(`Statement Duration: ${apiDates?.from} to ${apiDates?.to}`, 14, 50);

        const transactionsTable = {
            head: [
                [
                    "Wallet ID",
                    "Wallet Currency",
                    "Current Balance",
                    "Wallet Status",
                ],
            ],
            body: [[
                `INSTA-${wallet?.wallet_id}`,
                wallet?.currency?.code,
                `${wallet?.currency?.code} ${wallet?.balance?.available?.toFixed(2)}`,
                wallet?.status?.toUpperCase()
            ]],
            startY: 60,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
        };

        doc.autoTable(transactionsTable);

        // Current Time and Date
        const currentDate = new Date();
        const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("montserrat", "normal", "bold");
        doc.setFontSize(10);
        doc.text(formattedDate, 160, 17.5);

        const callback = (arr) => {

            const transactionsTable = {
                head: [
                    [
                        "Date & Time",
                        "Transaction ID",
                        "Payment Type",
                        "Recipient",
                        "Type",
                        "Amount",
                        "Status",
                    ],
                ],
                body: arr.map((item) => {
                    const internationalReceiver = beneficiaries.filter(benef => benef?._id === item?.beneficiary)?.[0]

                    return [
                        new Date(item?.createdAt)?.toLocaleString(),
                        item?.reference_id,
                        item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin"
                            ?
                            "Admin Funds"
                            :
                            item?.payment_type?.includes("bank")
                                ?
                                "Bank"
                                :
                                item?.payment_type?.includes("mobile")
                                    ?
                                    "mobile"
                                    :
                                    service_name_formatter(item?.payment_type),
                        item?.service_type === "airtime"
                            ?
                            item?.airtime_number
                            :
                            item?.payment_type === "conversion" || item?.service_type === "withdrawal"
                                ?
                                item?.wallet_id
                                :
                                item?.transaction_type?.toLowerCase() === "debit"
                                    ?
                                    item?.service_type === "withdraw_by_admin"
                                        ?
                                        "Admin"
                                        :
                                        item?.service_type === "kyc_verification"
                                            ?
                                            "InstaPay"
                                            :
                                            item?.service_type === "withdrawal"
                                                ?
                                                `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)
                                                :
                                                item?.receiver
                                                    ?
                                                    `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                                    :
                                                    `${internationalReceiver?.first_name} ${internationalReceiver?.last_name}`.slice(0, 20)

                                    :
                                    item?.service_type === "topup"
                                        ?
                                        `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                        :
                                        `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20),
                        service_name_formatter(item?.service_type),
                        `${item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}${item?.currency?.code} ${item?.amount ? item?.amount.toFixed(2) : ""}`,
                        item?.status,
                    ]
                }),
                startY: 80,
                styles: tableStyles,
                headStyles: tableHeaderStyles,
            };

            doc.autoTable(transactionsTable);

            doc.save(`${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}_transactions.pdf`);
        };
        getTransactions(callback);
    };


    // default wallet
    const [isSaving, setIsSaving] = useState(false)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [currentDefault, setCurrentDefault] = useState(wallet?.default ? true : false)
    const [defaultWal, setDefaultWal] = useState(null)

    useEffect(() => {
        if (userWallets.length > 0) {
            setCurrentDefault(wallet?.default ? true : false)

            const filterDefault = userWallets.filter(wal => wal?.default)[0]
            setDefaultWal(filterDefault)
        }
    }, [userWallets, wallet])

    const setActiveQrHandler = (setter) => {
        setIsSaving(true)
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/set-to-default-wallet/${wallet?.wallet_id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                getUserWallets()
                setter(prev => !prev)
                // console.log(decrypted)
                setIsSaving(false)
                setShowConfirmationModal(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsSaving(false)
            })
    }
    const qrDefaultChange = (setter) => {
        if (defaultWal?.wallet_id === wallet?.wallet_id) {
            setActiveQrHandler(setter)
        } else {
            setShowConfirmationModal(true)
        }
    }


    const switchStyle = {
        display: 'inline-block',
        width: '80px',
        height: '36px',
        backgroundColor: "#ededed",
        borderRadius: '100px',
        position: 'relative',
        cursor: currentDefault ? "not-allowed" : 'pointer',
    };

    const thumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: active ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: active ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    const statusThumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: currentDefault ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: currentDefault ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    const swiperRef = useRef(null)


    // warning defautl
    const [showWarning, setShowWarning] = useState(false);
    const [showBlockWarning, setShowBlockWarning] = useState(false);
    const [showTopupWarning, setShowTopupWarning] = useState(false);

    // withdrawal
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)


    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_address = queryParams.get("wallet_address")
    const action = queryParams.get("action")

    useEffect(() => {
        if (wallet_address) {
            const walletIndex = userWallets?.findIndex(item => item?.wallet_id?.toLowerCase() === wallet_address?.toLowerCase())
            setCurrent(walletIndex)
        }
    }, [wallet_address])

    useEffect(() => {
        if (action, wallet) {
            if (action?.toLowerCase() === "download") {
                setShowModal(true)
            }
            if (action?.toLowerCase() === "withdraw") {
                if (adminBlocked || blocked || !active) {
                    return
                } else {
                    setShowWithdrawalModal(true)
                }
            }
        }
    }, [action, wallet])
    return (
        <div className={styles.left}>
            <Modal isOpen={showModal}>
                <ModalHeader toggle={() => setShowModal(!showModal)}>
                    {t("Download Statement")}
                </ModalHeader>
                <ModalBody>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        position: "relative",
                        marginBottom: ".5rem"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", width: "90%", overflowX: "auto", padding: "1rem", background: "rgb(240,240,240)", borderRadius: "7px", whiteSpace: "nowrap" }}>{dateString}</div>
                        <img src={calendar} alt="i" onClick={handleDatePickerClick} />
                        {showDatePicker && (
                            <div ref={datePickerRef} style={{ position: "absolute", top: "50px", right: `0px`, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", zIndex: 10000000 }}>
                                <DateRangePicker maxDate={new Date()}
                                    ranges={[dateRange]}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>
                    {
                        downloadError
                        &&
                        <div style={{ color: "red", fontSize: ".65rem", fontWeight: 500, margin: ".5rem 0" }}>{downloadError}</div>
                    }
                    <Input type='select' value={fileType} onChange={e => setFileType(e.target.value)}>
                        <option value="">{t("-Select-File-Type-")}</option>
                        <option value="PDF">PDF</option>
                        <option value="CSV">CSV</option>
                    </Input>
                </ModalBody>
                <ModalFooter>
                    <Button
                        disabled={!fileType || !apiDates || downlaoding}
                        onClick={generatePDF}
                        style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >{downlaoding ? t("Downloading") + "..." : t("Download Now")}</Button>
                </ModalFooter>
            </Modal>

            {/* default wallet change modal */}
            <Modal isOpen={showConfirmationModal} toggle={() => setShowConfirmationModal(!showConfirmationModal)}>
                <ModalHeader toggle={() => setShowConfirmationModal(!showConfirmationModal)}>
                    Confirmation
                </ModalHeader>
                <ModalBody>
                    You are setting {wallet?.currency?.code}  as default. Previously {defaultWal?.currency?.code}  was default QR.
                </ModalBody>
                <ModalFooter>
                    <Button disabled={isSaving} onClick={() => setShowConfirmationModal(!showConfirmationModal)}
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button disabled={isSaving} onClick={() => setActiveQrHandler(setCurrentDefault)} color="primary"
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }}
                    >
                        Continue
                    </Button>
                </ModalFooter>
            </Modal>


            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <h4 >{wallet?.currency?.code}  {t("Wallet")}</h4>
                <div className={styles.lbt_b}>
                    <span>{t("Default")}: </span>
                    <div style={switchStyle} onClick={() => {
                        if (currentDefault) return;
                        qrDefaultChange(setCurrentDefault)
                    }}>
                        <div style={statusThumbStyle}></div>
                    </div>
                </div>
            </div>
            <Swiper
                effect={"cards"}
                grabCursor={true}
                modules={[EffectCards]}
                cardsEffect={{
                    rotate: false
                }}
                style={{ minWidth: "250px", cursor: "none", maxWidth: window.innerWidth < 1000 ? "100%" : window.innerWidth > 1500 ? "310px" : "270px" }}
                className="mySwiper"
                onSlideChange={e => setCurrent(e.activeIndex)}
                ref={swiperRef}
            >
                {
                    userWallets.length > 0
                        ?
                        userWallets.map((data, index) => (
                            <SwiperSlide key={index} style={{
                                cursor: "none",
                                borderRadius: "16px",
                            }}>
                                <Card
                                    current={current}
                                    index={index}
                                    wallet={data}
                                />
                            </SwiperSlide>
                        ))
                        : ""
                }
            </Swiper>
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: '10px',
            }} className={`d_r_act_dot ${cardsStyle.dots}`}>
                {
                    userWallets.map((_, index) => <span
                        key={index * Date.now()}
                        style={{
                            height: "7px",
                            width: current === index ? "30px" : "7px",
                            borderRadius: "30px",
                            background: current === index ? "#5926f0" : "#666666",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            setCurrent(index)
                            swiperRef?.current?.swiper?.slideTo(index)
                        }}
                    />)
                }
            </div>
            <div className={styles.manage}>
                <h5>{t("Wallet Management")}</h5>
                <Link
                    to={adminBlocked || blocked || !active ? "" : `/add-funds?type=wallet&wallet_address=${wallet?.wallet_id}`} style={{
                        position: "relative",
                        pointerEvents: adminBlocked || blocked || !active ? "none" : "all"
                    }}
                    onClick={(e) => {
                        if (adminBlocked || blocked || !active) return;
                    }}
                    onMouseOver={() => {
                        if (adminBlocked || blocked || !active) {
                            setShowTopupWarning(true)
                        }
                    }} onMouseLeave={() => setShowTopupWarning(false)}
                >
                    <button onClick={verifyToken} className={styles.btn}
                        style={{
                            opacity: adminBlocked || blocked || !active ? ".8" : "1",
                            cursor: adminBlocked || blocked || !active ? "not-allowed" : "pointer",
                        }}>
                        <div>
                            <img src={top_up} alt='i' />
                        </div>
                        <span>{t("Top-up Your Wallet")}</span>
                    </button>
                    {
                        showTopupWarning
                        &&
                        <div style={{
                            position: "absolute",
                            top: "-100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                            background: "#5926f0",
                            width: "fit-content",
                            padding: ".6rem 1rem",
                            color: "white",
                            borderRadius: "7px"
                        }}>Disabled/Blocked wallet cannot be funded, <br /> Make sure to unblock/active it first.</div>
                    }
                </Link>
                <button className={styles.btn} disabled={adminBlocked || blocked || !active} onClick={() => setShowWithdrawalModal(true)}>
                    <div>
                        <img style={{ height: "20px", width: "24px", objectFit: "contain" }} src={withdraw} alt='i' />
                    </div>
                    <span>{t("Withdraw Balance")}</span>
                </button>
                {
                    wallet &&
                    <Withdraw
                        wallet={wallet}
                        isOpen={showWithdrawalModal}
                        toggle={() => setShowWithdrawalModal(!showWithdrawalModal)}
                    />
                }
                <button className={styles.btn} onClick={() => {
                    setShowModal(!showModal)
                }} disabled={downlaoding}>
                    <div>
                        <img src={down_load} alt='i' />
                    </div>
                    <span>{!downlaoding ? t("Download Statement") : t("Downloading") + "..."}</span>
                </button>
                <button style={{ opacity: blocking || adminBlocked || currentDefault ? ".7" : "1", pointerEvents: blocking || adminBlocked ? "none" : "all", position: "relative" }} onClick={() => {
                    currentDefault ? console.log("") : handleBlockWallet()
                }} className={styles.btn}
                    onMouseOver={() => {
                        if (currentDefault) {
                            setShowBlockWarning(true)
                        }
                    }} onMouseLeave={() => setShowBlockWarning(false)}
                >
                    {
                        showBlockWarning
                        &&
                        <div style={{
                            position: "absolute",
                            top: "-100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                            background: "#5926f0",
                            width: "fit-content",
                            padding: ".6rem 1rem",
                            color: "white",
                            borderRadius: "7px"
                        }}>Default wallet cannot be blocked, <br /> Select another wallet as default first.</div>
                    }
                    <div>
                        <img src={block} alt='i' />
                    </div>
                    <span>{adminBlocked ? t("Blocked By Admin") : !blocked ? t("Block the Wallet") : t("Unblock the Wallet")}</span>
                </button>
                <div className={styles.status}>
                    <span>{t("Wallet Status")}</span>
                    <div style={switchStyle} onMouseOver={() => {
                        if (currentDefault) {
                            setShowWarning(true)
                        }
                    }} onMouseLeave={() => setShowWarning(false)} onClick={() => currentDefault ? "a" : handleChangeStatus()}>
                        <div style={thumbStyle}></div>
                        {
                            showWarning
                            &&
                            <div style={{
                                position: "absolute",
                                top: "-110%",
                                left: "-50%",
                                whiteSpace: "nowrap",
                                background: "#5926f0",
                                width: "fit-content",
                                padding: ".6rem 1rem",
                                color: "white",
                                borderRadius: "7px"
                            }}>Default wallet cannot be switched, <br /> Select another wallet as default first.</div>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
}

export default LeftContainer

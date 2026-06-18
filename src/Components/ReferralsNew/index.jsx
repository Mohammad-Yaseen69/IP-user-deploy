import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import EarnMoneyBanner from "../HomeNewUpdated/EarnMoneyBanner";
import { Check, ChevronDown, ChevronRight, MoreHorizontal } from "react-feather";
import copy_ic from "../ChipsInNew/copy.png"
import ref_share from "./ref_share.png"
import { useContext, useEffect, useMemo, useState } from "react";
import SocialModal from "../ShareBtn/SocialModal";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { Button, Card, CardBody, CardText, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import countries from "../PaymentsNewer/CountriesData.json"
import InstaPayLoader from "../Loader";
import CommissionConversion from "./CommissionConversion";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import CommissionWithdraw from "./CommissionWithdraw";
import RefItem from "./RefItem";
import TransactionItem from "../TransactionsNewApi/TransactionItem";
import TransactionItemMobile from "../TransactionsNewApi/Mobile/TransactionItemMobile";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const ReferralsNew = () => {
    const { referralLink, userDetails, authHeader, getInvitationLink, getReferralCommission, totalReferralAmount, userWallets, validateReceivingLimits, verifyToken, commisions } = useContext(UserContext)

    const isLimitReached = useMemo(() => validateReceivingLimits(), [])
    const can = usePermission()
    useEffect(() => {
        if (userDetails) {
            getInvitationLink()
        }
    }, [userDetails])


    const [copied, setCopied] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [referrals, setReferrals] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReferral, setSelectedReferral] = useState(null)

    const handleCopy = () => {
        const textField = document.createElement('textarea');
        textField.innerText = referralLink;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 4000);
    };

    const { t } = useTranslation()

    const canWithdrawCommission = can("referrals.commission.withdraw")
    const canConvertCommission = can("referrals.commission.convert")
    const canShareReferral = can("referrals.link.share")
    const getReferrals = () => {
        if (userDetails?.account_type === "individual") {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-referral/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setIsLoading(false)
                    if (decrypted?.data && decrypted?.data.length > 0) {
                        const arr = decrypted?.data?.map(item => {
                            const country = countries.find(coun => coun.alpha3 === item?.referral?.country_iso_code)
                            return {
                                joined: new Date(item?.referral?.createdAt).toLocaleDateString(),
                                id: item?.referral?._id,
                                name: item?.referral?.account_type === "individual" ? `${item?.referral?.user?.first_name} ${item?.referral?.user?.last_name}` : item?.referral?.company?.company_name,
                                username: item?.referral?.username,
                                status: "Referral Complete",
                                amount: item?.totalCommission,
                                country
                            }
                        })
                        setReferrals(arr)
                    }
                })
                .catch(err => {
                    setIsLoading(false)
                })
        } else {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-company-referral/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    setIsLoading(false)
                    if (decrypted?.data && decrypted?.data.length > 0) {
                        const arr = decrypted?.data?.map(item => {
                            const country = countries.find(coun => coun.alpha3 === item?.referral?.country_iso_code)
                            return {
                                joined: new Date(item?.referral?.createdAt).toLocaleDateString(),
                                id: item?.referral?._id,
                                name: item?.referral?.account_type === "individual" ? `${item?.referral?.user?.first_name} ${item?.referral?.user?.last_name}` : item?.referral?.company?.company_name,
                                username: item?.referral?.username,
                                status: "Referral Complete",
                                amount: item?.totalCommission,
                                country
                            }
                        })
                        setReferrals(arr)
                    }
                })
                .catch(err => {
                    setIsLoading(false)
                })
        }
    }

    useEffect(() => {
        if (userDetails) {
            getReferralCommission()
            getReferrals()
        }
    }, [userDetails])

    const defaultWalletCurrency = useMemo(() => userWallets?.filter(item => item?.default)?.[0]?.currency, [userWallets])
    const selectedReferralCommissions = useMemo(() => {
        if (!selectedReferral?.id) {
            return []
        }

        return (commisions ?? [])
            ?.filter(item => item?.child?._id === selectedReferral.id)
            ?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
    }, [commisions, selectedReferral])

    const formatCommissionDate = (date) => {
        if (!date) {
            return t("N/A")
        }

        return new Date(date).toLocaleString()
    }

    const getCommissionAmount = (commission) => {
        const amount = commission?.amount ?? commission?.commission ?? commission?.totalCommission ?? commission?.referralCommission ?? 0
        return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const [showMore, setShowMore] = useState(false)
    const toggleShowMore = () => setShowMore(prev => !prev);
    const [convertModal, setConvertModal] = useState(false)
    const toggleConvertModal = () => setConvertModal(!convertModal)
    const [withdrawModal, setWithdrawModal] = useState(false)
    const toggleWithdrawModal = () => setWithdrawModal(!withdrawModal)
    const [success, setSuccess] = useState(false)
    const [currentTab, setCurrentTab] = useState("My Referrals")
    const [transactions, setTransactions] = useState([])
    const [activeItem, setActiveItem] = useState(0)

    useEffect(() => {
        const getTransactions = async () => {
            setIsLoading(true)

            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-service-transactions/commission/${userDetails?._id}/0/200`)
                const dec = decryptData(res.data.data)
                console.log(dec)
                setTransactions(dec?.transactionList ?? [])
            }
            catch (error) {
                console.log(error)
                const dec = decryptData(error?.response?.data?.data)
                console.log(dec)
                setTransactions([])
            }
            finally {
                setIsLoading(false)
            }
        }


        if (userDetails) {
            getTransactions()
        }
    }, [userDetails])

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("Referrals")}</h4>
                {
                    window.innerWidth > 1000
                    &&
                    <TopRight />
                }
            </div>
            {
                userDetails?.username
                    ?
                    <>
                        {
                            convertModal &&
                            <CommissionConversion
                                isOpen={convertModal}
                                toggle={toggleConvertModal}
                                referralBalance={+totalReferralAmount}
                                defaultCurrency={defaultWalletCurrency?.code}
                                setSuccess={setSuccess}
                                getReferralCommission={getReferralCommission}
                                toggleWithdrawModal={toggleWithdrawModal}
                            />
                        }
                        {
                            withdrawModal &&
                            <CommissionWithdraw
                                isOpen={withdrawModal}
                                toggle={toggleWithdrawModal}
                                referralBalance={+totalReferralAmount}
                                defaultCurrency={defaultWalletCurrency?.code}
                                setSuccess={setSuccess}
                                getReferralCommission={getReferralCommission}
                            />
                        }
                        {
                            success
                            &&
                            <SuccessModal
                                isOpen={success}
                                message={"Commission Converted to wallet balance successfully!"}
                                subMessage={"Commission Converted"}
                                toggle={() => {
                                    setSuccess(false)
                                    verifyToken()
                                }}
                            />
                        }
                        <Modal isOpen={Boolean(selectedReferral)} toggle={() => setSelectedReferral(null)} centered>
                            <ModalHeader toggle={() => setSelectedReferral(null)}>
                                {selectedReferral?.name ? `${selectedReferral.name} ${t("Commissions")}` : t("Referral Commissions")}
                            </ModalHeader>
                            <ModalBody>
                                <div className={styles.commission_summary}>
                                    <span>{t("Total Commission")}</span>
                                    <strong>${Number(selectedReferral?.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                </div>
                                {
                                    selectedReferralCommissions?.length > 0
                                        ?
                                        <div className={styles.commission_timeline}>
                                            {
                                                selectedReferralCommissions.map((commission, index) => (
                                                    <div className={styles.timeline_item} key={commission?._id ?? index}>
                                                        <div className={styles.timeline_marker} />
                                                        <div className={styles.timeline_content}>
                                                            <div>
                                                                <h6>{commission?.description ?? commission?.type ?? t("Commission Earned")}</h6>
                                                                <strong>+${getCommissionAmount(commission)}</strong>
                                                            </div>
                                                            <span>{formatCommissionDate(commission?.createdAt ?? commission?.updatedAt)}</span>
                                                            {
                                                                commission?.status
                                                                &&
                                                                <p>{t("Status")}: {commission?.status}</p>
                                                            }
                                                            {
                                                                (commission?.transaction?._id || commission?.transaction_id)
                                                                &&
                                                                <p>{t("Transaction ID")}: {commission?.transaction?._id ?? commission?.transaction_id}</p>
                                                            }
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        :
                                        <div className={styles.empty_commissions}>
                                            {t("No commissions found for this referral.")}
                                        </div>
                                }
                            </ModalBody>
                        </Modal>
                        <div className={styles.banner_con}>
                            <EarnMoneyBanner height="100%" showLink={false} headSize={"4cqi"} textSize={"2cqi"} radius={"30px"} minWidth="40vw" />
                            <div style={{ display: "flex", gap: "1.5rem", flex: 1 }}>
                                <div className={styles.total_refs}>
                                    <div>
                                        <h5>{t("Total Referrals")}</h5>
                                        {/* <MoreHorizontal /> */}
                                    </div>
                                    <h3>{referrals?.length}</h3>
                                </div>
                                <div className={styles.total_earn}>
                                    <div>
                                        <h5>{t("My Earnings")}</h5>
                                        {
                                            totalReferralAmount
                                                ?
                                                <div onClick={toggleShowMore} style={{
                                                    position: "relative",
                                                    cursor: "pointer"
                                                }}>
                                                    <MoreHorizontal />
                                                    {
                                                        showMore ?
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "110%",
                                                                right: 0,
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                background: "white",
                                                                borderRadius: "8px",
                                                                gap: 0
                                                            }}>
                                                                {
                                                                    !isLimitReached
                                                                    && canConvertCommission &&
                                                                    <div
                                                                        style={{
                                                                            padding: "13px 16px",
                                                                            fontSize: ".9rem",
                                                                            fontWeight: 600,
                                                                            color: "black",
                                                                            whiteSpace: "nowrap",
                                                                            marginBottom: 0,
                                                                            cursor: "pointer"
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            toggleConvertModal()
                                                                            toggleShowMore()
                                                                        }}
                                                                    >{t("Move To Main Balance")}</div>
                                                                }
                                                                {
                                                                    canWithdrawCommission && (
                                                                        isLimitReached
                                                                        ||
                                                                        totalReferralAmount > (userDetails?.level?.daily_receiving_limit - userDetails?.used_limits?.daily_receiving_limit)
                                                                    )
                                                                        ?
                                                                        <div
                                                                            style={{
                                                                                padding: "13px 16px",
                                                                                fontSize: ".9rem",
                                                                                fontWeight: 600,
                                                                                color: "black",
                                                                                whiteSpace: "nowrap",
                                                                                marginBottom: 0,
                                                                                cursor: "pointer",
                                                                                borderTop: "1px solid #1111111e"
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                toggleWithdrawModal()
                                                                                toggleShowMore()
                                                                            }}
                                                                        >{t("External Withdraw")}</div>
                                                                        : ""
                                                                }
                                                            </div>
                                                            : ""
                                                    }
                                                </div>
                                                : ""
                                        }
                                    </div>
                                    <h3>{"$"}{Number(totalReferralAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                    {
                                        userDetails?.external_witdrawal_commission
                                        &&
                                        <div style={{ fontSize: ".7rem", fontWeight: "400", marginTop: "1rem" }}>${userDetails?.external_witdrawal_commission} {t("is being processed for external withdrawal.")}</div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={styles.ref_dets}>
                            <div className={`${styles.ref_dets_sub} ${styles.left}`}>
                                <span>
                                    {t("Your Referral ID")}:
                                </span>
                                <h4>
                                    {referralLink.split("/signup/")[1] + userDetails?.username}
                                </h4>
                            </div>
                            <div className={`${styles.ref_dets_sub} ${styles.right}`}>
                                <span>{t("Share Your Unique Referral Link")}: </span>
                                <div style={{ gap: window.innerWidth < 500 && "0.5rem" }} className={styles.bot}>
                                    <div>
                                        <span>
                                            {referralLink + userDetails?.username}
                                        </span>
                                        {
                                            copied
                                                ?
                                                <Check />
                                                :
                                                <img src={copy_ic} alt="c" loading="lazy" style={{ cursor: "pointer" }} onClick={handleCopy} />
                                        }
                                    </div>
                                    {
                                        canShareReferral &&
                                        <img src={ref_share} alt="r" loading="lazy" style={{ cursor: "pointer" }} onClick={() => setShowShareModal(!showShareModal)} />
                                    }   </div>
                                <SocialModal isOpen={showShareModal} toggle={() => setShowShareModal(!showShareModal)} link={referralLink} />
                            </div>
                        </div>
                        <div className={styles.ref_guide}>
                            <h4>{t("How do I Refer a Friend to InstaPay?")}</h4>
                            <div>
                                <div className={styles.ref_guide_item}>
                                    <h4>{t("Step 01")}</h4>
                                    <p>{t("Share your InstaPay unique referral link with your friends.")}</p>
                                </div>
                                <div className={styles.ref_guide_item}>
                                    <h4>{t("Step 02")}</h4>
                                    <p>{t("Earn rewards when they transact $100 or more")}</p>
                                </div>
                                <div className={styles.ref_guide_item}>
                                    <h4>{t("Step 03")}</h4>
                                    <p>{t("Earn up to $0.06 for every transaction your followers make.")}</p>
                                </div>
                            </div>
                        </div>
                        {
                            isLoading ?
                                <div style={{ height: "300px", width: "300px", margin: "0 auto" }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                <>
                                    <div className={styles.ref_table}>
                                        <div className={styles.item}>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{t(currentTab)}</div>
                                            <Button color="primary" style={{ borderRadius: "8px" }} onClick={() => setCurrentTab(currentTab === "My Referrals" ? "my withdrawls" : "My Referrals")}>{currentTab === "My Referrals" ? t("My Withdrawls") : t("My Referrals")}</Button>
                                        </div>
                                        {
                                            currentTab === "My Referrals"
                                                ?
                                                <>
                                                    <div className={styles.item}>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Country")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Name")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Username")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Joined At")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Profile Link")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Commission")}</div>
                                                        <div style={{ color: "#6f6f6f", fontSize: ".85rem" }}>{t("Action")}</div>
                                                    </div>
                                                    {
                                                        referrals.map(item => (
                                                            <div key={item?.id} className={styles.item}>
                                                                <RefItem item={item} onViewCommissions={setSelectedReferral} />
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                                :
                                                <>
                                                    <div className={styles.table_header}>
                                                        <div>{t("Date & Time")}</div>
                                                        <div>{t("Type")}</div>
                                                        <div>{t("Transaction ID")}</div>
                                                        <div>{t("Payment Type")}</div>
                                                        <div>{t("Recipient")}</div>
                                                        <div>{t("Amount")}</div>
                                                        <div>{t("Status")}</div>
                                                        {/* <div style={{ maxWidth: "15px" }}></div> */}
                                                    </div>
                                                    {
                                                        transactions?.map((item, index) => (
                                                            <TransactionItem
                                                                activeItem={activeItem}
                                                                color={""}
                                                                index={index}
                                                                item={item}
                                                                setActiveItem={setActiveItem}
                                                                key={item?._id}
                                                                fromReferral={true}
                                                            />
                                                        ))
                                                    }
                                                </>
                                        }
                                        {/* {
                                            referrals.map(referral => (
                                                <div className={styles.item}>
                                                    <div className={styles.details}>
                                                        <div>{referral.joined}</div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <img src={referral?.country?.file_url} alt={referral?.country?.alpha3} style={{ width: "45px", height: "30px", objectFit: "cover", boxShadow: "0 0 3px #000" }} />
                                                            <h5 style={{ marginBottom: 0 }}>{referral?.country?.name}</h5>
                                                        </div>
                                                        <div>{referral.name}</div>
                                                    </div>
                                                    <div className={styles.amount_status}>
                                                        <div className={styles.status}>{referral.status}</div>
                                                        <div className={styles.amount}>+${referral?.amount}</div>
                                                    </div>
                                                </div>
                                            ))
                                        } */}
                                    </div>
                                    {/* <div className={styles.ref_table_mobile}>
                                        <h5>{t("My Referrals")}</h5>
                                        {
                                            currentTab === "My Referrals"
                                                ?
                                                referrals.map(referral => (
                                                    <ReferralItemMobile
                                                        referral={referral}
                                                    />
                                                ))
                                                :
                                                transactions?.map((item, index) => (
                                                    <TransactionItemMobile
                                                        activeItem={activeItem}
                                                        index={index}
                                                        item={item}
                                                        setActiveItem={setActiveItem}
                                                        key={item?._id}
                                                        fromReferral={true}
                                                    />
                                                ))
                                        }
                                    </div> */}
                                </>
                        }
                    </>
                    :
                    <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                        <CardBody>
                            <CardText>{t("Please add username to your profile to enable referrals feature.")} <Link to={"/settings?tab=basic"} style={{ textDecoration: "underline", fontWeight: 600 }}>{t("Add Now")}</Link></CardText>
                        </CardBody>
                    </Card>
            }
        </div>
    )
}

export default ReferralsNew

// const ReferralItemMobile = ({ referral }) => {
//     const [isOpen, setIsOpen] = useState("")
//     const navigate = useNavigate()

//     console.log(referral)
//     return (
//         <>
//             <div className={styles.ref_card} onClick={() => setIsOpen(referral?._id)}>
//                 <div className={styles.left}>
//                     <div className={styles.dp}>
//                         {referral?.name?.slice(0, 2)}
//                     </div>
//                     <div className={styles.name}>
//                         <h6>{referral?.name}</h6>
//                         <span>{referral?.joined}</span>
//                     </div>
//                 </div>
//                 <div className={styles.more}>
//                     <div className={styles.amount}>+${referral?.amount}</div>
//                     {
//                         isOpen === referral?._id
//                             ?
//                             <ChevronDown />
//                             :
//                             <ChevronRight />
//                     }
//                 </div>
//             </div>
//             {
//                 isOpen === referral?._id
//                 &&
//                 <div style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: "1rem",
//                     padding: "1rem"
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", fontSize: ".9rem" }}>
//                         <span>Username:</span>
//                         <strong>{referral?.username ?? "No Username"}</strong>
//                     </div>
//                     {
//                         referral?.username
//                         &&
//                         <Button color="primary" style={{ width: "100%", borderRadius: "10px" }} onClick={() => {
//                             navigate(`/profile/${referral?.username}`)
//                         }}>
//                             Visit Profile
//                         </Button>
//                     }
//                 </div>
//             }
//         </>
//     )
// }
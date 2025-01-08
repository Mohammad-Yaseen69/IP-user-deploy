import React, { useEffect, useMemo, useState } from 'react'
import styles from "../../PendingNew/Item.module.css"
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronDown } from 'react-feather'
import { useLocation } from 'react-router'
import QuoteDetails from '../QuoteDetails.jsx'
import DeclineQuotation from '../DeclineQuotation.jsx'
import BargainQuotation from '../BargainQuotation.jsx'
import AcceptQuotation from '../AcceptQuotation.jsx'
import { Button } from 'reactstrap'
import AcceptBargainedAmount from '../AcceptBaragainedAmount.jsx'

const SentItemMobile = ({ item, activeItem, setActiveItem, index }) => {
    const { t } = useTranslation()
    const [showReviseModal, setShowReviseModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showAcceptModal, setShowAcceptModal] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const _id = queryParams.get("_id")
    const type = queryParams.get("type")


    useEffect(() => {
        if (_id === item?._id) {
            if (type === "bargain") {
                setShowReviseModal(true)
            } else {
                setShowDetails(true)
            }
        }
    }, [_id, type, item])

    const badgeColor = useMemo(() => {
        switch (item?.status?.toLowerCase()) {
            case "initiated":
            case "bargain":
                return "#ADD8E6"
            case "completed":
                return "#28A745"
            case "rejected":
                return "#DC3545"
            case "cancelled":
                return "#C82333"
            case "submitted":
                return "#FFA500"
            case "available":
                return "#007BFF"
            case "confirmed":
                return "#218838"
            case "reversed":
                return "#FFC107"
            case "declined":
                return "#C82333"
            default:
                return "#FFA500"
                break;
        }
    }, [item])

    return (
        <>
            {
                showAcceptModal
                &&
                <AcceptBargainedAmount
                    isOpen={showAcceptModal}
                    item={item}
                    toggle={() => setShowAcceptModal(false)}
                    badgeColor={badgeColor}
                    type='send'
                />
            }

            {/* revise */}
            {
                showReviseModal
                &&
                <BargainQuotation
                    isOpen={showReviseModal}
                    item={item}
                    toggle={() => setShowReviseModal(false)}
                    badgeColor={badgeColor}
                    type='revise'
                />
            }

            {/* cancel Modal */}
            {
                showDeleteModal
                &&
                <DeclineQuotation
                    isOpen={showDeleteModal}
                    toggle={() => setShowDeleteModal(false)}
                    item={item}
                />
            }

            <div className={styles.item}>
                <div className={styles.top} onClick={() => setActiveItem(activeItem === index + 1 ? 0 : index + 1)}>
                    <div className={styles.left}>
                        <div className={styles.dp}>{item?.reciever?.user?.first_name?.[0]}</div>
                        <div className={styles.t_details}>
                            <h5
                                style={{
                                    width: activeItem === index + 1 ? "fit-content" : "30vw",
                                    maxWidth: "none"
                                }}
                            >
                                {item?.reciever?.account_type === "individual" ? `${item?.reciever?.user?.first_name} ${item?.reciever?.user?.last_name}` : item?.reciever?.company?.company_name}
                            </h5>
                            <span>{new Date(item?.createdAt)?.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className={styles.right}>
                        {/* <h5 className={styles.amount}
                            style={{
                                color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234",
                                display: activeItem === index + 1 ? "none" : "inherit"
                            }} >{item?.amount_reciever_currency?.currency?.code} {item?.amount ? item?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                        </h5> */}
                        <div style={{ display: activeItem === index + 1 ? "none" : "flex", alignItems: "flex-end", gap: ".5rem", flexDirection: "column" }}>
                            <h5 className={styles.amount}
                                style={{
                                    color: item?.transaction_type?.toLowerCase() === "debit" ? "#FF7293" : "#1CB234",
                                    display: activeItem === index + 1 ? "none" : "inherit"
                                }} >{item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}{item?.amount_reciever_currency?.currency?.code} {item?.amount ? item?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                            </h5>
                            <div style={{
                                fontSize: "9px",
                                color: badgeColor,
                                padding: "3px 5px",
                                borderRadius: "7px",
                                textAlign: "center",
                                fontWeight: 800
                            }}>{t(item?.status?.toUpperCase())}</div>
                        </div>
                        {
                            activeItem !== index + 1
                                ?
                                <ChevronRight />
                                :
                                <ChevronDown />
                        }
                    </div>
                </div>

                {
                    activeItem === index + 1
                    &&
                    <QuoteDetails
                        item={item}
                        key={item?._id}
                        type='send'
                    />
                }
                {
                    window.innerWidth < 1000
                        ?
                        item?.status?.toLowerCase() !== "accepted" && item?.status?.toLowerCase() !== "declined"
                        &&
                        <div style={{ display: "flex", gap: ".5rem", marginTop: "1.5rem", flexDirection: "row-reverse", flexWrap: "wrap " }}>
                            <Button color="danger" style={{ padding: "1px 18px", flex: 1 }} onClick={() => setShowDeleteModal(true)}>{t("Cancel")}</Button>
                            {
                                (item?.bargain && item?.status === "bargain")
                                &&
                                <>
                                    <Button color='primary' style={{ padding: "1px 18px", flex: 1, background: "#5926f0" }} onClick={() => setShowReviseModal(true)}>{t("Revise")}</Button>
                                    <Button color="success" style={{ padding: "1px 18px", flex: 1 }} onClick={() => setShowAcceptModal(true)}>{t("Accept")}</Button>
                                </>
                            }
                        </div>
                        :
                        ""
                }
            </div>
        </>
    )
}

export default SentItemMobile
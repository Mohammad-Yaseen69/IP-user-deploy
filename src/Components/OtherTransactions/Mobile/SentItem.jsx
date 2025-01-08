import { useTranslation } from "react-i18next"
import styles from "./item.module.css"
import { ChevronDown, ChevronRight, ChevronLeft } from "react-feather"
import { Link } from "react-router-dom"
import { Button } from "reactstrap"
import { cancelSubscriptionOrSchedulePayment } from "../ReceivedTransactionItem"
import { useContext, useMemo, useState } from "react"
import { UserContext } from "../../../Context/UserContext"
import { calculateFinalDate } from "../SubscriptionDetails"


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const SentItem = ({ item, activeItem, setActiveItem, index, currentUser }) => {
    const { t } = useTranslation()
    const { authHeader, verifyToken } = useContext(UserContext)
    const item_date = item?.date;
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const startMonth = +item_date.split("-")[1] - 1;
    const startYear = new Date(item_date?.split("-")?.reverse()?.join("-")).getFullYear();
    const cycles = item?.cycles;

    const handleNextYear = () => {
        setCurrentYear(currentYear + 1);
    };

    const handlePreviousYear = () => {
        setCurrentYear(currentYear - 1);
    };

    const displayMonths = (year) => {
        const monthsToHighlight = [];
        for (let i = 0; i < cycles; i++) {
            const cycleMonth = (startMonth + i) % 12;
            const cycleYear = startYear + Math.floor((startMonth + i) / 12);
            if (cycleYear === year) {
                monthsToHighlight.push(cycleMonth);
            }
        }

        return months.map((it, ind) => (
            <div key={it} style={{ display: "flex", flexDirection: "column", gap: ".1rem", alignItems: "center" }}>
                <span>{it}</span>
                <div className={styles.month_block} style={{
                    background: monthsToHighlight.includes(ind) ? "#5926f0" : "#D9D9D9",
                    borderRadius: "12px"
                }}
                />
            </div>
        ));
    };

    const recipient = useMemo(() => {
        return item?.[item?.type === "payment" ? "payment" : "request_payment"]?.receiver?.account_type === "individual" ? `${item?.[item?.type === "payment" ? "payment" : "request_payment"]?.receiver?.first_name} ${item?.[item?.type === "payment" ? "payment" : "request_payment"]?.receiver?.last_name}` : item?.[item?.type === "payment" ? "payment" : "request_payment"]?.receiver?.company_name
    }, [item])
    return (
        <div className={styles.item}>
            <div className={styles.top} onClick={() => setActiveItem(activeItem === index + 1 ? 0 : index + 1)}>
                <div className={styles.left}>
                    <div className={styles.dp}>{currentUser?.user?.first_name?.[0]}</div>
                    <div className={styles.t_details}>
                        <h5>{recipient}</h5>
                        <span>{new Date(item?.createdAt)?.toLocaleString()}</span>
                    </div>
                </div>
                <div className={styles.right}>
                    <h5 className={styles.amount}>{item?.["payment" in item ? "payment" : "request_payment"]?.currency?.code} {item?.payment?.amount ? item?.payment?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item?.request_payment?.amount ? item?.request_payment?.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                    </h5>
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
                <div className={styles.tm_details}>
                    {
                        item?.recursive
                            ?
                            <>
                                <div className={styles.tmd_row}>
                                    {
                                        item?.status === "completed"
                                            ?
                                            <div className={styles.tmdr_item}>
                                                <span>{t("Paid")}</span>
                                                <h4>{item?.date}</h4>
                                            </div>
                                            :
                                            <div className={styles.tmdr_item}>
                                                <span>{t("Next Payment At")}</span>
                                                <h4>{item?.date}</h4>
                                            </div>
                                    }
                                    <div className={styles.tmdr_item}>
                                        <span>{t("Payment Type")}:</span>
                                        <h4>{item?.recursive ? t("Subscription") : t("Scheduled")}</h4>
                                    </div>
                                </div>
                                <div className={styles.tmd_row}>
                                    <div className={styles.tmdr_item}>
                                        <span>{t("Started on")}</span>
                                        <h4>{item?.date}</h4>
                                    </div>
                                    <div className={styles.tmdr_item}>
                                        <span>{t("Ends On")}:</span>
                                        <h4>{calculateFinalDate(item?.date, item?.cycles)}</h4>
                                    </div>
                                </div>
                                <div className={styles.rec_left}>
                                    <p style={{ color: "#888" }}>{t("Num Of Cycles")}: {item?.cycles}</p>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                        borderRadius: "16px",
                                        background: "#FFF8D8",
                                        boxShadow: "0px -7px 113px 0px rgba(0, 0, 0, 0.10)",
                                        padding: ".7rem 1rem"

                                    }}>
                                        <h5 style={{ marginBottom: 0, fontSize: "20px", fontWeight: "700" }}>{currentYear}</h5>
                                        <div style={{
                                            display: "flex",
                                            gap: ".5rem"
                                        }}>
                                            <ChevronLeft size={16} onClick={handlePreviousYear} />
                                            <ChevronRight size={16} onClick={handleNextYear} />
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(6,1fr)",
                                        marginTop: "1rem"
                                    }} className={styles.month_con}>
                                        {displayMonths(currentYear)}
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                <div className={styles.tmd_row}>
                                    {
                                        item?.status === "completed"
                                            ?
                                            <div className={styles.tmdr_item}>
                                                <span>{t("Paid")}</span>
                                                <h4>{item?.time?.split("T")?.[0]}</h4>
                                            </div>
                                            :
                                            <div className={styles.tmdr_item}>
                                                <span>{t("Scheduled At")}</span>
                                                <h4>{item?.time?.split("T")?.[0]}</h4>
                                                <p>{item?.time?.split("T")?.[1]?.split(".")?.[0]}</p>
                                            </div>
                                    }
                                    <div className={styles.tmdr_item}>
                                        <span>{t("Payment Type")}:</span>
                                        <h4>{item?.recursive ? t("Subscription") : t("Scheduled")}</h4>
                                    </div>
                                </div>
                            </>
                    }
                    <div className={styles.tmd_row} style={{ alignItems: "flex-end", marginTop: "1rem" }}>
                        {/* <Link>{t("See more") + ">"}</Link> */}
                        <div></div>
                        {
                            (item?.status?.toLowerCase() === "pending" || item?.status?.toLowerCase() === "processing")
                            &&
                            <Button color="danger" style={{ padding: "3px 18px" }} onClick={() => cancelSubscriptionOrSchedulePayment(item, authHeader, verifyToken)}>{t("Cancel")}</Button>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default SentItem
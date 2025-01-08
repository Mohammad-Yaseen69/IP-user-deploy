import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss";
import { ChevronLeft, ChevronRight } from "react-feather";
import ImagePreviewModal from '../ImagePreviewModal.jsx';
import { Button } from 'reactstrap';
import SubscriptionPaymentFlow from './PaymentFlow/index.jsx';
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem.jsx';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const calculateFinalDate = (startDate, cycles) => {
    const dateParts = startDate.split('-');
    const startYear = parseInt(dateParts[2], 10);
    const startMonth = parseInt(dateParts[1], 10) - 1;
    const startDay = parseInt(dateParts[0], 10);

    const startDateObj = new Date(startYear, startMonth, startDay);
    const finalDateObj = new Date(startDateObj);
    finalDateObj.setMonth(finalDateObj.getMonth() + cycles - 1);

    const finalYear = finalDateObj.getFullYear();
    const finalMonth = (finalDateObj.getMonth() + 1).toString().padStart(2, '0');
    const finalDay = finalDateObj.getDate().toString().padStart(2, '0');

    return `${finalDay}-${finalMonth}-${finalYear}`;
};

const SubscriptionDetails = ({ item, currentImage, setCurrentImage }) => {
    const { t } = useTranslation();
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
                <span>{t(it)}</span>
                <div style={{
                    minHeight: "50px",
                    minWidth: "50px",
                    background: monthsToHighlight.includes(ind) ? "#5926f0" : "#D9D9D9",
                    borderRadius: "12px"
                }}
                />
            </div>
        ));
    };
    // console.log(item)

    const [showPaymentFlow, setShowPaymentFlow] = useState(false)
    return (
        <>
            {
                showPaymentFlow
                &&
                <SubscriptionPaymentFlow
                    isOpen={showPaymentFlow}
                    toggle={() => setShowPaymentFlow(false)}
                    item={item}
                />
            }
            <div className={styles.rec_left}>
                <p style={{ color: "#888" }}>{t("Number Of Cycle")}: {item?.cycles}</p>
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
                    gap: "1rem",
                    marginTop: "1rem"
                }}>
                    {displayMonths(currentYear)}
                </div>
            </div>

            {/* right */}
            <div className={styles.right}>
                <div>
                    <span>{t(service_name_formatter("Subscription starting date"))}</span>
                    <h5>{item?.date}</h5>
                </div>
                <div>
                    <span>{t("Until")}</span>
                    <h5>{calculateFinalDate(item?.date, item?.cycles)}</h5>
                </div>
                {
                    item?.status?.toLowerCase() !== "completed" && item?.status?.toLowerCase() !== "cancelled"
                        ?
                        <div>
                            <span>{t("Next Transaction")}</span>
                            <div style={{ width: "fit-content", gap: "1rem" }}>
                                <Button
                                    style={{
                                        background: "linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "9px",
                                        padding: ".5rem 1rem"
                                    }}
                                    onClick={() => setShowPaymentFlow(true)}
                                >
                                    {t("Pay Now")}
                                </Button>
                                <h5>{item?.date}</h5>
                            </div>
                        </div>
                        :
                        ""
                }
                <div>
                    <span>{t("Transaction Method")}</span>
                    <h5>{item?.type?.[0]?.toUpperCase()}{item?.type?.slice(1)}</h5>
                </div>
                {
                    item?.description
                    &&
                    <div>
                        <span>{t("Note")}:</span>
                        <h5>{item?.description}</h5>
                    </div>
                }
                {
                    item?.attachments?.length > 0
                    &&
                    <div>
                        <span>{t("Attachments")}:</span>
                        <div style={{
                            display: "flex",
                            gap: ".75rem",
                            maxWidth: "100%",
                            overflowX: "auto"
                        }}>
                            {
                                item?.attachments?.map(it => (
                                    <img key={it?.key} src={it?.url} alt="" style={{
                                        height: "60px",
                                        width: "60px",
                                        objectFit: "cover",
                                        borderRadius: "10px"
                                    }}
                                        onClick={() => setCurrentImage({
                                            src: it?.url,
                                            index: it?.key
                                        })}
                                    />
                                ))
                            }
                        </div>
                    </div>
                }
                {
                    currentImage
                    &&
                    <ImagePreviewModal
                        currentImage={currentImage}
                        isOpen={currentImage}
                        toggle={() => setCurrentImage("")}
                    />
                }

            </div>
        </>
    );
};

export default SubscriptionDetails;

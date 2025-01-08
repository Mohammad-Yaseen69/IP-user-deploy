import { Card, CardBody } from "reactstrap";
import w from "./files/where.png"
import download from "../Profile/files/download.svg"
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { takeScreenshot } from "../../Helper/takeScreenshot";
import { useState } from "react";

const RequestReceipt = ({ beneficiary, amount, currency, paymentType, setShowStatus, exchangeRate }) => {
    const { t } = useTranslation()
    const [downloading, setDownloading] = useState(false)
    return (
        <Card className="" style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            // maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "20px",
                padding: "0",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }} className="conf_cont">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "14px" }} className="transaction-receipt">
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>{t("You are requesting")}</span>
                        <h4 style={{ fontSize: "2rem" }}>{currency} {Number(amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                    </div>
                    {/* recipient */}
                    <div style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "10px"
                    }}>
                        <span style={{ minWidth: "100px", color: "#8a8a8a" }}>{t("To Recipient")}:</span>
                        <Swiper
                            slidesPerView="auto"
                            centeredSlides
                            spaceBetween={10}
                            grabCursor={true}
                            style={{
                                width: "100%"
                            }}
                        >
                            {
                                beneficiary.map(item => (
                                    <SwiperSlide>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                            {
                                                item?.profileImage?.url || item?.profileImage
                                                    ?
                                                    <img src={item?.profileImage?.url ?? item?.profileImage} style={{
                                                        width: "45px",
                                                        height: "45px",
                                                        borderRadius: "12px",
                                                    }} />
                                                    :
                                                    <div style={{
                                                        width: "35px",
                                                        height: "35px",
                                                        borderRadius: "12px",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                        color: "white",
                                                        fontSize: "1rem",
                                                        fontWeight: 800
                                                    }}>
                                                        {item?.beneficiary_type === "individual" ? item?.first_name?.[0] : item?.company_name?.[0] ?? ""}
                                                        {
                                                            item?.user ?
                                                                item?.account_type === "individual" ? item?.user?.first_name?.[0] : item?.company?.company_name?.[0] ?? ""
                                                                :
                                                                item?.account_type === "individual" ? item?.first_name?.[0] : item?.company_name?.[0] ?? ""
                                                        }
                                                    </div>
                                            }
                                            <span style={{ fontWeight: 600, fontSize: ".8rem" }}>{item?.first_name ?? item?.user?.first_name} {item?.last_name ?? item?.user?.last_name}</span>
                                        </div>
                                    </SwiperSlide>
                                ))
                            }
                        </Swiper>
                    </div>
                    {/* payment type */}
                    <div style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "10px"
                    }}>
                        <span style={{ minWidth: "100px", color: "#8a8a8a" }}>{t("As")}:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                            <div style={{
                                minHeight: "35px",
                                minWidth: "35px",
                                background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "12px",
                                boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                            }}>
                                <img src={paymentType.icon} draggable="false" alt={paymentType.name[0]} style={{
                                    height: "22px",
                                    width: "22px",
                                    objectFit: "contain"
                                }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: ".8rem" }}>{paymentType.name}</span>
                        </div>
                    </div>
                </div>
                {/* bottom */}
                <div style={{ display: 'flex', alignItems: "center", gap: ".5rem", justifyContent: "center", padding: "14px" }}>
                    <Link to={`/payment-requests?current-index=1&tab=sent`} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }}>
                        <img src={w} alt="w" style={{ height: "25px", width: "25px", objectFit: "contain" }} />
                        <span style={{ fontWeight: "600", color: "black" }}>{t("Where is my payment?")}</span>
                    </Link>
                    {
                        downloading
                            ?
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" color='primary' role="status">
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                            :
                            <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }} onClick={() => {
                                takeScreenshot("transaction-receipt", setDownloading)
                            }}>
                                <img src={download} alt="s" style={{ height: "20px", width: "20px", objectFit: "contain" }} />
                                <span style={{ fontWeight: "600" }}>{t("Download")}</span>
                            </div>
                    }
                </div>
            </CardBody>
        </Card>
    )
}

export default RequestReceipt;
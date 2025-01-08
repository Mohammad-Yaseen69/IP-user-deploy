import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedRecipient from "./SelectedRecipient";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import SelectedPayoutChannel from "./SelectedPayoutChannel";
import SelectedCountry from "./SelectedCountry";
import SelectedPaymentType from "./SelectedPaymentType";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"
import { useDispatch } from "react-redux";
import { newTransaction } from "../../store/slices/Transactions";
import faded_lines from "./files/faded_lines.png"

const ConfirmSend = ({ beneficiary, amount, currency, country, payoutChannel, paymentType, setConfirmed, setSubStep, scheduleDate, scheduleTime, recCycle, recStartDate }) => {
    const { t } = useTranslation()
    const [complete, setComplete] = useState(false);
    const dispatch = useDispatch();
    const pRef = useRef(null)
    const divRef = useRef(null)
    const svgRef = useRef(null)
    const chevRef = useRef(null)

    const handleDrag = (e, ui) => {
        const { x } = ui;
        pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`
        svgRef.current.style.transform = `translateX(${x}px)`
        const threshold = divRef?.current?.offsetWidth - 72;
        if (x >= threshold) {
            beneficiary.forEach((item, index) => {
                const date = new Date().toLocaleString().split(", ")[0]
                const time = new Date().toLocaleString().split(", ")[1]
                const payload = {
                    id: Date.now() + index * Date.now(),
                    beneficiary: item.name,
                    date,
                    type: "Send",
                    transactionTime: time,
                    paymentType: "Instant",
                    transactionId: `INSTA-${Date.now()}`,
                    amount: `${currency}${amount}.00`,
                    status: 'Completed'
                }
                dispatch(newTransaction(payload))
            });
            setComplete(true);
            setTimeout(() => {
                setConfirmed(true);
            }, 2000);
        } else {
            setConfirmed(false);
        }
    };

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "20px 30px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
                <SelectedCountry country={country} setSubStep={setSubStep} />
                <SelectedPayoutChannel payoutChannel={payoutChannel} setSubStep={setSubStep} />
                <SelectedAmountAndCurrency amount={amount} currency={currency} setSubStep={setSubStep} step={3} />
                <SelectedPaymentType paymentType={paymentType} setSubStep={setSubStep} scheduleDate={`To: ${scheduleDate} ${scheduleTime}`} subscriptionDate={`Starts: ${recStartDate} For: ${recCycle} times`} />
                <Swiper
                    // effect={"cards"}
                    // grabCursor={true}
                    // style={{ width: "100%", maxWidth: "100%" }}
                    // className="mySwiper"
                    slidesPerView="auto"
                    centeredSlides
                    spaceBetween={10}
                    grabCursor={true}
                    style={{
                        width: "100%"
                    }}
                >
                    {
                        beneficiary.map((item, index) => (
                            <SwiperSlide key={item.id}>
                                <SelectedRecipient index={index} user={item} setSubStep={setSubStep} size={beneficiary.length} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
                <div ref={divRef}
                    style={{
                        textAlign: "center",
                        position: "relative",
                        background: "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                        backgroundBlendMode: "color-burn,normal",
                        boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                        borderRadius: "16px",
                        padding: "1rem",
                        width: "85%",
                        margin: "1rem auto 0",
                        overflow: "hidden"
                    }}
                >
                    <img src={faded_lines} alt="faded" style={{ position: "absolute", left: "-130px", display: complete ? "none" : "inherit", width: "130px" }} ref={svgRef} />
                    <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "3px solid white",
                                height: "40px",
                                width: "40px",
                                borderRadius: "16px",
                                cursor: "pointer"
                            }}
                            ref={chevRef}
                        >
                            {
                                complete
                                    ?
                                    <Check color="white" size={30} />
                                    :
                                    <ChevronRight color="white" size={30} />
                            }
                        </div>
                    </Draggable>
                    <p style={{ marginBottom: "0", fontSize: "1.1rem", fontWeight: 500, color: "white", display: complete ? "none" : "inherit" }} ref={pRef}>
                        {t("Slide To Confirm")}
                    </p>
                    {
                        complete
                        &&
                        <p style={{ marginBottom: "0", fontSize: window.innerWidth > 1700 ? "1.1rem" : ".95rem", fontWeight: 500, color: "white" }}>
                            {t("Payment Confirmed")}
                        </p>
                    }
                </div>
            </CardBody>
        </Card>
    );
};

export default ConfirmSend;
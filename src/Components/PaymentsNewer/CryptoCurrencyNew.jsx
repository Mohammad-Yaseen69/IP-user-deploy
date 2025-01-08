import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import 'swiper/css';
import Chart from "react-apexcharts"
import { useEffect } from "react";
import btc from "./files/btc.png"
import eth from "./files/eth.png"
import usdt from "./files/usdt.png"
import chevup from "./files/chevup.png"

const isBig = window.innerWidth > 1000

const CryptoCurrencyNew = ({ cryptoCurrency, setSubStep, setCryptoCurrency, action = "convert" }) => {
    const { t } = useTranslation()

    const currenciesData = [
        {
            name: "Bitcoin",
            img: btc,
            value: "btc",
            color: "#f39900",
            graph_values: [13, 15, 25, 20, 30, 26, 24, 15, 16, 20],
            item_bg: "#FFE1B4",
            price: "29,683 USD",
            text_color: "#ff9921",
            text_bg: "rgba(255, 153, 33, 0.20)",
            increment: "2.05%",
            inc_bg: "#91BE65",
            inc_color: "white"
        },
        {
            name: "Tether",
            img: usdt,
            value: "usdt",
            color: "#009393",
            graph_values: [15, 12, 13, 10, 12, 14, 16, 16, 8],
            item_bg: "#01E2E2",
            price: "1 USD",
            text_color: "#009393",
            text_bg: "rgba(0, 147, 147, 0.22)",
            increment: "2.05%",
            inc_bg: "#fff",
            inc_color: "black"
        },
        {
            name: "Ethereum",
            img: eth,
            value: "eth",
            color: "#101010",
            graph_values: [8, 9, 16, 7, 20, 8, 12, 14],
            item_bg: "#ececec",
            price: "13,000 USD",
            text_color: "#a8a8a8",
            text_bg: "#a8a8a81e",
            increment: "2.05%",
            inc_bg: "#FD0D1b",
            inc_color: "white"
        },
    ]

    useEffect(() => "a") // console.log(cryptoCurrency?.value))

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
        }}>
            <CardBody style={{
                background: isBig ? "rgba(0,0,0,.03)" : "transparent",
                borderRadius: "20px",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                padding: isBig ? "30px" : "5px",
                gap: "1rem",
                paddingBottom: 0,
                boxShadow: isBig ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)" : "none"
            }} className="c_f_c">
                {/* <div style={{ display: "flex", gap: "20px", padding: "1rem", flexDirection: "column", overflowY: "auto", maxHeight: "500px" }}> */}
                {currenciesData.map(item => {

                    const Currentlysale = {
                        series: [
                            {
                                name: "crypto price",
                                data: item.graph_values,
                            },
                        ],
                        options: {
                            chart: {
                                opacity: 1,
                                type: "area",
                                toolbar: {
                                    show: false,
                                },
                            },
                            dataLabels: {
                                enabled: false,
                            },
                            stroke: {
                                width: [3, 3],
                                curve: "smooth",
                            },
                            xaxis: {
                                offsetX: 0,
                                offsetY: 0,
                                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
                                labels: {
                                    low: 0,
                                    offsetX: 0,
                                    show: false,
                                },
                                axisBorder: {
                                    low: 0,
                                    offsetX: 0,
                                    show: false,
                                },
                                axisTicks: {
                                    show: false,
                                },
                            },

                            yaxis: {
                                show: false,
                            },
                            grid: {
                                show: false,
                            },
                            colors: [item.color],
                            fill: {
                                opacity: [0.5, 0.25, 1],
                            },

                            legend: {
                                show: false,
                            },
                            tooltip: {
                                x: {
                                    format: "MM",
                                },
                            },
                        },
                    };
                    return (
                        <div onClick={() => setCryptoCurrency(item)} key={item.value} style={{
                            background: item.item_bg,
                            borderRadius: "16px",
                            cursor: "pointer",
                            transition: "250ms",
                            display: "flex",
                            height: "fit-content",
                            padding: "1rem",
                            boxShadow: item.value === cryptoCurrency.value ? `0 0 10px ${item.item_bg}` : "none",
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: ".3rem", width: "fit-content" }}>
                                <img src={item.img} alt={item.value} style={{ width: "40px", borderRadius: "17px" }} />
                                <h2 style={{ marginBottom: 0, fontSize: "1.4rem", fontWeight: 900, whiteSpace: "nowrap" }}>{item.name} ({item.value.toUpperCase()})</h2>
                                <span style={{
                                    marginBottom: 0,
                                    fontSize: "10px",
                                    background: item.text_bg,
                                    color: item.text_color,
                                    width: "fit-content",
                                    padding: ".3rem",
                                    borderRadius: "3px",
                                    fontWeight: 700
                                }}>{item.value.toUpperCase()}-USD</span>
                                <h4 style={{ marginBottom: 0, fontSize: "1.2rem", fontWeight: 800, color: item.text_color }}>{item.price}</h4>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", width: "100%", position: "relative" }}>
                                <span style={{
                                    color: item.inc_color,
                                    background: item.inc_bg,
                                    fontSize: ".7rem",
                                    fontWeight: 700,
                                    padding: ".3rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".3rem",
                                    borderRadius: "6px",
                                    width: "fit-content"
                                }}>
                                    <img src={chevup} alt="c" style={{
                                        width: "10px",
                                    }} />
                                    {item.increment}
                                </span>
                                <div style={{ width: "90%", position: "absolute", right: 0, bottom: window.innerWidth < 1600 ? "-60px" : "-43px", overflow: "hidden" }}>
                                    <Chart id="chart-currently" options={Currentlysale.options} series={Currentlysale.series} type="area" height={"140px"} width={"100%"} style={{
                                        // transform: cryptoCurrency?.value === item.value ? "translateX(-6%) translateY(64px)" : "translateX(-8%) translateY(46px)",
                                    }} />
                                </div>
                            </div>
                        </div>
                    )
                })}
                {/* </div> */}
                {/* </Swiper> */}
                {/* {
                    cryptoCurrency
                    &&
                    <div style={{ display: "Flex", alignItems: "center", gap: ".6rem", padding: "0 1rem" }} className="i_t_mt2">
                        <img src={cryptoCurrency.img} alt={cryptoCurrency.value} width={25} />
                        <h5 style={{ fontSize: "1rem", fontWeight: "900", marginBottom: "0" }}>{cryptoCurrency.name} is selected.</h5>
                    </div>
                } */}
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: isBig ? "1rem" : "0",
                marginTop: "1rem"
            }}>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: isBig ? "60%" : "100%",
                    minWidth: "fit-content",
                    padding: ".75rem 2rem",
                    borderRadius: "12px"
                }}
                    className="i_t_button"
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!cryptoCurrency}
                >
                    {t("Next")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default CryptoCurrencyNew;
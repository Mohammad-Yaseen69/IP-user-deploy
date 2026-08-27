import React from 'react'
import styles from "./styles/CryptoCurrency.module.css"
import { useTranslation } from 'react-i18next'
import { Button } from 'reactstrap'
import Chart from "react-apexcharts"
import btc from "../files/btc.png"
import eth from "../files/eth.webp"
import usdt from "../files/usdt.webp"
import chevup from "../files/chevup.png"


const currenciesData = [
    {
        name: "Bitcoin",
        img: btc,
        value: "btc",
        color: "#f39900",
        graph_values: [13, 15, 25, 20, 30, 26, 24, 15, 16, 20],
        item_bg: "#FFE1B4",
        price: "$29,683",
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
        price: "$1",
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
        price: "$13,000",
        text_color: "#a8a8a8",
        text_bg: "#a8a8a81e",
        increment: "2.05%",
        inc_bg: "#FD0D1b",
        inc_color: "white"
    },
]

const CryptoCurrency = ({ cryptoCurrency, setStep, setCryptoCurrency, }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.container}>
            <h5>{t("Choose the Cryptocurrency You Intend to Liquidate.")}</h5>
            <div className={styles.cards}>
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
                        <div onClick={() => setCryptoCurrency(item)} key={item?.value} style={{
                            background: item.item_bg,
                            borderRadius: "16px",
                            cursor: "pointer",
                            transition: "250ms",
                            display: "flex",
                            height: "fit-content",
                            padding: "1rem",
                            boxShadow: item.value === cryptoCurrency?.value ? `0 0 10px ${item.item_bg}` : "none",
                            overflow: "hidden"
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
                                }}>{item.value.toUpperCase()}{t("-USD")}</span>
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
                    );
                })}
            </div>
            <Button className={styles.button} disabled={!cryptoCurrency} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    );
}

export default CryptoCurrency
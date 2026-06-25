import React, { useEffect, useState } from 'react'
import styles from "./styles/BottomLeft.module.css"
import Chart from "react-apexcharts"
import { MoreHorizontal } from 'react-feather'
import { useTranslation } from 'react-i18next'




const BottomLeft = ({ data,
    requestedAmount,
    quotedAmount,
    currentWallet }) => {
    const { t } = useTranslation()
    // const [totalRequested, setTotalRequested] = useState(0)
    // useEffect(() => {
    //     if (reports) {
    //         for (const type in reports) {
    //             const totalAmount = reports?.[type]?.[currentWallet?.currency?.code]?.reduce((acc, item) => {
    //                 if (item?.type?.toLowerCase()?.includes("request")) {
    //                     return acc += item?.amount ?? 0
    //                 }
    //                 return acc ?? 0
    //             }, 0)
    //             if (typeof totalAmount === "number") {
    //                 // console.log(totalAmount)
    //                 setTotalRequested(prev => prev + totalAmount ?? 0)
    //             }
    //         }
    //     }
    // }, [reports])
    const currenciesData = [
        {
            name: "Requested Amount",
            color1: "#f39900",
            color2: "#00c853",
            send: requestedAmount?.sent || 0,
            receive: requestedAmount?.received || 0,
        },
        {
            name: "Quoted Amount",
            color1: "#f39900",
            color2: "#00c853",
            send: quotedAmount?.sent || 0,
            receive: quotedAmount?.received || 0,
        },
    ];
    // console.log(data)
    return (
        <div className={styles.container}>
            {currenciesData.map(item => {

                const Currentlysale = {
                    series: [
                        {
                            name: "Send",
                            data: [0, item.send],
                        },
                        {
                            name: "Receive",
                            data: [0, item.receive],
                        },
                    ],
                    options: {
                        chart: {
                            type: "area",
                            toolbar: {
                                show: false,
                            },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        stroke: {
                            curve: "smooth",
                            width: 3,
                        },
                        xaxis: {
                            categories: ["Start", "Total"],
                            labels: {
                                show: false,
                            },
                            axisBorder: {
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
                        colors: [item.color1, item.color2],
                        fill: {
                            opacity: 0.4,
                        },
                        legend: {
                            show: true,
                            position: "top",
                        },
                    },
                };
                const totalAmount = item.send + item.receive;
                return (
                    <div key={item.value} className={styles.card}>
                        <div className={styles.c_top}>
                            <div>
                                <h5>{t(item.name)}</h5>

                                <h4>
                                    {currentWallet?.currency?.code}{" "}
                                    {totalAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </h4>                            </div>
                            <div className={styles.amounts}>
                                <small>{t("Send")}: {item.send.toFixed(2)}</small>
                                <small>{t("Receive")}: {item.receive.toFixed(2)}</small>
                            </div>
                        </div>
                        <div className={styles.chart_con}>
                            <Chart id="chart-currently" options={Currentlysale.options} series={Currentlysale.series} type="area" height={"100%"} width={"100%"} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default BottomLeft
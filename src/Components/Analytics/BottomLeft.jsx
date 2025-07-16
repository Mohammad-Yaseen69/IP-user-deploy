import React, { useEffect, useState } from 'react'
import styles from "./styles/BottomLeft.module.css"
import Chart from "react-apexcharts"
import { MoreHorizontal } from 'react-feather'
import { useTranslation } from 'react-i18next'




const BottomLeft = ({ data, reports, currentWallet }) => {
    const { t } = useTranslation()
    const [totalRequested, setTotalRequested] = useState(0)
    useEffect(() => {
        if (reports) {
            for (const type in reports) {
                const totalAmount = reports?.[type]?.[currentWallet?.currency?.code]?.reduce((acc, item) => {
                    if (item?.type?.toLowerCase()?.includes("request")) {
                        return acc += item?.amount ?? 0
                    }
                    return acc ?? 0
                }, 0)
                if (typeof totalAmount === "number") {
                    // console.log(totalAmount)
                    setTotalRequested(prev => prev + totalAmount ?? 0)
                }
            }
        }
    }, [reports])

    const currenciesData = [
        {
            name: "Requested Amount",
            color: "#f39900",
            graph_values: [0.00, totalRequested],
            amount: totalRequested
        },
        {
            name: "Quoted Amount",
            color: "#f39900",
            graph_values: [0.00, data?.quotation?.totalAmounts ?? 0.00],
            amount: data?.quotation?.totalAmounts ?? 0
        },
    ]
    return (
        <div className={styles.container}>
            {currenciesData.map(item => {

                const Currentlysale = {
                    series: [
                        {
                            name: "amount",
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
                    <div key={item.value} className={styles.card}>
                        <div className={styles.c_top}>
                            <div>
                                <h5>{t(item.name)}</h5>
                                <h4>{currentWallet?.currency?.code} {item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                            </div>
                            {/* <MoreHorizontal /> */}
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
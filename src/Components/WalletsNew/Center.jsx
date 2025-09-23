import styles from "./styles/Center.module.scss"
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import InstaPayLoader from "../Loader";

const CenterContainer = ({ categories, setCategories, currentType, setCurrentType, currentWallet }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [currentMonthTransactions, setCurrentMonthTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isChartLoading, setIsChartLoading] = useState(false)

    useEffect(() => {
        if (userDetails?._id) {
            const getRandomVibrantColor = (usedColors) => {
                const letters = '0123456789ABCDEF';
                let color = '#';

                do {
                    for (let i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }

                    const hexColor = color.substring(1);
                    const r = parseInt(hexColor.substr(0, 2), 16);
                    const g = parseInt(hexColor.substr(2, 2), 16);
                    const b = parseInt(hexColor.substr(4, 2), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                    if (luminance < 0.5) {
                        color = '#';
                    }
                } while (usedColors.includes(color));

                usedColors.push(color);
                return color;
            };

            const fetchData = async () => {
                try {
                    const res = await axios.get(
                        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-all-user-categories/${userDetails?._id}`,
                        {
                            headers: authHeader,
                        }
                    );

                    const decrypted = decryptData(res.data.data);

                    const usedColors = [];
                    const formatted = decrypted?.transactionCategoryList?.map((it) => ({
                        ...it,
                        color: getRandomVibrantColor(usedColors),
                        value: 0,
                    }));

                    setCategories(formatted);
                    setIsLoading(false)
                } catch (err) {
                    const decrypted = decryptData(err.response?.data?.data);
                    setIsLoading(false)
                    console.error(decrypted);
                }
            };

            fetchData();
        }
    }, [userDetails, currentWallet]);

    const [chartData, setChartData] = useState(null)
    useEffect(() => {
        setChartData(null)
        const newChartData = {
            series: categories?.length > 0 ? categories?.map(it => it.value) : [],
            options: {
                chart: {
                    width: "100%",
                    type: 'donut',
                },
                plotOptions: {
                    pie: {
                        startAngle: -90,
                        endAngle: 270,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                tooltip: {
                    enabled: false,
                    custom: function ({ seriesIndex, w }) {
                        const category = categories?.[seriesIndex];
                        return `<div style="text-align: center; padding: 5px; display: flex; align-items:center; gap: 5px; background: ${category?.color};"><span>${category?.name}: ${currentWallet?.currency?.code} ${category?.value?.toFixed(2)}</span></div>`;
                    },
                },
                fill: {
                    type: 'gradient',
                    colors: categories.length > 0 ? categories.map(it => it.color) : []
                },
                legend: {
                    show: false,
                    position: 'bottom',
                    horizontalAlign: "left",
                    formatter: function (val, opts) {
                        const data = opts.w.globals.series[opts.seriesIndex];
                        const category = categories?.[opts.seriesIndex]?.name;
                        return `${category} - ${data?.toFixed(2) ?? 0.00}`;
                    },
                },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: "100%",
                            },
                            legend: {
                                position: 'bottom',
                                horizontalAlign: 'center',
                            },
                        },
                    },
                ],
            },
        };
        setChartData(newChartData);
    }, [categories]);


    // total in this month
    const [total, setTotal] = useState(0)

    // useEffect(() => {
    //     if (userDetails) {
    //         const currentDate = new Date();

    //         // Set 'from' date to the 1st day of the current month
    //         const fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    //         // Set 'to' date to the last day of the current month
    //         const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    //         const data = {
    //             from: formatDate(fromDate),
    //             to: formatDate(lastDayOfMonth),
    //             query: ""
    //         }


    //         const encrypted = encryptData(data);

    //         axios.post(
    //             `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-by-date/${userDetails?._id}/0/300`,
    //             {
    //                 data: encrypted
    //             },
    //             {
    //                 headers: authHeader,
    //             }
    //         )
    //             .then(res => {
    //                 const decrypted = decryptData(res.data.data);
    //                 setCurrentMonthTransactions(decrypted?.transactionList)
    //                 setIsChartLoading(false)
    //             })
    //             .catch(err => {
    //                 const decrypted = decryptData(err.response.data.data);
    //                 // console.log(decrypted);
    //                 setIsChartLoading(false)
    //             });
    //     }
    // }, [userDetails]);

    // total amount functionality
    useEffect(() => {
        const totalAmount = categories?.reduce((acc, trx) => {
            return acc += trx.value
        }, 0)
        // console.log(totalAmount)
        setTotal(totalAmount)
    }, [categories])

    // Helper function to format the date as DD-MM-YYYY
    function formatDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
    }

    return (
        <div className={styles.center}>
            <div className={styles.top}>
                <h5>{t("Breakdown")}</h5>
                <div>
                    <button onClick={() => setCurrentType("credit")} style={{
                        background: currentType === "credit" ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                        boxShadow: currentType === "credit" ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                        color: currentType === "credit" ? "white" : "#848484",
                    }}>{t("Credit")}</button>
                    <button onClick={() => setCurrentType("debit")} style={{
                        background: currentType === "debit" ? "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9" : "#f8f8f8",
                        boxShadow: currentType === "debit" ? "0px 11.90068244934082px 8.655041694641113px rgba(89, 38, 240, 0.17)" : "none",
                        color: currentType === "debit" ? "white" : "#848484",
                    }}>{t("Debit")}</button>
                </div>
            </div>
            <div className={styles.chart_container} style={{ overflow: "hidden" }}>
                {
                    !chartData
                        ?
                        <InstaPayLoader />
                        :
                        <div id="chart" style={{ height: "auto", position: "relative", width: "250px" }}>
                            <div className={styles.balance_info}>
                                <h4>{currentWallet?.currency?.code} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                {/* <span>{t(`${currentType === "credit" ? "Credit" : "Debit"} in`)} {`${t(new Date().toLocaleString('default', { month: 'short' }))}`}</span> */}
                                <span>{t(`${currentType === "credit" ? "Credit" : "Debit"}`)}</span>
                            </div>
                            {
                                chartData?.options
                                &&
                                <ReactApexChart
                                    options={chartData?.options}
                                    series={chartData?.series}
                                    type="donut"
                                    width={"150%"}
                                    height={"150%"}
                                    style={{ transform: window.innerWidth > 480 ? "translateX(-25%)" : "translateX(0%)" }}
                                />
                            }
                        </div>
                }
            </div>
            <div className={styles.series_container}>
                {
                    isLoading
                        ?
                        <InstaPayLoader />
                        :
                        <>
                            {
                                categories.length > 0
                                &&
                                categories.map(item => (
                                    <div className={styles.category_item}>
                                        <div className={styles.ci_left}>
                                            <div style={{ background: item?.color }} />
                                            <span>{t(item?.name)}</span>
                                        </div>
                                        <span>{currentType === "credit" ? "+" : "-"}{currentWallet?.currency?.code} {item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                ))
                            }
                        </>
                }
            </div>
        </div>
    )
}

export default CenterContainer
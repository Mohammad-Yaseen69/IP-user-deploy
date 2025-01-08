import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from "./styles/TopRight.module.css"
import chev_up from "../HomeNewUpdated/files/chev_up.png"
import ReactApexChart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem';
import { DateRangePicker } from 'react-date-range';
import { X } from 'react-feather';

const tabsData = ["Payment Methods", "Payment Types"]

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

const TopRight = ({ data, reports, currentWallet, setApiDates, isLoading }) => {
    const { t } = useTranslation()
    const CalendarData = [
        {
            label: "1M",
            name: `${t("Last")} 30 ${t("days")}`
        },
        {
            label: "3M",
            name: `${t("Last")} 90 ${t("days")}`
        },
        {
            label: "6M",
            name: `${t("Last")} 180 ${t("days")}`
        },
        {
            label: "1Y",
            name: `${t("Last")} 365 ${t("days")}`
        },
        {
            label: "2Y",
            name: `${t("Last")} 2 ${t("Year")}`
        },
        {
            label: "C",
            name: "Custom Date"
        },
    ]
    const [selectedRange, setSelectedRange] = useState(CalendarData[0])
    const [currentTab, setCurrentTab] = useState(tabsData[0])
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState([])
    const [categoriesType, setCategoriesType] = useState([])


    useEffect(() => {
        if (reports) {
            const usedColors = [];
            setCategories([]);
            setCategoriesType([])
            const code = currentWallet?.currency?.code;

            let index = 0;
            for (const type in reports) {
                const totalAmount = reports?.[type]?.[code]?.reduce((acc, item) => {
                    if (item?.service_type === type) {
                        return acc += item?.amount;
                    }
                    return acc;
                }, 0);

                const itemObj = {
                    name: service_name_formatter(type),
                    color: getRandomVibrantColor(usedColors),
                    value: +(totalAmount ?? 0)?.toFixed(2)
                };
                setCategories(prev => [itemObj, ...prev]);

                index++;
            }

            let subIndex = 0;
            for (const p_type in data) {
                if (p_type === "total") continue;
                const itemObj = {
                    name: service_name_formatter(p_type),
                    color: getRandomVibrantColor(usedColors),
                    value: +data?.[p_type]?.totalAmounts?.toFixed(2)
                };

                setCategoriesType(prev => [itemObj, ...prev])
                subIndex++
            }
        }
    }, [reports, currentWallet, data]);

    useEffect(() => {
        setTotal(data?.total?.totalAmounts ?? 0)
    }, [data])

    const chartData = useMemo(() => ({
        series: currentTab === tabsData[0] ? categories?.length > 0 ? categories?.map(it => it.value) : [] : categoriesType?.length > 0 ? categoriesType?.map(it => it.value) : [],
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
            fill: {
                type: 'gradient',
                colors: currentTab === tabsData[0] ? categories?.length > 0 ? categories?.map(it => it.color.length > 3 ? it.color : "#444") : [] : categoriesType?.length > 0 ? categoriesType?.map(it => it.color.length > 3 ? it.color : "#444") : []
            },
            legend: {
                show: false,
                position: 'bottom',
                horizontalAlign: "left",
                formatter: function (val, opts) {
                    const data = opts.w.globals.series[opts.seriesIndex];
                    const category = currentTab === tabsData[0] ? categories?.[opts.seriesIndex]?.name : categoriesType?.[opts.seriesIndex]?.name;
                    return `${category} - ${data}`;
                },
            },
            tooltip: {
                custom: function ({ seriesIndex, w }) {
                    const category = currentTab === tabsData[0] ? categories?.[seriesIndex] : categoriesType?.[seriesIndex];
                    return `<div style="text-align: center; padding: 5px; display: flex; align-items:center; gap: 5px; background: ${category?.color};"><span>${category?.name}: ${currentWallet?.currency?.code} ${category?.value}</span></div>`;
                },
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: "160%",
                        },
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                        },
                    },
                },
            ],
        },
    }), [currentTab, categories, categoriesType])

    // date picker
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const handleChange = (ranges) => {
        if (ranges.selection) {
            const startDate = ranges.selection.startDate.toISOString().split('T')[0];
            const endDate = ranges.selection.endDate.toISOString().split('T')[0];

            const formattedDateRange = {
                from: startDate,
                to: endDate,
            };
            setApiDates(formattedDateRange)
            setDateRange(ranges.selection);
        }
    };

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.amount_details} style={{ position: "relative" }}>
                    <p>{t("Total Transaction")}</p>
                    {
                        isLoading
                        &&
                        <div className="d-flex justify-content-center align-items-center" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: "#fafafa" }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">{t("Loading")}...</span>
                            </div>
                        </div>
                    }
                    <h4>{currentWallet?.currency?.code} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                    {
                        window.innerWidth > 1000
                        &&
                        <span>{t("You spent more comparing to last month")}</span>
                    }
                    {/* {
                        window.innerWidth < 1000
                        &&
                        <div className={styles.stats}>
                            <img src={chev_up} />
                            <span>2.05%</span>
                        </div>
                    } */}
                </div>
                <div className={styles.actions}>
                    {/* <div className={styles.stats}>
                        <img src={chev_up} />
                        <span>2.05%</span>
                    </div> */}
                </div>
                <div className={styles.dates} style={{ position: "relative" }}>
                    {
                        CalendarData.map((item, index) => (
                            <div key={item.label} className={`${styles.date_item} ${selectedRange.label === item.label ? styles.date_item_active : ""}`} onClick={() => {
                                if (item.label === "C") {
                                    handleDatePickerClick();
                                } else {
                                    const currentDate = new Date();
                                    const startDate = new Date(currentDate);
                                    switch (item.label) {
                                        case "1M":
                                            startDate.setMonth(currentDate.getMonth() - 1);
                                            break;
                                        case "3M":
                                            startDate.setMonth(currentDate.getMonth() - 3);
                                            break;
                                        case "6M":
                                            startDate.setMonth(currentDate.getMonth() - 6);
                                            break;
                                        case "1Y":
                                            startDate.setFullYear(currentDate.getFullYear() - 1);
                                            break;
                                        case "2Y":
                                            startDate.setFullYear(currentDate.getFullYear() - 2);
                                            break;
                                        default:
                                            break;
                                    }

                                    const formattedDateRange = {
                                        from: startDate.toISOString().split("T")[0],
                                        to: currentDate.toISOString().split("T")[0],
                                    };

                                    setApiDates(formattedDateRange);
                                    setSelectedRange(CalendarData[index]);
                                }
                            }}>
                                <span>{item.label}</span>
                                <span>{t(item.name)}</span>
                            </div>
                        ))
                    }
                    {showDatePicker && (
                        <div ref={datePickerRef} style={{ position: "absolute", top: "100%", right: `0px`, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", zIndex: 10000000 }}>
                            <button onClick={() => setShowDatePicker(false)} style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                border: "none",
                                outline: "none",
                                background: "#fff",
                                boxShadow: "0 0 3px #1111111e",
                                borderRadius: "30px",
                                height: "30px",
                                width: "30px",
                                display: "flex",
                                justifyContent: "center", alignItems: "center",
                                fontSize: "1rem"
                            }}><X /></button>
                            <DateRangePicker maxDate={new Date()}
                                ranges={[dateRange]}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.bottom}>
                <div className={styles.tabs}>
                    {
                        tabsData.map((item, index) => (
                            <div key={item} className={`${styles.tab} ${currentTab === item ? styles.tab_active : ""}`} onClick={() => {
                                setCurrentTab(tabsData[index])
                            }}>
                                {t(item)}
                            </div>
                        ))
                    }
                </div>
                <div className={styles.chart_categories}>
                    <div className={styles.chart_container}>
                        <div className={styles.balance_info}>
                            <h4>{currentWallet?.currency?.code} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                            <span>
                                {t("Spent in")} {t("Total")}
                                {/* {`${new Date().toLocaleString('default', { month: 'short' })}`} */}
                            </span>
                        </div>
                        {/* <ReactApexChart
                                options={chartData.options}
                                series={chartData.series}
                                type="donut"
                                width={"100%"}
                                height={window.innerWidth > 480 ? "110%" : "115%"}
                                style={{ transform: window.innerWidth > 480 ? "translateX(-1%)" : "translateX(-26.5%)" }}
                            /> */}
                        <div style={{
                            height: "100%",
                            width: "100%",
                        }}>
                            <ReactApexChart
                                options={chartData.options}
                                series={chartData.series}
                                type="donut"
                                width={"100%"}
                                height={window.innerWidth < 400 ? 275 : 325}
                                style={{ transform: window.innerWidth < 400 ? "translateX(-76px)" : window.innerWidth < 480 ? "translatex(-91px)" : "none" }}
                            />
                        </div>
                    </div>
                    <div className={styles.categories}>
                        {
                            currentTab === tabsData[0]
                                ?
                                categories.map(item => {
                                    console.log(item)
                                    return (
                                        <div className={styles.c_item}>
                                            <div className={styles.ci_circle} style={{ '--color': item.color.length > 3 ? item.color : "#444" }} />
                                            <span>{t(item.name)}</span>
                                        </div>
                                    )
                                }
                                )
                                :
                                categoriesType.map(item => (
                                    <div className={styles.c_item}>
                                        <div className={styles.ci_circle} style={{ '--color': item.color.length > 3 ? item.color : "#444" }} />
                                        <span>{t(item.name)}</span>
                                    </div>
                                ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopRight
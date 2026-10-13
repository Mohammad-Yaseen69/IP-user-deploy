import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import InstaPayLoader from '../Loader';
import styles from "./styles/Stats.module.css"
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem';
import i18next from 'i18next';

export function getMonthName(dateString) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const date = new Date(dateString);
    return months[date.getMonth()];
}

export function getDateRange(monthsAgo) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const targetDate = new Date(currentYear, currentMonth - monthsAgo, 1);
    const monthName = getMonthName(targetDate.toISOString());

    const startDate = targetDate.toISOString().slice(0, 10);
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);

    return {
        name: `${monthsAgo === 0 ? 'Current' : 'Previous ' + monthsAgo} Month`,
        month_name: monthName,
        from: startDate,
        to: endDate,
    };
}

const initialState = {
    firstMonth: [],
    secondMonth: [],
    thirdMonth: [],
    forthMonth: [],
    fifthMonth: [],
    sixthMonth: []
}

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value
            };
        // other cases can be added here
        default:
            return state;
    }
}

const Stats = ({ currentWallet }) => {
    const [months, dispatch] = useReducer(reducer, initialState);
    const updateMonths = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value });
    };
    const chartRef = useRef(null);
    const chartRefMobile = useRef(null);
    const chartInstanceRef = useRef(null);
    const chartInstanceMobileRef = useRef(null);
    const { t, } = useTranslation()
    const { authHeader } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)

    const dateRanges = useMemo(() => {
        const ranges = [];
        for (let i = 0; i <= 5; i++) {
            ranges.push(getDateRange(i));
        }
        return ranges;
    }, []);

    const fetchData = async () => {
        setIsLoading(true)
        updateMonths("firstMonth", [])
        updateMonths("secondMonth", [])
        updateMonths("thirdMonth", [])
        updateMonths("forthMonth", [])
        updateMonths("fifthMonth", [])
        updateMonths("sixthMonth", [])
        const requests = dateRanges.map(async (item) => {
            const data = {
                from: item.from,
                to: item.to,
                query: "",
            };

            const encrypted = encryptData(data);
            

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${currentWallet?.wallet_id}/0/0`,
                    {
                        data: encrypted,
                    },
                    {
                        headers: authHeader,
                    }
                );

                const decrypted = decryptData(res.data.data);
                const transactions = decrypted.transactionList?.filter(item => item?.status?.toLowerCase() === "completed")
                if (transactions) {
                    switch (true) {
                        case item.name.includes("5"):
                            updateMonths("firstMonth", transactions);
                            break;
                        case item.name.includes("4"):
                            updateMonths("secondMonth", transactions);
                            break;
                        case item.name.includes("3"):
                            updateMonths("thirdMonth", transactions);
                            break;
                        case item.name.includes("2"):
                            updateMonths("forthMonth", transactions);
                            break;
                        case item.name.includes("1"):
                            updateMonths("fifthMonth", transactions);
                            break;
                        case item.name.includes("Current"):
                            updateMonths("sixthMonth", transactions);
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
            }
        });

        await Promise.all(requests);
        setIsLoading(false)
    };
    useEffect(() => {
        if (currentWallet) {
            fetchData();
        }
    }, [currentWallet]);


    useEffect(() => {
        if (isLoading) return;
        // Data for the chart
        const data = [
            {
                month: t(dateRanges[5].month_name),
                moneyIn: months.firstMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.firstMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
            {
                month: t(dateRanges[4].month_name),
                moneyIn: months.secondMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.secondMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
            {
                month: t(dateRanges[3].month_name),
                moneyIn: months.thirdMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.thirdMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
            {
                month: t(dateRanges[2].month_name),
                moneyIn: months.forthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.forthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
            {
                month: t(dateRanges[1].month_name),
                moneyIn: months.fifthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.fifthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
            {
                month: t(dateRanges[0].month_name),
                moneyIn: months.sixthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "credit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0),
                moneyOut: months.sixthMonth.reduce((acc, item) => {
                    if (item?.transaction_type === "debit") {
                        return acc + item.amount
                    }
                    return acc
                }, 0)
            },
        ];

        // Prepare data for chart
        const categories = data.map((item) => item.month);
        const moneyInSeries = data.map((item) => Number(item.moneyIn));
        const moneyOutSeries = data.map((item) => Number(item.moneyOut));


        // Chart configuration
        const options = {
            chart: {
                type: 'bar',
                height: '100%',
                width: '100%',
                stacked: true,
                redrawOnWindowResize: true,
                redrawOnParentResize: true,
                animations: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '80%',
                    borderRadius: 10,
                },
            },
            series: [
                {
                    name: service_name_formatter(t('money in')),
                    data: moneyInSeries,
                },
                {
                    name: service_name_formatter(t('money out')),
                    data: moneyOutSeries,
                },
            ],
            xaxis: {
                categories: categories,
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        if (val === 0) {
                            return "0"
                        }
                        return `${(val < 100000 ? val / 1000 : val / 1000000).toString()}${val < 100000 ? "K" : "M"}`;
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            colors: ['#5926f0', '#e64067'],
            legend: {
                show: window.innerWidth < 1000,
                position: "top",
                horizontalAlign: "right"
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        const value = Number(val)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        return `${currentWallet?.currency?.code} ${value}`;
                    },
                },
            },
            grid: {
                xaxis: {
                    lines: {
                        show: false
                    }
                }
            }
        };


        // Desktop chart: create once, then update
        if (chartRef.current) {
            if (!chartInstanceRef.current) {
                chartInstanceRef.current = new ApexCharts(chartRef.current, options);
                chartInstanceRef.current.render().then(() => {
                    chartInstanceRef.current?.updateSeries([
                        { name: options.series[0].name, data: moneyInSeries },
                        { name: options.series[1].name, data: moneyOutSeries }
                    ], true);
                });
            } else {
                chartInstanceRef.current.updateOptions({
                    xaxis: { categories }
                }, false, false);
                chartInstanceRef.current.updateSeries([
                    { name: options.series[0].name, data: moneyInSeries },
                    { name: options.series[1].name, data: moneyOutSeries }
                ], true);
            }
        }
        // Mobile chart: create once, then update
        if (chartRefMobile.current) {
            if (!chartInstanceMobileRef.current) {
                chartInstanceMobileRef.current = new ApexCharts(chartRefMobile.current, options);
                chartInstanceMobileRef.current.render().then(() => {
                    chartInstanceMobileRef.current?.updateSeries([
                        { name: options.series[0].name, data: moneyInSeries },
                        { name: options.series[1].name, data: moneyOutSeries }
                    ], true);
                });
            } else {
                chartInstanceMobileRef.current.updateOptions({
                    xaxis: { categories }
                }, false, false);
                chartInstanceMobileRef.current.updateSeries([
                    { name: options.series[0].name, data: moneyInSeries },
                    { name: options.series[1].name, data: moneyOutSeries }
                ], true);
            }
        }



        return undefined;
    }, [months, i18next.language, isLoading]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
            chartInstanceMobileRef.current?.destroy();
            chartInstanceMobileRef.current = null;
        };
    }, []);

    const yearsToShow = useMemo(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const sixMonthsAgo = new Date(currentDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        const sixMonthsYear = sixMonthsAgo.getFullYear();

        if (sixMonthsYear < currentYear) {
            return `${sixMonthsYear}-${currentYear}`;
        } else {
            return `${currentYear}`;
        }
    }, [])

    return (
        <>
            <Card style={{ marginBottom: 0, flex: 1.5, height: "100%", borderRadius: "30px" }} className={styles.pc}>
                <CardHeader className='c_h_pb' style={{ padding: window.innerWidth > 1540 ? "36px 36px 0px" : "1rem 1rem 0" }}>
                    <h4 style={{ margin: 0, letterSpacing: "" }} className='c_h_pb_h4'>{t("Payment Insights")} ({currentWallet?.currency?.code} )</h4>
                </CardHeader>
                <CardBody className='p_g_link' style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {
                        isLoading
                            ?
                            <InstaPayLoader />
                            :
                            <>
                                {
                                    months.firstMonth.length < 1
                                    &&
                                    months.secondMonth.length < 1
                                    &&
                                    months.thirdMonth.length < 1
                                    &&
                                    months.forthMonth.length < 1
                                    &&
                                    months.fifthMonth.length < 1
                                    &&
                                    months.sixthMonth.length < 1
                                    &&
                                    <div style={{ margin: "3rem auto", textAlign: "center" }}>{t("No transactions")}</div>
                                }
                            </>
                    }
                    <div
                        ref={chartRef}
                        style={{
                            display:
                                months.firstMonth.length < 1 &&
                                    months.secondMonth.length < 1 &&
                                    months.thirdMonth.length < 1 &&
                                    months.forthMonth.length < 1 &&
                                    months.fifthMonth.length < 1 &&
                                    months.sixthMonth.length < 1
                                    ? 'none'
                                    : 'inherit',
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            minHeight: '240px',
                        }}
                    />
                </CardBody>
            </Card >
            <div className={styles.mobile}>
                <h5>{t("Payment Insights")} ({currentWallet?.currency?.code} )</h5>
                <Card style={{ marginBottom: 0 }}>
                    <div className={styles.header}>
                        <span>{yearsToShow}</span>
                        {/* <Calendar /> */}
                    </div>
                    <div className={styles.body}>
                        {
                            isLoading
                                ?
                                <InstaPayLoader />
                                :
                                <>
                                    {
                                        months.firstMonth.length < 1
                                        &&
                                        months.secondMonth.length < 1
                                        &&
                                        months.thirdMonth.length < 1
                                        &&
                                        months.forthMonth.length < 1
                                        &&
                                        months.fifthMonth.length < 1
                                        &&
                                        months.sixthMonth.length < 1
                                        &&
                                        <div style={{ margin: "3rem auto", textAlign: "center" }}>{t("No transactions")}</div>
                                    }
                                </>
                        }
                        <div
                            ref={chartRefMobile}
                            style={{
                                display:
                                    months.firstMonth.length < 1 &&
                                        months.secondMonth.length < 1 &&
                                        months.thirdMonth.length < 1 &&
                                        months.forthMonth.length < 1 &&
                                        months.fifthMonth.length < 1 &&
                                        months.sixthMonth.length < 1
                                        ? 'none'
                                        : 'inherit',
                                width: '100%',
                                height: '100%',
                                minHeight: '240px',
                            }}
                        />
                    </div>
                </Card>
            </div>
        </>
    );
};

export default React.memo(Stats);
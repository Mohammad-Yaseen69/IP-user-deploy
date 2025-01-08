import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';

const Stats = () => {
    const chartRef = useRef(null);
    const { t } = useTranslation()

    useEffect(() => {
        // Data for the chart
        const data = [
            {
                month: 'Jan',
                moneyIn: 1000,
                moneyOut: 200,
            },
            {
                month: 'Feb',
                moneyIn: 2500,
                moneyOut: 300,
            },
            {
                month: 'Mar',
                moneyIn: 1000,
                moneyOut: 600,
            },
            {
                month: 'Apr',
                moneyIn: 2000,
                moneyOut: 250,
            },
            {
                month: 'May',
                moneyIn: 3000,
                moneyOut: 890,
            },
            {
                month: 'June',
                moneyIn: 1500,
                moneyOut: 400,
            },
        ];

        // Prepare data for chart
        const categories = data.map((item) => item.month);
        const moneyInSeries = data.map((item) => item.moneyIn);
        const moneyOutSeries = data.map((item) => item.moneyOut);

        // Chart configuration
        const options = {
            chart: {
                type: 'bar',
                stacked: true,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '80%',
                    borderRadius: 5,
                },
            },
            series: [
                {
                    name: 'Money In',
                    data: moneyInSeries,
                },
                {
                    name: 'Money Out',
                    data: moneyOutSeries,
                },
            ],
            xaxis: {
                categories: categories,
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        if (val == 0) {
                            return "0"
                        }
                        return (val / 1000).toString() + 'k';
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            colors: ['#5926f0', '#e64067'],
            legend: {
                show: false,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return (val / 10000).toString() + 'k';
                    },
                },
            },
        };


        // Create chart
        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        // Cleanup
        return () => {
            chart.destroy();
        };
    }, []);

    return (
        <Card style={{ marginBottom: 0, flex: 1.5, minWidth: '300px', height: "100%" }}>
            <CardHeader className='c_h_pb'>
                <h4 style={{ margin: 0 }}>{t("Payment Insights")}</h4>
            </CardHeader>
            <CardBody className='p_g_link'>
                <div ref={chartRef} />
            </CardBody>
        </Card>
    );
};

export default Stats;
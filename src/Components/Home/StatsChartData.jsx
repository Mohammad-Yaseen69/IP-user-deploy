export const statsChartData = {
    series: [{
        name: 'Incoming',
        type: 'column',
        data: [430.00, 235.00, 421.00, 554.00, 900.00, 600.00, 370.00, 121.00, 440.00, 220.00, 300.00]
    },
    {
        name: 'Refund',
        type: 'line',
        data: [230.00, 120.00, 210.00, 200.00, 150.00, 350.00, 340.00, 220.00, 490.00, 260.00, 190.00]
    },
    {
        name: 'Outgoing',
        type: 'line',
        data: [300.00, 250.00, 360.00, 300.00, 450.00, 350.00, 640.00, 520.00, 590.00, 360.00, 390.00]
    }],
    options: {
        chart: {
            height: "100%",
            type: 'line',
            stacked: false,
            toolbar: {
                show: false
            }
        },
        stroke: {
            width: [0, 5],
            curve: 'smooth'
        },
        grid: {
            show: false
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 5
            }
        },

        fill: {
            opacity: [0.85, 1],
            gradient: {
                inverseColors: false,
                shade: 'light',
                type: 'vertical',
                opacityFrom: 0.85,
                opacityTo: 0.55,
                stops: [0, 100, 100, 100]
            }
        },
        labels: ['01/01/2023', '02/01/2023', '03/01/2023', '04/01/2023', '05/01/2023', '06/01/2023', '07/01/2023',
            '08/01/2023', '09/01/2023', '10/01/2023', '11/01/2023'
        ],
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return "$" + value;
                }
            },
            min: 0,
            max: 1000,
            // tickAmount: 10
        },
        colors: ["#5926f0", "#EE4B2B", "#61ae41"],
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (y) {
                    if (typeof y !== 'undefined') {
                        return "$" + y.toFixed(2);
                    }
                    return y;

                }
            }
        },
        legend: {
            show: false
        }
    }
};
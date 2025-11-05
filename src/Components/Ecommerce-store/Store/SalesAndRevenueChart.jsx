import Chart from "react-apexcharts";
import { ChevronDown } from "react-feather";
import { useTranslation } from "react-i18next";

const SalesAndRevenueChart = () => {
    const { t } = useTranslation()
    const options = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        legend: {
            show: false, 
        },
        colors: ["#5926F0", "#3D0EC9"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.8,
                opacityTo: 0.1,
                stops: [0, 100],
                gradientToColors: ["#5926F0", "#33168A", "#33168A"],
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        grid: {
            borderColor: "#E5E7EB",
            strokeDashArray: 4,
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: "#6c757d", fontSize: "12px" },
            },
        },
        yaxis: {
            labels: {
                formatter: (val) => `$${val}k`,
                style: { colors: "#6c757d", fontSize: "12px" },
            },
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `$${val}k`,
            },
        },
    };

    const series = [
        {
            name: "Revenue",
            data: [1000, 10, 600, 140, 2000, 100, 1020, 460, 100, 540, 580, 200],
        },
        {
            name: "Sales",
            data: [10, 600, 10, 1000, 100, 1000, 370, 410, 460, 1090, 520, 550],
        },
    ];

    return (
        <div className="w-full rounded-4 p-3 bg-white ">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">{t("Sales & Revenue Trend")}</h5>
                <div className="d-flex align-items-center btn btn-light rounded-4  gap-1">
                    {t("yearly")}
                    <ChevronDown size={15} />
                </div>
            </div>
            <Chart options={options} series={series} type="area" height={160} />
        </div>
    );
};

export default SalesAndRevenueChart;

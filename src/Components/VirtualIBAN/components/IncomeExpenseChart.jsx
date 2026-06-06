import React from "react";
import Chart from "react-apexcharts";

const IncomeExpenseChart = () => {
  const totalBars = 40;
  const activeBars = 24;

  const series = [
    {
      data: Array(totalBars).fill(1),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 1,
        distributed: true,
      },
    },
    colors: Array(totalBars)
      .fill("#E7DFFF")
      .map((c, i) => (i < activeBars ? "#5926F0" : "#E7DFFF")),

    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
    xaxis: {
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
    tooltip: {
      enabled: false,
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={40}
    />
  );
};

export default IncomeExpenseChart;
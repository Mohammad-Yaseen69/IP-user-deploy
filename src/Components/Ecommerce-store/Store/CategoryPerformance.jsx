import ReactApexChart from "react-apexcharts";

const BarChart = () => {
  const options = {
    chart: {
      type: "bar",
      height: "100%",
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        borderRadius: 2,
        endingShape: "rounded",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex }) => {
        return seriesIndex === 0 ? `$${val}K` : "";
      },
      style: {
        colors: ["#fff"],
        fontSize: "12px",
        fontWeight: "bold",
      },
      offsetY: -0,
    },
    grid: {
      show: false,
    }, xaxis: {
      categories: ["Electronics", "Fashion", "Sports"],
      labels: {
        style: {
          colors: "#333",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
      colors: ["#5926F0", "#ccc"],
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: function (val) {
          return "$ " + val + " thousands";
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Net Profit",
      data: [10, 20, 23,],
    },
    {
      name: "Revenue",
      data: [40, 10, 12,],
    },
  ];

  return (
    <div className="w-full rounded-4 p-3 bg-white ">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={220}
        width="100%"
        borderRadius="8px"
      />
    </div>
  );
};

export default BarChart;
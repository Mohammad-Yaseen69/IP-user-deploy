import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./styles/TopLeft.module.css";
import { UserContext } from "../../Context/UserContext";
import { ChevronDown, X } from "react-feather";
import { DateRangePicker } from "react-date-range";
import { Input } from "reactstrap";
import calendar from "./files/calendar.png";
import ApexCharts from "apexcharts";
import arrow_l from "./files/arrow_l.svg";
import arrow_r from "./files/arrow_r.svg";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

function generateRandomArray(currentPage) {
  const itemsPerPage = 10;
  const startValue = currentPage * itemsPerPage + 1;
  const endValue = startValue + itemsPerPage - 1;

  const randomArray = [];

  for (let i = startValue; i <= endValue; i++) {
    randomArray.push(i);
  }

  return randomArray;
}

const TopLeft = ({
  setApiDates,
  currentWallet,
  setCurrentWallet,
  creditPayments,
  debitPayments,
  apiDates,
}) => {
  const { t } = useTranslation();
  const { userWallets } = useContext(UserContext);
  const [credited, setCredited] = useState(creditPayments);
  const [debited, setDebited] = useState(debitPayments);

  useEffect(() => {
    setCredited(creditPayments);
    setDebited(debitPayments);
  }, [creditPayments, debitPayments]);
  // dropdown states
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  useEffect(() => {
    if (userWallets?.length > 0) {
      const filtered = userWallets.filter((item) => item?.default)?.[0];
      setCurrentWallet(filtered);
    }
  }, [userWallets]);

  // date picker
  const [dateString, setDateString] = useState(`${apiDates.from} To ${apiDates.to}`);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const handleChange = (ranges) => {
    if (ranges.selection) {
      const startDate = ranges.selection.startDate.toISOString().split("T")[0];
      const endDate = ranges.selection.endDate.toISOString().split("T")[0];

      const formattedDateRange = {
        from: startDate,
        to: endDate,
      };
      setApiDates(formattedDateRange);
      setDateRange(ranges.selection);
    }
  };
  useEffect(() => {
    setDateString(`${apiDates.from} To ${apiDates.to}`);
  }, [apiDates]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

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

  // filter
  const [filters, setFilters] = useState({
    international: {
      active: true,
      label: "International Transfer",
    },
    wallet: {
      active: true,
      label: "Wallet to Wallet Transfer",
    },
    qr: {
      active: true,
      label: "QR Code Payment",
    },
    quotation: {
      active: true,
      label: "Quotations",
    },
    request: {
      active: true,
      label: "Payment Requests",
    },
    address: {
      active: true,
      label: "My Payment Address",
    },
    conversion: {
      active: true,
      label: "Conversion",
    },
  });

  const handleFilter = (e) => {
    const { name, checked } = e.target;

    setFilters((prev) => {
      return {
        ...prev,
        [name]: {
          ...prev[name],
          active: checked,
        },
      };
    });
  };

  useEffect(() => {
    const updatedTransactions = creditPayments.filter((transaction) => {
      // Check if the transaction should be included based on active filters
      return Object.keys(filters).every((filterKey) => {
        const filter = filters[filterKey];
        const transactionType = transaction.payment_type || transaction.service_type || "NONE";
        return filter.active || !transactionType?.toLowerCase()?.includes(filterKey?.toLowerCase());
      });
    });
    // console.log(creditPayments)
    setCredited(updatedTransactions);
    const updatedDebitTransactions = debitPayments.filter((transaction) => {
      // Check if the transaction should be included based on active filters
      return Object.keys(filters).every((filterKey) => {
        const filter = filters[filterKey];
        const transactionType = transaction.payment_type || transaction.service_type || "NONE";
        return filter.active || !transactionType?.toLowerCase()?.includes(filterKey?.toLowerCase());
      });
    });
    // console.log(debitPayments)
    setDebited(updatedDebitTransactions);
    // setCredited(creditPayments.filter(item => {
    //     return Object.keys(filters).every(key => {
    //         if (filters[key].active) return true;
    //         return !item?.[key === "international" ? "service_type" : "payment_type"]?.toLowerCase()?.includes(key)
    //     });
    // }));
    // setDebited(debitPayments.filter(item => {
    //     return Object.keys(filters).every(key => {
    //         if (filters[key].active) return true;
    //         return !item?.[key === "international" ? "service_type" : "payment_type"]?.toLowerCase()?.includes(key)
    //     });
    // }));
  }, [filters, creditPayments, debitPayments]);

  // charts data
  const chartRef = useRef(null);
  const [currentChartPage, setCurrentChartPage] = useState(0);
  const [maxData, setMaxData] = useState(0);

  useEffect(() => {
    setMaxData(credited.length > debited.length ? credited.length : debited.length);
  }, [credited, debited]);

  useEffect(() => {
    setCurrentChartPage(0);
  }, [currentWallet]);

  useLayoutEffect(() => {
    const categories = generateRandomArray(currentChartPage);
    const moneyInSeries = credited
      .slice(currentChartPage * 10, (currentChartPage + 1) * 10)
      ?.map((item) => item?.amount?.toFixed(2));
    const moneyOutSeries = debited
      .slice(currentChartPage * 10, (currentChartPage + 1) * 10)
      ?.map((item) => item?.amount?.toFixed(2));

    while (moneyInSeries.length < 10) {
      moneyInSeries.push("0.00");
    }

    while (moneyOutSeries.length < 10) {
      moneyOutSeries.push("0.00");
    }

    // Chart configuration
    const options = {
      chart: {
        type: "bar",
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          borderRadius: 6,
        },
      },
      series: [
        {
          name: t("Credit"),
          data: moneyInSeries,
        },
        {
          name: t("Debit"),
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
              return "0";
            }
            return val.toString();
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#13C61A", "#EB4634"],
      legend: {
        // show: false,
        position: "top",
        horizontalAlign: "right",
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `${currentWallet?.currency?.code}  ${val}`;
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
  }, [credited, debited, currentChartPage, currentWallet, i18next.language]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.currency_dropdown}>
          <div
            className={styles.cd_item}
            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
          >
            <div className={styles.cdi_icon}>{currentWallet?.currency?.code} </div>
            <span className={styles.cdi_currency}>{currentWallet?.currency?.code} </span>
            <span className={styles.down_icon}>
              <ChevronDown />
            </span>
          </div>
          {currencyDropdownOpen && (
            <div className={styles.dropdown_menu}>
              {userWallets
                ?.filter(
                  (item) =>
                    item?.wallet_type?.toLowerCase() === "insta" &&
                    currentWallet?._id !== item?._id,
                )
                ?.map((item) => (
                  <div
                    key={item?._id}
                    onClick={() => {
                      setCurrentWallet(item);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={styles.cd_item}
                  >
                    <div className={styles.cdi_icon}>{item?.currency?.code} </div>
                    <span className={styles.cdi_currency}>{item?.currency?.code} </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: window.innerWidth > 700 ? "1rem" : ".5rem",
            position: "relative",
            marginBottom: ".5rem",
            borderRadius: "12.248px",
            background: "#F6F4FE",
            padding: "6px",
          }}
        >
          <Input
            readOnly
            value={dateString}
            disabled
            style={{
              borderRadius: "6.772px",
              background: "#E3E0F0",
              fontSize: "14px",
              fontWeight: "600",
              height: "28px",
              minWidth: window.innerWidth > 700 ? "200px" : "120px",
            }}
          />
          <img
            src={calendar}
            alt="i"
            onClick={handleDatePickerClick}
            style={{
              borderRadius: "8px",
              width: "27px",
              height: "27px",
              objectFit: "contain",
              cursor: "pointer",
            }}
          />
          {showDatePicker && (
            <div
              ref={datePickerRef}
              style={{
                position: "absolute",
                top: "80%",
                right: "12px",
                boxShadow: "0px 0px 3px rgba(0,0,0,0.1)",
                borderRadius: "10xp",
                zIndex: 99,
              }}
            >
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-8px",
                  border: "none",
                  outline: "none",
                  background: "#fff",
                  boxShadow: "0 0 3px #1111111e",
                  borderRadius: "8px",
                  height: "32px",
                  width: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1rem",
                }}
              >
                <X />
              </button>
              <DateRangePicker maxDate={new Date()} ranges={[dateRange]} onChange={handleChange} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.chart}>
          <div ref={chartRef} />
        </div>
        <div className={styles.pagination}>
          <img
            src={arrow_l}
            alt="a"
            onClick={() => {
              if (currentChartPage !== 0) {
                setCurrentChartPage((prev) => prev - 1);
              }
            }}
            style={{
              opacity: currentChartPage !== 0 ? 1 : 0.5,
            }}
          />
          <img
            src={arrow_r}
            alt="a"
            onClick={() => {
              if (currentChartPage < maxData / 10 - 1) {
                setCurrentChartPage((prev) => prev + 1);
              }
            }}
            style={{
              opacity: currentChartPage < maxData / 10 - 1 ? 1 : 0.5,
            }}
          />
        </div>

        <div className={styles.filters}>
          {Object.keys(filters).map((item) => (
            <div
              key={item}
              className={`${styles.filter} ${filters[item].active ? styles.filter_active : ""}`}
            >
              <Input
                type="checkbox"
                name={item}
                id={item}
                checked={filters[item].active}
                onChange={handleFilter}
              />
              <label htmlFor={item}>{t(filters[item].label)}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopLeft;

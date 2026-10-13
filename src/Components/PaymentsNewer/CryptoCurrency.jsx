import Chart from "react-apexcharts";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import "swiper/css";

const CryptoCurrency = ({ cryptoCurrency, setSubStep, setCryptoCurrency, action = "convert" }) => {
  const { t } = useTranslation();

  const currenciesData = [
    {
      name: "Bitcoin",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
      value: "btc",
      color: "#f39900",
      graph_values: [13, 15, 25, 20, 30, 26, 24, 15, 16, 20],
    },
    {
      name: "Ethereum",
      img: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png",
      value: "eth",
      color: "#637feb",
      graph_values: [15, 12, 13, 10, 12, 14, 16, 16, 8],
    },
    {
      name: "USDT",
      img: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Tether-USDT-icon.png",
      value: "usdt",
      color: "#26a17b",
      graph_values: [8, 9, 16, 7, 20, 8, 12, 14],
    },
  ];

  return (
    <Card
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
      }}
    >
      <CardBody
        style={{
          background: "rgba(0,0,0,.03)",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "30px 0",
          gap: "14px",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <p style={{ fontSize: "1rem", color: "#7d7d7d", padding: "0 1rem" }}>
          {t("Select the crypto currency from below that you want to")} {action}.
        </p>
        {/* <Swiper
                    slidesPerView={"auto"}
                    spaceBetween={15}
                    className="mySwiper i_t_mt1"
                    style={{
                        height: "fit-content",
                        width: "100%",
                        padding: "1rem",
                    }}
                > */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "1rem",
          }}
        >
          {currenciesData.map((item) => {
            const Currentlysale = {
              series: [
                {
                  name: "crypto price",
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
                  ],
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
              // <SwiperSlide onClick={() => setCryptoCurrency(item)} key={item.value} style={{
              //     background: "#fff",
              //     boxShadow: "0 0 20px rgba(8, 21, 66, 0.05)",
              //     borderRadius: "16px",
              //     padding: 0,
              //     overflow: "hidden",
              //     cursor: "pointer",
              //     width: cryptoCurrency?.value === item.value ? "166px" : "157px",
              //     height: cryptoCurrency?.value === item.value ? "206px" : "191px",
              //     transition: "250ms"
              // }}>
              <div
                onClick={() => setCryptoCurrency(item)}
                key={item.value}
                style={{
                  background: "#fff",
                  boxShadow: "0 0 20px rgba(8, 21, 66, 0.05)",
                  borderRadius: "16px",
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  width: cryptoCurrency?.value === item.value ? "36%" : "33%",
                  height: cryptoCurrency?.value === item.value ? "110%" : "inherit",
                  transition: "250ms",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    padding: ".75rem .75rem 0",
                  }}
                >
                  <img src={item.img} alt={item.value} style={{ width: "1.5vw" }} />
                  <h5
                    style={{
                      fontSize: ".8vw",
                      fontWeight: "900",
                      marginBottom: "0",
                    }}
                  >
                    {item.name}
                  </h5>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "-4rem",
                    padding: ".75rem .75rem 0",
                    gap: ".25rem",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "0",
                      fontSize: ".6vw",
                      fontWeight: 700,
                      color: "#a8a8a8",
                    }}
                  >
                    {t("Minimum Payout:")}
                  </p>
                  <h5
                    style={{
                      marginBottom: "0",
                      fontSize: "1.5vw",
                      fontWeight: 800,
                    }}
                  >
                    $100
                  </h5>
                </div>
                <div style={{ width: "100%" }}>
                  <Chart
                    id="chart-currently"
                    options={Currentlysale.options}
                    series={Currentlysale.series}
                    type="area"
                    height={"140px"}
                    width={"118%"}
                    style={{
                      transform:
                        cryptoCurrency?.value === item.value
                          ? "translateX(-6%) translateY(64px)"
                          : "translateX(-8%) translateY(46px)",
                    }}
                  />
                </div>
              </div>
              // {/* </SwiperSlide> */}
            );
          })}
        </div>
        {/* </Swiper> */}
        {cryptoCurrency && (
          <div
            style={{
              display: "Flex",
              alignItems: "center",
              gap: ".6rem",
              padding: "0 1rem",
            }}
            className="i_t_mt2"
          >
            <img src={cryptoCurrency.img} alt={cryptoCurrency.value} width={25} />
            <h5 style={{ fontSize: "1rem", fontWeight: "900", marginBottom: "0" }}>
              {cryptoCurrency.name} {t("is selected.")}
            </h5>
          </div>
        )}
      </CardBody>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
        <p
          style={{
            fontSize: ".6rem",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
          }}
        >
          <HelpCircle size={12} />
          <span>{t("Trouble Sending Money?")}</span>
        </p>
        <Button
          size="sm"
          style={{
            border: "none",
            outline: "none",
            background:
              " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
            backgroundBlendMode: "overlay, normal",
            boxShadow:
              "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
          className="i_t_button"
          onClick={() => {
            setSubStep((prev) => prev + 1);
          }}
          disabled={!cryptoCurrency}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default CryptoCurrency;

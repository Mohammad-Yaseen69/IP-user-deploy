import { Card, CardBody } from "reactstrap";
import "swiper/css";
import { useContext, useMemo } from "react";
import btc from "./files/btc.png";
import eth from "./files/eth.webp";
import usdt from "./files/usdt.webp";
import { UserContext } from "../../Context/UserContext";

const isBig = window.innerWidth > 1000;

const CryptoCurrencyNew = ({ cryptoCurrency, setCryptoCurrency }) => {
  const { userWallets } = useContext(UserContext);
  const cryptoWalletsUIData = [
    {
      name: "Tether",
      img: usdt,
      value: "usdt",
      color: "#009393",
      item_bg: "#01E2E2",
      text_color: "#009393",
      text_bg: "rgba(0, 147, 147, 0.22)",
    },
    {
      name: "Bitcoin",
      img: btc,
      value: "btc",
      color: "#f39900",
      item_bg: "#FFE1B4",
      text_color: "#ff9921",
      text_bg: "rgba(255, 153, 33, 0.20)",
      disabled: true,
    },
    {
      name: "Ethereum",
      img: eth,
      value: "eth",
      color: "#101010",
      item_bg: "#ececec",
      text_color: "#a8a8a8",
      text_bg: "#a8a8a81e",
      disabled: true,
    },
  ];

  const currenciesData = useMemo(() => {
    if (!userWallets) return [];

    const cryptoWallets = userWallets.filter(
      (item) => item.wallet_type === "crypto",
    );

    const filtered = cryptoWallets.map((wallet) => {
      const code = wallet?.currency?.code?.toLowerCase();

      const ui = cryptoWalletsUIData.find((c) => c.value === code);

      return {
        ...wallet,
        ...ui,
      };
    });
    return filtered.sort((a, b) => {
      return (a.disabled === true) - (b.disabled === true);
    });
  }, [userWallets, cryptoWalletsUIData]);

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
          background: isBig ? "rgba(0,0,0,.03)" : "transparent",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          padding: isBig ? "30px" : "5px",
          gap: "1rem",
          paddingBottom: 0,
          boxShadow: isBig
            ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            : "none",
        }}
        className="c_f_c"
      >
        {currenciesData.map((item) => {
          return (
            <div
              onClick={() => !item.disabled && setCryptoCurrency(item)}
              key={item.value}
              style={{
                background: item.item_bg,
                borderRadius: "16px",
                cursor: item.disabled ? "not-allowed" : "pointer",
                transition: "250ms",
                display: "flex",
                height: "fit-content",
                padding: "1rem",
                boxShadow:
                  item.value === cryptoCurrency.value
                    ? `0 0 10px ${item.item_bg}`
                    : "none",
                opacity: item.disabled && 0.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: ".3rem",
                  width: "fit-content",
                }}
              >
                <img
                  src={item.img}
                  alt={item.value}
                  style={{ width: "40px", borderRadius: "17px" }}
                />
                <h2
                  style={{
                    marginBottom: 0,
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name} ({item.value.toUpperCase()})
                </h2>
                <span
                  style={{
                    marginBottom: 0,
                    fontSize: "10px",
                    background: item.text_bg,
                    color: item.text_color,
                    width: "fit-content",
                    padding: ".3rem",
                    borderRadius: "3px",
                    fontWeight: 700,
                  }}
                >
                  {item.value.toUpperCase()}-USD
                </span>
                <h4
                  style={{
                    marginBottom: 0,
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: item.text_color,
                  }}
                >
                  {item.price}
                </h4>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};

export default CryptoCurrencyNew;

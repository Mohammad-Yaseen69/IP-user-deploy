import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Input } from "reactstrap";

const CryptoWalletDetails = ({ amount }) => {
  const initialTime = 60 * 60; // 1 hour in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const value = amount?.split(",").join("");
  const { t } = useTranslation();
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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
          overflow: "hidden",
          padding: "30px 20px",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <div>
          <p style={{ fontSize: "1rem", color: "#7d7d7d" }}>
            {t("Send")} {(+value * 0.000034).toFixed(3)} {t("BTC to below wallet address")}
          </p>
          <Input
            readOnly
            value={"3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5"}
            style={{ padding: "16px", fontSize: "18px", borderRadius: "10px" }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "4rem",
          }}
        >
          <h5 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            {t("The Wallet address is valid for")}
          </h5>
          <h2
            style={{
              fontSize: "4rem",
              fontWeight: 900,
            }}
          >
            {formatTime(timeLeft)}
          </h2>
        </div>
      </CardBody>
    </Card>
  );
};

export default CryptoWalletDetails;

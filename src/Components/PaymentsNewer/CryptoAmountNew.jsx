import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Input } from "reactstrap";
import { NumberInputValidator } from "../../Helper/NumberInput";
import { NumberSeperator } from "../../Helper/NumberSeperator";
import { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { AiFillInfoCircle } from "react-icons/ai";

const isBig = window.innerWidth > 1000;

const CryptoAmountNew = ({ setSubStep, amount, setAmount, cryptoCurrency }) => {
  const { t } = useTranslation();
  const [exchanged, setExhanged] = useState();

  useEffect(() => {
    const value = amount?.split(",").join("");
    setExhanged(+value * 0.000034);
  }, [amount]);

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
          overflow: "hidden",
          padding: isBig ? "30px 20px" : "0px",
          paddingBottom: 0,
          boxShadow: isBig
            ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            : "none",
        }}
        className="i_t_pt"
      >
        <h4
          style={{ textAlign: "center", color: "#7d7d7d" }}
          className="c_f_a_head"
        >
          {t("Enter The Amount")}
        </h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="m_t_1_0"
        >
          <h4
            style={{ fontWeight: 600, marginBottom: 0 }}
            className="c_f_a_amount"
          >
            $
          </h4>
          <input
            type="text"
            value={amount}
            onKeyPress={NumberInputValidator}
            onChange={(e) => {
              NumberSeperator(e.target.value, setAmount);
            }}
            maxLength={7}
            placeholder="100.00"
            style={{
              fontWeight: 600,
              background: "none",
              minWidth: "none",
              border: "none",
              outline: "none",
              width: "180px",
            }}
            className="c_f_a_amount"
          />
        </div>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            color: "red",
          }}
          className="c_f_a_warning"
        >
          <IoWarningOutline style={{ marginTop: "1px" }} />
          <span>
            {t("Minimum Transactional Value: $100.").replace("$", "USD ")}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            padding: ".75rem 1rem",
            background: "white",
            justifyContent: "space-between",
            gap: ".5rem",
            borderRadius: "10px",
            alignItems: "center",
            width: "90%",
          }}
          className="m_t_1_05"
        >
          <h4 style={{ marginBottom: 0 }}>
            {amount
              ? (
                  +amount.split(",").join("") /
                  +cryptoCurrency.price.split(" ")[0].split(",").join("")
                ).toFixed(5)
              : ""}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              borderRadius: "10px",
              background: "rgba(89, 38, 240, 0.06)",
              padding: ".5rem",
            }}
          >
            <img
              src={cryptoCurrency.img}
              alt={cryptoCurrency.value}
              style={{ width: "25px", borderRadius: "8px" }}
            />
            <h5 style={{ fontSize: ".9rem", fontWeight: 700, marginBottom: 0 }}>
              {cryptoCurrency.name}
            </h5>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            padding: ".75rem 1rem",
            background: "white",
            justifyContent: "center",
            gap: ".5rem",
            borderRadius: "10px",
            alignItems: "center",
            width: "90%",
          }}
          className="m_t_1_05"
        ></div>
        <div
          style={{
            display: "flex",
            padding: ".75rem 1rem",
            background: "white",
            justifyContent: "center",
            gap: ".5rem",
            borderRadius: "10px",
            alignItems: "center",
            width: "90%",
          }}
          className="m_t_1_05"
        >
          <span style={{ color: "#808080", fontWeight: 500 }}>
            {t("Transaction Fee: 1.32 USD")}
          </span>
        </div>
      </CardBody>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: isBig ? "1rem" : "0",
          marginTop: "1rem",
        }}
      >
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: isBig ? "60%" : "100%",
            minWidth: "fit-content",
            padding: ".75rem 2rem",
            borderRadius: "12px",
          }}
          className="i_t_button"
          onClick={() => {
            setSubStep((prev) => prev + 1);
          }}
          disabled={!amount}
        >
          {t("Next")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default CryptoAmountNew;

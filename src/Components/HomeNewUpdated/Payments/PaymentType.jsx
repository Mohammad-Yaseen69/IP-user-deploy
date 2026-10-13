import React from "react";
import { Check, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import { paymentTypeData } from "../../PaymentsNewer/PaymentType";

const PaymentType = ({ paymentType, setPaymentType, setStep, step }) => {
  const { t } = useTranslation();
  return (
    <Card
      style={{
        height: "fit-content",
        marginBottom: 0,
        boxShadow: "none",
        height: "100%",
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          borderRadius: "12px",
          padding: "1.5rem",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        {paymentTypeData.map((item) => (
          <Card
            key={item.name}
            style={{ marginBottom: 0, borderRadius: "12px" }}
            onClick={() => {
              setPaymentType(item);
            }}
          >
            <CardBody
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                padding: "15px",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    minHeight: "35px",
                    minWidth: "35px",
                    background:
                      "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                  }}
                >
                  <img
                    src={item.icon}
                    draggable="false"
                    alt={item.name[0]}
                    style={{
                      width: item.width,
                      objectFit: "contain",
                      aspectRatio: 1,
                    }}
                  />
                </div>
                <h5
                  style={{ marginBottom: 0, fontSize: "1.2rem" }}
                >{`${t(item.name.split(" ")[0])} ${t(item.name.split(" ")[1])}`}</h5>
              </div>
              {paymentType?.name === item.name && <Check color="green" />}
            </CardBody>
          </Card>
        ))}
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
            // maxWidth: "120px"
            alignSelf: "flex-end",
          }}
          className="i_t_button"
          disabled={!paymentType}
          onClick={() => {
            if (paymentType.value === "instant") {
              setStep(step + 1);
            } else {
              setStep(step);
            }
          }}
        >
          <span>{t("Confirm")}</span>
          <ChevronRight size={20} />
        </Button>
      </CardBody>
    </Card>
  );
};

export default PaymentType;

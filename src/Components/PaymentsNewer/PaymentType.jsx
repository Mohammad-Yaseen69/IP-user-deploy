import { Check, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import instant from "./files/instant.png";
import schedule from "./files/schedule.png";
import subscription from "./files/subscription.png";
import security from "./files/security.png";
import instalment from "./files/instalment.png";
import split from "./files/split.png";

export const paymentTypeData = [
  {
    name: /*t(*/ "Instant Payment" /*)*/,
    icon: instant,
    value: "instant",
    width: "14px",
  },
  {
    name: /*t(*/ "Subscription Payment" /*)*/,
    icon: subscription,
    value: "subscription",
    width: "22px",
  },
  {
    name: /*t(*/ "Schedule Payment" /*)*/,
    icon: schedule,
    value: "schedule",
    width: "20px",
  },
  {
    name: /*t(*/ "Security Deposit" /*)*/,
    icon: security,
    value: "security",
    width: "20px",
    coming_soon: true,
  },
  {
    name: /*t(*/ "Instalment Payment" /*)*/,
    icon: instalment,
    value: "instalment",
    width: "26px",
    coming_soon: true,
  },
  {
    name: /*t(*/ "Split Payment" /*)*/,
    icon: split,
    value: "split",
    width: "19px",
    coming_soon: true,
  },
];

const PaymentType = ({
  setSubStep,
  paymentMethod,
  setPaymentMethod,
  setNotInstant,
  sendType = "",
}) => {
  const { t } = useTranslation();

  return (
    <Card
      style={{
        // height: "100%",
        height: "fit-content",
        marginBottom: 0,
        boxShadow: "none",
        // gap: "1.3rem",
        // maxHeight: "540px"
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
        className="i_t_pt"
      >
        {paymentTypeData.map((item) => (
          <Card
            key={item.name}
            style={{ marginBottom: 0, borderRadius: "12px" }}
            onClick={() => {
              if (
                !(sendType === "card"
                  ? item?.value !== "instant"
                  : item?.coming_soon)
              ) {
                setPaymentMethod(item);
              }
            }}
          >
            <CardBody
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                padding: "15px",
                justifyContent: "space-between",
                cursor: (
                  sendType === "card"
                    ? item?.value !== "instant"
                    : item?.coming_soon
                )
                  ? "not-allowed"
                  : "pointer",
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
              {(sendType === "card"
                ? item?.value !== "instant"
                : item?.coming_soon) && (
                <div
                  style={{
                    padding: "5px 8px",
                    background: "#5926f0",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: ".7rem",
                  }}
                >
                  {t("Coming Soon")}
                </div>
              )}
              {paymentMethod?.name === item.name && <Check color="green" />}
            </CardBody>
          </Card>
        ))}
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
        <a
          href="https://insta-pay.ch/faq"
          style={{
            fontSize: ".7vw",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            color: "#2b2b2b",
          }}
        >
          <HelpCircle size={12} />
          <span>{t("Trouble Sending Money?")}</span>
        </a>
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
            if (paymentMethod.value === "instant") {
              setSubStep((prev) => prev + 1);
            } else {
              setNotInstant(true);
            }
          }}
          disabled={!paymentMethod}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default PaymentType;

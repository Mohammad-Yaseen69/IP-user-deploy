import { Check, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import instant from "./files/instant.png";
import schedule from "./files/schedule.png";
import subscription from "./files/subscription.png";
import security from "./files/security.png";
import instalment from "./files/instalment.png";
import split from "./files/split.png";

const RequestType = ({ setSubStep, paymentMethod, setPaymentMethod, setNotInstant }) => {
  const { t } = useTranslation();
  const data = [
    {
      name: t("Standard Request"),
      icon: instant,
      value: "standard",
    },
    {
      name: t("Subscription Request"),
      icon: subscription,
      value: "subscription",
    },
    {
      name: t("Schedule Request"),
      icon: schedule,
      value: "schedule",
    },
    {
      name: t("Security Request"),
      icon: security,
      value: "security",
      coming_soon: true,
    },
    {
      name: t("Instalment Request"),
      icon: instalment,
      value: "instalment",
      coming_soon: true,
    },
    {
      name: t("Split Request"),
      icon: split,
      value: "split",
      coming_soon: true,
    },
  ];

  return (
    <Card
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        // gap: "1.3rem",
        // maxHeight: "540px"
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          borderRadius: "20px",
          padding: "14px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
        className="i_t_pt"
      >
        {data.map((item) => (
          <Card
            key={item.name}
            style={{ marginBottom: 0 }}
            onClick={() => {
              if (!item?.coming_soon) {
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
                cursor: item?.coming_soon ? "not-allowed" : "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
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
                      height: "22px",
                      width: "22px",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <h5
                  style={{ marginBottom: 0, fontSize: "1.2rem" }}
                >{`${t(item.name.split(" ")[0])} ${t(item.name.split(" ")[1])}`}</h5>
              </div>
              {item?.coming_soon && (
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
        <p
          style={{
            fontSize: window.innerWidth > 1000 ? ".7vw" : ".7rem",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
            cursor: "pointer",
          }}
          onClick={() => window.open("https://insta-pay.ch/faqs", "_blank")}
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
            if (paymentMethod.value === "standard") {
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

export default RequestType;

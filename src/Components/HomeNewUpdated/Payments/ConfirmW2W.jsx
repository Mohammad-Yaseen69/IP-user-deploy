import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import faded_lines from "../../PaymentsNewer/files/faded_lines.png";

const ConfirmW2W = ({
  amount,
  currency,
  paymentType,
  wallet,
  scheduleDate,
  recStartDate,
  setStep,
  item,
}) => {
  const { t } = useTranslation();
  const [complete, setComplete] = useState(false);
  // const dispatch = useDispatch();
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      setComplete(true);
      setTimeout(() => {
        setStep(3);
      }, 2000);
    }
  };

  return (
    <Card
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        gap: "1.3rem",
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "20px",
          padding: "20px 30px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column" }}
          className="conf_cont"
        >
          <h4 className="text-center">
            {t("You Selected")}
            <br />
            {t("Wallet To Wallet")}
          </h4>

          {/* selected payment type */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>
                {t("You selected")}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
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
                  src={paymentType.icon}
                  draggable="false"
                  alt={paymentType.name[0]}
                  style={{
                    height: "22px",
                    width: "22px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 500 }}>{t(paymentType.name)}</span>
                {paymentType.value === "schedule" && (
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: "grey",
                      fontSize: ".7rem",
                    }}
                  >{`${scheduleDate}`}</span>
                )}
                {paymentType.value === "subscription" && (
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: "grey",
                      fontSize: ".7rem",
                    }}
                  >{`${recStartDate}`}</span>
                )}
              </div>
            </div>
          </div>

          {/* selected amount */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`You are transferring`)}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
            >
              <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                {amount} {currency}
              </span>
            </div>
          </div>

          {/* selected wallet */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>
                {t("Sending to")}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontWeight: "600",
                  marginBottom: "-6px",
                  fontSize: "1rem",
                }}
              >
                {`${item?.first_name} ${item?.last_name}`.slice(0, 16)}
              </p>
              <span
                style={{
                  fontWeight: 500,
                  color: "rgba(0,0,0,.36)",
                  fontSize: ".6rem",
                }}
              >
                {t("INSTA-")}
                {wallet?.wallet_id}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={divRef}
          style={{
            textAlign: "center",
            position: "relative",
            background:
              "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
            backgroundBlendMode: "color-burn,normal",
            boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
            borderRadius: "16px",
            padding: "1rem",
            width: window.innerWidth > 500 ? "85%" : "100%",
            margin: "1rem auto 0",
            overflow: "hidden",
          }}
        >
          <img
            src={faded_lines}
            alt="faded"
            style={{
              position: "absolute",
              left: "-130px",
              display: complete ? "none" : "inherit",
              width: "130px",
            }}
            ref={svgRef}
          />
          <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "3px solid white",
                height: "40px",
                width: "40px",
                borderRadius: "16px",
                cursor: "pointer",
                zIndex: 1,
              }}
              ref={chevRef}
            >
              {complete ? (
                <Check color="white" size={30} />
              ) : (
                <ChevronRight color="white" size={30} />
              )}
            </div>
          </Draggable>
          <p
            style={{
              marginBottom: "0",
              fontSize: "1.1rem",
              fontWeight: 500,
              color: "white",
              display: complete ? "none" : "inherit",
            }}
            ref={pRef}
          >
            {t("Slide To Confirm")}
          </p>
          {complete && (
            <p
              style={{
                marginBottom: "0",
                fontSize: window.innerWidth > 1700 ? "1.1rem" : ".95rem",
                fontWeight: 500,
                color: "white",
              }}
            >
              {t("Payment Confirmed")}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ConfirmW2W;

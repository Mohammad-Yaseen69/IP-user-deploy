import React, { useContext } from "react";
import { Check, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";

const isBig = window.innerWidth > 1000;

const ChooseWallet = ({
  setSubStep,
  wallet,
  setWallet,
  setAction = () => {},
  loading,
}) => {
  const { t } = useTranslation();
  const { userWallets } = useContext(UserContext);
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
        {userWallets
          ?.filter(
            (item) =>
              item?.wallet_type === "insta" &&
              item?.status === "active" &&
              !item?.blocked &&
              !item?.admin_blocked &&
              !item?.blocked,
          )
          ?.map((item) => (
            <div
              onClick={() => setWallet(item)}
              style={{
                display: "flex",
                background: "white",
                boxShadow: "0 0 4px #1111113e",
                padding: "1rem",
                borderRadius: "16px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "35px",
                  width: "35px",
                  background:
                    "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                  fontSize: "1rem",
                  fontWeight: 900,
                  color: "white",
                  marginRight: ".75rem",
                }}
              >
                <span>{item?.currency?.code} </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <h5
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "0",
                  }}
                >
                  {item?.wallet_id}
                </h5>
                <span
                  style={{
                    color: "#a8a8a8",
                    fontSize: ".6rem",
                    fontWeight: 500,
                  }}
                >
                  {item?.currency?.code}{" "}
                </span>
              </div>
              {wallet?._id === item?._id && (
                <Check
                  color="green"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "1rem",
                    transform: "translateY(-50%)",
                  }}
                />
              )}
            </div>
          ))}
      </CardBody>
      <div
        style={{
          display: "flex",
          justifyContent:
            window.innerWidth > 1000 ? "flex-end" : "space-between",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap-reverse",
          paddingLeft: isBig ? "1rem" : 0,
          marginTop: "1rem",
        }}
      >
        <button
          style={{
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            padding: 0,
            cursor: "pointer",
            fontSize: ".9rem",
            color: "#afafaf",
          }}
          onClick={() => setAction(false)}
        >
          {t("Back")}
        </button>
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
            width: isBig ? "60%" : "inherit",
            minWidth: "fit-content",
            padding: ".75rem 2rem",
            borderRadius: "12px",
          }}
          // className="i_t_button"
          onClick={() => {
            setSubStep((prev) => prev + 1);
          }}
          disabled={!wallet || loading}
        >
          {t("Next")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default ChooseWallet;

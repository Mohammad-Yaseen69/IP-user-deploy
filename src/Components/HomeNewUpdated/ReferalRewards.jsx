import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";
import { IoMdArrowDropright } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { UserContext } from "../../Context/UserContext";
import { Link } from "react-router-dom";

const ReferalRewards = () => {
  const { t } = useTranslation();
  const { getReferralCommission, totalReferralAmount, userDetails } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getReferralCommission();
    }
  }, [userDetails]);
  return (
    <Card
      style={{
        marginBottom: 0,
        flex: 1,
        minWidth: "120px",
        background: "linear-gradient(0deg, #D2FFDF 0%, #D2FFDF 100%)",
        boxShadow: "0px 0px 146px 0px rgba(109, 41, 220, 0.05) inset",
      }}
    >
      <CardBody className="b_card">
        <div
          className="d-flex flex-column"
          style={{ justifyContent: "space-between", height: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: ".5rem",
            }}
          >
            <p
              style={{
                marginBottom: 0,
                fontWeight: 700,
                lineHeight: 1.3,
                overflow: "hidden",
              }}
            >
              {t("Referral Rewards")}
            </p>
            {/* <BsThreeDots size={30} style={{ transform: "translateY(-4px)", color: "#5926f0" }} /> */}
          </div>
          <Link to={"/referrals"}>
            <div
              className="text-white d-flex align-items-center"
              style={{
                fontSize: "1rem",
                justifyContent: "space-between",
                padding: "0 11px",
                borderRadius: "12px",
                background:
                  "linear-gradient(0deg, #1EA744 0%, #1EA744 100%), radial-gradient(4203.6% 250.48% at -13% 100%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
              }}
            >
              <span style={{ fontSize: "22px", fontWeight: 700 }}>
                $
                {Number(totalReferralAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <IoMdArrowDropright size={30} />
            </div>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default ReferalRewards;

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import styles from "./styles/onboard.module.scss";
import Img from "./files/kyc-img.png";
import { useTranslation } from "react-i18next";

const Stepthree = () => {
  const { userDetails } = useContext(UserContext);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (
      userDetails?.account_type === "individual"
        ? userDetails?.user?.kyc_status === "approved"
        : userDetails?.company?.kyb_status === "approved"
    ) {
      setIsKycVerified(true);
    }
  }, [userDetails]);

  return (
    <>
      <div className={styles.top} style={{ width: "100%" }}>
        <h2>
          {!isKycVerified
            ? t("Let's Verify Your Identity")
            : t("You're Already Verified!")}
        </h2>
        <p>
          {!isKycVerified
            ? t(
                "We need to verify your identity before issuing your InstaPay card. This ensures a secure and smooth experience for you!",
              )
            : t(
                "Good news! We've found your KYC details, so you don't need to verify again. Let's move ahead and set up your InstaPay card!",
              )}
        </p>
      </div>

      <img style={{ width: "550px" }} src={Img} alt="" />
    </>
  );
};

export default Stepthree;

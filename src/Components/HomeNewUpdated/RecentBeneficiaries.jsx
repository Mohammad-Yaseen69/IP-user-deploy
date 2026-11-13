import React, { useContext, useEffect } from "react";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import BenefCard from "./BenefCard";
import { useTranslation } from "react-i18next";
import styles from "./styles/RecentBenef.module.css";
import { ChevronRight } from "lucide-react";

const RecentBeneficiaries = () => {
  const { t } = useTranslation();
  const { userDetails, beneficiaries, getUserBeneficiaries } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getUserBeneficiaries();
    }
  }, [userDetails]);

  console.log(beneficiaries);

  return (
    <>
      <Card
        className={styles.pc}
        style={{
          marginBottom: 0,
          borderRadius: "1rem",
          minHeight: "142px",
          flex: 1,
        }}
      >
        <CardBody
          style={{
            padding: window.innerWidth > 1500 ? "24px" : "13px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className={styles.row}>
            <div className={styles.qt_head}>
              <h3>{t("Quick transfer")}</h3>
              <p>{t("People you pay most")}</p>
              <a href="/beneficiaries" className={styles.qt_link}>
                {t("All contacts")} <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
            {beneficiaries.length > 0 ? (
              beneficiaries.map((item, index) => (
                <BenefCard index={index} total={beneficiaries?.length} key={item._id} item={item} />
              ))
            ) : (
              <div style={{ margin: "2rem auto" }}>{t("No Beneficiaries")}</div>
            )}
          </div>
        </CardBody>
      </Card>
      <div className={styles.mob}>
        <div className={styles.mob_head}>
          <h3>{t("Quick transfer")}</h3>
          <a href="/beneficiaries" className={styles.qt_link}>
            {t("All contacts")} <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.mob_row}>
          {beneficiaries.length > 0 ? (
            beneficiaries.map((item, index) => (
              <BenefCard index={index} total={beneficiaries?.length} key={item._id} item={item} />
            ))
          ) : (
            <div style={{ margin: "2rem auto" }}>{t("No Beneficiaries")}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentBeneficiaries;

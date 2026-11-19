import { useContext, useEffect } from "react";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import BenefCard from "./BenefCard";
import { useTranslation } from "react-i18next";
import styles from "./styles/RecentBenef.module.css";
import { ChevronRight, Plus } from "lucide-react";

const NewBeneficiaryButton = () => {
  const { t } = useTranslation();

  return (
    <a
      href="/beneficiaries"
      aria-label={t("Add new beneficiary")}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        textDecoration: "none",
        flexShrink: 0,
        cursor: "pointer",
        background: "transparent",
        border: "none",
        padding: 0,
      }}
    >
      <span
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "2px dashed #D0D5DD",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5926F0",
          boxSizing: "border-box",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F4F1FE";
          e.currentTarget.style.borderColor = "#5926F0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "#D0D5DD";
        }}
      >
        <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#667085",
          lineHeight: "20px",
        }}
      >
        {t("New")}
      </span>
    </a>
  );
};

const RecentBeneficiaries = () => {
  const { t } = useTranslation();
  const { userDetails, beneficiaries, getUserBeneficiaries } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getUserBeneficiaries();
    }
  }, [userDetails]);

  const list = beneficiaries ?? [];

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
            {list.length > 0 ? (
              list.map((item, index) => (
                <BenefCard index={index} total={list.length} key={item._id} item={item} />
              ))
            ) : (
              <NewBeneficiaryButton />
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
          {list.length > 0 ? (
            list.map((item, index) => (
              <BenefCard index={index} total={list.length} key={item._id} item={item} />
            ))
          ) : (
            <NewBeneficiaryButton />
          )}
        </div>
      </div>
    </>
  );
};

export default RecentBeneficiaries;

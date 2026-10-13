import { useContext, useMemo } from "react";
import { Check } from "react-feather";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import i from "../../PaymentsNewer/files/PaymentsNewFiles/i.svg";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";

const ChooseType = ({ selected, setter }) => {
  const { t } = useTranslation();
  const { userWithdrawals } = useContext(UserContext);
  const navigate = useNavigate();

  const defaultWithdrawal = useMemo(() => {
    return userWithdrawals.some((item) =>
      ["bank_details", "mobile_wallet", "cash_pickup", "card"].some(
        (key) => item[key]?.[0]?.default === true,
      ),
    );
  }, [userWithdrawals]);
  return (
    <div>
      <h5
        style={{
          fontSize: "1rem",
          fontWeight: "500",
          marginBottom: "1rem",
        }}
      >
        {service_name_formatter(t("How Would You Like To Cashout?:"))}
      </h5>
      <div
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
        <Card
          style={{ marginBottom: 0, borderRadius: "12px" }}
          onClick={() => {
            defaultWithdrawal
              ? setter("default")
              : navigate("/settings?tab=withdrawal");
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
              position: "relative",
              height: "70px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>
                {defaultWithdrawal
                  ? t("Default Receiving Account")
                  : t("Setup Default Account")}
              </h5>
            </div>
            {selected === "default" ? (
              <Check color="green" size={24} />
            ) : (
              <img src={i} alt="i" />
            )}
          </CardBody>
        </Card>
        <Card
          style={{ marginBottom: 0, borderRadius: "12px" }}
          onClick={() => {
            setter("specify");
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
              position: "relative",
              height: "70px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>
                {t("Specify Receiving Account")}
              </h5>
            </div>
            {selected === "specify" ? (
              <Check color="green" size={24} />
            ) : (
              <img src={i} alt="i" />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ChooseType;

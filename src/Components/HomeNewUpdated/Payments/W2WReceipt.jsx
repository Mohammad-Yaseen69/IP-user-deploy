import { useTranslation } from "react-i18next";
import { Card, CardBody } from "reactstrap";

const W2WReceipt = ({
  walletDetails,
  transactionDetails,
  amount,
  currency,
  type = "instant",
  item,
}) => {
  const { t } = useTranslation();
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
          padding: "14px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
        className="conf_cont"
      >
        <div style={{ display: "flex", flexDirection: "column" }} className="conf_cont">
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>
              {t("You are transferring")}
            </span>
            <h4 style={{ fontSize: "2rem" }}>
              {amount} {currency}
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            {type === "instant" && (
              <>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Total")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.currency?.code} {transactionDetails?.total?.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Fees")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.currency?.code} {transactionDetails?.fee?.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {type === "subscription" && (
              <>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Cycles")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.cycles}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Starts From")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.date}
                  </span>
                </div>
              </>
            )}
          </div>
          {/* recipient */}
          <div
            style={{
              background: "rgba(89,38,240,0.06)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              borderRadius: "10px",
            }}
          >
            <span style={{ minWidth: "80px", color: "#8a8a8a" }}>{t("To")}:</span>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                {`${item?.first_name || item?.company_name} ${item?.last_name}`.slice(0, 20)}
                {t("(INSTA-")}
                {walletDetails.wallet_id})
              </span>
            </div>
          </div>
        </div>
        {/* bottom */}
        {/* <div style={{ display: 'flex', alignItems: "center", gap: ".5rem", justifyContent: "center  " }}>
                    <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }}>
                        <img src={w} alt="w" style={{ height: "25px", width: "25px", objectFit: "contain" }} />
                        <span style={{ fontWeight: "600" }}>{t("Where is my payment?")}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "50px", padding: "10px", gap: ".3rem", cursor: "pointer" }}>
                        <img src={s} alt="s" style={{ height: "20px", width: "20px", objectFit: "contain" }} />
                        <span style={{ fontWeight: "600" }}>Share</span>
                    </div>
                </div> */}
      </CardBody>
    </Card>
  );
};

export default W2WReceipt;

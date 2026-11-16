import { Badge, Card, CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem";

const AirtimeReceipt = ({ pkgDetails, amount }) => {
  const { t } = useTranslation();
  console.log(pkgDetails);
  return (
    <Card
      style={{
        height: "100%",
        marginBottom: 0,
        boxShadow: "none",
        gap: "1.3rem",
        maxHeight: "540px",
      }}
    >
      <CardBody
        style={{
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          padding: "14px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
        className="conf_cont"
      >
        <div
          style={{
            background: "rgba(89, 38, 240, 0.060",
            borderRadius: 6,
            padding: ".5rem",
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <span>{t("Title")}</span>
          <strong>{service_name_formatter(pkgDetails?.name)}</strong>
        </div>
        <div
          style={{
            background: "rgba(89, 38, 240, 0.060",
            borderRadius: 6,
            padding: ".5rem",
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <span>{t("Description")}</span>
          <strong>{pkgDetails?.description ?? "N/A"}</strong>
        </div>
        <div
          style={{
            background: "rgba(89, 38, 240, 0.060",
            borderRadius: 6,
            padding: ".5rem",
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <span>{t("Total")}</span>
          {amount ? (
            <strong>
              {String(pkgDetails?.prices?.amount)?.slice(0, 4)} {pkgDetails?.prices?.unit}
            </strong>
          ) : (
            <strong>
              {pkgDetails?.prices?.amount?.toFixed(2)} {pkgDetails?.prices?.unit}
            </strong>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default AirtimeReceipt;

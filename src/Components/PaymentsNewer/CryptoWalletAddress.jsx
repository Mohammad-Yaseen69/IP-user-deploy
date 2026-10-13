import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Input } from "reactstrap";

const CryptoWalletAddress = ({ setWallet, setSubStep, wallet }) => {
  const { t } = useTranslation();
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
          background: "rgba(0,0,0,.03)",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "30px 20px",
          gap: "14px",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <p style={{ fontSize: "1rem", color: "#7d7d7d", marginBottom: 0 }}>
          {t("Enter the Wallet Address")}
        </p>
        <Input
          placeholder="Enter the Wallet Address"
          onChange={(e) => setWallet(e.target.value)}
          style={{ padding: "16px", fontSize: "18px", borderRadius: "10px" }}
        />
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
            fontSize: ".6rem",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            marginBottom: "0",
          }}
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
            setSubStep((prev) => prev + 1);
          }}
          disabled={!wallet}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default CryptoWalletAddress;

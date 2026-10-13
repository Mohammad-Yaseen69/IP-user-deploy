import { useState } from "react";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Input } from "reactstrap";
import InviteFriendModal from "./InviteFriendModal";

const CryptoSendWallet = ({ setWallet, setSubStep, wallet }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
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
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
      >
        <div>
          <p style={{ fontSize: "1rem", color: "#7d7d7d" }}>
            {t("Enter the Wallet ID, Email, or Phone Number of the recipient.")}
          </p>
          <Input
            placeholder="Enter the Wallet ID"
            onChange={(e) => setWallet(e.target.value)}
            style={{
              fontSize: "18px",
              borderRadius: "10px",
              boxShadow:
                " 0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
            }}
            className="w_a_i"
          />
          <Input
            type="select"
            style={{
              background: "rgba(89, 38, 240, 0.04)",
              boxShadow:
                "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04)",
              appearance: "auto",
              marginTop: "1.5rem",
              fontWeight: 700,
            }}
          >
            <option value="">{t("Select Network")}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Input>
        </div>
      </CardBody>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          gap: ".5rem",
          flexWrap: "wrap",
          paddingLeft: "1rem",
          marginTop: "1rem",
        }}
      >
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
            width: "60%",
            minWidth: "fit-content",
            padding: ".75rem 2rem",
            borderRadius: "12px",
          }}
          className="i_t_button"
          onClick={() => setSubStep((prev) => prev + 1)}
        >
          {t("Confirm")} <ChevronRight size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default CryptoSendWallet;

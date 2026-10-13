import { Card, CardBody, CardHeader } from "reactstrap";
import { AccountsData } from "./AccountsData";
import AccountItem from "./AccountItem";
import { useTranslation } from "react-i18next";
import styles from "./styles/Accounts.module.scss";
import { useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const Accounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails } = useContext(UserContext);
  const [isPinAdded, setIsPinAdded] = useState(false);
  const can = usePermission();
  const isEdit = can("settings.social-accounts.update");

  useEffect(() => {
    if (userDetails?.pin_status) {
      setIsPinAdded(true);
    }
  }, [userDetails]);
  console.log(isPinAdded);
  return (
    <Card
      style={{
        background: window.innerWidth > 1000 && "#FFF",
        height: "100%",
        marginLeft: window.innerWidth > 1000 ? "1rem" : "0",
        boxShadow:
          window.innerWidth > 1000
            ? "0px -17px 58px 0px rgba(0, 0, 0, 0.02), 15.146px 4.328px 242.341px 0px rgba(0, 0, 0, 0.07)"
            : "none",
      }}
    >
      <CardHeader
        style={{
          padding: window.innerWidth > 1000 ? "30px 30px 10px 30px" : "0",
        }}
      >
        <div>
          <h4>{t("Social Network Accounts")}</h4>
          <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>
            {t("Here, you can set up and manage your integration settings.")}
          </p>
        </div>
      </CardHeader>

      <div className={styles.pinBar}>
        <div
          style={{
            flex: window.innerWidth < 1000 && "flex",
            flexDirection: window.innerWidth < 1000 && "column",
            alignItems: window.innerWidth < 1000 && "flex-start",
          }}
        >
          <div>
            <h4>
              {t(!isPinAdded ? "Set Your Security PIN" : "Update Your Pin")}
            </h4>
            <p style={{ width: !isPinAdded ? "50%" : "auto" }}>
              {!isPinAdded ? t(``) : t("Need to change your PIN?")}
            </p>
          </div>

          <button
            disabled={!isEdit}
            style={{
              width: window.innerWidth < 1000 && "100%",
              marginTop: window.innerWidth < 1000 && "10px",
              borderRadius: window.innerWidth < 1000 && "4px",
            }}
            onClick={() =>
              navigate(!isPinAdded ? "/create-pin" : "/update-pin")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
            >
              <path
                d="M9.99996 10.5439H10.0041M14.1666 10.5439H14.1708M5.83329 10.5439H5.83746M4.33329 6.3772H15.6666C16.6 6.3772 17.0668 6.3772 17.4233 6.55885C17.7369 6.71864 17.9918 6.97361 18.1516 7.28721C18.3333 7.64373 18.3333 8.11044 18.3333 9.04386V12.0439C18.3333 12.9773 18.3333 13.444 18.1516 13.8005C17.9918 14.1141 17.7369 14.3691 17.4233 14.5289C17.0668 14.7105 16.6 14.7105 15.6666 14.7105H4.33329C3.39987 14.7105 2.93316 14.7105 2.57664 14.5289C2.26304 14.3691 2.00807 14.1141 1.84828 13.8005C1.66663 13.444 1.66663 12.9773 1.66663 12.0439V9.04386C1.66663 8.11044 1.66663 7.64373 1.84828 7.28721C2.00807 6.97361 2.26304 6.71864 2.57664 6.55885C2.93316 6.3772 3.39987 6.3772 4.33329 6.3772ZM10.2083 10.5439C10.2083 10.6589 10.115 10.7522 9.99996 10.7522C9.8849 10.7522 9.79163 10.6589 9.79163 10.5439C9.79163 10.4288 9.8849 10.3355 9.99996 10.3355C10.115 10.3355 10.2083 10.4288 10.2083 10.5439ZM14.375 10.5439C14.375 10.6589 14.2817 10.7522 14.1666 10.7522C14.0516 10.7522 13.9583 10.6589 13.9583 10.5439C13.9583 10.4288 14.0516 10.3355 14.1666 10.3355C14.2817 10.3355 14.375 10.4288 14.375 10.5439ZM6.04163 10.5439C6.04163 10.6589 5.94835 10.7522 5.83329 10.7522C5.71823 10.7522 5.62496 10.6589 5.62496 10.5439C5.62496 10.4288 5.71823 10.3355 5.83329 10.3355C5.94835 10.3355 6.04163 10.4288 6.04163 10.5439Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p>{t(!isPinAdded ? "Set your PIN" : "Update your PIN")}</p>
          </button>
        </div>
      </div>

      <div
        style={{
          opacity: !isPinAdded ? "0.3" : "1",
          pointerEvents: !isPinAdded ? "none" : "auto",
        }}
      >
        <CardBody
          style={{
            display: "grid",
            padding: window.innerWidth > 1000 ? "18px" : "18px 0",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "15px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {AccountsData.map((data) => {
            return <AccountItem key={data.name} data={data} />;
          })}
        </CardBody>
      </div>
    </Card>
  );
};

export default Accounts;

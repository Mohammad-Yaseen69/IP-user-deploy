import { Card, CardBody, CardHeader } from "reactstrap";
import NotifTable from "./NotifTable";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div>
          <h4>{t("Notifications")}</h4>
          <p style={{ color: "black", fontWeight: "300" }}>
            {t(
              "Customize how you receive notifications. These settings apply to the activities you are monitoring.",
            )}
          </p>
        </div>
      </CardHeader>
      <div>
        <CardBody
          style={{
            overflowX: "auto",
            padding: window.innerWidth < 500 ? "24px 0" : "24px",
          }}
        >
          <NotifTable />
        </CardBody>
      </div>
    </Card>
  );
};

export default Notifications;

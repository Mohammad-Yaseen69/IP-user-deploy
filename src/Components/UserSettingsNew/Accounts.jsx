import { Card, CardBody, CardHeader } from "reactstrap";
import { H4 } from "../../AbstractElements";
import { AccountsData } from "./AccountsData";
import AccountItem from "./AccountItem";
import { useTranslation } from "react-i18next";

const Accounts = () => {
  const { t } = useTranslation();
  return (
    <Card id="accounts">
      <CardHeader className={`pb-0 expanded`}>
        <div>
          <H4 attrH4={{ className: "card-title mb-0" }}>{t("Social Accounts")}</H4>
          <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>
            {t("Here you can setup and manage your integration settings.")}
          </p>
        </div>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          {AccountsData.map((data) => {
            return <AccountItem key={data.name} data={data} />;
          })}
        </CardBody>
      </div>
    </Card>
  );
};

export default Accounts;

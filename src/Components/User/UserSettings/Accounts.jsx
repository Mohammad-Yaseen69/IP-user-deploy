import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { H4 } from "../../../AbstractElements";
import { AccountsData } from "./AccountsData";
import AccountItem from "./AccountItem";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";

const Accounts = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  const toggleAccordion = () => {
    setIsCollapsed(isCollapsed ? "accounts" : "");
  };
  return (
    <Card id="accounts">
      <CardHeader
        className={`pb-0 ${isCollapsed ? "collapsed" : "expanded"}`}
        onClick={toggleAccordion}
      >
        <div>
          <H4 attrH4={{ className: "card-title mb-0" }}>{t("Social Accounts")}</H4>
          <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>
            {t("Here you can setup and manage your integration settings.")}
          </p>
        </div>
        <div className="card-options">{isCollapsed ? <ChevronDown /> : <ChevronUp />}</div>
      </CardHeader>
      <div className={`accordion-body ${isCollapsed ? "collapsed" : "expanded"}`}>
        <CardBody>
          {AccountsData.map((data) => {
            return <AccountItem key={data.name} data={data} ssa={setIsCollapsed} />;
          })}
        </CardBody>
      </div>
    </Card>
  );
};

export default Accounts;

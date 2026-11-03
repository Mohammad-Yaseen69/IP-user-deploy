import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { Btn, H4, P } from "../../../AbstractElements";
import NotifTable from "./NotifTable";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";

const Notifications = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();

  const toggleAccordion = () => {
    setIsCollapsed(isCollapsed ? "notifications" : "");
  };
  return (
    <Card id="notifications">
      <CardHeader
        className={`pb-0 ${isCollapsed ? "collapsed" : "expanded"}`}
        onClick={toggleAccordion}
      >
        <div>
          <H4 attrH4={{ className: "card-title mb-0" }}>{t("Notifications")}</H4>
          <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>
            {t(
              "Choose how you receive notifications. These notification settings apply to the things you’re watching.",
            )}
          </p>
        </div>
        <div className="card-options">{isCollapsed ? <ChevronDown /> : <ChevronUp />}</div>
      </CardHeader>
      <div className={`accordion-body ${isCollapsed ? "collapsed" : "expanded"}`}>
        <CardBody
          style={{
            overflowX: "auto",
          }}
        >
          <NotifTable />
        </CardBody>
      </div>
    </Card>
  );
};

export default Notifications;

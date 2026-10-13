import React, { useContext, useEffect } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { H4 } from "../../../AbstractElements";
import SessionItem from "./SessionItem";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";

const Sessions = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  const { userSessions, userDetails, getSessions } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getSessions();
    }
  }, [userDetails]);

  const toggleAccordion = () => {
    setIsCollapsed(isCollapsed ? "sessions" : "");
  };

  const filteredSessions = userSessions.reduce((uniqueSessions, session) => {
    const existingSession = uniqueSessions.find(
      (uniqueSession) =>
        uniqueSession.account === session.account &&
        uniqueSession.browser_name === session.browser_name &&
        uniqueSession.browser_version === session.browser_version &&
        uniqueSession.is_mobile_user === session.is_mobile_user &&
        uniqueSession.location.IPv4 === session.location.IPv4 &&
        uniqueSession.location.city === session.location.city &&
        uniqueSession.location.country_code === session.location.country_code &&
        uniqueSession.location.country_name === session.location.country_name &&
        uniqueSession.location.latitude === session.location.latitude &&
        uniqueSession.location.longitude === session.location.longitude &&
        uniqueSession.location.postal === session.location.postal &&
        uniqueSession.location.state === session.location.state &&
        uniqueSession.platform === session.platform,
    );

    if (!existingSession) {
      uniqueSessions.push(session);
    } else {
      if (new Date(session.createdAt) > new Date(existingSession.createdAt)) {
        const index = uniqueSessions.indexOf(existingSession);
        uniqueSessions[index] = session;
      }
    }

    return uniqueSessions;
  }, []);

  useEffect(() => {
    filteredSessions.sort(
      (sessionA, sessionB) =>
        new Date(sessionB.createdAt) - new Date(sessionA.createdAt),
    );
  }, []);

  return (
    <Card id="sessions">
      <CardHeader
        className={`pb-0 ${isCollapsed ? "collapsed" : "expanded"}`}
        onClick={toggleAccordion}
      >
        <div>
          <H4 attrH4={{ className: "card-title mb-0" }}>{t("Sessions")}</H4>
          <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>
            {t("This is a list of devices that have logged into your account.")}
          </p>
        </div>
        <div className="card-options">
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </div>
      </CardHeader>
      <div
        className={`accordion-body ${isCollapsed ? "collapsed" : "expanded"}`}
      >
        <CardBody>
          {filteredSessions.length > 0
            ? filteredSessions.map((session, index) => {
                return (
                  <SessionItem
                    key={session._id}
                    session={session}
                    index={index}
                  />
                );
              })
            : ""}
        </CardBody>
      </div>
    </Card>
  );
};

export default Sessions;

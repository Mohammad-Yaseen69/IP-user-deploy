import ProfileComponent from "./ProfileComponent";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import { useTranslation } from "react-i18next";
import PageHeader from "../../Common/PageHeader";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { Card, CardBody, CardText } from "reactstrap";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  return (
    <>
      <div className={styles.container}>
        <PageHeader title={t("Profile")} />
        {userDetails?.username ? (
          <ProfileComponent />
        ) : (
          <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
            <CardBody>
              <CardText>
                {t(
                  "Please add username to your profile to create a personalized public profile page.",
                )}{" "}
                <Link
                  to={"/settings?tab=basic"}
                  style={{ textDecoration: "underline", fontWeight: 600 }}
                >
                  {t("Add Now")}
                </Link>
              </CardText>
            </CardBody>
          </Card>
        )}
      </div>
      <div className={styles.mobile}>
        {userDetails?.username ? (
          <ProfileComponent />
        ) : (
          <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
            <CardBody>
              <CardText>
                {t(
                  "Please add username to your profile to create a personalized public profile page.",
                )}{" "}
                <Link
                  to={"/settings?tab=basic"}
                  style={{ textDecoration: "underline", fontWeight: 600 }}
                >
                  {t("Add Now")}
                </Link>
              </CardText>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
};

export default UserProfile;

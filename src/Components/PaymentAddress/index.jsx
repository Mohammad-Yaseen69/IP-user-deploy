import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { useShowOnce } from "../../hooks/GeneralUse/useShowOnce";
import PageHeader from "../../Common/PageHeader";
import PaymentAddressComponent from "./PaymentAddressComponent";
import { Card, CardBody, CardText } from "reactstrap";
import { Link } from "react-router-dom";
import styles from "./styles/index.module.css";
import { Info } from "react-feather";

const PaymentAddress = () => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const [isOpen, setIsOpen] = useShowOnce("payment_address_intro");
  return (
    <>
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <PageHeader
            title={
              <>
                {t("My Payment Address")}
                <Info
                  color="#5926f0"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsOpen(!isOpen)}
                  size={16}
                />
              </>
            }
          />
          {
            <>
              {userDetails?.level?.payment_address?.receive ? (
                userDetails?.username ? (
                  <PaymentAddressComponent
                    userDetails={userDetails}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                ) : (
                  <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                    <CardBody>
                      <CardText>
                        {t(
                          "Please add username to your profile to create a personalized payment address page.",
                        )}{" "}
                        <Link
                          to={"/settings?tab=basic"}
                          style={{
                            textDecoration: "underline",
                            fontWeight: 600,
                          }}
                        >
                          {t("Add Now")}
                        </Link>
                      </CardText>
                    </CardBody>
                  </Card>
                )
              ) : (
                <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                  <CardBody>
                    <CardText>{t("Currently not supported on this level.")}</CardText>
                  </CardBody>
                </Card>
              )}
            </>
          }
        </div>
      ) : (
        <div className={styles.mobile}>
          {
            <>
              {userDetails?.level?.payment_address?.receive ? (
                userDetails?.username ? (
                  <PaymentAddressComponent
                    userDetails={userDetails}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                ) : (
                  <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                    <CardBody>
                      <CardText>
                        {t(
                          "Please add username to your profile to create a personalized payment address page.",
                        )}{" "}
                        <Link
                          to={"/settings?tab=basic"}
                          style={{
                            textDecoration: "underline",
                            fontWeight: 600,
                          }}
                        >
                          {t("Add Now")}
                        </Link>
                      </CardText>
                    </CardBody>
                  </Card>
                )
              ) : (
                <Card style={{ maxWidth: "fit-content", margin: "5rem auto 0" }}>
                  <CardBody>
                    <CardText>{t("Currently not supported on this level.")}</CardText>
                  </CardBody>
                </Card>
              )}
            </>
          }
        </div>
      )}
    </>
  );
};

export default PaymentAddress;

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "react-feather";
import { Button, Card, CardBody, CardHeader, Input } from "reactstrap";
import { H4 } from "../../AbstractElements";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const DeleteAccount = () => {
  const [check, setCheck] = useState(false);
  const { t } = useTranslation();

  const { userDetails, authHeader } = useContext(UserContext);

  const deleteAccountHandler = async () => {
    axios
      .delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-account/${userDetails?._id}`, {
        headers: authHeader,
      })
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        // console.log(decrypted)
      });
  };

  return (
    <Card id="delete_account">
      <CardHeader className={`pb-0 expanded`}>
        <H4 attrH4={{ className: "card-title mb-0" }}>{t("Delete Your Account")}</H4>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          <div className="container p-sm-5 p-0">
            <div className="mt-4">
              <h4>{t("Ask us to delete your data and close this account")}</h4>
              <p className="text-secondary">
                {t(
                  "We use your data to provide services, so if we delete your data, we also need to close your account",
                )}
              </p>
            </div>
            <div className="mt-4 mb-4">
              <h6>{t("Before you continue:")}</h6>
              <ul
                className="list-unstyled p-3 d-flex flex-column text-sm"
                style={{ listStyleType: "disk" }}
              >
                <li>
                  {t(
                    "If your account is limited, go to the Resolution center, select Go to Account Limitations, then click resolve",
                  )}
                </li>
                <li>
                  {t(
                    "Make sure any outstanding payments have cleared. We won't be able to close your account until they do.",
                  )}
                </li>
                <li>
                  {t(
                    "If you have a negative balance, click the Resolve link next to your balance.",
                  )}
                </li>
              </ul>
            </div>
            <div className="p-3 bg-light rounded-lg text-secondary mb-4">
              {t(
                "Once your account is clear, and if you're eligible, we'll close your account and delete your data. We need yo retain some of your data for legal and regulatory reasons. To learn more, see our",
              )}{" "}
              &nbsp;
              <span className="text-primary cursor-pointer">{t("privacy statement")}</span>
              <br />
              {t(
                "We'll email you to let you know the status, and if there are any other steps you need to take.",
              )}
            </div>
            <div className="d-flex align-items-center mt-2 gap-1">
              {/* <span className="h2 inline-flex h-12 w-12 align-items-center justify-content-center"> */}
              <HelpCircle size={16} />
              {/* </span> */}
              <span className="text-secondary">
                {t("Have more questions about data deletion?")} &nbsp;
                <Link to="/faq">
                  <span className="text-primary font-weight-bold cursor-pointer">
                    {t("Contact us")}
                  </span>
                </Link>
              </span>
            </div>
            <div className="d-flex mt-3 gap-1">
              <Input type="checkbox" checked={check} onChange={(e) => setCheck(e.target.checked)} />
              <span className="text-secondary" onClick={() => setCheck(!check)}>
                {t("I understand that account deletion is permanent and can't be reversed.")}
              </span>
            </div>
            <div className="d-flex justify-content-center flex-column align-items-center gap-2 mt-4">
              <span>{t("Are you sure you want to close your account?")}</span>
              <Button color="danger" disabled={!check} onClick={deleteAccountHandler}>
                {t("Yes, Continue")}
              </Button>
            </div>
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

export default DeleteAccount;

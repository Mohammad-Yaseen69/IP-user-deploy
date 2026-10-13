import React, { useContext, useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "reactstrap";
import { H4 } from "../../AbstractElements";
import { useTranslation } from "react-i18next";
import AddNominee from "./AddNominee";
import NomineeDetails from "./NomineeDetails";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const Nominee = () => {
  const { t } = useTranslation();

  const [nominee, setNominee] = useState({});
  const [addNominee, setAddNominee] = useState(false);

  // context
  const { authHeader, userDetails } = useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      const getNomineeDetails = () => {
        axios
          .get(`${import.meta.env.VITE_IP_DEV_API}/api/nominee/get-nominee/${userDetails?._id}`, {
            headers: authHeader,
          })
          .then((res) => {
            const decrypted = decryptData(res.data.data);
            setNominee(decrypted?.nomineeDetails);
            // console.log(decrypted)
          })
          .catch((err) => {
            const decrypted = decryptData(err.response.data.data);
            // console.log(decrypted)
          });
      };
      getNomineeDetails();
    }
  }, [userDetails]);

  return (
    <Card id="nominee">
      <CardHeader className={`pb-0 expanded`}>
        <H4 attrH4={{ className: "card-title mb-0" }}>{t("Nominee")}</H4>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          {nominee?.full_name ? (
            <NomineeDetails nominee={nominee} setNominee={setNominee} />
          ) : (
            <>
              {addNominee ? (
                <AddNominee setNominee={setNominee} setAddNominee={setAddNominee} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <p style={{ textAlign: "center" }}>
                    {t(
                      "You may elect a Nominee of your choice not being a minor through the InstaPay platform itself. You acknowledge that no wet signature will be taken to appoint the nominee and the online registration will be considered as final and binding. In the event of the death of an InstaPay Wallet holder, the balance in the Wallet will be handed over to the Nominee as registered on the platform. KEMIT KINGDOM will be discharged from all its liabilities upon handover of the amount to the Nominee. The Nominee will provide documents as may be required by InstaPay including for identification and proof of death.",
                    )}
                  </p>
                  <Button
                    style={{
                      background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                      border: "none",
                      outline: "none",
                      borderRadius: "10px",
                    }}
                    onClick={() => setAddNominee(true)}
                  >
                    {t("Add Nominee")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </div>
    </Card>
  );
};

export default Nominee;

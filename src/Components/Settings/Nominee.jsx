import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AddNominee, { NoNomineeNote } from "./AddNominee";
import NomineeDetails from "./NomineeDetails";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import styles from "./styles/Nominee.module.scss";

const Nominee = () => {
  const { t } = useTranslation();

  const [nominee, setNominee] = useState({});
  const [addNominee, setAddNominee] = useState(false);
  const can = usePermission();
  const isEdit = can("settings.nominee.update");
  const { authHeader, userDetails } = useContext(UserContext);

  useEffect(() => {
    const getNomineeDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/nominee/get-nominee/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const decrypted = await decryptData(res.data.data);
        setNominee(decrypted?.nomineeDetails);
      } catch (err) {
        const decrypted = decryptData(err.response.data.data);
        // console.log(decrypted)
      }
    };
    if (userDetails) {
      getNomineeDetails();
    }
  }, [userDetails]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Nominee")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("The person who receives your wallet balance if something happens to you.")}
          </p>
        </div>
      </div>

      {nominee?.full_name ? (
        <NomineeDetails nominee={nominee} setNominee={setNominee} />
      ) : (
        <>
          {addNominee ? (
            <AddNominee setNominee={setNominee} setAddNominee={setAddNominee} />
          ) : (
            <section className={styles.card}>
              <div className={styles.cardBody}>
                <NoNomineeNote />
                <p className={styles.legal}>
                  {t(
                    "You may elect a Nominee of your choice, provided they are not a minor, through the InstaPay platform itself. You acknowledge that no wet signature is required to \nappoint the nominee, and the online registration will be considered final and binding. In the event of the death of an InstaPay Wallet holder, the balance in the Wallet \nwill be transferred to the registered Nominee. KEMIT KINGDOM will be discharged from all its liabilities upon the handover of the amount to the Nominee. The Nominee \nwill provide any documents required by InstaPay, including those for identification and proof of death.",
                  )}
                </p>
              </div>
              <div className={`${styles.cardFooter} ${styles.cardFooterEnd}`}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={!isEdit}
                  onClick={() => setAddNominee(true)}
                >
                  {t("Add Nominee")}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Nominee;

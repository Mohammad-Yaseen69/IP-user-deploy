import { useState } from "react";
import { MoreHorizontal, Plus } from "react-feather";
import styles from "../styles/AccountsSidebar.module.css";
import VirtualIbanModal from "../VirtualIbanModal";
import UK_Image from "../files/images/UK.svg";
import Malta_Image from "../files/images/Malta.svg";
import { getVirtualIbanCountry } from "../utils/virtualIban";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";

const AccountsSidebar = ({ selectedAccount, onSelect, accounts = [], isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const can = usePermission();
  const canCreateIban = can("virtual-iban.account.create");

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.sidebar}>
      <p className={styles.label}>
        {t("Your accounts")}
        {/* <span> <MoreHorizontal /></span> */}
      </p>

      <div className={styles.accountItemCon}>
        {isLoading && <div className={styles.accCurrency}>{t("Loading accounts...")}</div>}
        {!isLoading && accounts.length === 0 && (
          <div className={styles.accCurrency}>{t("No virtual IBANs yet")}</div>
        )}

        {accounts.map((acc, index) => {
          const id = acc?._id || acc?.id;
          const country = getVirtualIbanCountry(acc);

          return (
            <div
              key={id}
              className={`${styles.accountItem} ${selectedAccount === id ? styles.selected : ""}`}
              onClick={() => onSelect(id)}
            >
              <input type="radio" checked={selectedAccount === id} readOnly />
              <div className={styles.flagBox}>
                <img src={country === "GB" ? UK_Image : Malta_Image} alt="" />
              </div>

              <div className={styles.accInfo}>
                <span className={styles.accName}>
                  {country === "GB" ? t("UK IBAN") : t("Malta IBAN")}
                  {/* {index === 0 ? t("Primary IBAN") : t("IBAN {{number}}", { number: index + 1 })} */}
                </span>
                <span className={styles.accCurrency}>
                  {t("{{currency}} IBAN", { currency: acc?.currency })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* {!isLoading &&
                < div className={styles.openNew} onClick={handleOpenModal}>
                    <div className={styles.plusIcon}>
                        <Plus size={14} />
                    </div>
                    <div className={styles.accInfo}>
                        <span>{t("Open new IBAN")}</span>
                        <span className={styles.accCurrency}>{t("MT jurisdictions")}</span>
                    </div>
                </div>
            } */}
      {canCreateIban && <VirtualIbanModal isOpen={showModal} toggle={handleCloseModal} />}
    </div>
  );
};

export default AccountsSidebar;

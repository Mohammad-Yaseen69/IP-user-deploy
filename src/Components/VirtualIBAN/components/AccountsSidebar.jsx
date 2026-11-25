import { useContext, useState } from "react";
import { Plus } from "react-feather";
import styles from "../styles/AccountsSidebar.module.css";
import VirtualIbanModal from "../VirtualIbanModal";
import UK_Image from "../files/images/UK.svg";
import Malta_Image from "../files/images/Malta.svg";
import US_Image from "../files/images/US.svg";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import { UserContext } from "../../../Context/UserContext";
import { MAX_BUSINESS_IBANS } from "../../../stateMachines/virtualIbanPayment";

const ACCOUNT_DISPLAY = {
  GB: { image: UK_Image, label: "UK IBAN" },
  US: { image: US_Image, label: "US Account" },
  MT: { image: Malta_Image, label: "Malta IBAN" },
};

const AccountsSidebar = ({
  selectedAccount,
  onSelect,
  setShowGetIBAN,
  accounts = [],
  isLoading,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const can = usePermission();
  const { userDetails } = useContext(UserContext);
  const canCreateIban = can("virtual-iban.account.create");
  const canOpenNewBusinessIban =
    userDetails?.account_type === "business" &&
    canCreateIban &&
    !isLoading &&
    accounts.length < MAX_BUSINESS_IBANS;

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
          const display = acc?.provider === "rhub" ? ACCOUNT_DISPLAY.US : ACCOUNT_DISPLAY.MT;

          return (
            <div
              key={id}
              className={`${styles.accountItem} ${selectedAccount === id ? styles.selected : ""}`}
              onClick={() => onSelect(id)}
            >
              <input type="radio" checked={selectedAccount === id} readOnly />
              <div className={styles.flagBox}>
                <img src={display.image} alt="" />
              </div>

              <div className={styles.accInfo}>
                <span className={styles.accName}>
                  {t(display.label)}
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

      {canOpenNewBusinessIban && (
        <div className={styles.openNew} onClick={() => setShowGetIBAN?.()}>
          <div className={styles.plusIcon}>
            <Plus size={14} />
          </div>
          <div className={styles.accInfo}>
            <span>{t("Open new IBAN")}</span>
            <span className={styles.accCurrency}>
              {t("{{count}} of {{max}} IBANs used", {
                count: accounts.length,
                max: MAX_BUSINESS_IBANS,
              })}
            </span>
          </div>
        </div>
      )}
      {canCreateIban && <VirtualIbanModal isOpen={showModal} toggle={handleCloseModal} />}
    </div>
  );
};

export default AccountsSidebar;
